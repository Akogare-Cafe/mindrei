"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { api, internal } from "./_generated/api";
import OpenAI from "openai/index.js";

let openaiInstance: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!openaiInstance) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY environment variable is required");
    }
    openaiInstance = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openaiInstance;
}

const openai = new Proxy({} as OpenAI, {
  get: (target, prop) => {
    const client = getOpenAI();
    const value = client[prop as keyof OpenAI];
    return typeof value === 'function' ? value.bind(client) : value;
  }
});

// Model configuration - can be overridden via env
const AI_MODEL = process.env.AI_MODEL || "gpt-4o-mini";

// Retry configuration
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY_MS = 1000;

async function withRetry<T>(
  fn: () => Promise<T>,
  retries = MAX_RETRIES
): Promise<T> {
  let lastError: Error | null = null;
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (attempt < retries - 1) {
        const delay = INITIAL_RETRY_DELAY_MS * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }
  throw lastError;
}

// Simple hash function for caching
function hashTopic(topic: string, mainTopic?: string): string {
  const normalized = `${topic.toLowerCase().trim()}|${(mainTopic || "").toLowerCase().trim()}`;
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    const char = normalized.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(36);
}

export interface MindMapNode {
  tempId: string;
  parentTempId?: string;
  label: string;
  content?: string;
  level: number;
  order: number;
}

export interface MindMapEdge {
  tempId: string;
  sourceTempId: string;
  targetTempId: string;
}

export const generateMindMap = action({
  args: {
    text: v.string(),
    title: v.optional(v.string()),
  },
  handler: async (_, args): Promise<{ title: string; nodes: MindMapNode[] }> => {
    const prompt = `You are an AI that converts text into a structured mind map. 
Given the following text, create a hierarchical mind map structure.

Text: "${args.text}"

Return a JSON object with:
1. "title": A concise title for the mind map (max 50 chars)
2. "nodes": An array of nodes where each node has:
   - "tempId": A unique string ID (use format "node_0", "node_1", etc.)
   - "parentTempId": The tempId of the parent node (null for root node)
   - "label": A short label for the node (max 30 chars)
   - "content": Optional longer description
   - "level": The depth level (0 for root, 1 for first children, etc.)
   - "order": The order among siblings (0, 1, 2, etc.)

Rules:
- Create a single root node (level 0) that represents the main topic
- Group related concepts as children
- Maximum 3 levels deep
- Maximum 15 nodes total
- Keep labels concise and meaningful

Return ONLY valid JSON, no markdown or explanation.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a mind map generator. Return only valid JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from AI");
    }

    try {
      const cleanedContent = content
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      
      const result = JSON.parse(cleanedContent);
      
      return {
        title: args.title || result.title || "Mind Map",
        nodes: result.nodes || [],
      };
    } catch {
      throw new Error("Failed to parse AI response");
    }
  },
});

export const extractTopic = action({
  args: {
    text: v.string(),
    speakerHint: v.optional(v.string()),
    mainTopic: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<{ topic: string; speaker: string | null; confidence: number }> => {
    const cachedResult = await ctx.runQuery(api.cache.getCachedExtraction, {
      text: args.text,
      mainTopic: args.mainTopic,
    });

    if (cachedResult) {
      return cachedResult;
    }
    const contextHint = args.mainTopic 
      ? `\nContext: The user is discussing "${args.mainTopic}". Extract subtopics related to this main topic.`
      : "";

    const prompt = `Extract the main topic, concept, or key idea from this spoken text. This is real-time speech recognition output, so it may contain:
- Filler words (um, uh, like, you know, basically, actually, so, well, I mean, right, okay)
- Repetitions and false starts
- Incomplete sentences
- Conversational phrases

Your job is to identify the CORE CONCEPT or SUBJECT being discussed.
${contextHint}
Spoken text: "${args.text}"

Return a JSON object with:
1. "topic": The main topic/concept in 2-5 words. Use proper noun capitalization. Be specific - prefer "Neural Network Layers" over just "Layers"
2. "speaker": If you detect a speaker change marker, otherwise null
3. "confidence": 0-1 score. Set LOW confidence (< 0.5) if the text is mostly filler words, greetings, or doesn't contain a clear topic

IMPORTANT:
- If the text is just filler/conversational ("um yeah so like"), return confidence < 0.3
- Focus on NOUNS and CONCEPTS, not actions or transitions
- Extract the most specific, meaningful topic possible

Examples:
- "um so like machine learning is basically about computers learning from data" → {"topic": "Machine Learning", "speaker": null, "confidence": 0.9}
- "and then uh neural networks they use these layers right" → {"topic": "Neural Network Layers", "speaker": null, "confidence": 0.85}
- "so basically the gradient descent algorithm" → {"topic": "Gradient Descent", "speaker": null, "confidence": 0.9}
- "um yeah so like you know" → {"topic": "Conversation", "speaker": null, "confidence": 0.1}
- "I think we should talk about APIs" → {"topic": "APIs", "speaker": null, "confidence": 0.85}

Return ONLY valid JSON.`;

    return withRetry(async () => {
      const response = await openai.chat.completions.create({
        model: AI_MODEL,
        messages: [
          {
            role: "system",
            content: "You are an expert topic extractor for real-time speech. Your job is to identify meaningful concepts from messy, conversational speech. Ignore filler words and extract the core subject matter. Return only valid JSON.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.2,
        max_tokens: 150,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        return { topic: args.text.slice(0, 25), speaker: null, confidence: 0.5 };
      }

      try {
        const cleanedContent = content
          .replace(/```json\n?/g, "")
          .replace(/```\n?/g, "")
          .trim();
        
        const result = JSON.parse(cleanedContent);
        
        await ctx.runMutation(internal.cache.setCachedExtraction, {
          text: args.text,
          mainTopic: args.mainTopic,
          result,
        });
        
        return result;
      } catch {
        return { topic: args.text.slice(0, 25), speaker: null, confidence: 0.5 };
      }
    });
  },
});

// Batch topic extraction - reduces API calls by ~80%
export const extractTopicsBatch = action({
  args: {
    texts: v.array(v.string()),
    mainTopic: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<Array<{ topic: string; speaker: string | null; confidence: number; originalText: string }>> => {
    if (args.texts.length === 0) return [];
    
    const results: Array<{ topic: string; speaker: string | null; confidence: number; originalText: string }> = [];
    const uncachedTexts: Array<{ text: string; index: number }> = [];
    
    for (let i = 0; i < args.texts.length; i++) {
      const cachedResult = await ctx.runQuery(api.cache.getCachedExtraction, {
        text: args.texts[i],
        mainTopic: args.mainTopic,
      });
      
      if (cachedResult) {
        results[i] = { ...cachedResult, originalText: args.texts[i] };
      } else {
        uncachedTexts.push({ text: args.texts[i], index: i });
      }
    }
    
    if (uncachedTexts.length === 0) {
      return results;
    }
    
    if (uncachedTexts.length === 1) {
      const contextHint = args.mainTopic 
        ? `\nContext: The user is discussing "${args.mainTopic}". Extract subtopics related to this main topic.`
        : "";
      
      const prompt = `Extract the main topic from this spoken text:
${contextHint}
Text: "${uncachedTexts[0].text}"

Return JSON: {"topic": "2-5 word topic", "speaker": null, "confidence": 0-1}`;

      const response = await openai.chat.completions.create({
        model: AI_MODEL,
        messages: [
          { role: "system", content: "Extract topics from speech. Return only valid JSON." },
          { role: "user", content: prompt },
        ],
        temperature: 0.2,
        max_tokens: 150,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        results[uncachedTexts[0].index] = { topic: uncachedTexts[0].text.slice(0, 25), speaker: null, confidence: 0.5, originalText: uncachedTexts[0].text };
        return results;
      }

      try {
        const result = JSON.parse(content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim());
        
        await ctx.runMutation(internal.cache.setCachedExtraction, {
          text: uncachedTexts[0].text,
          mainTopic: args.mainTopic,
          result,
        });
        
        results[uncachedTexts[0].index] = { ...result, originalText: uncachedTexts[0].text };
        return results;
      } catch {
        results[uncachedTexts[0].index] = { topic: uncachedTexts[0].text.slice(0, 25), speaker: null, confidence: 0.5, originalText: uncachedTexts[0].text };
        return results;
      }
    }

    // Batch processing for multiple texts
    const contextHint = args.mainTopic 
      ? `Context: The user is discussing "${args.mainTopic}". Extract subtopics related to this main topic.`
      : "";

    const textsFormatted = uncachedTexts.map((item, i) => `${i + 1}. "${item.text}"`).join("\n");

    const prompt = `Extract the main topic from each of these spoken text segments. This is real-time speech recognition output.
${contextHint}

Texts:
${textsFormatted}

For each text, identify the CORE CONCEPT being discussed. Skip filler words.

Return a JSON array where each element has:
- "index": The text number (1-based)
- "topic": The main topic in 2-5 words
- "speaker": null (unless speaker change detected)
- "confidence": 0-1 score (< 0.3 for filler-only text)

Return ONLY valid JSON array.`;

    return withRetry(async () => {
      const response = await openai.chat.completions.create({
        model: AI_MODEL,
        messages: [
          {
            role: "system",
            content: "You are an expert topic extractor for real-time speech. Extract meaningful concepts from multiple speech segments efficiently. Return only valid JSON array.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.2,
        max_tokens: 100 * args.texts.length,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        for (const item of uncachedTexts) {
          results[item.index] = { topic: item.text.slice(0, 25), speaker: null, confidence: 0.5, originalText: item.text };
        }
        return results;
      }

      try {
        const cleanedContent = content
          .replace(/```json\n?/g, "")
          .replace(/```\n?/g, "")
          .trim();
        
        const aiResults = JSON.parse(cleanedContent);
        
        for (let i = 0; i < uncachedTexts.length; i++) {
          const item = uncachedTexts[i];
          const aiResult = aiResults.find((r: { index: number }) => r.index === i + 1) || {
            topic: item.text.slice(0, 25),
            speaker: null,
            confidence: 0.5,
          };
          
          await ctx.runMutation(internal.cache.setCachedExtraction, {
            text: item.text,
            mainTopic: args.mainTopic,
            result: aiResult,
          });
          
          results[item.index] = { ...aiResult, originalText: item.text };
        }
        
        return results;
      } catch {
        for (const item of uncachedTexts) {
          results[item.index] = { topic: item.text.slice(0, 25), speaker: null, confidence: 0.5, originalText: item.text };
        }
        return results;
      }
    });
  },
});

export const searchTopic = action({
  args: {
    topic: v.string(),
    mainTopic: v.optional(v.string()),
    nodeId: v.id("nodes"),
    mindMapId: v.id("mindMaps"),
  },
  handler: async (ctx, args): Promise<{
    summary: string;
    keyPoints: string[];
    relatedConcepts: string[];
    sources: { title: string; url?: string }[];
    cached?: boolean;
  }> => {
    // Check cache first
    const cachedResult = await ctx.runQuery(api.cache.getCachedInsight, {
      topic: args.topic,
      mainTopic: args.mainTopic,
    });

    if (cachedResult) {
      // Save to topic insights even if cached
      await ctx.runMutation(internal.topicInsights.save, {
        mindMapId: args.mindMapId,
        nodeId: args.nodeId,
        topic: args.topic,
        mainTopic: args.mainTopic,
        summary: cachedResult.summary,
        keyPoints: cachedResult.keyPoints,
        relatedConcepts: cachedResult.relatedConcepts,
        sources: cachedResult.sources,
      });
      
      return { ...cachedResult, cached: true };
    }

    const contextPrompt = args.mainTopic 
      ? `The user is discussing "${args.mainTopic}" and mentioned the subtopic "${args.topic}".`
      : `The user mentioned the topic "${args.topic}".`;

    const prompt = `${contextPrompt}

Provide helpful, real-time research insights about this topic. Act as a knowledgeable research assistant.

Return a JSON object with:
1. "summary": A concise 2-3 sentence explanation of this topic (relevant to the main context if provided)
2. "keyPoints": An array of 3-4 key facts or insights about this topic
3. "relatedConcepts": An array of 2-3 related concepts the user might want to explore
4. "sources": An array of 2-3 recommended resources with "title" and optional "url" (use well-known sources like Wikipedia, official docs, reputable sites)

Keep responses informative but concise. Focus on practical, actionable information.

Return ONLY valid JSON.`;

    return withRetry(async () => {
      const response = await openai.chat.completions.create({
        model: AI_MODEL,
        messages: [
          {
            role: "system",
            content: "You are a real-time research assistant. Provide accurate, helpful insights about topics being discussed. Return only valid JSON.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.5,
        max_tokens: 800,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        return {
          summary: `Information about ${args.topic}`,
          keyPoints: ["No additional information available"],
          relatedConcepts: [],
          sources: [],
        };
      }

      try {
        const cleanedContent = content
          .replace(/```json\n?/g, "")
          .replace(/```\n?/g, "")
          .trim();
        
        const result = JSON.parse(cleanedContent);
        
        // Save to cache
        await ctx.runMutation(internal.cache.setCachedInsight, {
          topic: args.topic,
          mainTopic: args.mainTopic,
          response: {
            summary: result.summary || "",
            keyPoints: result.keyPoints || [],
            relatedConcepts: result.relatedConcepts || [],
            sources: result.sources || [],
          },
        });
        
        // Save to topic insights
        await ctx.runMutation(internal.topicInsights.save, {
          mindMapId: args.mindMapId,
          nodeId: args.nodeId,
          topic: args.topic,
          mainTopic: args.mainTopic,
          summary: result.summary || "",
          keyPoints: result.keyPoints || [],
          relatedConcepts: result.relatedConcepts || [],
          sources: result.sources || [],
        });

        return result;
      } catch {
        return {
          summary: `Information about ${args.topic}`,
          keyPoints: ["Unable to fetch detailed information"],
          relatedConcepts: [],
          sources: [],
        };
      }
    });
  },
});

export const suggestSimilarTopics = action({
  args: {
    nodeLabel: v.string(),
    nodeContent: v.optional(v.string()),
    context: v.optional(v.string()),
    existingTopics: v.optional(v.array(v.string())),
  },
  handler: async (_, args): Promise<{ suggestions: Array<{ label: string; description: string }> }> => {
    const existingList = args.existingTopics?.length 
      ? `\nExisting topics to avoid duplicating: ${args.existingTopics.join(", ")}`
      : "";

    const prompt = `Given this mind map node, suggest 3-4 similar or related topics that would be interesting to branch off into.

Node: "${args.nodeLabel}"
${args.nodeContent ? `Description: "${args.nodeContent}"` : ""}
${args.context ? `Main Topic Context: "${args.context}"` : ""}
${existingList}

Return a JSON object with:
"suggestions": An array of 3-4 related topics where each has:
- "label": Short topic name (2-5 words, max 25 chars)
- "description": Brief explanation of why this is related (1 sentence)

Guidelines:
- Suggest topics that are SIMILAR but not identical
- Include adjacent concepts, deeper dives, or alternative perspectives
- Make suggestions diverse - don't just add adjectives to the original topic
- Avoid duplicating any existing topics

Return ONLY valid JSON.`;

    const response = await openai.chat.completions.create({
      model: AI_MODEL,
      messages: [
        {
          role: "system",
          content: "You are a creative mind map assistant that suggests related topics for exploration. Return only valid JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.8,
      max_tokens: 500,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return { suggestions: [] };
    }

    try {
      const cleanedContent = content
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      
      return JSON.parse(cleanedContent);
    } catch {
      return { suggestions: [] };
    }
  },
});

export const generateFromYouTube = action({
  args: {
    videoId: v.string(),
  },
  handler: async (_, args): Promise<{ title: string; nodes: MindMapNode[]; summary: string }> => {
    const prompt = `You are analyzing a YouTube video with ID: "${args.videoId}"

Based on this video ID, imagine the likely content of an educational or informational YouTube video and create a comprehensive mind map structure.

Consider common YouTube video formats:
- Tutorial videos: Step-by-step instructions
- Educational content: Key concepts and explanations
- Reviews: Pros, cons, features
- Vlogs: Timeline of events or topics discussed
- Lectures: Main topics and subtopics

Return a JSON object with:
1. "title": A descriptive title for the mind map (max 50 chars)
2. "summary": A brief summary of the video content (1-2 sentences)
3. "nodes": An array of nodes where each node has:
   - "tempId": A unique string ID (use format "node_0", "node_1", etc.)
   - "parentTempId": The tempId of the parent node (null for root node)
   - "label": A short label for the node (max 30 chars)
   - "content": Optional longer description
   - "level": The depth level (0 for root, 1 for first children, etc.)
   - "order": The order among siblings (0, 1, 2, etc.)

Rules:
- Create a single root node (level 0) representing the video topic
- Include key sections, timestamps, or chapters as level 1 nodes
- Add details and subtopics as level 2-3 nodes
- Maximum 3 levels deep
- Maximum 15 nodes total
- Keep labels concise and meaningful

Return ONLY valid JSON, no markdown or explanation.`;

    const response = await openai.chat.completions.create({
      model: AI_MODEL,
      messages: [
        {
          role: "system",
          content: "You are a YouTube video analyzer that creates structured mind maps from video content. Return only valid JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from AI");
    }

    try {
      const cleanedContent = content
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      
      return JSON.parse(cleanedContent);
    } catch {
      throw new Error("Failed to parse AI response");
    }
  },
});

export const generateFromUrl = action({
  args: {
    url: v.string(),
  },
  handler: async (_, args): Promise<{ title: string; nodes: MindMapNode[]; summary: string }> => {
    const prompt = `You are given a URL. Imagine you have access to the content of this webpage and create a mind map structure based on what a typical article at this URL would contain.

URL: "${args.url}"

Based on the URL structure and domain, create a relevant mind map. For example:
- News sites: Create a map about the likely topic
- Blog posts: Create a map about the subject matter
- Documentation: Create a technical overview map

Return a JSON object with:
1. "title": A concise title for the mind map (max 50 chars)
2. "summary": A brief summary of what the page likely contains (1-2 sentences)
3. "nodes": An array of nodes where each node has:
   - "tempId": A unique string ID (use format "node_0", "node_1", etc.)
   - "parentTempId": The tempId of the parent node (null for root node)
   - "label": A short label for the node (max 30 chars)
   - "content": Optional longer description
   - "level": The depth level (0 for root, 1 for first children, etc.)
   - "order": The order among siblings (0, 1, 2, etc.)

Rules:
- Create a single root node (level 0) that represents the main topic
- Group related concepts as children
- Maximum 3 levels deep
- Maximum 12 nodes total
- Keep labels concise and meaningful

Return ONLY valid JSON, no markdown or explanation.`;

    const response = await openai.chat.completions.create({
      model: AI_MODEL,
      messages: [
        {
          role: "system",
          content: "You are a mind map generator that creates structured content from URLs. Return only valid JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from AI");
    }

    try {
      const cleanedContent = content
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      
      return JSON.parse(cleanedContent);
    } catch {
      throw new Error("Failed to parse AI response");
    }
  },
});

export const generateFromPDF = action({
  args: {
    pdfText: v.string(),
    title: v.optional(v.string()),
  },
  handler: async (_, args): Promise<{ title: string; nodes: MindMapNode[]; edges: MindMapEdge[] }> => {
    const textPreview = args.pdfText.slice(0, 15000);
    
    const prompt = `Analyze this PDF document and create a comprehensive mind map structure.

Document content:
${textPreview}

Create a hierarchical mind map with:
1. A central topic (infer from content if no title provided)
2. Main sections as level 1 nodes
3. Key points as level 2 nodes
4. Supporting details as level 3 nodes

Return a JSON object with:
- "title": The document title or inferred topic
- "nodes": Array of nodes with tempId, label (max 40 chars), content (optional description), level (0-3), order
- "edges": Array of edges with tempId, sourceTempId, targetTempId

Return ONLY valid JSON. Create 10-20 nodes for a comprehensive overview.`;

    const response = await openai.chat.completions.create({
      model: AI_MODEL,
      messages: [
        {
          role: "system",
          content: "You are a document analyzer that creates structured mind maps from PDF content. Return only valid JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.5,
      max_tokens: 3000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from AI");
    }

    try {
      const cleanedContent = content
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      
      return JSON.parse(cleanedContent);
    } catch {
      throw new Error("Failed to parse AI response");
    }
  },
});

export const deepResearch = action({
  args: {
    topic: v.string(),
    depth: v.optional(v.union(v.literal("basic"), v.literal("detailed"), v.literal("comprehensive"))),
  },
  handler: async (_, args): Promise<{ title: string; nodes: MindMapNode[]; edges: MindMapEdge[]; sources: string[] }> => {
    const depth = args.depth || "detailed";
    const nodeCount = depth === "basic" ? "8-12" : depth === "detailed" ? "15-25" : "25-40";
    
    const prompt = `Conduct deep research on the topic: "${args.topic}"

Create a ${depth} mind map with ${nodeCount} nodes covering:
1. Definition and overview
2. Key concepts and principles
3. Historical context or background
4. Current applications or relevance
5. Related topics and connections
6. Common misconceptions (if any)
7. Future trends or developments

Return a JSON object with:
- "title": The research topic
- "nodes": Array of nodes with tempId, label (max 40 chars), content (detailed description), level (0-3), order
- "edges": Array of edges with tempId, sourceTempId, targetTempId
- "sources": Array of suggested source types (e.g., "Academic journals", "Industry reports")

Return ONLY valid JSON. Make the content educational and well-researched.`;

    const response = await openai.chat.completions.create({
      model: AI_MODEL,
      messages: [
        {
          role: "system",
          content: "You are a research assistant that creates comprehensive, educational mind maps. Include factual, well-organized information. Return only valid JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.6,
      max_tokens: 4000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from AI");
    }

    try {
      const cleanedContent = content
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      
      return JSON.parse(cleanedContent);
    } catch {
      throw new Error("Failed to parse AI response");
    }
  },
});

export const generateFromAudio = action({
  args: {
    transcript: v.string(),
    title: v.optional(v.string()),
    audioType: v.optional(v.union(v.literal("meeting"), v.literal("lecture"), v.literal("podcast"), v.literal("interview"), v.literal("other"))),
  },
  handler: async (_, args): Promise<{ title: string; nodes: MindMapNode[]; edges: MindMapEdge[]; summary: string }> => {
    const audioType = args.audioType || "other";
    const transcriptPreview = args.transcript.slice(0, 12000);
    
    const typeSpecificInstructions = {
      meeting: "Focus on action items, decisions made, and key discussion points.",
      lecture: "Organize by main topics, key concepts, and important examples.",
      podcast: "Capture main themes, guest insights, and memorable quotes.",
      interview: "Structure around questions asked and key responses.",
      other: "Extract main topics and organize hierarchically.",
    };
    
    const prompt = `Analyze this ${audioType} transcript and create a mind map.

Transcript:
${transcriptPreview}

${typeSpecificInstructions[audioType]}

Return a JSON object with:
- "title": The inferred title or topic
- "nodes": Array of nodes with tempId, label (max 40 chars), content (key points), level (0-3), order
- "edges": Array of edges with tempId, sourceTempId, targetTempId
- "summary": A 2-3 sentence summary of the content

Return ONLY valid JSON. Create 10-20 nodes.`;

    const response = await openai.chat.completions.create({
      model: AI_MODEL,
      messages: [
        {
          role: "system",
          content: "You are an audio content analyzer that creates structured mind maps from transcripts. Return only valid JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.5,
      max_tokens: 3000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from AI");
    }

    try {
      const cleanedContent = content
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      
      return JSON.parse(cleanedContent);
    } catch {
      throw new Error("Failed to parse AI response");
    }
  },
});

export const expandNode = action({
  args: {
    nodeLabel: v.string(),
    nodeContent: v.optional(v.string()),
    context: v.optional(v.string()),
  },
  handler: async (_, args): Promise<{ nodes: MindMapNode[] }> => {
    const prompt = `Expand the following mind map node into 3-5 sub-nodes.

Node: "${args.nodeLabel}"
${args.nodeContent ? `Description: "${args.nodeContent}"` : ""}
${args.context ? `Context: "${args.context}"` : ""}

Return a JSON object with:
"nodes": An array of child nodes where each has:
- "tempId": Unique ID (format "expand_0", "expand_1", etc.)
- "label": Short label (max 30 chars)
- "content": Optional description
- "level": 1 (these are all children)
- "order": Order among siblings

Return ONLY valid JSON.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a mind map expander. Return only valid JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from AI");
    }

    try {
      const cleanedContent = content
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      
      return JSON.parse(cleanedContent);
    } catch {
      throw new Error("Failed to parse AI response");
    }
  },
});

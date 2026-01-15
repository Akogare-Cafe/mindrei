import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";

// Simple hash function for topic caching
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

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function hashText(text: string, mainTopic?: string): string {
  const normalized = `${normalizeText(text)}|${(mainTopic || "").toLowerCase().trim()}`;
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    const char = normalized.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(36);
}

function calculateSimilarity(text1: string, text2: string): number {
  const words1 = new Set(text1.split(" "));
  const words2 = new Set(text2.split(" "));
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);
  return intersection.size / union.size;
}

// Cache duration: 24 hours
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000;

export const getCachedInsight = query({
  args: { 
    topic: v.string(),
    mainTopic: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const topicHash = hashTopic(args.topic, args.mainTopic);
    const cached = await ctx.db
      .query("insightCache")
      .withIndex("by_hash", (q) => q.eq("topicHash", topicHash))
      .first();
    
    if (!cached) return null;
    
    // Check if expired
    if (cached.expiresAt < Date.now()) {
      return null;
    }
    
    return cached.response;
  },
});

export const setCachedInsight = internalMutation({
  args: {
    topic: v.string(),
    mainTopic: v.optional(v.string()),
    response: v.object({
      summary: v.string(),
      keyPoints: v.array(v.string()),
      relatedConcepts: v.array(v.string()),
      sources: v.array(v.object({ 
        title: v.string(), 
        url: v.optional(v.string()) 
      })),
    }),
  },
  handler: async (ctx, args) => {
    const topicHash = hashTopic(args.topic, args.mainTopic);
    const now = Date.now();
    
    // Check if already cached
    const existing = await ctx.db
      .query("insightCache")
      .withIndex("by_hash", (q) => q.eq("topicHash", topicHash))
      .first();
    
    if (existing) {
      // Update hit count and extend expiry
      await ctx.db.patch(existing._id, {
        hitCount: existing.hitCount + 1,
        expiresAt: now + CACHE_DURATION_MS,
      });
      return existing._id;
    }
    
    // Create new cache entry
    return await ctx.db.insert("insightCache", {
      topicHash,
      mainTopic: args.mainTopic,
      response: args.response,
      hitCount: 1,
      createdAt: now,
      expiresAt: now + CACHE_DURATION_MS,
    });
  },
});

export const incrementCacheHit = internalMutation({
  args: { topicHash: v.string() },
  handler: async (ctx, args) => {
    const cached = await ctx.db
      .query("insightCache")
      .withIndex("by_hash", (q) => q.eq("topicHash", args.topicHash))
      .first();
    
    if (cached) {
      await ctx.db.patch(cached._id, {
        hitCount: cached.hitCount + 1,
      });
    }
  },
});

// Cleanup expired cache entries (run periodically)
export const cleanupExpiredCache = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const expired = await ctx.db
      .query("insightCache")
      .withIndex("by_expires", (q) => q.lt("expiresAt", now))
      .take(100);
    
    for (const entry of expired) {
      await ctx.db.delete(entry._id);
    }
    
    return { deleted: expired.length };
  },
});

export const getCachedExtraction = query({
  args: { 
    text: v.string(),
    mainTopic: v.optional(v.string()),
    similarityThreshold: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const textHash = hashText(args.text, args.mainTopic);
    const normalized = normalizeText(args.text);
    const threshold = args.similarityThreshold || 0.85;
    
    const exactMatch = await ctx.db
      .query("extractionCache")
      .withIndex("by_hash", (q) => q.eq("textHash", textHash))
      .first();
    
    if (exactMatch && exactMatch.expiresAt > Date.now()) {
      return { ...exactMatch.result, cached: true, matchType: "exact" };
    }
    
    const similarEntries = await ctx.db
      .query("extractionCache")
      .withIndex("by_normalized")
      .filter((q) => q.gt(q.field("expiresAt"), Date.now()))
      .take(50);
    
    for (const entry of similarEntries) {
      if (entry.mainTopic !== args.mainTopic) continue;
      
      const similarity = calculateSimilarity(normalized, entry.normalizedText);
      if (similarity >= threshold) {
        return { ...entry.result, cached: true, matchType: "similar", similarity };
      }
    }
    
    return null;
  },
});

export const setCachedExtraction = internalMutation({
  args: {
    text: v.string(),
    mainTopic: v.optional(v.string()),
    result: v.object({
      topic: v.string(),
      speaker: v.union(v.string(), v.null()),
      confidence: v.number(),
    }),
  },
  handler: async (ctx, args) => {
    const textHash = hashText(args.text, args.mainTopic);
    const normalized = normalizeText(args.text);
    const now = Date.now();
    
    const existing = await ctx.db
      .query("extractionCache")
      .withIndex("by_hash", (q) => q.eq("textHash", textHash))
      .first();
    
    if (existing) {
      await ctx.db.patch(existing._id, {
        hitCount: existing.hitCount + 1,
        expiresAt: now + CACHE_DURATION_MS,
      });
      return existing._id;
    }
    
    return await ctx.db.insert("extractionCache", {
      textHash,
      normalizedText: normalized,
      mainTopic: args.mainTopic,
      result: args.result,
      hitCount: 1,
      createdAt: now,
      expiresAt: now + CACHE_DURATION_MS,
    });
  },
});

export const cleanupExpiredExtractionCache = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const expired = await ctx.db
      .query("extractionCache")
      .withIndex("by_expires", (q) => q.lt("expiresAt", now))
      .take(100);
    
    for (const entry of expired) {
      await ctx.db.delete(entry._id);
    }
    
    return { deleted: expired.length };
  },
});

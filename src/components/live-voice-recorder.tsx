"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Square, Sparkles, Users, Brain, Target } from "lucide-react";
import { useMutation, useAction, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useVoiceRecognition } from "@/hooks/use-voice-recognition";
import { PixelButton } from "@/components/pixel-button";
import { PixelCard, PixelCardContent } from "@/components/pixel-card";
import { PixelBadge } from "@/components/pixel-badge";
import { PixelInput } from "@/components/pixel-input";
import { cn } from "@/lib/utils";
import { cleanupTranscript } from "@/lib/text-cleanup";

// Sentence boundary detection constants
const SENTENCE_ENDINGS = /[.!?]+\s*$/;
const CLAUSE_BOUNDARIES = /[,;:]+\s*$/;
const MIN_WORDS_FOR_PROCESSING = 1;
const MAX_WORDS_BEFORE_FORCE = 5;
const BATCH_DEBOUNCE_MS = 150;
const INTERIM_PROCESS_THRESHOLD = 3;

interface LiveVoiceRecorderProps {
  userId: Id<"users">;
  onSessionStart: (mindMapId: Id<"mindMaps">, rootNodeId: Id<"nodes">) => void;
  onSessionEnd: () => void;
  activeMindMapId: Id<"mindMaps"> | null;
}

export function LiveVoiceRecorder({
  userId,
  onSessionStart,
  onSessionEnd,
  activeMindMapId,
}: LiveVoiceRecorderProps) {
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [showTopicPrompt, setShowTopicPrompt] = useState(false);
  const [mainTopic, setMainTopic] = useState("");
  const [detectedSpeakers, setDetectedSpeakers] = useState<string[]>([]);
  const [currentSpeaker, setCurrentSpeaker] = useState<string | null>(null);
  const [processedTopics, setProcessedTopics] = useState<string[]>([]);
  const [useAI, setUseAI] = useState(true);
  
  const wordBufferRef = useRef<string>("");
  const processingQueueRef = useRef<string[]>([]);
  const isProcessingRef = useRef(false);
  const mindMapIdRef = useRef<Id<"mindMaps"> | null>(null);
  const batchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingPhrasesRef = useRef<string[]>([]);
  const detectedSpeakersRef = useRef<string[]>([]);

  const createSession = useMutation(api.liveSession.create);
  const addLiveNode = useMutation(api.liveSession.addLiveNode);
  const extractTopic = useAction(api.ai.extractTopic);
  const extractTopicsBatch = useAction(api.ai.extractTopicsBatch);
  const searchTopic = useAction(api.ai.searchTopic);
  
  const mainTopicRef = useRef<string>("");
  
  const rootNode = useQuery(
    api.liveSession.getRootNode,
    activeMindMapId ? { mindMapId: activeMindMapId } : "skip"
  );

  const activeMindMap = useQuery(
    api.mindMaps.getById,
    activeMindMapId ? { id: activeMindMapId } : "skip"
  );

  const rootNodeRef = useRef<typeof rootNode>(null);

  useEffect(() => {
    mindMapIdRef.current = activeMindMapId;
    if (activeMindMap?.mainTopic) {
      mainTopicRef.current = activeMindMap.mainTopic;
      setMainTopic(activeMindMap.mainTopic);
    }
  }, [activeMindMapId, activeMindMap]);

  useEffect(() => {
    if (rootNode) {
      rootNodeRef.current = rootNode;
    }
  }, [rootNode]);

  // Keep ref in sync with state for detectedSpeakers
  useEffect(() => {
    detectedSpeakersRef.current = detectedSpeakers;
  }, [detectedSpeakers]);

  // Process a single topic result and add to mind map
  const processTopicResult = useCallback(async (
    topic: string,
    speaker: string | null,
    confidence: number,
    rawPhrase: string
  ) => {
    if (!mindMapIdRef.current || !rootNodeRef.current) return;
    
    if (confidence < 0.4) {
      console.log("Skipping low-confidence topic:", topic, confidence);
      return;
    }

    // Update speakers using ref to avoid stale closure
    if (speaker && !detectedSpeakersRef.current.includes(speaker)) {
      setDetectedSpeakers(prev => [...prev, speaker!]);
    }
    if (speaker) {
      setCurrentSpeaker(speaker);
    }

    console.log("Adding node:", topic, "confidence:", confidence);
    setProcessedTopics(prev => [...prev.slice(-4), topic]);

    try {
      const nodeId = await addLiveNode({
        mindMapId: mindMapIdRef.current,
        parentId: rootNodeRef.current._id,
        label: topic.slice(0, 25),
        content: rawPhrase,
        level: 1,
        order: 0,
      });
      
      if (!nodeId) {
        console.log("Node skipped (duplicate or filler)");
        return;
      }
      
      console.log("Node added successfully!");

      // Fire and forget search
      searchTopic({
        topic,
        mainTopic: mainTopicRef.current || undefined,
        nodeId,
        mindMapId: mindMapIdRef.current,
      }).catch((err) => console.log("Search failed:", err));
    } catch (error) {
      console.error("Failed to add node:", error);
    }
  }, [addLiveNode, searchTopic]);

  // Batch process multiple phrases with single AI call
  const processBatch = useCallback(async () => {
    if (!mindMapIdRef.current || !rootNodeRef.current) {
      console.log("Waiting for mindMapId or rootNode...");
      setTimeout(processBatch, 50);
      return;
    }

    const phrases = pendingPhrasesRef.current.splice(0);
    if (phrases.length === 0) return;

    console.log("Processing batch of", phrases.length, "phrases");

    if (useAI) {
      try {
        const results = await extractTopicsBatch({
          texts: phrases,
          mainTopic: mainTopicRef.current || undefined,
        });

        for (const result of results) {
          await processTopicResult(
            result.topic,
            result.speaker,
            result.confidence,
            result.originalText
          );
        }
      } catch (error) {
        console.error("Batch extraction failed:", error);
        // Fallback: process each phrase with cleanup
        for (const phrase of phrases) {
          const topic = cleanupText(phrase);
          await processTopicResult(topic, null, 0.5, phrase);
        }
      }
    } else {
      // Non-AI mode: just clean up text
      for (const phrase of phrases) {
        const topic = cleanupText(phrase);
        await processTopicResult(topic, null, 0.5, phrase);
      }
    }
  }, [useAI, extractTopicsBatch, processTopicResult]);

  // Legacy single-phrase processing (kept for compatibility)
  const processNextInQueue = useCallback(async () => {
    if (isProcessingRef.current || processingQueueRef.current.length === 0) return;
    if (!mindMapIdRef.current || !rootNodeRef.current) {
      console.log("Waiting for mindMapId or rootNode...");
      setTimeout(processNextInQueue, 50);
      return;
    }

    isProcessingRef.current = true;
    const rawPhrase = processingQueueRef.current.shift()!;

    try {
      let topic = rawPhrase;
      let speaker: string | null = null;
      let confidence = 0.5;
      
      if (useAI) {
        try {
          const result = await extractTopic({ 
            text: rawPhrase,
            mainTopic: mainTopicRef.current || undefined,
          });
          topic = result.topic;
          speaker = result.speaker;
          confidence = result.confidence;
        } catch (aiError) {
          console.log("AI extraction failed, using raw text:", aiError);
          topic = rawPhrase.slice(0, 25);
        }
      } else {
        topic = cleanupText(rawPhrase);
      }

      await processTopicResult(topic, speaker, confidence, rawPhrase);
    } catch (error) {
      console.error("Failed to process phrase:", error);
    } finally {
      isProcessingRef.current = false;
      if (processingQueueRef.current.length > 0) {
        setTimeout(processNextInQueue, 50);
      }
    }
  }, [addLiveNode, extractTopic, useAI, processTopicResult]);

  const cleanupText = (text: string): string => {
    const cleaned = cleanupTranscript(text, 4);
    const words = cleaned.split(' ');
    return words.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  // Queue phrase for batch processing with debounce
  const queuePhrase = useCallback((phrase: string) => {
    if (phrase.trim().length === 0) return;
    
    console.log("Queuing phrase:", phrase);
    pendingPhrasesRef.current.push(phrase.trim());
    
    // Clear existing timeout
    if (batchTimeoutRef.current) {
      clearTimeout(batchTimeoutRef.current);
    }
    
    // Set new debounced batch processing
    batchTimeoutRef.current = setTimeout(() => {
      processBatch();
    }, BATCH_DEBOUNCE_MS);
  }, [processBatch]);

  // Check if buffer should be processed based on sentence boundaries
  const shouldProcessBuffer = useCallback((buffer: string): boolean => {
    const words = buffer.trim().split(/\s+/).filter(w => w.length > 0);
    
    if (words.length >= MAX_WORDS_BEFORE_FORCE) return true;
    
    if (words.length >= MIN_WORDS_FOR_PROCESSING && SENTENCE_ENDINGS.test(buffer)) {
      return true;
    }
    
    if (words.length >= MIN_WORDS_FOR_PROCESSING && CLAUSE_BOUNDARIES.test(buffer)) {
      return true;
    }
    
    return false;
  }, []);

  const {
    isListening,
    isSupported,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    resetTranscript,
  } = useVoiceRecognition({
    onResult: (text) => {
      console.log("Voice result:", text);
      wordBufferRef.current += " " + text;
      
      if (shouldProcessBuffer(wordBufferRef.current)) {
        const phrase = wordBufferRef.current.trim();
        wordBufferRef.current = "";
        queuePhrase(phrase);
      }
    },
    onInterimResult: (interim) => {
      const words = interim.trim().split(/\s+/).filter(w => w.length > 0);
      if (words.length >= INTERIM_PROCESS_THRESHOLD) {
        if (batchTimeoutRef.current) {
          clearTimeout(batchTimeoutRef.current);
        }
        batchTimeoutRef.current = setTimeout(() => {
          if (pendingPhrasesRef.current.length > 0) {
            processBatch();
          }
        }, 100);
      }
    },
    continuous: true,
  });

  const handleShowTopicPrompt = () => {
    setShowTopicPrompt(true);
  };

  const handleStartSession = async () => {
    if (!mainTopic.trim()) return;
    
    try {
      const result = await createSession({
        userId,
        title: mainTopic.trim(),
        mainTopic: mainTopic.trim(),
      });
      
      setIsSessionActive(true);
      setShowTopicPrompt(false);
      setDetectedSpeakers([]);
      setCurrentSpeaker(null);
      setProcessedTopics([]);
      wordBufferRef.current = "";
      processingQueueRef.current = [];
      pendingPhrasesRef.current = [];
      isProcessingRef.current = false;
      if (batchTimeoutRef.current) {
        clearTimeout(batchTimeoutRef.current);
        batchTimeoutRef.current = null;
      }
      mainTopicRef.current = mainTopic.trim();
      resetTranscript();
      
      onSessionStart(result.mindMapId, result.rootNodeId);
      startListening();
    } catch (error) {
      console.error("Failed to start session:", error);
    }
  };

  const handleCancelTopicPrompt = () => {
    setShowTopicPrompt(false);
    setMainTopic("");
  };

  const handleStopSession = () => {
    stopListening();
    setIsSessionActive(false);
    if (!activeMindMapId) {
      setMainTopic("");
      mainTopicRef.current = "";
    }
    
    // Process any remaining buffer
    if (wordBufferRef.current.trim()) {
      pendingPhrasesRef.current.push(wordBufferRef.current.trim());
    }
    
    // Clear debounce and process immediately
    if (batchTimeoutRef.current) {
      clearTimeout(batchTimeoutRef.current);
      batchTimeoutRef.current = null;
    }
    
    // Process any pending phrases immediately
    if (pendingPhrasesRef.current.length > 0) {
      processBatch();
    }
    
    onSessionEnd();
  };

  const toggleAI = () => {
    setUseAI(prev => !prev);
  };

  if (!isSupported) {
    return (
      <PixelCard className="p-6">
        <div className="text-center text-muted-foreground">
          <MicOff className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Voice recognition is not supported in your browser.</p>
          <p className="text-sm mt-2">Please use Chrome, Edge, or Safari.</p>
        </div>
      </PixelCard>
    );
  }

  return (
    <PixelCard rarity={isSessionActive ? "legendary" : "common"} className="overflow-visible">
      <PixelCardContent className="space-y-4 p-5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">Voice Capture</span>
          </div>
          <button
            onClick={toggleAI}
            className={cn(
              "px-2 py-1 rounded-md text-xs font-medium transition-colors",
              useAI 
                ? "bg-primary/20 text-primary border border-primary/30" 
                : "bg-muted text-muted-foreground border border-border"
            )}
          >
            {useAI ? "AI On" : "AI Off"}
          </button>
        </div>

        {showTopicPrompt && !isSessionActive && (
          <div className="space-y-3 p-4 bg-accent/10 rounded-lg border border-accent/20">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium text-foreground">What is the main topic?</span>
            </div>
            <p className="text-xs text-muted-foreground">
              This helps improve AI topic detection accuracy
            </p>
            <PixelInput
              type="text"
              placeholder="e.g., Machine Learning, Project Planning..."
              value={mainTopic}
              onChange={(e) => setMainTopic(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleStartSession()}
              autoFocus
              className="w-full"
            />
            <div className="flex gap-2">
              <PixelButton
                onClick={handleStartSession}
                disabled={!mainTopic.trim()}
                className="flex-1"
              >
                <Mic className="w-4 h-4 mr-2" />
                Start Recording
              </PixelButton>
              <PixelButton
                variant="outline"
                onClick={handleCancelTopicPrompt}
              >
                Cancel
              </PixelButton>
            </div>
          </div>
        )}

        {!showTopicPrompt && (
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <button
                onClick={isSessionActive ? handleStopSession : handleShowTopicPrompt}
                className={cn(
                "relative w-20 h-20 rounded-full flex items-center justify-center",
                "border-2 shadow-lg",
                isSessionActive
                  ? "bg-gradient-to-br from-red-500/20 to-orange-500/20 border-red-400 hover:border-red-300"
                  : "bg-gradient-to-br from-primary/10 to-accent/10 border-primary/50 hover:border-primary"
              )}
            >
              {isSessionActive ? (
                <Square className="w-6 h-6 text-red-500 fill-red-500" />
              ) : (
                <Mic className="w-8 h-8 text-primary" />
              )}
            </button>
            </div>


            <div className="text-center">
              <p className="text-base font-semibold text-foreground">
                {isSessionActive ? "Recording Active" : "Start Recording"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {isSessionActive
                  ? "Click the stop button to end session"
                  : "Click microphone to begin"}
              </p>
            </div>
          </div>
        )}

        {detectedSpeakers.length > 0 && (
          <div className="flex items-center gap-2 p-3 bg-accent/10 rounded-lg border border-accent/20">
            <Users className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-foreground">Speakers:</span>
            <div className="flex gap-1 flex-wrap">
              {detectedSpeakers.map((speaker, i) => (
                <PixelBadge 
                  key={i} 
                  variant={currentSpeaker === speaker ? "default" : "secondary"}
                  className="text-xs"
                >
                  {speaker}
                </PixelBadge>
              ))}
            </div>
          </div>
        )}

        {processedTopics.length > 0 && isSessionActive && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Recent Topics
            </p>
            <div className="flex flex-wrap gap-1.5">
              {processedTopics.map((topic, i) => (
                <div
                  key={i}
                  className={cn(
                    "px-2.5 py-1 rounded-full text-xs font-medium",
                    i === processedTopics.length - 1
                      ? "bg-primary/20 text-primary border border-primary/30"
                      : "bg-muted/50 text-muted-foreground border border-border/50"
                  )}
                >
                  {topic}
                </div>
              ))}
            </div>
          </div>
        )}

        {(transcript || interimTranscript) && isSessionActive && (
          <div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Live Transcript
                </p>
                <div className="bg-card rounded-lg p-3 max-h-24 overflow-y-auto border border-border shadow-inner">
                  <p className="text-sm leading-relaxed text-foreground">
                    {transcript}
                    {interimTranscript && (
                      <span className="text-primary/70 italic">
                        {" "}{interimTranscript}
                      </span>
                    )}
                  </p>
                </div>
              </div>
          </div>
        )}

        {isSessionActive && (
          <div className="flex items-center justify-center gap-2 pt-2 border-t border-border/50">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-medium text-muted-foreground">
              {useAI ? "AI extracting topics from speech" : "Creating branches from speech"}
            </span>
          </div>
        )}
      </PixelCardContent>
    </PixelCard>
  );
}

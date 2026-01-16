"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Plus, Loader2 } from "lucide-react";
import { useAction, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { PixelButton } from "@/components/pixel-button";
import { PixelCard } from "@/components/pixel-card";

interface SimilarTopicsDialogProps {
  nodeId: Id<"nodes">;
  nodeLabel: string;
  nodeContent?: string;
  mindMapId: Id<"mindMaps">;
  mainTopic?: string;
  existingTopics: string[];
  onClose: () => void;
  onTopicAdded?: () => void;
}

export function SimilarTopicsDialog({
  nodeId,
  nodeLabel,
  nodeContent,
  mindMapId,
  mainTopic,
  existingTopics,
  onClose,
  onTopicAdded,
}: SimilarTopicsDialogProps) {
  const [suggestions, setSuggestions] = useState<Array<{ label: string; description: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [addingTopicIndex, setAddingTopicIndex] = useState<number | null>(null);

  const suggestSimilarTopics = useAction(api.ai.suggestSimilarTopics);
  const expandNodeWithChildren = useMutation(api.liveSession.expandNodeWithChildren);

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        setIsLoading(true);
        const result = await suggestSimilarTopics({
          nodeLabel,
          nodeContent,
          context: mainTopic,
          existingTopics,
        });
        setSuggestions(result.suggestions || []);
      } catch (error) {
        console.error("Failed to fetch suggestions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuggestions();
  }, [nodeLabel, nodeContent, mainTopic, existingTopics, suggestSimilarTopics]);

  const handleAddTopic = async (topic: { label: string; description: string }, index: number) => {
    try {
      setAddingTopicIndex(index);
      await expandNodeWithChildren({
        mindMapId,
        parentNodeId: nodeId,
        childLabels: [{ label: topic.label, content: topic.description }],
      });
      onTopicAdded?.();
      setSuggestions(prev => prev.filter((_, i) => i !== index));
    } catch (error) {
      console.error("Failed to add topic:", error);
    } finally {
      setAddingTopicIndex(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl"
      >
        <PixelCard className="overflow-hidden">
          <div className="p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-bold text-foreground">Similar Topics</h2>
                </div>
                <p className="text-sm text-muted-foreground">
                  AI-suggested topics related to <span className="font-medium text-foreground">{nodeLabel}</span>
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <div className="space-y-3">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
              ) : suggestions.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p className="text-sm">No suggestions available</p>
                </div>
              ) : (
                <AnimatePresence>
                  {suggestions.map((suggestion, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-4 rounded-xl border border-border bg-card hover:border-primary/30 transition-all group"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground mb-1">
                            {suggestion.label}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {suggestion.description}
                          </p>
                        </div>
                        <PixelButton
                          size="sm"
                          onClick={() => handleAddTopic(suggestion, index)}
                          disabled={addingTopicIndex !== null}
                          className="flex-shrink-0"
                        >
                          {addingTopicIndex === index ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <Plus className="w-4 h-4 mr-1" />
                              Add
                            </>
                          )}
                        </PixelButton>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <PixelButton variant="outline" onClick={onClose}>
                Close
              </PixelButton>
            </div>
          </div>
        </PixelCard>
      </motion.div>
    </motion.div>
  );
}

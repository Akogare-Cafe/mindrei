"use client";

import { useState } from "react";
import { useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Loader2, AlertCircle, Sparkles } from "lucide-react";
import { PixelButton } from "@/components/pixel-button";
import { PixelInput } from "@/components/pixel-input";
import { PixelCard, PixelCardContent, PixelCardHeader, PixelCardTitle } from "@/components/pixel-card";

interface DeepResearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMindMapCreated: (mindMapId: Id<"mindMaps">) => void;
  userId: Id<"users">;
}

type ResearchDepth = "basic" | "detailed" | "comprehensive";

const depthOptions: { value: ResearchDepth; label: string; description: string; nodes: string }[] = [
  { value: "basic", label: "Basic", description: "Quick overview", nodes: "8-12 nodes" },
  { value: "detailed", label: "Detailed", description: "In-depth analysis", nodes: "15-25 nodes" },
  { value: "comprehensive", label: "Comprehensive", description: "Full research", nodes: "25-40 nodes" },
];

export function DeepResearchDialog({
  open,
  onOpenChange,
  onMindMapCreated,
  userId,
}: DeepResearchDialogProps) {
  const [topic, setTopic] = useState("");
  const [depth, setDepth] = useState<ResearchDepth>("detailed");
  const [isResearching, setIsResearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string>("");

  const deepResearch = useAction(api.ai.deepResearch);
  const createMindMap = useMutation(api.mindMaps.create);
  const createNode = useMutation(api.nodes.create);
  const createEdge = useMutation(api.edges.create);

  const handleResearch = async () => {
    if (!topic.trim()) {
      setError("Please enter a research topic");
      return;
    }

    setIsResearching(true);
    setError(null);
    setProgress("Researching topic with AI...");

    try {
      const result = await deepResearch({
        topic: topic.trim(),
        depth,
      });

      setProgress("Creating mind map...");
      const mindMapId = await createMindMap({
        userId,
        title: result.title,
      });

      setProgress("Adding research nodes...");
      const nodeIdMap = new Map<string, Id<"nodes">>();

      for (const node of result.nodes) {
        const parentId = node.parentTempId ? nodeIdMap.get(node.parentTempId) : undefined;
        
        const nodeId = await createNode({
          mindMapId,
          label: node.label,
          content: node.content,
          level: node.level,
          order: node.order,
          parentId,
          positionX: 400 + (node.level * 250) + (Math.random() * 50 - 25),
          positionY: 100 + (node.order * 100) + (Math.random() * 30 - 15),
        });
        
        nodeIdMap.set(node.tempId, nodeId);
      }

      if (result.edges) {
        setProgress("Creating connections...");
        for (const edge of result.edges) {
          const sourceId = nodeIdMap.get(edge.sourceTempId);
          const targetId = nodeIdMap.get(edge.targetTempId);
          
          if (sourceId && targetId) {
            await createEdge({
              mindMapId,
              sourceId,
              targetId,
            });
          }
        }
      }

      setProgress("Done!");
      onMindMapCreated(mindMapId);
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Research failed");
    } finally {
      setIsResearching(false);
      setProgress("");
    }
  };

  const handleClose = () => {
    setTopic("");
    setDepth("detailed");
    setError(null);
    setProgress("");
    onOpenChange(false);
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg mx-4"
        >
          <PixelCard>
            <PixelCardHeader className="flex flex-row items-center justify-between">
              <PixelCardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5 text-primary" />
                Deep Research
              </PixelCardTitle>
              <button
                onClick={handleClose}
                className="p-1.5 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </PixelCardHeader>

            <PixelCardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Research Topic
                </label>
                <PixelInput
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., Machine Learning, Climate Change, Blockchain..."
                  disabled={isResearching}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Research Depth
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {depthOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setDepth(option.value)}
                      disabled={isResearching}
                      className={`
                        p-3 rounded-xl border-2 text-left transition-all
                        ${depth === option.value
                          ? "border-primary bg-primary/10"
                          : "border-muted hover:border-primary/50"
                        }
                        ${isResearching ? "opacity-50 cursor-not-allowed" : ""}
                      `}
                    >
                      <p className="font-medium text-sm text-foreground">{option.label}</p>
                      <p className="text-xs text-muted-foreground">{option.nodes}</p>
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <p className="text-sm">{error}</p>
                </div>
              )}

              {progress && (
                <div className="flex items-center gap-2 p-3 bg-primary/10 text-primary rounded-lg">
                  <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
                  <p className="text-sm">{progress}</p>
                </div>
              )}

              <div className="flex gap-3">
                <PixelButton
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1"
                  disabled={isResearching}
                >
                  Cancel
                </PixelButton>
                <PixelButton
                  onClick={handleResearch}
                  className="flex-1"
                  disabled={!topic.trim() || isResearching}
                >
                  {isResearching ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Researching...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Start Research
                    </>
                  )}
                </PixelButton>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                AI will research the topic and create a comprehensive mind map with key concepts, history, applications, and more.
              </p>
            </PixelCardContent>
          </PixelCard>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

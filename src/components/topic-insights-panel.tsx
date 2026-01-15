"use client";

import { useEffect, useRef, forwardRef } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Lightbulb, Link2, BookOpen, Loader2, X } from "lucide-react";
import { PixelCard, PixelCardContent, PixelCardHeader, PixelCardTitle } from "@/components/pixel-card";
import { PixelBadge } from "@/components/pixel-badge";
import { PixelButton } from "@/components/pixel-button";
import { cn } from "@/lib/utils";

interface TopicInsight {
  _id: Id<"topicInsights">;
  nodeId: Id<"nodes">;
  topic: string;
  mainTopic?: string;
  summary: string;
  keyPoints: string[];
  relatedConcepts: string[];
  sources: { title: string; url?: string }[];
  createdAt: number;
}

interface TopicInsightsPanelProps {
  mindMapId: Id<"mindMaps"> | null;
  isLive: boolean;
  onClose?: () => void;
  focusedNodeId?: string | null;
}

export function TopicInsightsPanel({
  mindMapId,
  isLive,
  onClose,
  focusedNodeId,
}: TopicInsightsPanelProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const insightRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  
  const insights = useQuery(
    api.topicInsights.getByMindMap,
    mindMapId ? { mindMapId } : "skip"
  );

  useEffect(() => {
    if (focusedNodeId && insightRefs.current.has(focusedNodeId)) {
      const element = insightRefs.current.get(focusedNodeId);
      element?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [focusedNodeId]);

  const setInsightRef = (nodeId: string, el: HTMLDivElement | null) => {
    if (el) {
      insightRefs.current.set(nodeId, el);
    } else {
      insightRefs.current.delete(nodeId);
    }
  };

  if (!mindMapId) return null;

  return (
    <PixelCard className="h-full flex flex-col" rarity={isLive ? "rare" : "common"}>
      <PixelCardHeader className="flex-shrink-0 pb-3">
        <div className="flex items-center justify-between">
          <PixelCardTitle className="flex items-center gap-2">
            <Search className="w-4 h-4 text-primary" />
            <span>Research Insights</span>
          </PixelCardTitle>
          <div className="flex items-center gap-2">
            {isLive && (
              <PixelBadge variant="default" className="text-xs">
                <motion.div
                  className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5"
                  animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
                Live
              </PixelBadge>
            )}
            {onClose && (
              <PixelButton variant="ghost" size="sm" onClick={onClose}>
                <X className="w-4 h-4" />
              </PixelButton>
            )}
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Real-time research as you discuss topics
        </p>
      </PixelCardHeader>

      <PixelCardContent 
        ref={scrollContainerRef}
        className="flex-1 min-h-0 overflow-y-auto space-y-3 pb-4"
        style={{ scrollbarWidth: "thin", scrollbarColor: "var(--border) transparent" }}
      >
        <AnimatePresence mode="popLayout">
          {insights && insights.length > 0 ? (
            insights.map((insight, index) => (
              <InsightCard 
                key={insight._id} 
                insight={insight} 
                index={index} 
                isLatest={index === 0 && isLive}
                isFocused={focusedNodeId === insight.nodeId}
                ref={(el: HTMLDivElement | null) => setInsightRef(insight.nodeId, el)}
              />
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-12 text-muted-foreground"
            >
              {isLive ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <Loader2 className="w-8 h-8 mb-3 opacity-30" />
                  </motion.div>
                  <p className="text-sm font-medium">Listening for topics...</p>
                  <p className="text-xs mt-1 opacity-70">
                    Insights will appear as you speak
                  </p>
                </>
              ) : (
                <>
                  <Search className="w-8 h-8 mb-3 opacity-20" />
                  <p className="text-sm font-medium">No insights yet</p>
                  <p className="text-xs mt-1 opacity-70">
                    Start a live session to get research
                  </p>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </PixelCardContent>
    </PixelCard>
  );
}

const InsightCard = forwardRef<HTMLDivElement, {
  insight: TopicInsight;
  index: number;
  isLatest: boolean;
  isFocused: boolean;
}>(({ insight, index, isLatest, isFocused }, ref) => {
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        "p-3 rounded-xl border transition-all",
        isFocused
          ? "border-primary bg-primary/10 shadow-md ring-2 ring-primary/30"
          : isLatest
            ? "border-primary/50 bg-primary/5 shadow-sm"
            : "border-border/50 bg-card/50"
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-2 h-2 rounded-full",
            isLatest ? "bg-primary" : "bg-muted-foreground/30"
          )} />
          <h4 className="font-semibold text-sm text-foreground">
            {insight.topic}
          </h4>
        </div>
        <span className="text-[10px] text-muted-foreground">
          {new Date(insight.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed mb-3">
        {insight.summary}
      </p>

      {insight.keyPoints.length > 0 && (
        <div className="mb-3">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Lightbulb className="w-3 h-3 text-yellow-500" />
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
              Key Points
            </span>
          </div>
          <ul className="space-y-1">
            {insight.keyPoints.slice(0, 3).map((point, i) => (
              <li key={i} className="text-xs text-foreground/80 pl-3 relative before:content-[''] before:absolute before:left-0 before:top-1.5 before:w-1 before:h-1 before:rounded-full before:bg-primary/50">
                {point}
              </li>
            ))}
          </ul>
        </div>
      )}

      {insight.relatedConcepts.length > 0 && (
        <div className="mb-3">
          <div className="flex items-center gap-1.5 mb-1.5">
            <BookOpen className="w-3 h-3 text-blue-500" />
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
              Related
            </span>
          </div>
          <div className="flex flex-wrap gap-1">
            {insight.relatedConcepts.map((concept, i) => (
              <PixelBadge key={i} variant="secondary" className="text-[10px] py-0.5">
                {concept}
              </PixelBadge>
            ))}
          </div>
        </div>
      )}

      {insight.sources.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <Link2 className="w-3 h-3 text-green-500" />
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
              Sources
            </span>
          </div>
          <div className="space-y-1">
            {insight.sources.slice(0, 2).map((source, i) => (
              <div key={i} className="text-xs">
                {source.url ? (
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {source.title}
                  </a>
                ) : (
                  <span className="text-foreground/70">{source.title}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
});

InsightCard.displayName = "InsightCard";

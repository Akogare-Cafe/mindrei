"use client";

import React, { useCallback, useEffect, useRef, useState, memo, useMemo } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ExternalLink, Plus, Sparkles, GitBranch, ChevronRight } from "lucide-react";

interface AnimatedNode {
  id: string;
  label: string;
  content?: string;
  x: number;
  y: number;
  level: number;
  color: string;
  parentId?: string;
  nodeId?: Id<"nodes">;
}

interface AnimatedEdge {
  id: string;
  sourceId: string;
  targetId: string;
}

interface AnimatedMindMapProps {
  nodes: AnimatedNode[];
  edges: AnimatedEdge[];
  isLive?: boolean;
  onNodeClick?: (nodeId: string) => void;
  onNodeHover?: (nodeId: string | null) => void;
  mindMapId?: Id<"mindMaps"> | null;
  mainTopic?: string;
}

const pastelColors = [
  "var(--node-purple)",
  "var(--node-teal)",
  "var(--node-yellow)",
  "var(--node-pink)",
  "var(--node-blue)",
  "var(--node-green)",
];

// Memoized helper functions (moved outside component)
const getNodeRadius = (node: AnimatedNode) => {
  const baseRadius = node.level === 0 ? 60 : node.level === 1 ? 50 : 42;
  const textLength = node.label.length;
  const textBonus = Math.min(textLength * 1.2, 15);
  return baseRadius + textBonus;
};

const getFontSize = (node: AnimatedNode) => {
  const textLength = node.label.length;
  if (node.level === 0) return Math.max(14 - textLength * 0.15, 10);
  if (node.level === 1) return Math.max(12 - textLength * 0.12, 9);
  return Math.max(10 - textLength * 0.1, 8);
};

// Memoized Node Component - prevents re-renders when other nodes change
interface MemoizedNodeProps {
  node: AnimatedNode;
  index: number;
  isLatest: boolean;
  onNodeClick?: (nodeId: string) => void;
  onNodeHover?: (nodeId: string | null) => void;
  onMouseEnter: (e: React.MouseEvent, nodeId: string) => void;
  onMouseLeave: () => void;
}

const MemoizedNode = memo(function MemoizedNode({
  node,
  index,
  isLatest,
  onNodeClick,
  onMouseEnter,
  onMouseLeave,
}: MemoizedNodeProps) {
  const radius = getNodeRadius(node);
  const fontSize = getFontSize(node);
  
  return (
    <motion.g
      initial={{ scale: 0.85, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 20,
        mass: 0.5,
        delay: index * 0.04,
      }}
      style={{ originX: node.x, originY: node.y }}
    >
      <motion.g
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onNodeClick?.(node.id)}
        onMouseEnter={(e) => onMouseEnter(e, node.id)}
        onMouseLeave={onMouseLeave}
        className="cursor-pointer"
        transition={{ type: "spring", stiffness: 350, damping: 20 }}
      >
        {isLatest && (
          <motion.circle
            cx={node.x}
            cy={node.y}
            r={radius + 8}
            fill="none"
            stroke={node.color}
            strokeWidth="1.5"
            strokeDasharray="4 3"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ 
              opacity: [0.3, 0.6, 0.3],
              scale: [0.98, 1.02, 0.98],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        )}

        <motion.circle
          cx={node.x}
          cy={node.y}
          r={radius}
          fill="transparent"
          stroke={node.color}
          strokeWidth="2.5"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ 
            scale: isLatest ? [1, 1.01, 1] : 1,
            opacity: 1,
          }}
          transition={{
            scale: {
              duration: 2.5,
              repeat: isLatest ? Infinity : 0,
              ease: "easeInOut",
            },
            opacity: { duration: 0.3 }
          }}
        />

        <motion.circle
          cx={node.x}
          cy={node.y}
          r={radius}
          fill="transparent"
          stroke={node.color}
          strokeWidth="1"
          opacity="0.4"
          initial={{ scale: 1 }}
          whileHover={{ scale: 1.05, opacity: 0.7 }}
          transition={{ duration: 0.2 }}
        />

        <motion.text
          x={node.x}
          y={node.y}
          textAnchor="middle"
          dominantBaseline="middle"
          className="font-medium pointer-events-none select-none"
          style={{
            fontSize,
            fill: node.color,
          } as React.CSSProperties}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: index * 0.04 + 0.15, duration: 0.3 }}
        >
          {node.label.length > 16
            ? node.label.slice(0, 16) + "..."
            : node.label}
        </motion.text>
      </motion.g>
    </motion.g>
  );
}, (prevProps, nextProps) => {
  // Custom comparison - only re-render if these specific props change
  return (
    prevProps.node.id === nextProps.node.id &&
    prevProps.node.label === nextProps.node.label &&
    prevProps.node.x === nextProps.node.x &&
    prevProps.node.y === nextProps.node.y &&
    prevProps.node.color === nextProps.node.color &&
    prevProps.isLatest === nextProps.isLatest &&
    prevProps.index === nextProps.index
  );
});

// Memoized Edge Component
interface MemoizedEdgeProps {
  edge: AnimatedEdge;
  source: AnimatedNode;
  target: AnimatedNode;
  index: number;
  isLatest: boolean;
}

const MemoizedEdge = memo(function MemoizedEdge({
  edge,
  source,
  target,
  index,
  isLatest,
}: MemoizedEdgeProps) {
  const sourceRadius = getNodeRadius(source);
  const targetRadius = getNodeRadius(target);
  const dx = target.x - source.x;
  const dy = target.y - source.y;
  const angle = Math.atan2(dy, dx);
  
  const startX = source.x + Math.cos(angle) * sourceRadius;
  const startY = source.y + Math.sin(angle) * sourceRadius;
  const endX = target.x - Math.cos(angle) * targetRadius;
  const endY = target.y - Math.sin(angle) * targetRadius;
  
  const midX = (startX + endX) / 2;
  const midY = (startY + endY) / 2;

  const pathD = `M ${startX} ${startY} Q ${midX} ${midY}, ${endX} ${endY}`;

  return (
    <g>
      <motion.path
        d={pathD}
        fill="none"
        stroke="rgba(100, 116, 139, 0.2)"
        strokeWidth="2"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        exit={{ pathLength: 0, opacity: 0 }}
        transition={{
          pathLength: { 
            duration: 0.5, 
            delay: index * 0.03, 
            ease: "easeOut"
          },
          opacity: { duration: 0.3, delay: index * 0.03 },
        }}
      />
      
      <motion.path
        d={pathD}
        fill="none"
        stroke="var(--primary)"
        strokeWidth={isLatest ? "3" : "1.5"}
        strokeLinecap="round"
        opacity={isLatest ? 0.6 : 0.3}
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{
          duration: 0.5,
          delay: index * 0.03 + 0.1,
          ease: "easeOut"
        }}
      />
      
      {isLatest && (
        <motion.circle
          cx={midX}
          cy={midY}
          r="4"
          fill="var(--primary)"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.8, 0.4, 0.8],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}
    </g>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.edge.id === nextProps.edge.id &&
    prevProps.source.x === nextProps.source.x &&
    prevProps.source.y === nextProps.source.y &&
    prevProps.target.x === nextProps.target.x &&
    prevProps.target.y === nextProps.target.y &&
    prevProps.isLatest === nextProps.isLatest
  );
});

export function AnimatedMindMap({
  nodes,
  edges,
  isLive = false,
  onNodeClick,
  onNodeHover,
  mindMapId,
  mainTopic,
}: AnimatedMindMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewBox, setViewBox] = useState({ x: -400, y: -300, width: 800, height: 600 });
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [expandingNodeId, setExpandingNodeId] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<Array<{ label: string; description: string }>>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const insights = useQuery(
    api.topicInsights.getByMindMap,
    mindMapId ? { mindMapId } : "skip"
  );

  const expandNodeAction = useAction(api.ai.expandNode);
  const expandNodeMutation = useMutation(api.liveSession.expandNodeWithChildren);
  const suggestSimilarTopicsAction = useAction(api.ai.suggestSimilarTopics);

  const getInsightForNode = (nodeId: string) => {
    return insights?.find((i) => i.nodeId === nodeId);
  };

  const handleExpandNode = useCallback(async (nodeId: string, nodeLabel: string, nodeContent?: string) => {
    if (!mindMapId || expandingNodeId) return;
    
    setExpandingNodeId(nodeId);
    
    try {
      const result = await expandNodeAction({
        nodeLabel,
        nodeContent,
        context: mainTopic,
      });
      
      if (result.nodes && result.nodes.length > 0) {
        await expandNodeMutation({
          mindMapId,
          parentNodeId: nodeId as Id<"nodes">,
          childLabels: result.nodes.map(n => ({
            label: n.label,
            content: n.content,
          })),
        });
      }
    } catch (error) {
      console.error("Failed to expand node:", error);
    } finally {
      setExpandingNodeId(null);
    }
  }, [mindMapId, expandingNodeId, expandNodeAction, expandNodeMutation, mainTopic]);

  const fetchSuggestions = useCallback(async (nodeLabel: string, nodeContent?: string) => {
    if (!mindMapId) return;
    
    setLoadingSuggestions(true);
    setSuggestions([]);
    
    try {
      const existingTopics = nodes.map(n => n.label);
      const result = await suggestSimilarTopicsAction({
        nodeLabel,
        nodeContent,
        context: mainTopic,
        existingTopics,
      });
      
      if (result.suggestions && result.suggestions.length > 0) {
        setSuggestions(result.suggestions);
      }
    } catch (error) {
      console.error("Failed to fetch suggestions:", error);
    } finally {
      setLoadingSuggestions(false);
    }
  }, [mindMapId, mainTopic, nodes, suggestSimilarTopicsAction]);

  const handleSelectSuggestion = useCallback(async (nodeId: string, suggestion: { label: string; description: string }) => {
    if (!mindMapId || expandingNodeId) return;
    
    setExpandingNodeId(nodeId);
    
    try {
      await expandNodeMutation({
        mindMapId,
        parentNodeId: nodeId as Id<"nodes">,
        childLabels: [{
          label: suggestion.label,
          content: suggestion.description,
        }],
      });
      
      setSuggestions(prev => prev.filter(s => s.label !== suggestion.label));
    } catch (error) {
      console.error("Failed to add suggestion:", error);
    } finally {
      setExpandingNodeId(null);
    }
  }, [mindMapId, expandingNodeId, expandNodeMutation]);

  useEffect(() => {
    if (nodes.length > 0) {
      const minX = Math.min(...nodes.map((n) => n.x)) - 100;
      const maxX = Math.max(...nodes.map((n) => n.x)) + 100;
      const minY = Math.min(...nodes.map((n) => n.y)) - 100;
      const maxY = Math.max(...nodes.map((n) => n.y)) + 100;
      
      setViewBox({
        x: minX,
        y: minY,
        width: Math.max(maxX - minX, 400),
        height: Math.max(maxY - minY, 300),
      });
    }
  }, [nodes]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setScale((s) => Math.min(Math.max(s * delta, 0.3), 3));
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 0) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  }, [pan]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Memoize node lookup map for O(1) access
  const nodeMap = useMemo(() => {
    const map = new Map<string, AnimatedNode>();
    nodes.forEach(node => map.set(node.id, node));
    return map;
  }, [nodes]);

  const getNodeById = useCallback((id: string) => nodeMap.get(id), [nodeMap]);

  // Memoized mouse handlers
  const handleNodeMouseEnter = useCallback((e: React.MouseEvent, nodeId: string) => {
    setHoveredNodeId(nodeId);
    onNodeHover?.(nodeId);
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }
  }, [onNodeHover]);

  const handleNodeMouseLeave = useCallback(() => {
    setHoveredNodeId(null);
    onNodeHover?.(null);
    setShowSuggestions(false);
    setSuggestions([]);
    if (suggestionsTimeoutRef.current) {
      clearTimeout(suggestionsTimeoutRef.current);
    }
  }, [onNodeHover]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full min-h-[500px] bg-gradient-to-br from-background via-background to-muted/30 rounded-2xl border border-border overflow-hidden cursor-grab active:cursor-grabbing"
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <svg
        width="100%"
        height="100%"
        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
        style={{
          transform: `scale(${scale}) translate(${pan.x / scale}px, ${pan.y / scale}px)`,
        }}
      >
        <defs>
          <filter id="nodeBloom" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="8" result="bloom" />
            <feColorMatrix in="bloom" type="saturate" values="2" result="saturatedBloom" />
            <feMerge>
              <feMergeNode in="saturatedBloom" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          
          <filter id="nodeGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          
          <filter id="edgeBlur" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          
          <filter id="particleGlow" x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="3" result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <linearGradient id="edgeGradientOrganic" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.3" />
            <stop offset="30%" stopColor="var(--primary)" stopOpacity="0.8" />
            <stop offset="70%" stopColor="var(--accent)" stopOpacity="0.8" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.3" />
          </linearGradient>
          
          <linearGradient id="edgePulse">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0">
              <animate attributeName="offset" values="-0.3;1" dur="1.5s" repeatCount="indefinite" />
            </stop>
            <stop offset="15%" stopColor="var(--accent)" stopOpacity="1">
              <animate attributeName="offset" values="-0.15;1.15" dur="1.5s" repeatCount="indefinite" />
            </stop>
            <stop offset="30%" stopColor="var(--primary)" stopOpacity="0">
              <animate attributeName="offset" values="0;1.3" dur="1.5s" repeatCount="indefinite" />
            </stop>
          </linearGradient>

          <radialGradient id="nodeRadial" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </radialGradient>
        </defs>

        <AnimatePresence>
          {edges.map((edge, index) => {
            const source = getNodeById(edge.sourceId);
            const target = getNodeById(edge.targetId);
            if (!source || !target) return null;

            const isLatest = isLive && index === edges.length - 1;

            return (
              <MemoizedEdge
                key={edge.id}
                edge={edge}
                source={source}
                target={target}
                index={index}
                isLatest={isLatest}
              />
            );
          })}
        </AnimatePresence>

        <AnimatePresence>
          {nodes.map((node, index) => {
            const isLatest = isLive && index === nodes.length - 1;
            
            return (
              <MemoizedNode
                key={node.id}
                node={node}
                index={index}
                isLatest={isLatest}
                onNodeClick={onNodeClick}
                onNodeHover={onNodeHover}
                onMouseEnter={handleNodeMouseEnter}
                onMouseLeave={handleNodeMouseLeave}
              />
            );
          })}
        </AnimatePresence>
      </svg>

      {isLive && (
        <div className="absolute top-4 right-4 flex items-center gap-2 bg-card/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-border">
          <motion.div
            className="w-2 h-2 rounded-full bg-green-500"
            animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
          <span className="text-xs font-medium text-muted-foreground">Live</span>
        </div>
      )}

      <AnimatePresence>
        {hoveredNodeId && (() => {
          const insight = getInsightForNode(hoveredNodeId);
          const node = nodes.find((n) => n.id === hoveredNodeId);
          if (!node) return null;
          
          const isExpanding = expandingNodeId === hoveredNodeId;
          const hasChildren = edges.some(e => e.sourceId === hoveredNodeId);
          
          return (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              className="absolute z-50"
              style={{
                left: Math.min(tooltipPos.x, (containerRef.current?.clientWidth || 400) - 280),
                top: tooltipPos.y + 20,
                pointerEvents: "auto",
              } as React.CSSProperties}
            >
              <div className="bg-card/95 backdrop-blur-md border border-border rounded-xl shadow-lg p-3 w-64">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: node.color }} />
                    <h4 className="font-semibold text-sm text-foreground">{node.label}</h4>
                  </div>
                  {mindMapId && node.level > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleExpandNode(hoveredNodeId, node.label, node.content);
                      }}
                      disabled={isExpanding}
                      className="p-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-colors disabled:opacity-50"
                      title={hasChildren ? "Expand more" : "Expand topic"}
                    >
                      {isExpanding ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Sparkles className="w-3.5 h-3.5" />
                      )}
                    </button>
                  )}
                </div>
                
                {insight ? (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {insight.summary}
                    </p>
                    {insight.keyPoints.length > 0 && (
                      <div className="space-y-1">
                        {insight.keyPoints.slice(0, 2).map((point, i) => (
                          <p key={i} className="text-[10px] text-foreground/70 pl-2 border-l-2 border-primary/30">
                            {point}
                          </p>
                        ))}
                      </div>
                    )}
                    {insight.sources.length > 0 && (
                      <div className="flex items-center gap-1 text-[10px] text-primary">
                        <ExternalLink className="w-3 h-3" />
                        <span>{insight.sources[0].title}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {isLive ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>Researching...</span>
                      </>
                    ) : (
                      <span>Click the sparkle to expand this topic</span>
                    )}
                  </div>
                )}

                {mindMapId && node.level > 0 && (
                  <div className="mt-3 pt-3 border-t border-border/50">
                    {!showSuggestions && suggestions.length === 0 && !loadingSuggestions ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowSuggestions(true);
                          fetchSuggestions(node.label, node.content);
                        }}
                        className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-accent/10 hover:bg-accent/20 text-accent transition-colors text-xs font-medium"
                      >
                        <GitBranch className="w-3.5 h-3.5" />
                        <span>Suggest Similar Topics</span>
                      </button>
                    ) : loadingSuggestions ? (
                      <div className="flex items-center justify-center gap-2 py-2 text-xs text-muted-foreground">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Finding related topics...</span>
                      </div>
                    ) : suggestions.length > 0 ? (
                      <div className="space-y-1.5">
                        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">
                          Similar Topics
                        </p>
                        {suggestions.map((suggestion, i) => (
                          <motion.button
                            key={suggestion.label}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectSuggestion(hoveredNodeId, suggestion);
                            }}
                            disabled={isExpanding}
                            className="w-full flex items-center gap-2 p-2 rounded-lg bg-muted/50 hover:bg-primary/10 transition-colors text-left group disabled:opacity-50"
                          >
                            <Plus className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-foreground truncate">
                                {suggestion.label}
                              </p>
                              <p className="text-[10px] text-muted-foreground line-clamp-1">
                                {suggestion.description}
                              </p>
                            </div>
                            <ChevronRight className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                          </motion.button>
                        ))}
                      </div>
                    ) : showSuggestions ? (
                      <p className="text-xs text-muted-foreground text-center py-2">
                        No suggestions available
                      </p>
                    ) : null}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}

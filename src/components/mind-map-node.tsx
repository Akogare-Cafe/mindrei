"use client";

import { memo, useState } from "react";
import { Handle, Position, NodeProps } from "../../node_modules/reactflow/dist/esm";
import { motion } from "framer-motion";
import { Expand, Edit2, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface MindMapNodeData {
  label: string;
  content?: string;
  color: string;
  level: number;
  onClick?: () => void;
  onDoubleClick?: () => void;
  onUpdate?: (data: { label?: string; content?: string }) => void;
}

function MindMapNodeComponent({ data, selected }: NodeProps<MindMapNodeData>) {
  const [isEditing, setIsEditing] = useState(false);
  const [editLabel, setEditLabel] = useState(data.label);

  const handleSave = () => {
    if (editLabel.trim() && editLabel !== data.label) {
      data.onUpdate?.({ label: editLabel.trim() });
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditLabel(data.label);
    setIsEditing(false);
  };

  const nodeSize = data.level === 0 ? "large" : data.level === 1 ? "medium" : "small";

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        data.onDoubleClick?.();
      }}
      className={cn(
        "mind-map-node relative group",
        "bg-card border-2 rounded-xl shadow-lg",
        "transition-all duration-200",
        selected && "ring-2 ring-primary ring-offset-2 ring-offset-background",
        nodeSize === "large" && "min-w-[180px] p-4",
        nodeSize === "medium" && "min-w-[140px] p-3",
        nodeSize === "small" && "min-w-[100px] p-2"
      )}
      style={{
        borderColor: data.color,
        boxShadow: selected ? `0 0 20px ${data.color}40` : undefined,
      } as React.CSSProperties}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-primary !border-2 !border-background !w-3 !h-3"
      />

      <div className="flex items-start gap-2">
        <div
          className="w-3 h-3 rounded-full flex-shrink-0 mt-1"
          style={{ backgroundColor: data.color }}
        />

        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={editLabel}
                onChange={(e) => setEditLabel(e.target.value)}
                className="flex-1 bg-transparent border-b border-primary outline-none text-sm font-medium"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSave();
                  if (e.key === "Escape") handleCancel();
                }}
              />
              <button
                onClick={handleSave}
                className="p-1 hover:bg-primary/20 rounded"
              >
                <Check className="w-3 h-3 text-primary" />
              </button>
              <button
                onClick={handleCancel}
                className="p-1 hover:bg-destructive/20 rounded"
              >
                <X className="w-3 h-3 text-destructive" />
              </button>
            </div>
          ) : (
            <p
              className={cn(
                "font-medium text-foreground truncate",
                nodeSize === "large" && "text-base",
                nodeSize === "medium" && "text-sm",
                nodeSize === "small" && "text-xs"
              )}
            >
              {data.label}
            </p>
          )}

          {data.content && !isEditing && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {data.content}
            </p>
          )}
        </div>
      </div>

      <div className="absolute -right-1 -top-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
        <button
          onClick={() => setIsEditing(true)}
          className="p-1 bg-card border border-border rounded-full shadow-sm hover:bg-muted"
        >
          <Edit2 className="w-3 h-3 text-muted-foreground" />
        </button>
        <button
          onClick={data.onClick}
          className="p-1 bg-card border border-border rounded-full shadow-sm hover:bg-muted"
        >
          <Expand className="w-3 h-3 text-muted-foreground" />
        </button>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-primary !border-2 !border-background !w-3 !h-3"
      />
    </motion.div>
  );
}

export const MindMapNode = memo(MindMapNodeComponent);

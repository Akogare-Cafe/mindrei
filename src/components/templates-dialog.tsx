"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PixelButton } from "@/components/pixel-button";
import { PixelBadge } from "@/components/pixel-badge";
import { motion } from "framer-motion";
import { Loader2, Layout, Briefcase, GraduationCap, User, Palette, ChevronRight } from "lucide-react";
import { Id } from "../../convex/_generated/dataModel";
import { TEMPLATES, TEMPLATE_CATEGORIES, MindMapTemplate } from "@/lib/templates";

interface TemplatesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMindMapCreated: (mindMapId: Id<"mindMaps">) => void;
  userId: Id<"users">;
}

const categoryIcons = {
  business: Briefcase,
  education: GraduationCap,
  personal: User,
  creative: Palette,
};

export function TemplatesDialog({
  open,
  onOpenChange,
  onMindMapCreated,
  userId,
}: TemplatesDialogProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [creatingTemplateId, setCreatingTemplateId] = useState<string | null>(null);

  const createMindMap = useMutation(api.mindMaps.create);
  const createNode = useMutation(api.nodes.create);
  const createEdge = useMutation(api.edges.create);

  const handleSelectTemplate = async (template: MindMapTemplate) => {
    setIsCreating(true);
    setCreatingTemplateId(template.id);

    try {
      const mindMapId = await createMindMap({
        userId,
        title: template.name,
        mainTopic: template.nodes[0]?.label || template.name,
      });

      const tempIdToNodeId = new Map<string, Id<"nodes">>();

      for (const node of template.nodes) {
        const parentNodeId = node.parentTempId ? tempIdToNodeId.get(node.parentTempId) : undefined;
        
        const nodeId = await createNode({
          mindMapId,
          label: node.label,
          content: node.content,
          level: node.level,
          order: node.order,
          parentId: parentNodeId,
          positionX: 0,
          positionY: 0,
        });

        tempIdToNodeId.set(node.tempId, nodeId);

        if (parentNodeId) {
          await createEdge({
            mindMapId,
            sourceId: parentNodeId,
            targetId: nodeId,
          });
        }
      }

      onMindMapCreated(mindMapId);
      onOpenChange(false);
      setSelectedCategory(null);
    } catch (error) {
      console.error("Failed to create mind map from template:", error);
    } finally {
      setIsCreating(false);
      setCreatingTemplateId(null);
    }
  };

  const handleClose = () => {
    if (!isCreating) {
      onOpenChange(false);
      setSelectedCategory(null);
    }
  };

  const filteredTemplates = selectedCategory
    ? TEMPLATES.filter(t => t.category === selectedCategory)
    : TEMPLATES;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Layout className="w-5 h-5 text-primary" />
            Templates
          </DialogTitle>
          <DialogDescription>
            Start with a pre-built template to organize your ideas faster
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-2 flex-wrap py-2">
          <PixelButton
            variant={selectedCategory === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(null)}
          >
            All
          </PixelButton>
          {TEMPLATE_CATEGORIES.map(cat => {
            const Icon = categoryIcons[cat.id as keyof typeof categoryIcons];
            return (
              <PixelButton
                key={cat.id}
                variant={selectedCategory === cat.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(cat.id)}
              >
                <Icon className="w-3.5 h-3.5 mr-1.5" />
                {cat.name}
              </PixelButton>
            );
          })}
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 py-2">
          {filteredTemplates.map((template, index) => {
            const Icon = categoryIcons[template.category];
            const isThisCreating = creatingTemplateId === template.id;
            
            return (
              <motion.button
                key={template.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                onClick={() => handleSelectTemplate(template)}
                disabled={isCreating}
                className="w-full p-4 rounded-xl border border-border/50 hover:border-primary/30 hover:bg-muted/30 transition-all text-left group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-foreground">{template.name}</h3>
                      <PixelBadge variant="secondary" className="text-[10px]">
                        {template.nodes.length} nodes
                      </PixelBadge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">
                      {template.description}
                    </p>
                  </div>
                  <div className="flex-shrink-0 self-center">
                    {isThisCreating ? (
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>

        <div className="flex justify-end pt-2 border-t border-border/50">
          <PixelButton variant="outline" onClick={handleClose} disabled={isCreating}>
            Cancel
          </PixelButton>
        </div>
      </DialogContent>
    </Dialog>
  );
}

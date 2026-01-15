"use client";

import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PixelButton } from "@/components/pixel-button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, FileText, Sparkles } from "lucide-react";
import { Id } from "../../convex/_generated/dataModel";

interface TextToMindMapDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMindMapCreated: (mindMapId: Id<"mindMaps">) => void;
  userId: Id<"users">;
}

export function TextToMindMapDialog({
  open,
  onOpenChange,
  onMindMapCreated,
  userId,
}: TextToMindMapDialogProps) {
  const [text, setText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateMindMapAction = useAction(api.ai.generateMindMap);

  const handleGenerate = async () => {
    if (!text.trim()) {
      setError("Please enter some text");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const result = await generateMindMapAction({ text: text.trim() });
      
      onOpenChange(false);
      setText("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate mind map");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClose = () => {
    if (!isGenerating) {
      onOpenChange(false);
      setText("");
      setError(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Text to Mind Map
          </DialogTitle>
          <DialogDescription>
            Paste any text and AI will convert it into a structured mind map
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Textarea
            placeholder="Paste your text here... (articles, notes, ideas, outlines, etc.)"
            value={text}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setText(e.target.value)}
            disabled={isGenerating}
            className="min-h-[200px] resize-none"
          />

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              {text.length} characters
            </div>
            <div className="flex gap-2">
              <PixelButton
                variant="outline"
                onClick={handleClose}
                disabled={isGenerating}
              >
                Cancel
              </PixelButton>
              <PixelButton
                onClick={handleGenerate}
                disabled={isGenerating || !text.trim()}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Mind Map
                  </>
                )}
              </PixelButton>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

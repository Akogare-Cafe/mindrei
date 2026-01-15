"use client";

import { useState } from "react";
import { useAction, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PixelButton } from "@/components/pixel-button";
import { Input } from "@/components/ui/input";
import { Loader2, Link, Sparkles } from "lucide-react";
import { Id } from "../../convex/_generated/dataModel";

interface UrlToMindMapDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMindMapCreated: (mindMapId: Id<"mindMaps">) => void;
  userId: Id<"users">;
}

export function UrlToMindMapDialog({
  open,
  onOpenChange,
  onMindMapCreated,
  userId,
}: UrlToMindMapDialogProps) {
  const [url, setUrl] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateFromUrlAction = useAction(api.ai.generateFromUrl);
  const createMindMap = useMutation(api.mindMaps.create);

  const isValidUrl = (urlString: string) => {
    try {
      new URL(urlString);
      return true;
    } catch {
      return false;
    }
  };

  const handleGenerate = async () => {
    if (!url.trim()) {
      setError("Please enter a URL");
      return;
    }

    if (!isValidUrl(url.trim())) {
      setError("Please enter a valid URL (e.g., https://example.com)");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const result = await generateFromUrlAction({ url: url.trim() });
      
      if (result && result.title && result.nodes) {
        const mindMapId = await createMindMap({
          userId,
          title: result.title,
          mainTopic: result.title,
        });

        onMindMapCreated(mindMapId);
        onOpenChange(false);
        setUrl("");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate mind map from URL");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClose = () => {
    if (!isGenerating) {
      onOpenChange(false);
      setUrl("");
      setError(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link className="w-5 h-5 text-primary" />
            URL to Mind Map
          </DialogTitle>
          <DialogDescription>
            Enter a webpage URL and AI will extract key information into a mind map
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Input
            placeholder="https://example.com/article"
            value={url}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUrl(e.target.value)}
            disabled={isGenerating}
            type="url"
          />

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-2">
            <PixelButton
              variant="outline"
              onClick={handleClose}
              disabled={isGenerating}
            >
              Cancel
            </PixelButton>
            <PixelButton
              onClick={handleGenerate}
              disabled={isGenerating || !url.trim()}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Extracting...
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
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useState } from "react";
import { useAction, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PixelButton } from "@/components/pixel-button";
import { Input } from "@/components/ui/input";
import { Loader2, Youtube, Sparkles } from "lucide-react";
import { Id } from "../../convex/_generated/dataModel";

interface YouTubeToMindMapDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMindMapCreated: (mindMapId: Id<"mindMaps">) => void;
  userId: Id<"users">;
}

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export function YouTubeToMindMapDialog({
  open,
  onOpenChange,
  onMindMapCreated,
  userId,
}: YouTubeToMindMapDialogProps) {
  const [url, setUrl] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateFromYouTubeAction = useAction(api.ai.generateFromYouTube);
  const createMindMap = useMutation(api.mindMaps.create);
  const createNode = useMutation(api.nodes.create);
  const createEdge = useMutation(api.edges.create);

  const handleGenerate = async () => {
    if (!url.trim()) {
      setError("Please enter a YouTube URL");
      return;
    }

    const videoId = extractYouTubeId(url.trim());
    if (!videoId) {
      setError("Please enter a valid YouTube URL or video ID");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const result = await generateFromYouTubeAction({ videoId });
      
      if (result && result.title && result.nodes) {
        const mindMapId = await createMindMap({
          userId,
          title: result.title,
          mainTopic: result.title,
        });

        const tempIdToNodeId = new Map<string, Id<"nodes">>();

        for (const node of result.nodes) {
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
        setUrl("");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate mind map from YouTube video");
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

  const videoId = extractYouTubeId(url);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Youtube className="w-5 h-5 text-red-500" />
            YouTube to Mind Map
          </DialogTitle>
          <DialogDescription>
            Enter a YouTube video URL and AI will create a mind map from its content
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Input
            placeholder="https://youtube.com/watch?v=... or video ID"
            value={url}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUrl(e.target.value)}
            disabled={isGenerating}
            type="url"
          />

          {videoId && (
            <div className="aspect-video rounded-lg overflow-hidden bg-muted">
              <iframe
                src={`https://www.youtube.com/embed/${videoId}`}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">
              {error}
            </div>
          )}

          <div className="text-xs text-muted-foreground">
            Note: AI will analyze the video title and description to generate the mind map structure.
          </div>

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
                  Analyzing...
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

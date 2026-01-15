"use client";

import { useState, useRef } from "react";
import { useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Upload, X, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { PixelButton } from "@/components/pixel-button";
import { PixelCard, PixelCardContent, PixelCardHeader, PixelCardTitle } from "@/components/pixel-card";

interface AudioToMindMapDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMindMapCreated: (mindMapId: Id<"mindMaps">) => void;
  userId: Id<"users">;
}

type AudioType = "meeting" | "lecture" | "podcast" | "interview" | "other";

const audioTypeOptions: { value: AudioType; label: string }[] = [
  { value: "meeting", label: "Meeting" },
  { value: "lecture", label: "Lecture" },
  { value: "podcast", label: "Podcast" },
  { value: "interview", label: "Interview" },
  { value: "other", label: "Other" },
];

export function AudioToMindMapDialog({
  open,
  onOpenChange,
  onMindMapCreated,
  userId,
}: AudioToMindMapDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [audioType, setAudioType] = useState<AudioType>("meeting");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateFromAudio = useAction(api.ai.generateFromAudio);
  const createMindMap = useMutation(api.mindMaps.create);
  const createNode = useMutation(api.nodes.create);
  const createEdge = useMutation(api.edges.create);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const validTypes = ["audio/mpeg", "audio/wav", "audio/mp4", "audio/webm", "audio/ogg", "video/mp4", "video/webm"];
      if (!validTypes.some(type => selectedFile.type.includes(type.split("/")[1]))) {
        setError("Please select an audio or video file (MP3, WAV, MP4, WebM, OGG)");
        return;
      }
      if (selectedFile.size > 100 * 1024 * 1024) {
        setError("File size must be less than 100MB");
        return;
      }
      setFile(selectedFile);
      setError(null);
    }
  };

  const transcribeAudio = async (audioFile: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", audioFile);
    formData.append("model", "whisper-1");
    
    const response = await fetch("/api/transcribe", {
      method: "POST",
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to transcribe audio");
    }
    
    const data = await response.json();
    return data.text;
  };

  const handleGenerate = async () => {
    if (!file) return;

    setIsProcessing(true);
    setError(null);
    setProgress("Transcribing audio...");

    try {
      const transcript = await transcribeAudio(file);
      
      if (!transcript || transcript.length < 50) {
        throw new Error("Could not extract enough content from audio");
      }
      
      setProgress("Analyzing content with AI...");
      const result = await generateFromAudio({
        transcript,
        title: file.name.replace(/\.[^/.]+$/, ""),
        audioType,
      });

      setProgress("Creating mind map...");
      const mindMapId = await createMindMap({
        userId,
        title: result.title,
      });

      setProgress("Adding nodes...");
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
          positionY: 100 + (node.order * 120) + (Math.random() * 30 - 15),
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
      setError(err instanceof Error ? err.message : "Failed to process audio");
    } finally {
      setIsProcessing(false);
      setProgress("");
    }
  };

  const handleClose = () => {
    setFile(null);
    setAudioType("meeting");
    setError(null);
    setProgress("");
    onOpenChange(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      if (droppedFile.size > 100 * 1024 * 1024) {
        setError("File size must be less than 100MB");
        return;
      }
      setFile(droppedFile);
      setError(null);
    }
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
                <Mic className="w-5 h-5 text-primary" />
                Import Audio
              </PixelCardTitle>
              <button
                onClick={handleClose}
                className="p-1.5 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </PixelCardHeader>

            <PixelCardContent className="space-y-4">
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => fileInputRef.current?.click()}
                className={`
                  border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
                  transition-colors hover:border-primary/50 hover:bg-primary/5
                  ${file ? "border-green-500 bg-green-500/5" : "border-muted-foreground/30"}
                `}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*,video/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                
                {file ? (
                  <div className="flex flex-col items-center gap-2">
                    <CheckCircle className="w-10 h-10 text-green-500" />
                    <p className="font-medium text-foreground">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="w-10 h-10 text-muted-foreground" />
                    <p className="font-medium text-foreground">
                      Drop audio/video here or click to browse
                    </p>
                    <p className="text-sm text-muted-foreground">
                      MP3, WAV, MP4, WebM (max 100MB)
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Content Type
                </label>
                <div className="flex flex-wrap gap-2">
                  {audioTypeOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setAudioType(option.value)}
                      disabled={isProcessing}
                      className={`
                        px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                        ${audioType === option.value
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }
                        ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}
                      `}
                    >
                      {option.label}
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
                  disabled={isProcessing}
                >
                  Cancel
                </PixelButton>
                <PixelButton
                  onClick={handleGenerate}
                  className="flex-1"
                  disabled={!file || isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4 mr-2" />
                      Generate Mind Map
                    </>
                  )}
                </PixelButton>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                Audio will be transcribed using AI, then analyzed to create a structured mind map.
              </p>
            </PixelCardContent>
          </PixelCard>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

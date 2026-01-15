"use client";

import { useState, useRef } from "react";
import { useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Upload, X, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { PixelButton } from "@/components/pixel-button";
import { PixelCard, PixelCardContent, PixelCardHeader, PixelCardTitle } from "@/components/pixel-card";

interface PDFToMindMapDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMindMapCreated: (mindMapId: Id<"mindMaps">) => void;
  userId: Id<"users">;
}

export function PDFToMindMapDialog({
  open,
  onOpenChange,
  onMindMapCreated,
  userId,
}: PDFToMindMapDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateFromPDF = useAction(api.ai.generateFromPDF);
  const createMindMap = useMutation(api.mindMaps.create);
  const createNode = useMutation(api.nodes.create);
  const createEdge = useMutation(api.edges.create);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== "application/pdf") {
        setError("Please select a PDF file");
        return;
      }
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError("File size must be less than 10MB");
        return;
      }
      setFile(selectedFile);
      setError(null);
    }
  };

  const extractTextFromPDF = async (pdfFile: File): Promise<string> => {
    const arrayBuffer = await pdfFile.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    let text = "";
    const decoder = new TextDecoder("utf-8", { fatal: false });
    const content = decoder.decode(uint8Array);
    
    const streamMatches = content.match(/stream[\r\n]+([\s\S]*?)[\r\n]+endstream/g);
    if (streamMatches) {
      for (const match of streamMatches) {
        const streamContent = match.replace(/stream[\r\n]+/, "").replace(/[\r\n]+endstream/, "");
        const textMatches = streamContent.match(/\(([^)]+)\)/g);
        if (textMatches) {
          for (const textMatch of textMatches) {
            const extractedText = textMatch.slice(1, -1);
            if (extractedText.length > 1 && /[a-zA-Z]/.test(extractedText)) {
              text += extractedText + " ";
            }
          }
        }
      }
    }
    
    if (text.length < 100) {
      const textMatches = content.match(/\(([^)]{2,})\)/g);
      if (textMatches) {
        text = textMatches
          .map(m => m.slice(1, -1))
          .filter(t => /[a-zA-Z]/.test(t) && t.length > 1)
          .join(" ");
      }
    }
    
    text = text
      .replace(/\\n/g, " ")
      .replace(/\\r/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    
    if (text.length < 50) {
      throw new Error("Could not extract enough text from PDF. Please ensure the PDF contains selectable text.");
    }
    
    return text;
  };

  const handleGenerate = async () => {
    if (!file) return;

    setIsProcessing(true);
    setError(null);
    setProgress("Extracting text from PDF...");

    try {
      const pdfText = await extractTextFromPDF(file);
      
      setProgress("Analyzing document with AI...");
      const result = await generateFromPDF({
        pdfText,
        title: file.name.replace(".pdf", ""),
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
      setError(err instanceof Error ? err.message : "Failed to process PDF");
    } finally {
      setIsProcessing(false);
      setProgress("");
    }
  };

  const handleClose = () => {
    setFile(null);
    setError(null);
    setProgress("");
    onOpenChange(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile?.type === "application/pdf") {
      if (droppedFile.size > 10 * 1024 * 1024) {
        setError("File size must be less than 10MB");
        return;
      }
      setFile(droppedFile);
      setError(null);
    } else {
      setError("Please drop a PDF file");
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
                <FileText className="w-5 h-5 text-primary" />
                Import PDF
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
                  accept=".pdf,application/pdf"
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
                      Drop PDF here or click to browse
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Maximum file size: 10MB
                    </p>
                  </div>
                )}
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
                      <FileText className="w-4 h-4 mr-2" />
                      Generate Mind Map
                    </>
                  )}
                </PixelButton>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                Works best with text-based PDFs. Scanned documents may not extract properly.
              </p>
            </PixelCardContent>
          </PixelCard>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

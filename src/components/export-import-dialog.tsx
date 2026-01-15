"use client";

import { useState, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { motion } from "framer-motion";
import {
  Download,
  Upload,
  X,
  FileJson,
  FileText,
  Table,
  List,
  Check,
  AlertCircle,
  Loader2,
  Copy,
} from "lucide-react";
import {
  exportToMarkdown,
  exportToCSV,
  exportToOutline,
  downloadFile,
  copyToClipboard,
} from "@/lib/export-utils";
import { PixelButton } from "@/components/pixel-button";
import { PixelInput } from "@/components/pixel-input";
import { PixelCard, PixelCardContent, PixelCardHeader, PixelCardTitle } from "@/components/pixel-card";

interface ExportImportDialogProps {
  mindMapId?: Id<"mindMaps"> | null;
  userId: Id<"users">;
  onClose: () => void;
  onImportSuccess?: (mindMapId: Id<"mindMaps">) => void;
}

export function ExportImportDialog({
  mindMapId,
  userId,
  onClose,
  onImportSuccess,
}: ExportImportDialogProps) {
  const [mode, setMode] = useState<"export" | "import">(mindMapId ? "export" : "import");
  const [exportFormat, setExportFormat] = useState<"json" | "markdown" | "csv" | "outline">("json");
  const [isExporting, setIsExporting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importTitle, setImportTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const exportData = useQuery(
    api.exportImport.exportMindMap,
    mindMapId ? { mindMapId } : "skip"
  );

  const importMindMap = useMutation(api.exportImport.importMindMap);

  const handleExport = async () => {
    if (!exportData) return;
    setIsExporting(true);
    setError(null);

    try {
      const title = exportData.mindMap.title;
      const safeTitle = title.replace(/[^a-z0-9]/gi, "_");
      
      const mindMapData = {
        title,
        nodes: exportData.nodes.map(n => ({
          id: n.exportId,
          label: n.label,
          content: n.content,
          level: n.level,
          parentId: n.parentExportId,
        })),
        edges: exportData.edges.map((e, i) => ({
          id: `edge_${i}`,
          sourceId: e.sourceExportId,
          targetId: e.targetExportId,
        })),
      };

      switch (exportFormat) {
        case "markdown": {
          const md = exportToMarkdown(mindMapData);
          downloadFile(md, `${safeTitle}.md`, "text/markdown");
          break;
        }
        case "csv": {
          const csv = exportToCSV(mindMapData);
          downloadFile(csv, `${safeTitle}.csv`, "text/csv");
          break;
        }
        case "outline": {
          const outline = exportToOutline(mindMapData);
          downloadFile(outline, `${safeTitle}.txt`, "text/plain");
          break;
        }
        default: {
          const jsonString = JSON.stringify(exportData, null, 2);
          downloadFile(jsonString, `${safeTitle}_mindmap.json`, "application/json");
        }
      }
      setSuccess("Mind map exported successfully!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to export");
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyToClipboard = async () => {
    if (!exportData) return;
    setError(null);

    try {
      const title = exportData.mindMap.title;
      
      const mindMapData = {
        title,
        nodes: exportData.nodes.map(n => ({
          id: n.exportId,
          label: n.label,
          content: n.content,
          level: n.level,
          parentId: n.parentExportId,
        })),
        edges: exportData.edges.map((e, i) => ({
          id: `edge_${i}`,
          sourceId: e.sourceExportId,
          targetId: e.targetExportId,
        })),
      };

      let content = "";
      switch (exportFormat) {
        case "markdown":
          content = exportToMarkdown(mindMapData);
          break;
        case "csv":
          content = exportToCSV(mindMapData);
          break;
        case "outline":
          content = exportToOutline(mindMapData);
          break;
        default:
          content = JSON.stringify(exportData, null, 2);
      }

      await copyToClipboard(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to copy");
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setSuccess(null);

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (!data.version || !data.mindMap || !data.nodes) {
        throw new Error("Invalid mind map file format");
      }

      setImportTitle(data.mindMap.title);
      (fileInputRef.current as HTMLInputElement & { parsedData?: unknown }).parsedData = data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to parse file");
    }
  };

  const handleImport = async () => {
    const parsedData = (fileInputRef.current as HTMLInputElement & { parsedData?: unknown })?.parsedData;
    if (!parsedData) {
      setError("Please select a file first");
      return;
    }

    setIsImporting(true);
    setError(null);

    try {
      const newMindMapId = await importMindMap({
        userId,
        data: parsedData as Parameters<typeof importMindMap>[0]["data"],
        newTitle: importTitle || undefined,
      });
      setSuccess("Mind map imported successfully!");
      onImportSuccess?.(newMindMapId);
      setTimeout(() => onClose(), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to import");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-md mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <PixelCard>
          <PixelCardHeader className="flex flex-row items-center justify-between">
            <PixelCardTitle className="flex items-center gap-2">
              {mode === "export" ? (
                <>
                  <Download className="w-5 h-5 text-primary" />
                  Export Mind Map
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5 text-primary" />
                  Import Mind Map
                </>
              )}
            </PixelCardTitle>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </PixelCardHeader>

          <PixelCardContent className="space-y-6">
            <div className="flex gap-2">
              <PixelButton
                variant={mode === "export" ? "default" : "ghost"}
                onClick={() => setMode("export")}
                className="flex-1"
                disabled={!mindMapId}
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </PixelButton>
              <PixelButton
                variant={mode === "import" ? "default" : "ghost"}
                onClick={() => setMode("import")}
                className="flex-1"
              >
                <Upload className="w-4 h-4 mr-2" />
                Import
              </PixelButton>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </motion.div>
            )}

            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 text-sm flex items-center gap-2"
              >
                <Check className="w-4 h-4 flex-shrink-0" />
                {success}
              </motion.div>
            )}

            {mode === "export" ? (
              <div className="space-y-4">
                {exportData ? (
                  <>
                    <div className="p-4 rounded-xl bg-muted/30 border border-border">
                      <div className="flex items-center gap-3 mb-3">
                        <FileJson className="w-8 h-8 text-primary" />
                        <div>
                          <p className="font-medium text-foreground">
                            {exportData.mindMap.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {exportData.nodes.length} nodes, {exportData.edges.length} connections
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Includes all nodes, connections, and research insights
                      </p>
                    </div>

                    <div className="grid grid-cols-4 gap-2 mb-4">
                      <button
                        onClick={() => setExportFormat("json")}
                        className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-1 ${exportFormat === "json" ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"}`}
                      >
                        <FileJson className="w-5 h-5" />
                        <span className="text-xs">JSON</span>
                      </button>
                      <button
                        onClick={() => setExportFormat("markdown")}
                        className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-1 ${exportFormat === "markdown" ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"}`}
                      >
                        <FileText className="w-5 h-5" />
                        <span className="text-xs">Markdown</span>
                      </button>
                      <button
                        onClick={() => setExportFormat("csv")}
                        className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-1 ${exportFormat === "csv" ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"}`}
                      >
                        <Table className="w-5 h-5" />
                        <span className="text-xs">CSV</span>
                      </button>
                      <button
                        onClick={() => setExportFormat("outline")}
                        className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-1 ${exportFormat === "outline" ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"}`}
                      >
                        <List className="w-5 h-5" />
                        <span className="text-xs">Outline</span>
                      </button>
                    </div>

                    <div className="flex gap-2">
                      <PixelButton
                        onClick={handleExport}
                        disabled={isExporting}
                        className="flex-1"
                      >
                        {isExporting ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                          <Download className="w-4 h-4 mr-2" />
                        )}
                        Download
                      </PixelButton>
                      <PixelButton
                        variant="outline"
                        onClick={handleCopyToClipboard}
                        disabled={isExporting}
                      >
                        {copied ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </PixelButton>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileJson className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p className="text-sm">Select a mind map to export</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div
                  className="p-6 rounded-xl border-2 border-dashed border-border hover:border-primary/50 transition-colors cursor-pointer text-center"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-sm font-medium text-foreground">
                    Click to select a file
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    JSON files exported from MindRei
                  </p>
                </div>

                {importTitle && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Mind Map Title
                    </label>
                    <PixelInput
                      value={importTitle}
                      onChange={(e) => setImportTitle(e.target.value)}
                      placeholder="Enter a title for the imported map"
                    />
                  </div>
                )}

                <PixelButton
                  onClick={handleImport}
                  disabled={!importTitle || isImporting}
                  className="w-full"
                >
                  {isImporting ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Upload className="w-4 h-4 mr-2" />
                  )}
                  Import Mind Map
                </PixelButton>
              </div>
            )}
          </PixelCardContent>
        </PixelCard>
      </motion.div>
    </motion.div>
  );
}

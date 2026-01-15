"use client";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PixelButton } from "@/components/pixel-button";
import { Keyboard } from "lucide-react";

interface KeyboardShortcutsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const shortcuts = [
  { keys: ["N"], description: "Create from text/notes" },
  { keys: ["U"], description: "Create from URL" },
  { keys: ["Y"], description: "Create from YouTube" },
  { keys: ["T"], description: "Browse templates" },
  { keys: ["I"], description: "Import mind map" },
  { keys: ["E"], description: "Export mind map" },
  { keys: ["S"], description: "Share mind map" },
  { keys: ["P"], description: "Toggle insights panel" },
  { keys: ["Esc"], description: "Close dialogs / deselect" },
  { keys: ["Shift", "?"], description: "Show keyboard shortcuts" },
];

export function KeyboardShortcutsDialog({
  open,
  onOpenChange,
}: KeyboardShortcutsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-primary" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>
            Use these shortcuts to navigate faster
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="space-y-2">
            {shortcuts.map((shortcut, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <span className="text-sm text-muted-foreground">
                  {shortcut.description}
                </span>
                <div className="flex items-center gap-1">
                  {shortcut.keys.map((key, keyIndex) => (
                    <span key={keyIndex}>
                      <kbd className="px-2 py-1 text-xs font-mono bg-muted border border-border rounded-md shadow-sm">
                        {key}
                      </kbd>
                      {keyIndex < shortcut.keys.length - 1 && (
                        <span className="mx-1 text-muted-foreground">+</span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-border/50">
          <PixelButton variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </PixelButton>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import { useEffect, useCallback } from "react";

interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  meta?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: () => void;
  description: string;
}

interface UseKeyboardShortcutsOptions {
  enabled?: boolean;
}

export function useKeyboardShortcuts(
  shortcuts: KeyboardShortcut[],
  options: UseKeyboardShortcutsOptions = {}
) {
  const { enabled = true } = options;

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      const target = event.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      for (const shortcut of shortcuts) {
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatch = shortcut.ctrl ? event.ctrlKey : !event.ctrlKey;
        const metaMatch = shortcut.meta ? event.metaKey : !event.metaKey;
        const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;
        const altMatch = shortcut.alt ? event.altKey : !event.altKey;

        if (keyMatch && ctrlMatch && metaMatch && shiftMatch && altMatch) {
          event.preventDefault();
          shortcut.action();
          return;
        }
      }
    },
    [shortcuts, enabled]
  );

  useEffect(() => {
    if (enabled) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [handleKeyDown, enabled]);
}

export const KEYBOARD_SHORTCUTS = {
  NEW_MAP: { key: "n", description: "New mind map from text" },
  NEW_URL: { key: "u", description: "New mind map from URL" },
  IMPORT: { key: "i", description: "Import mind map" },
  EXPORT: { key: "e", description: "Export mind map" },
  SHARE: { key: "s", description: "Share mind map" },
  TOGGLE_PANEL: { key: "p", description: "Toggle insights panel" },
  CLOSE: { key: "Escape", description: "Close dialogs/map" },
  HELP: { key: "?", shift: true, description: "Show keyboard shortcuts" },
} as const;

export function formatShortcut(shortcut: { key: string; ctrl?: boolean; meta?: boolean; shift?: boolean; alt?: boolean }): string {
  const parts: string[] = [];
  
  if (shortcut.ctrl) parts.push("Ctrl");
  if (shortcut.meta) parts.push("Cmd");
  if (shortcut.alt) parts.push("Alt");
  if (shortcut.shift) parts.push("Shift");
  
  const keyDisplay = shortcut.key === " " ? "Space" : shortcut.key.toUpperCase();
  parts.push(keyDisplay);
  
  return parts.join(" + ");
}

"use client";

import { useState, useEffect } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuietModeToggleProps {
  className?: string;
}

export function QuietModeToggle({ className }: QuietModeToggleProps) {
  const [isQuiet, setIsQuiet] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("quiet-mode");
    if (saved === "true") {
      setIsQuiet(true);
      document.documentElement.classList.add("quiet-mode");
    }
  }, []);

  const toggleQuietMode = () => {
    const newValue = !isQuiet;
    setIsQuiet(newValue);
    
    if (newValue) {
      document.documentElement.classList.add("quiet-mode");
      localStorage.setItem("quiet-mode", "true");
    } else {
      document.documentElement.classList.remove("quiet-mode");
      localStorage.setItem("quiet-mode", "false");
    }
  };

  return (
    <button
      onClick={toggleQuietMode}
      className={cn(
        "relative flex items-center gap-2 px-3 py-2 rounded-xl",
        "bg-card/80 backdrop-blur-sm border border-border",
        "hover:border-primary/50 calm-transition",
        "text-sm font-medium",
        isQuiet ? "text-primary" : "text-muted-foreground",
        className
      )}
      aria-label={isQuiet ? "Disable quiet mode" : "Enable quiet mode"}
      title={isQuiet ? "Animations reduced" : "Enable quiet mode for reduced motion"}
    >
      {isQuiet ? (
        <VolumeX className="w-4 h-4" />
      ) : (
        <Volume2 className="w-4 h-4" />
      )}
      <span className="hidden sm:inline">
        {isQuiet ? "Quiet" : "Normal"}
      </span>
    </button>
  );
}

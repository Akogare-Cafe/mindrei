"use client";

import { useState, useEffect, useCallback } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Maximize2,
  Minimize2,
  Download,
} from "lucide-react";
import { PixelButton } from "@/components/pixel-button";

interface PresentationModeProps {
  mindMapId: Id<"mindMaps">;
  onClose: () => void;
}

interface Slide {
  id: string;
  title: string;
  content?: string;
  level: number;
  children: string[];
}

export function PresentationMode({ mindMapId, onClose }: PresentationModeProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const mindMap = useQuery(api.mindMaps.getById, { id: mindMapId });
  const nodes = useQuery(api.nodes.getByMindMap, { mindMapId });

  const slides: Slide[] = [];
  
  if (mindMap && nodes) {
    const rootNodes = nodes.filter(n => n.level === 0);
    const level1Nodes = nodes.filter(n => n.level === 1);
    
    if (rootNodes.length > 0) {
      slides.push({
        id: "title",
        title: mindMap.title,
        content: rootNodes[0]?.content || "Mind Map Presentation",
        level: 0,
        children: level1Nodes.map(n => n.label),
      });
    }
    
    for (const node of level1Nodes) {
      const childNodes = nodes.filter(n => n.parentId === node._id);
      slides.push({
        id: node._id,
        title: node.label,
        content: node.content,
        level: 1,
        children: childNodes.map(n => n.label),
      });
    }
    
    slides.push({
      id: "summary",
      title: "Summary",
      content: `This presentation covered ${level1Nodes.length} main topics.`,
      level: 0,
      children: level1Nodes.map(n => n.label),
    });
  }

  const goToSlide = useCallback((index: number) => {
    if (index >= 0 && index < slides.length) {
      setCurrentSlide(index);
    }
  }, [slides.length]);

  const nextSlide = useCallback(() => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      setIsPlaying(false);
    }
  }, [currentSlide, slides.length]);

  const prevSlide = useCallback(() => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  }, [currentSlide]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(nextSlide, 5000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, nextSlide]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowRight":
        case " ":
          nextSlide();
          break;
        case "ArrowLeft":
          prevSlide();
          break;
        case "Escape":
          if (isFullscreen) {
            document.exitFullscreen();
          } else {
            onClose();
          }
          break;
        case "f":
          toggleFullscreen();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextSlide, prevSlide, isFullscreen, onClose]);

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const exportToHTML = () => {
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <title>${mindMap?.title || "Presentation"}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, sans-serif; background: #0c0f0e; color: white; }
    .slide { min-height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 4rem; }
    .slide h1 { font-size: 3rem; margin-bottom: 2rem; color: #2dd4bf; }
    .slide p { font-size: 1.5rem; max-width: 800px; text-align: center; opacity: 0.8; margin-bottom: 2rem; }
    .slide ul { list-style: none; display: flex; flex-wrap: wrap; gap: 1rem; justify-content: center; }
    .slide li { background: rgba(45, 212, 191, 0.2); padding: 0.75rem 1.5rem; border-radius: 0.5rem; }
    .nav { position: fixed; bottom: 2rem; left: 50%; transform: translateX(-50%); display: flex; gap: 1rem; }
    .nav button { padding: 0.5rem 1rem; background: #2dd4bf; color: #0c0f0e; border: none; border-radius: 0.25rem; cursor: pointer; }
  </style>
</head>
<body>
  ${slides.map((slide, i) => `
    <div class="slide" id="slide-${i}">
      <h1>${slide.title}</h1>
      ${slide.content ? `<p>${slide.content}</p>` : ""}
      ${slide.children.length > 0 ? `
        <ul>
          ${slide.children.map(c => `<li>${c}</li>`).join("")}
        </ul>
      ` : ""}
    </div>
  `).join("")}
  <script>
    let current = 0;
    const slides = document.querySelectorAll('.slide');
    function showSlide(n) {
      slides.forEach((s, i) => s.style.display = i === n ? 'flex' : 'none');
    }
    showSlide(0);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { current = Math.min(current + 1, slides.length - 1); showSlide(current); }
      if (e.key === 'ArrowLeft') { current = Math.max(current - 1, 0); showSlide(current); }
    });
  </script>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${mindMap?.title || "presentation"}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!mindMap || !nodes || slides.length === 0) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading presentation...</p>
      </div>
    );
  }

  const slide = slides[currentSlide];

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-background via-background to-primary/5">
      <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
        <PixelButton variant="ghost" size="sm" onClick={exportToHTML}>
          <Download className="w-4 h-4" />
        </PixelButton>
        <PixelButton variant="ghost" size="sm" onClick={toggleFullscreen}>
          {isFullscreen ? (
            <Minimize2 className="w-4 h-4" />
          ) : (
            <Maximize2 className="w-4 h-4" />
          )}
        </PixelButton>
        <PixelButton variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </PixelButton>
      </div>

      <div className="h-full flex flex-col items-center justify-center px-8 py-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="text-center max-w-4xl"
          >
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl font-bold text-foreground mb-6"
            >
              {slide.title}
            </motion.h1>

            {slide.content && (
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-xl md:text-2xl text-muted-foreground mb-8"
              >
                {slide.content}
              </motion.p>
            )}

            {slide.children.length > 0 && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex flex-wrap justify-center gap-3"
              >
                {slide.children.map((child, i) => (
                  <motion.span
                    key={i}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.4 + i * 0.1 }}
                    className="px-4 py-2 bg-primary/20 text-primary rounded-lg text-lg"
                  >
                    {child}
                  </motion.span>
                ))}
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4">
        <PixelButton
          variant="ghost"
          size="sm"
          onClick={prevSlide}
          disabled={currentSlide === 0}
        >
          <ChevronLeft className="w-5 h-5" />
        </PixelButton>

        <div className="flex items-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goToSlide(i)}
              className={`w-2 h-2 rounded-full transition-all ${
                i === currentSlide
                  ? "w-6 bg-primary"
                  : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
              }`}
            />
          ))}
        </div>

        <PixelButton
          variant="ghost"
          size="sm"
          onClick={() => setIsPlaying(!isPlaying)}
        >
          {isPlaying ? (
            <Pause className="w-5 h-5" />
          ) : (
            <Play className="w-5 h-5" />
          )}
        </PixelButton>

        <PixelButton
          variant="ghost"
          size="sm"
          onClick={nextSlide}
          disabled={currentSlide === slides.length - 1}
        >
          <ChevronRight className="w-5 h-5" />
        </PixelButton>
      </div>

      <div className="absolute bottom-4 right-4 text-sm text-muted-foreground">
        {currentSlide + 1} / {slides.length}
      </div>
    </div>
  );
}

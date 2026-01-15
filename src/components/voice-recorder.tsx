"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Loader2, Sparkles } from "lucide-react";
import { useVoiceRecognition } from "@/hooks/use-voice-recognition";
import { PixelButton } from "@/components/pixel-button";
import { PixelCard, PixelCardContent } from "@/components/pixel-card";
import { cn } from "@/lib/utils";
import { removeFillerWords } from "@/lib/text-cleanup";

interface VoiceRecorderProps {
  onTranscriptComplete: (transcript: string) => void;
  isProcessing?: boolean;
}

export function VoiceRecorder({
  onTranscriptComplete,
  isProcessing = false,
}: VoiceRecorderProps) {
  const [localTranscript, setLocalTranscript] = useState("");

  const {
    isListening,
    isSupported,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    resetTranscript,
  } = useVoiceRecognition({
    onResult: (text) => {
      const cleaned = removeFillerWords(text);
      setLocalTranscript((prev) => prev + " " + cleaned);
    },
    continuous: true,
  });

  const handleToggleRecording = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleGenerateMap = () => {
    const fullTranscript = removeFillerWords((transcript + " " + localTranscript).trim());
    if (fullTranscript) {
      onTranscriptComplete(fullTranscript);
      resetTranscript();
      setLocalTranscript("");
    }
  };

  const handleClear = () => {
    resetTranscript();
    setLocalTranscript("");
  };

  const fullTranscript = (transcript + " " + localTranscript).trim();
  const displayText = fullTranscript + (interimTranscript ? " " + interimTranscript : "");

  if (!isSupported) {
    return (
      <PixelCard className="p-6">
        <div className="text-center text-muted-foreground">
          <MicOff className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Voice recognition is not supported in your browser.</p>
          <p className="text-sm mt-2">Please use Chrome, Edge, or Safari.</p>
        </div>
      </PixelCard>
    );
  }

  return (
    <PixelCard rarity={isListening ? "legendary" : "common"} className="overflow-visible">
      <PixelCardContent className="space-y-4">
        <div className="flex items-center justify-center gap-4">
          <motion.button
            onClick={handleToggleRecording}
            disabled={isProcessing}
            className={cn(
              "relative w-20 h-20 rounded-full flex items-center justify-center",
              "transition-all duration-300",
              isListening
                ? "bg-primary text-primary-foreground voice-pulse"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
              isProcessing && "opacity-50 cursor-not-allowed"
            )}
            whileHover={{ scale: isProcessing ? 1 : 1.05 }}
            whileTap={{ scale: isProcessing ? 1 : 0.95 }}
          >
            <AnimatePresence mode="wait">
              {isListening ? (
                <motion.div
                  key="listening"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <Mic className="w-8 h-8" />
                </motion.div>
              ) : (
                <motion.div
                  key="idle"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <MicOff className="w-8 h-8" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            {isListening ? "Listening... Speak now" : "Click to start recording"}
          </p>
        </div>

        <AnimatePresence>
          {displayText && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-muted/50 rounded-lg p-4 max-h-40 overflow-y-auto">
                <p className="text-sm text-foreground whitespace-pre-wrap">
                  {displayText}
                  {interimTranscript && (
                    <span className="text-muted-foreground opacity-70">
                      {interimTranscript}
                    </span>
                  )}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-2 justify-center">
          {fullTranscript && (
            <>
              <PixelButton
                variant="ghost"
                size="sm"
                onClick={handleClear}
                disabled={isProcessing}
              >
                Clear
              </PixelButton>
              <PixelButton
                size="sm"
                onClick={handleGenerateMap}
                disabled={isProcessing || isListening}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate Mind Map
                  </>
                )}
              </PixelButton>
            </>
          )}
        </div>
      </PixelCardContent>
    </PixelCard>
  );
}

"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, ChevronLeft, Mic, FileText, Layout, Download, Keyboard } from "lucide-react";
import { PixelButton } from "@/components/pixel-button";
import { PixelCard, PixelCardContent } from "@/components/pixel-card";

interface OnboardingStep {
  title: string;
  description: string;
  icon: React.ReactNode;
  highlight?: string;
}

const steps: OnboardingStep[] = [
  {
    title: "Welcome to MindRei",
    description: "Transform your voice into beautiful mind maps in real-time. Let's take a quick tour of the key features.",
    icon: <Mic className="w-8 h-8 text-primary" />,
  },
  {
    title: "Voice Recording",
    description: "Click the microphone button to start a live voice session. Speak naturally and watch your ideas transform into a mind map instantly.",
    icon: <Mic className="w-8 h-8 text-green-500" />,
    highlight: "voice-recorder",
  },
  {
    title: "Multiple Input Methods",
    description: "Not just voice! Create mind maps from text, URLs, YouTube videos, or choose from pre-built templates.",
    icon: <FileText className="w-8 h-8 text-blue-500" />,
    highlight: "create-from",
  },
  {
    title: "Templates Library",
    description: "Start faster with 10 pre-built templates for business, education, personal, and creative projects.",
    icon: <Layout className="w-8 h-8 text-purple-500" />,
  },
  {
    title: "Export Anywhere",
    description: "Export your mind maps in multiple formats: JSON, Markdown, CSV, or Outline. Share or use in other tools.",
    icon: <Download className="w-8 h-8 text-orange-500" />,
  },
  {
    title: "Keyboard Shortcuts",
    description: "Power users love shortcuts! Press Shift+? anytime to see all available keyboard shortcuts.",
    icon: <Keyboard className="w-8 h-8 text-teal-500" />,
  },
];

interface OnboardingTourProps {
  onComplete: () => void;
}

export function OnboardingTour({ onComplete }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    setIsVisible(false);
    localStorage.setItem("mindrei-onboarding-complete", "true");
    setTimeout(onComplete, 300);
  };

  const handleSkip = () => {
    handleComplete();
  };

  const step = steps[currentStep];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-md mx-4"
          >
            <PixelCard className="relative overflow-hidden">
              <button
                onClick={handleSkip}
                className="absolute top-4 right-4 p-1.5 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-colors z-10"
              >
                <X className="w-4 h-4" />
              </button>

              <PixelCardContent className="pt-8 pb-6">
                <div className="text-center mb-6">
                  <motion.div
                    key={currentStep}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center"
                  >
                    {step.icon}
                  </motion.div>

                  <motion.h2
                    key={`title-${currentStep}`}
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-xl font-bold text-foreground mb-2"
                  >
                    {step.title}
                  </motion.h2>

                  <motion.p
                    key={`desc-${currentStep}`}
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="text-sm text-muted-foreground leading-relaxed"
                  >
                    {step.description}
                  </motion.p>
                </div>

                <div className="flex items-center justify-center gap-1.5 mb-6">
                  {steps.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentStep(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentStep
                          ? "w-6 bg-primary"
                          : index < currentStep
                          ? "bg-primary/50"
                          : "bg-muted-foreground/30"
                      }`}
                    />
                  ))}
                </div>

                <div className="flex items-center justify-between gap-3">
                  <PixelButton
                    variant="ghost"
                    onClick={handlePrev}
                    disabled={currentStep === 0}
                    className="flex-1"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Back
                  </PixelButton>

                  <PixelButton
                    onClick={handleNext}
                    className="flex-1"
                  >
                    {currentStep === steps.length - 1 ? (
                      "Get Started"
                    ) : (
                      <>
                        Next
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </>
                    )}
                  </PixelButton>
                </div>

                <button
                  onClick={handleSkip}
                  className="w-full mt-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Skip tour
                </button>
              </PixelCardContent>
            </PixelCard>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function useOnboardingTour() {
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    const completed = localStorage.getItem("mindrei-onboarding-complete");
    if (!completed) {
      const timer = setTimeout(() => setShowTour(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const resetTour = () => {
    localStorage.removeItem("mindrei-onboarding-complete");
    setShowTour(true);
  };

  return { showTour, setShowTour, resetTour };
}

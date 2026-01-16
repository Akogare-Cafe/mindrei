"use client";

import { useState, useCallback, useRef, useEffect } from "react";

interface UseVoiceRecognitionOptions {
  onResult?: (transcript: string) => void;
  onInterimResult?: (transcript: string) => void;
  onError?: (error: string) => void;
  continuous?: boolean;
  language?: string;
}

interface UseVoiceRecognitionReturn {
  isListening: boolean;
  isSupported: boolean;
  transcript: string;
  interimTranscript: string;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
}

export function useVoiceRecognition(
  options: UseVoiceRecognitionOptions = {}
): UseVoiceRecognitionReturn {
  const {
    onResult,
    onInterimResult,
    onError,
    continuous = true,
    language = "en-US",
  } = options;

  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isListeningRef = useRef(false);
  const onResultRef = useRef(onResult);
  const onInterimResultRef = useRef(onInterimResult);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onResultRef.current = onResult;
    onInterimResultRef.current = onInterimResult;
    onErrorRef.current = onError;
  }, [onResult, onInterimResult, onError]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      setIsSupported(!!SpeechRecognition);

      if (SpeechRecognition && !recognitionRef.current) {
        const recognition = new SpeechRecognition();
        recognition.continuous = continuous;
        recognition.interimResults = true;
        recognition.lang = language;

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          let finalTranscript = "";
          let interim = "";

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            if (result.isFinal) {
              finalTranscript += result[0].transcript + " ";
            } else {
              interim += result[0].transcript;
            }
          }

          if (finalTranscript) {
            setTranscript((prev) => prev + finalTranscript);
            onResultRef.current?.(finalTranscript.trim());
          }

          if (interim) {
            setInterimTranscript(interim);
            onInterimResultRef.current?.(interim);
          } else {
            setInterimTranscript("");
          }
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
          const errorMessage = event.error;
          
          if (errorMessage !== "no-speech" && errorMessage !== "aborted") {
            console.error("Speech recognition error:", errorMessage);
            onErrorRef.current?.(errorMessage);
            setIsListening(false);
            isListeningRef.current = false;
          }
        };

        recognition.onend = () => {
          if (isListeningRef.current && continuous) {
            try {
              recognition.start();
            } catch (e) {
              console.error("Failed to restart recognition:", e);
              setIsListening(false);
              isListeningRef.current = false;
            }
          } else {
            setIsListening(false);
            isListeningRef.current = false;
          }
        };

        recognitionRef.current = recognition;
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
        recognitionRef.current = null;
      }
    };
  }, [continuous, language]);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListeningRef.current) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        isListeningRef.current = true;
        setInterimTranscript("");
      } catch (error) {
        console.error("Failed to start voice recognition:", error);
        onErrorRef.current?.("Failed to start voice recognition");
      }
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListeningRef.current) {
      isListeningRef.current = false;
      recognitionRef.current.stop();
      setIsListening(false);
      setInterimTranscript("");
    }
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript("");
    setInterimTranscript("");
  }, []);

  return {
    isListening,
    isSupported,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    resetTranscript,
  };
}

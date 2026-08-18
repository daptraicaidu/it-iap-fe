import { useState, useCallback, useEffect, useRef } from "react";

export interface SpeechChunkData {
  text: string;
  isFinal: boolean;
}

interface UseSpeechRecognitionOptions {
  onSpeechChunk?: (data: SpeechChunkData) => void;
}

interface UseSpeechRecognitionReturn {
  startListening: () => void;
  stopListening: () => void;
  restartListening: () => void;
  isListening: boolean;
  isSupported: boolean;
}

export function useSpeechRecognition(
  options?: UseSpeechRecognitionOptions
): UseSpeechRecognitionReturn {
  const [isListening, setIsListening] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const shouldListenRef = useRef(false);

  const SpeechRecognitionAPI =
    typeof window !== "undefined"
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ? (window as any).SpeechRecognition ||
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).webkitSpeechRecognition
      : null;

  const isSupported = !!SpeechRecognitionAPI;

  const createRecognition = useCallback(() => {
    if (!isSupported || !SpeechRecognitionAPI) return null;

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "vi-VN";
    recognition.maxAlternatives = 1;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      const result = event.results[event.resultIndex];
      if (!result) return;

      const text = result[0]?.transcript || "";
      const isFinal = Boolean(result.isFinal);

      if (text) {
        optionsRef.current?.onSpeechChunk?.({ text, isFinal });
      }
    };

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onend = () => {
      if (shouldListenRef.current) {
        // Auto-restart recognition when browser stops due to brief silence
        try {
          recognition.start();
        } catch {
          setTimeout(() => {
            if (shouldListenRef.current && recognitionRef.current) {
              try {
                recognitionRef.current.start();
              } catch {
                // Ignore
              }
            }
          }, 100);
        }
      } else {
        setIsListening(false);
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onerror = (event: any) => {
      if (event.error === "no-speech" || event.error === "aborted") {
        return;
      }
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        shouldListenRef.current = false;
        setIsListening(false);
      }
    };

    return recognition;
  }, [isSupported, SpeechRecognitionAPI]);

  const startListening = useCallback(() => {
    if (!isSupported) return;
    shouldListenRef.current = true;
    setIsListening(true);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {
        // Ignore
      }
    }

    const rec = createRecognition();
    recognitionRef.current = rec;
    try {
      rec?.start();
    } catch {
      // Ignore
    }
  }, [isSupported, createRecognition]);

  const restartListening = useCallback(() => {
    if (!shouldListenRef.current || !isSupported) return;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {
        // Ignore
      }
      try {
        recognitionRef.current.start();
      } catch {
        // Ignore
      }
    }
  }, [isSupported]);

  const stopListening = useCallback(() => {
    shouldListenRef.current = false;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignore
      }
    }
    setIsListening(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      shouldListenRef.current = false;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // Ignore
        }
        recognitionRef.current = null;
      }
    };
  }, []);

  return {
    startListening,
    stopListening,
    restartListening,
    isListening,
    isSupported,
  };
}

export default useSpeechRecognition;

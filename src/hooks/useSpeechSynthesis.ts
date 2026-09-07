import { useState, useCallback, useEffect } from "react";

interface UseSpeechSynthesisReturn {
  speak: (text: string) => void;
  stop: () => void;
  isSpeaking: boolean;
  isSupported: boolean;
}

export function useSpeechSynthesis(): UseSpeechSynthesisReturn {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const isSupported =
    typeof window !== "undefined" && "speechSynthesis" in window;

  // Load voices — they may not be available immediately on some browsers
  useEffect(() => {
    if (!isSupported) return;

    const loadVoices = () => {
      const available = window.speechSynthesis.getVoices();
      if (available.length > 0) {
        setVoices(available);
      }
    };

    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);

    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    };
  }, [isSupported]);

  const speak = useCallback(
    (text: string) => {
      if (!isSupported) return;

      // Cancel any ongoing speech first
      window.speechSynthesis.cancel();
      setIsSpeaking(false);

      // Small delay to ensure cancel() is fully processed
      setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(text);

        const currentVoices = window.speechSynthesis.getVoices();
        const availableVoices = currentVoices.length > 0 ? currentVoices : voices;

        // Try to find a Vietnamese voice (priority: exact match, then prefix, then by name)
        let viVoice = availableVoices.find(
          (v) => v.lang.replace("_", "-").toLowerCase() === "vi-vn"
        );
        
        if (!viVoice) {
          viVoice = availableVoices.find(
            (v) => v.name.toLowerCase().includes("vietnamese") || v.name.toLowerCase().includes("tiếng việt")
          );
        }

        if (!viVoice) {
          viVoice = availableVoices.find((v) => v.lang.toLowerCase().startsWith("vi"));
        }

        if (viVoice) {
          utterance.voice = viVoice;
          utterance.lang = viVoice.lang;
        } else {
          utterance.lang = "vi-VN";
        }

        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = (e) => {
          // "interrupted" is expected when calling cancel(), not a real error
          if (e.error !== "interrupted") {
            setIsSpeaking(false);
          }
        };

        window.speechSynthesis.speak(utterance);
      }, 50);
    },
    [isSupported, voices]
  );

  const stop = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, [isSupported]);

  return { speak, stop, isSpeaking, isSupported };
}

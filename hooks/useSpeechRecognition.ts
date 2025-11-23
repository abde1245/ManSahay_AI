import { useState, useEffect, useRef, useCallback } from 'react';

export const useSpeechRecognition = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Browser support check
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.warn("Speech Recognition API not supported in this browser.");
      return;
    }

    setIsSupported(true);

    const recognition = new SpeechRecognition();
    recognition.continuous = false; // Set to false for dictation-style (stops after silence)
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onresult = (event: any) => {
      // The API returns a list of results, we take the latest one
      const last = event.results.length - 1;
      const text = event.results[last][0].transcript;
      setTranscript(text);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech Recognition Error:", event.error);
      if (event.error === 'not-allowed') {
        setError("Microphone access denied.");
      } else if (event.error === 'no-speech') {
        setError("No speech detected. Please try again.");
        setIsListening(false);
      } else {
        setError(`Error: ${event.error}`);
      }
      // Some errors (like no-speech) usually automatically stop the service
      if (event.error !== 'no-speech') {
          setIsListening(false);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    // Cleanup on unmount
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const startListening = useCallback(() => {
    setError(null);
    if (recognitionRef.current && isSupported) {
      try {
        // Abort any existing session to be safe
        recognitionRef.current.abort();
        recognitionRef.current.start();
      } catch (e) {
        console.warn("Failed to start recognition:", e);
      }
    }
  }, [isSupported]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  const resetTranscript = useCallback(() => {
      setTranscript('');
  }, []);

  return {
    isListening,
    transcript,
    error,
    startListening,
    stopListening,
    resetTranscript,
    hasSupport: isSupported
  };
};
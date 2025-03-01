import { useState, useEffect, useCallback, useRef } from 'react';

interface SpeechRecognitionResult {
  transcript: string;
  isListening: boolean;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
  error: string | null;
}

// Define the SpeechRecognition interface for TypeScript
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: {
    item(index: number): {
      item(index: number): {
        transcript: string;
        confidence: number;
      };
    };
    length: number;
    isFinal?: boolean;
  };
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onend: ((event: Event) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onstart: ((event: Event) => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

// Get the correct SpeechRecognition implementation
const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;

export const useSpeechRecognition = (): SpeechRecognitionResult => {
  const [transcript, setTranscript] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const previousTranscriptRef = useRef<string>('');

  // Initialize speech recognition
  useEffect(() => {
    if (!SpeechRecognitionAPI) {
      setError('Speech recognition is not supported in this browser');
      return;
    }

    try {
      recognitionRef.current = new SpeechRecognitionAPI();
      if (recognitionRef.current) {
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US'; // Default to English
        recognitionRef.current.maxAlternatives = 1;
      }
    } catch (err) {
      console.error('Error initializing speech recognition:', err);
      setError('Failed to initialize speech recognition');
    }

    return () => {
      if (recognitionRef.current && isListening) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Handle speech recognition results
  useEffect(() => {
    if (!recognitionRef.current) return;

    const handleResult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = '';
      let finalTranscript = previousTranscriptRef.current;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcriptText = result[0].transcript;

        if (result.isFinal) {
          finalTranscript += ' ' + transcriptText;
        } else {
          interimTranscript += transcriptText;
        }
      }

      // Update the transcript state
      const newTranscript = (finalTranscript + ' ' + interimTranscript).trim();
      setTranscript(newTranscript);
      
      // If we have a final result, update the previous transcript reference
      if (finalTranscript !== previousTranscriptRef.current) {
        previousTranscriptRef.current = finalTranscript.trim();
      }
    };

    const handleError = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error, event.message);
      
      // Set appropriate error message
      if (event.error === 'no-speech') {
        setError('No speech detected. Please try again.');
      } else if (event.error === 'audio-capture') {
        setError('No microphone available or microphone is disabled.');
      } else if (event.error === 'not-allowed') {
        setError('Microphone permission denied. Please enable microphone access in your browser.');
      } else {
        setError(`Speech recognition error: ${event.error}`);
      }
      
      setIsListening(false);
    };

    const handleEnd = () => {
      // This event fires when recognition stops for any reason
      setIsListening(false);
    };

    // Set up event listeners
    recognitionRef.current.onresult = handleResult;
    recognitionRef.current.onerror = handleError;
    recognitionRef.current.onend = handleEnd;
    recognitionRef.current.onstart = () => setIsListening(true);

  }, []);

  // Start speech recognition
  const startListening = useCallback(() => {
    setError(null);
    
    if (!recognitionRef.current) {
      setError('Speech recognition is not supported or initialized');
      return;
    }

    if (isListening) return;

    try {
      recognitionRef.current.start();
    } catch (err) {
      console.error('Error starting speech recognition:', err);
      setError('Failed to start speech recognition');
    }
  }, [isListening]);

  // Stop speech recognition
  const stopListening = useCallback(() => {
    if (!recognitionRef.current || !isListening) return;

    try {
      recognitionRef.current.stop();
    } catch (err) {
      console.error('Error stopping speech recognition:', err);
    }
  }, [isListening]);

  // Reset transcript
  const resetTranscript = useCallback(() => {
    setTranscript('');
    previousTranscriptRef.current = '';
  }, []);

  return {
    transcript,
    isListening,
    startListening,
    stopListening,
    resetTranscript,
    error
  };
};

export default useSpeechRecognition; 
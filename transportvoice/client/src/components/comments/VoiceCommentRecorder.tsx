import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  IconButton,
  Paper,
  Typography,
  LinearProgress,
  Tooltip,
  Chip,
  Stack,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Divider
} from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import EditIcon from '@mui/icons-material/Edit';
import WarningIcon from '@mui/icons-material/Warning';
import WavesIcon from '@mui/icons-material/Waves';
import GraphicEqIcon from '@mui/icons-material/GraphicEq';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { useCommentsHook } from '../../hooks/useCommentsHook';
import * as commentService from '../../services/commentService';
import AudioWaveform from '../common/AudioWaveform';

interface VoiceCommentRecorderProps {
  projectId: string;
  locationId?: string;
  onCommentAdded?: () => void;
  maxRecordingTime?: number; // in seconds
}

const VoiceCommentRecorder: React.FC<VoiceCommentRecorderProps> = ({
  projectId,
  locationId,
  onCommentAdded,
  maxRecordingTime = 120 // 2 minutes default
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editedTranscript, setEditedTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [micPermission, setMicPermission] = useState<boolean | null>(null);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const { 
    transcript, 
    isListening, 
    resetTranscript, 
    startListening, 
    stopListening,
    error: recognitionError
  } = useSpeechRecognition();
  
  const commentsHook = useCommentsHook({
    projectId
  });

  // Check for microphone permission on mount
  useEffect(() => {
    const checkMicPermission = async () => {
      try {
        const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        setMicPermission(result.state === 'granted');
        
        result.addEventListener('change', () => {
          setMicPermission(result.state === 'granted');
        });
      } catch (error) {
        console.error('Error checking microphone permission:', error);
      }
    };
    
    checkMicPermission();
    
    return () => {
      // Clean up any ongoing recording when the component unmounts
      if (isRecording) {
        stopRecording();
      }
      
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, []);

  // Set up audio playback progress tracking
  useEffect(() => {
    if (!audioRef.current) return;
    
    const updatePlaybackProgress = () => {
      if (audioRef.current) {
        const progress = (audioRef.current.currentTime / audioRef.current.duration) * 100;
        setPlaybackProgress(progress);
      }
    };
    
    const handlePlaybackEnded = () => {
      setIsPlaying(false);
      setPlaybackProgress(0);
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
      }
    };
    
    audioRef.current.addEventListener('timeupdate', updatePlaybackProgress);
    audioRef.current.addEventListener('ended', handlePlaybackEnded);
    audioRef.current.addEventListener('play', () => setIsPlaying(true));
    audioRef.current.addEventListener('pause', () => setIsPlaying(false));
    
    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener('timeupdate', updatePlaybackProgress);
        audioRef.current.removeEventListener('ended', handlePlaybackEnded);
        audioRef.current.removeEventListener('play', () => setIsPlaying(true));
        audioRef.current.removeEventListener('pause', () => setIsPlaying(false));
      }
    };
  }, [audioRef.current]);

  const requestMicrophonePermission = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicPermission(true);
      return true;
    } catch (err) {
      console.error('Error accessing microphone:', err);
      setError('Unable to access microphone. Please check your browser permissions.');
      setMicPermission(false);
      return false;
    }
  };

  const startRecording = async () => {
    setError(null);
    
    // Check/request microphone permission if not already granted
    if (micPermission !== true) {
      const permissionGranted = await requestMicrophonePermission();
      if (!permissionGranted) return;
    }
    
    try {
      // Reset state
      resetTranscript();
      audioChunksRef.current = [];
      setRecordingTime(0);
      
      // Get audio stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      // Set up audio analyzer for visualizing audio levels
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      const analyser = audioContext.createAnalyser();
      analyserRef.current = analyser;
      const microphone = audioContext.createMediaStreamSource(stream);
      microphone.connect(analyser);
      analyser.fftSize = 256;
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      
      // Function to continuously update audio level
      const updateAudioLevel = () => {
        if (analyserRef.current && isRecording && !isPaused) {
          analyserRef.current.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length;
          setAudioLevel(average);
          requestAnimationFrame(updateAudioLevel);
        }
      };
      
      // Set up media recorder
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const url = URL.createObjectURL(audioBlob);
        setAudioBlob(audioBlob);
        setAudioUrl(url);
        
        // Clean up
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
        
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
          audioContextRef.current.close();
        }
      };
      
      // Start recording
      mediaRecorder.start();
      setIsRecording(true);
      setIsPaused(false);
      
      // Start audio level visualization
      updateAudioLevel();
      
      // Start speech recognition
      startListening();
      
      // Start timer
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prevTime => {
          if (prevTime >= maxRecordingTime - 1) {
            stopRecording();
            return maxRecordingTime;
          }
          return prevTime + 1;
        });
      }, 1000);
      
    } catch (err) {
      console.error('Error starting recording:', err);
      setError('Failed to start recording. Please check your microphone and try again.');
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        // Resume recording
        mediaRecorderRef.current.resume();
        setIsPaused(false);
        startListening();
      } else {
        // Pause recording
        mediaRecorderRef.current.pause();
        setIsPaused(true);
        stopListening();
      }
    }
  };

  const stopRecording = () => {
    // Stop the timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // Stop speech recognition
    stopListening();
    
    // Stop media recorder
    if (mediaRecorderRef.current && isRecording) {
      if (mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    }
    
    // Stop all tracks in the stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    
    setIsRecording(false);
    setIsPaused(false);
    setIsTranscribing(true);
    
    // Simulate transcription delay (in a real app, this would be an API call)
    setTimeout(() => {
      setIsTranscribing(false);
    }, 1500);
  };

  const togglePlayback = () => {
    if (!audioRef.current || !audioUrl) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
  };

  const resetRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    
    setAudioBlob(null);
    setAudioUrl(null);
    setIsPlaying(false);
    setPlaybackProgress(0);
    resetTranscript();
    setRecordingTime(0);
    setEditedTranscript('');
  };

  const handleOpenEditDialog = () => {
    setEditedTranscript(transcript);
    setIsEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setIsEditDialogOpen(false);
  };

  const handleSaveEditedTranscript = () => {
    // In a real app, you might want to update the transcript state
    // For now, we'll just close the dialog
    setIsEditDialogOpen(false);
  };

  const submitVoiceComment = async () => {
    if (!audioBlob) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Create a FormData object to send the audio file
      const formData = new FormData();
      formData.append('audio', audioBlob, 'voice-comment.webm');
      
      if (editedTranscript || transcript) {
        formData.append('transcript', editedTranscript || transcript);
      }
      
      formData.append('projectId', projectId);
      if (locationId) {
        formData.append('locationId', locationId);
      }
      
      // Use the createComment function from useCommentsHook with the content being the transcript
      await commentsHook.createComment({
        content: editedTranscript || transcript || 'Voice comment',
        // You would need to upload the audio file separately and get a URL
        // This is a simplified implementation
      });
      
      // Reset state after successful submission
      resetRecording();
      
      // Notify parent component
      if (onCommentAdded) {
        onCommentAdded();
      }
    } catch (err) {
      console.error('Error submitting voice comment:', err);
      setError('Failed to submit your voice comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const copyTranscriptToClipboard = () => {
    navigator.clipboard.writeText(editedTranscript || transcript);
  };

  const renderRecordingControls = () => (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
          {isPaused ? 'Recording Paused' : 'Recording'} 
          {isPaused ? null : <GraphicEqIcon sx={{ ml: 1, color: 'error.main', animation: 'pulse 1.5s infinite' }} />}
        </Typography>
        <Chip 
          label={formatTime(recordingTime)} 
          color={recordingTime > maxRecordingTime * 0.8 ? 'error' : 'default'} 
          size="small"
        />
      </Box>
      
      <LinearProgress 
        variant="determinate" 
        value={(recordingTime / maxRecordingTime) * 100} 
        color={recordingTime > maxRecordingTime * 0.8 ? 'error' : 'primary'} 
        sx={{ mb: 2, height: 8, borderRadius: 1 }}
      />
      
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box sx={{ width: 40, height: 40 }}>
          <AudioWaveform audioLevel={audioLevel} active={isRecording && !isPaused} />
        </Box>
        
        <Paper 
          variant="outlined" 
          sx={{ 
            flexGrow: 1, 
            p: 1.5, 
            borderRadius: 2, 
            bgcolor: 'background.default',
            minHeight: 60,
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <Typography variant="body2" color="text.secondary">
            {transcript || 'Start speaking to see your words appear here...'}
          </Typography>
        </Paper>
      </Box>
      
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, gap: 2 }}>
        <Tooltip title={isPaused ? 'Resume Recording' : 'Pause Recording'}>
          <IconButton 
            color="primary" 
            onClick={pauseRecording}
            size="large"
          >
            {isPaused ? <PlayArrowIcon /> : <PauseIcon />}
          </IconButton>
        </Tooltip>
        
        <Tooltip title="Stop Recording">
          <IconButton 
            color="error" 
            onClick={stopRecording}
            size="large"
            sx={{ 
              bgcolor: 'error.main', 
              color: 'white',
              '&:hover': { bgcolor: 'error.dark' } 
            }}
          >
            <StopIcon />
          </IconButton>
        </Tooltip>
      </Box>
      
      {recordingTime > maxRecordingTime * 0.8 && (
        <Alert 
          severity="warning" 
          icon={<WarningIcon />}
          sx={{ mt: 2 }}
        >
          You are approaching the maximum recording time of {formatTime(maxRecordingTime)}.
        </Alert>
      )}
    </Box>
  );

  const renderPreviewControls = () => (
    <Box>
      {isTranscribing ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 3 }}>
          <CircularProgress size={40} sx={{ mb: 2 }} />
          <Typography>Transcribing your voice comment...</Typography>
        </Box>
      ) : (
        <>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Preview Your Voice Comment
            </Typography>
            
            <Card variant="outlined" sx={{ mb: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <WavesIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>
                    Audio ({formatTime(audioRef.current?.duration || 0)})
                  </Typography>
                  <Tooltip title={isPlaying ? 'Pause' : 'Play'}>
                    <IconButton 
                      size="small" 
                      onClick={togglePlayback}
                      color="primary"
                    >
                      {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
                    </IconButton>
                  </Tooltip>
                </Box>
                
                <Box sx={{ position: 'relative', height: 36, mb: 2 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={playbackProgress} 
                    sx={{ 
                      position: 'absolute', 
                      bottom: 0, 
                      left: 0, 
                      right: 0, 
                      height: 6,
                      borderRadius: 1
                    }} 
                  />
                </Box>
                
                <audio ref={audioRef} src={audioUrl || undefined} style={{ display: 'none' }} />
                
                <Divider sx={{ my: 2 }} />
                
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                  <Typography variant="subtitle2" sx={{ mr: 1, mt: 0.5 }}>
                    Transcript:
                  </Typography>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body2">
                      {editedTranscript || transcript || 'No transcript available.'}
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                  <Tooltip title="Copy Transcript">
                    <IconButton 
                      size="small" 
                      onClick={copyTranscriptToClipboard}
                    >
                      <ContentCopyIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edit Transcript">
                    <IconButton 
                      size="small" 
                      onClick={handleOpenEditDialog}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </CardContent>
            </Card>
          </Box>
          
          <Stack direction="row" spacing={2} justifyContent="space-between">
            <Button 
              variant="outlined" 
              startIcon={<DeleteIcon />} 
              onClick={resetRecording}
              color="error"
            >
              Discard
            </Button>
            
            <Button 
              variant="contained" 
              startIcon={<SaveIcon />} 
              onClick={submitVoiceComment}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Voice Comment'}
            </Button>
          </Stack>
        </>
      )}
    </Box>
  );

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {recognitionError && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Speech recognition error: {recognitionError}
        </Alert>
      )}
      
      {!isRecording && !audioUrl ? (
        <Box sx={{ textAlign: 'center', py: 2 }}>
          <Button
            variant="contained"
            startIcon={<MicIcon />}
            onClick={startRecording}
            size="large"
            disabled={isSubmitting}
          >
            Record Voice Comment
          </Button>
          <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
            Max recording time: {formatTime(maxRecordingTime)}
          </Typography>
        </Box>
      ) : isRecording ? (
        renderRecordingControls()
      ) : (
        renderPreviewControls()
      )}
      
      {/* Edit Transcript Dialog */}
      <Dialog open={isEditDialogOpen} onClose={handleCloseEditDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Transcript</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={6}
            value={editedTranscript}
            onChange={(e) => setEditedTranscript(e.target.value)}
            placeholder="Edit your transcribed text here..."
            variant="outlined"
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>Cancel</Button>
          <Button onClick={handleSaveEditedTranscript} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default VoiceCommentRecorder; 
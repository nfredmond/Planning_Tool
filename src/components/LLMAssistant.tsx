import React, { useState } from 'react';
import { 
  Box, 
  Paper, 
  TextField, 
  Button, 
  Typography, 
  CircularProgress,
  Divider,
  IconButton,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormControlLabel,
  Switch,
  ToggleButtonGroup,
  ToggleButton
} from '@mui/material';
import { useLLM, LLMProvider } from '../context/LLMContext';
import { Send, SmartToy, Settings, SettingsBackupRestore } from '@mui/icons-material';

interface LLMAssistantProps {
  title?: string;
  placeholder?: string;
  systemMessage?: string;
  contextData?: Record<string, any>;
  onResultGenerated?: (result: string) => void;
}

/**
 * LLM Assistant Component
 * A reusable component for interacting with LLMs
 */
const LLMAssistant: React.FC<LLMAssistantProps> = ({
  title = 'AI Assistant',
  placeholder = 'Ask me anything...',
  systemMessage = 'You are a helpful assistant. Provide concise and relevant information.',
  contextData,
  onResultGenerated
}) => {
  const [prompt, setPrompt] = useState<string>('');
  const [response, setResponse] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  
  const llm = useLLM();

  // Handle prompt submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setError(null);

    try {
      // Build context-aware prompt if context data is provided
      let contextPrompt = prompt;
      if (contextData) {
        contextPrompt = `Context information:\n${Object.entries(contextData)
          .map(([key, value]) => `${key}: ${value}`)
          .join('\n')}\n\nUser query: ${prompt}`;
      }

      // Generate completion
      const result = await llm.generateCompletionWithSystem(systemMessage, contextPrompt);
      
      setResponse(result);
      if (onResultGenerated) {
        onResultGenerated(result);
      }
    } catch (err) {
      console.error('Error generating LLM response:', err);
      setError('Failed to generate response. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Reset the conversation
  const handleReset = () => {
    setPrompt('');
    setResponse('');
    setError(null);
  };

  // Handle provider change
  const handleProviderChange = (event: React.MouseEvent<HTMLElement>, newProvider: LLMProvider | null) => {
    if (newProvider) {
      llm.setProvider(newProvider);
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 3, my: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <SmartToy sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6">{title}</Typography>
        </Box>
        <Box>
          <Tooltip title="Reset conversation">
            <IconButton onClick={handleReset} size="small">
              <SettingsBackupRestore />
            </IconButton>
          </Tooltip>
          <Tooltip title="LLM Settings">
            <IconButton onClick={() => setShowSettings(!showSettings)} size="small">
              <Settings />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {showSettings && (
        <Box sx={{ mb: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
          <Typography variant="subtitle2" gutterBottom>LLM Settings</Typography>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" gutterBottom>Provider</Typography>
            <ToggleButtonGroup
              value={llm.provider}
              exclusive
              onChange={handleProviderChange}
              aria-label="LLM Provider"
              size="small"
              sx={{ mb: 1 }}
            >
              <ToggleButton value="openai" aria-label="OpenAI">
                GPT (OpenAI)
              </ToggleButton>
              <ToggleButton value="anthropic" aria-label="Anthropic">
                Claude (Anthropic)
              </ToggleButton>
              <ToggleButton value="gemini" aria-label="Gemini">
                Gemini (Google)
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
          
          <FormControl fullWidth margin="dense" size="small">
            <InputLabel>Model</InputLabel>
            <Select
              value={llm.model}
              label="Model"
              onChange={(e) => llm.setModel(e.target.value)}
            >
              {llm.getAvailableModels().map(model => (
                <MenuItem key={model} value={model}>{model}</MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <TextField
            fullWidth
            margin="dense"
            size="small"
            label="API Key"
            type="password"
            value={llm.apiKey}
            onChange={(e) => llm.setApiKey(e.target.value)}
            helperText={`Current provider: ${
              llm.provider === 'openai' ? 'OpenAI' : 
              llm.provider === 'anthropic' ? 'Anthropic' : 'Google Gemini'
            }`}
          />
        </Box>
      )}

      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          multiline
          rows={3}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={placeholder}
          variant="outlined"
          margin="normal"
        />
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading || !prompt.trim()}
            startIcon={loading ? <CircularProgress size={20} /> : <Send />}
          >
            {loading ? 'Generating...' : 'Send'}
          </Button>
        </Box>
      </form>

      {error && (
        <Typography color="error" variant="body2" sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}

      {response && (
        <>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle2" gutterBottom>Response:</Typography>
          <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.paper' }}>
            <Typography variant="body2" style={{ whiteSpace: 'pre-wrap' }}>
              {response}
            </Typography>
          </Paper>
        </>
      )}
    </Paper>
  );
};

export default LLMAssistant; 
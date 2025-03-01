import React, { useState, useEffect, useRef } from 'react';
import { 
  Paper, Typography, TextField, Button, 
  CircularProgress, Box, Chip, 
  IconButton
} from '@mui/material';
import { 
  Send, Clear, SupportAgent, 
  QuestionAnswer, EmojiObjects
} from '@mui/icons-material';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export interface AIAssistantProps {
  context?: string;
  projectId?: string;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ context, projectId }) => {
  const [input, setInput] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [suggestions, setSuggestions] = useState<string[]>([
    'How does this project impact traffic?',
    'What are the environmental benefits?',
    'Suggest alternative transportation modes',
    'Show nearby points of interest'
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Add welcome message on initial load
  useEffect(() => {
    setMessages([{
      id: '0',
      text: context 
        ? `Hello! I'm your AI assistant for the ${context} project. How can I help you today?` 
        : "Hello! I'm your AI assistant for TransportVoice. How can I help you with your transportation planning?",
      sender: 'ai',
      timestamp: new Date()
    }]);
  }, [context]);

  // Scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    // Add user message to chat
    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      // Send message to API
      const response = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: input,
          context,
          projectId,
          history: messages.slice(-6) // Send last 6 messages for context
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }
      
      const data = await response.json();
      
      // Add AI response to chat
      const aiMessage: Message = {
        id: Date.now().toString(),
        text: data.response,
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
      // Update suggestions based on conversation context
      if (data.suggestions && data.suggestions.length > 0) {
        setSuggestions(data.suggestions);
      }
    } catch (error) {
      console.error('Error communicating with AI assistant:', error);
      
      // Add error message
      const errorMessage: Message = {
        id: Date.now().toString(),
        text: 'Sorry, I encountered an error. Please try again later.',
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };
  
  const handleClearChat = () => {
    // Keep only the welcome message
    setMessages(messages.slice(0, 1));
  };

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: 2, 
        display: 'flex', 
        flexDirection: 'column', 
        height: '100%',
        maxHeight: '600px'
      }}
    >
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          mb: 2, 
          borderBottom: '1px solid #eee',
          pb: 1
        }}
      >
        <SupportAgent color="primary" sx={{ mr: 1 }} />
        <Typography variant="h6" component="div">
          AI Assistant
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <IconButton 
          size="small" 
          onClick={handleClearChat}
          title="Clear conversation"
        >
          <Clear fontSize="small" />
        </IconButton>
      </Box>
      
      <Box 
        sx={{ 
          flexGrow: 1, 
          overflowY: 'auto', 
          mb: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 2
        }}
      >
        {messages.map(message => (
          <Box 
            key={message.id}
            sx={{
              alignSelf: message.sender === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '80%',
              backgroundColor: message.sender === 'user' ? '#1976d2' : '#f5f5f5',
              color: message.sender === 'user' ? 'white' : 'inherit',
              p: 2,
              borderRadius: 2
            }}
          >
            <Typography variant="body1">{message.text}</Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                display: 'block', 
                mt: 1,
                opacity: 0.7,
                textAlign: message.sender === 'user' ? 'right' : 'left' 
              }}
            >
              {message.timestamp.toLocaleTimeString()}
            </Typography>
          </Box>
        ))}
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: 1 }}>
            <CircularProgress size={20} />
          </Box>
        )}
        <div ref={messagesEndRef} />
      </Box>
      
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Suggested questions:
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {suggestions.map((suggestion, index) => (
            <Chip
              key={index}
              label={suggestion}
              onClick={() => handleSuggestionClick(suggestion)}
              icon={index % 2 === 0 ? <QuestionAnswer fontSize="small" /> : <EmojiObjects fontSize="small" />}
              variant="outlined"
              clickable
            />
          ))}
        </Box>
      </Box>
      
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Ask me anything about transportation planning..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          multiline
          maxRows={3}
          size="small"
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleSendMessage}
          disabled={isLoading || !input.trim()}
          endIcon={<Send />}
        >
          Send
        </Button>
      </Box>
    </Paper>
  );
};

export default AIAssistant; 
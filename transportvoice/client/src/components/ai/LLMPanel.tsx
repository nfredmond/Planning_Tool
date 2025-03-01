import React, { useState, useEffect } from 'react';
import { 
  Box, Paper, Typography, TextField, Button, 
  CircularProgress, Divider, Stack, Chip, 
  FormControl, InputLabel, Select, MenuItem, 
  SelectChangeEvent, Alert
} from '@mui/material';
import { 
  Psychology, BarChart, Lightbulb, 
  TimelineOutlined, PeopleOutline, 
  NatureOutlined, TrendingUp, Check
} from '@mui/icons-material';

interface LLMPanelProps {
  projectId?: string;
  projectData?: any;
  onInsightsGenerated?: (insights: any) => void;
}

interface Insight {
  id: string;
  type: 'demographic' | 'environmental' | 'economic' | 'traffic' | 'social' | 'other';
  content: string;
  score: number;
  timestamp: Date;
}

interface ModelOption {
  id: string;
  name: string;
  description: string;
  capabilities: string[];
}

const LLMPanel: React.FC<LLMPanelProps> = ({ 
  projectId, 
  projectData,
  onInsightsGenerated 
}) => {
  const [selectedModel, setSelectedModel] = useState<string>('gpt-4');
  const [promptInput, setPromptInput] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [recentPrompts, setRecentPrompts] = useState<string[]>([
    'Analyze demographic impact of this project',
    'Predict traffic flow changes',
    'Suggest environmental improvements',
    'Identify community engagement opportunities'
  ]);
  const [error, setError] = useState<string | null>(null);
  const [modelOptions, setModelOptions] = useState<ModelOption[]>([
    {
      id: 'gpt-4',
      name: 'GPT-4',
      description: 'Advanced LLM with strong reasoning capabilities',
      capabilities: ['Demographic analysis', 'Impact prediction', 'Policy suggestions']
    },
    {
      id: 'claude-3',
      name: 'Claude 3',
      description: 'Great for detailed, nuanced analysis',
      capabilities: ['Environmental assessment', 'Community impact', 'Detailed reports']
    },
    {
      id: 'llama-3',
      name: 'Llama 3',
      description: 'Open-source model with strong reasoning',
      capabilities: ['Quick analysis', 'Local execution', 'Basic recommendations']
    }
  ]);
  
  // Preset prompts based on project context
  useEffect(() => {
    if (projectData) {
      setRecentPrompts([
        `Analyze demographic impact of the ${projectData.name} project`,
        `Predict traffic flow changes for ${projectData.location}`,
        `Suggest environmental improvements for ${projectData.type} projects`,
        `Identify community engagement opportunities in ${projectData.neighborhood}`
      ]);
    }
  }, [projectData]);
  
  const handleModelChange = (event: SelectChangeEvent<string>) => {
    setSelectedModel(event.target.value);
  };
  
  const handlePromptSelect = (prompt: string) => {
    setPromptInput(prompt);
  };
  
  const generateInsights = async () => {
    if (!promptInput.trim()) return;
    
    setIsGenerating(true);
    setError(null);
    
    try {
      // API call to the AI service
      const response = await fetch('/api/ai/generate-insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          projectId,
          model: selectedModel,
          prompt: promptInput,
          projectData
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate insights');
      }
      
      const data = await response.json();
      
      // Process the insights
      const newInsights: Insight[] = data.insights.map((insight: any) => ({
        ...insight,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
        timestamp: new Date()
      }));
      
      setInsights(prev => [...newInsights, ...prev]);
      
      // Add current prompt to recent prompts if it's not already there
      if (!recentPrompts.includes(promptInput)) {
        setRecentPrompts(prev => [promptInput, ...prev.slice(0, 3)]);
      }
      
      // Clear the input
      setPromptInput('');
      
      // Callback with insights if provided
      if (onInsightsGenerated) {
        onInsightsGenerated(newInsights);
      }
    } catch (error) {
      console.error('Error generating insights:', error);
      setError('Failed to generate insights. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Get icon based on insight type
  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'demographic':
        return <PeopleOutline />;
      case 'environmental':
        return <NatureOutlined />;
      case 'economic':
        return <TrendingUp />;
      case 'traffic':
        return <TimelineOutlined />;
      case 'social':
        return <PeopleOutline />;
      default:
        return <Lightbulb />;
    }
  };
  
  return (
    <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Psychology color="primary" sx={{ mr: 1 }} />
        <Typography variant="h5" component="h2">
          AI Insights Generator
        </Typography>
      </Box>
      
      <Divider sx={{ mb: 3 }} />
      
      <FormControl fullWidth margin="normal">
        <InputLabel id="model-select-label">AI Model</InputLabel>
        <Select
          labelId="model-select-label"
          id="model-select"
          value={selectedModel}
          label="AI Model"
          onChange={handleModelChange}
        >
          {modelOptions.map(model => (
            <MenuItem key={model.id} value={model.id}>
              <Box>
                <Typography variant="subtitle1">{model.name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {model.description}
                </Typography>
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      
      <Box sx={{ mt: 2, mb: 1 }}>
        <Typography variant="subtitle2" gutterBottom>
          Model capabilities:
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {modelOptions
            .find(model => model.id === selectedModel)
            ?.capabilities.map((capability, index) => (
              <Chip 
                key={index} 
                label={capability} 
                size="small" 
                icon={<Check fontSize="small" />} 
              />
            ))
          }
        </Box>
      </Box>
      
      <TextField
        fullWidth
        label="What insights would you like to generate?"
        multiline
        rows={3}
        value={promptInput}
        onChange={(e) => setPromptInput(e.target.value)}
        margin="normal"
        placeholder="Describe what you'd like the AI to analyze..."
      />
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={generateInsights}
          disabled={isGenerating || !promptInput.trim()}
          startIcon={isGenerating ? <CircularProgress size={20} color="inherit" /> : <Lightbulb />}
        >
          {isGenerating ? 'Generating...' : 'Generate Insights'}
        </Button>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
      
      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Recent prompts:
        </Typography>
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
          {recentPrompts.map((prompt, index) => (
            <Chip
              key={index}
              label={prompt}
              onClick={() => handlePromptSelect(prompt)}
              clickable
              variant="outlined"
            />
          ))}
        </Stack>
      </Box>
      
      <Divider sx={{ my: 3 }} />
      
      <Typography variant="h6" gutterBottom>
        Generated Insights
      </Typography>
      
      {insights.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          No insights generated yet. Use the form above to generate AI-powered analysis of your project.
        </Typography>
      ) : (
        <Stack spacing={2} sx={{ mt: 2 }}>
          {insights.map(insight => (
            <Paper
              key={insight.id}
              sx={{
                p: 2,
                borderLeft: `4px solid ${
                  insight.type === 'environmental' ? 'green' :
                  insight.type === 'demographic' ? 'blue' :
                  insight.type === 'economic' ? 'purple' :
                  insight.type === 'traffic' ? 'orange' :
                  'grey'
                }`
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <Box sx={{ mt: 0.5 }}>
                  {getInsightIcon(insight.type)}
                </Box>
                <Box>
                  <Typography variant="subtitle1">
                    {insight.type.charAt(0).toUpperCase() + insight.type.slice(1)} Insight
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 1 }}>
                    {insight.content}
                  </Typography>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mt: 1 
                  }}>
                    <Typography variant="caption" color="text.secondary">
                      Confidence: {insight.score.toFixed(2)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {insight.timestamp.toLocaleTimeString()} {insight.timestamp.toLocaleDateString()}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Paper>
          ))}
        </Stack>
      )}
    </Paper>
  );
};

export default LLMPanel; 
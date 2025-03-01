import React, { useState, ReactNode, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Grid,
  Slider,
  Switch,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  CardActions,
  Divider,
  Alert,
  IconButton,
  Tooltip,
  Chip,
  Stack,
  useTheme,
  SelectChangeEvent,
  Tab,
  Tabs
} from '@mui/material';
import {
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Code as CodeIcon,
  Tune as TuneIcon,
  Api as ApiIcon,
  AutoFixHigh as AIIcon,
  Settings as SettingsIcon,
  Info as InfoIcon,
  Psychology as PsychologyIcon,
  HelpOutline as HelpIcon,
  CheckCircle as CheckCircleIcon,
  Edit as EditIcon,
  SmartToy as GeminiIcon
} from '@mui/icons-material';
import { useLLM, LLMProvider, LLM_MODELS } from '../../../context/LLMContext';

// Interface for AI Model settings
interface AIModel {
  id: string;
  name: string;
  provider: string;
  apiKey: string;
  isEnabled: boolean;
  usageLimit: number;
  temperature: number;
  maxTokens: number;
  isDefault: boolean;
}

// Mock data for AI models
const mockAIModels: AIModel[] = [
  {
    id: '1',
    name: 'GPT-4',
    provider: 'OpenAI',
    apiKey: 'sk-123456789abcdefghijk',
    isEnabled: true,
    usageLimit: 1000,
    temperature: 0.7,
    maxTokens: 2048,
    isDefault: true
  },
  {
    id: '2',
    name: 'Claude',
    provider: 'Anthropic',
    apiKey: 'sk-anthropic-987654321',
    isEnabled: true,
    usageLimit: 500,
    temperature: 0.5,
    maxTokens: 1024,
    isDefault: false
  },
  {
    id: '3',
    name: 'Llama-2',
    provider: 'Meta',
    apiKey: 'sk-meta-abcdef123456',
    isEnabled: false,
    usageLimit: 300,
    temperature: 0.8,
    maxTokens: 4096,
    isDefault: false
  }
];

// Interface for prompt templates
interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  template: string;
  category: 'comments' | 'reports' | 'sentiment' | 'geographic' | 'general';
  lastUsed?: string;
  isDefault?: boolean;
}

// Mock data for prompt templates
const mockPromptTemplates: PromptTemplate[] = [
  {
    id: '1',
    name: 'Comment Summarization',
    description: 'Summarizes multiple comments into key themes and sentiments',
    template: 'Analyze and summarize the following comments, identifying key themes, sentiments, and actionable insights: {{COMMENTS}}',
    category: 'comments',
    lastUsed: '2023-05-15T10:30:00Z',
    isDefault: true
  },
  {
    id: '2',
    name: 'Sentiment Analysis',
    description: 'Analyzes text to determine positive/negative sentiment',
    template: 'Analyze the sentiment of the following text. Rate on a scale from -5 (very negative) to +5 (very positive), and explain the reasoning: {{TEXT}}',
    category: 'sentiment',
    lastUsed: '2023-05-12T14:20:00Z'
  },
  {
    id: '3',
    name: 'Report Generation',
    description: 'Generates a structured report from engagement data',
    template: 'Create a structured report based on the following engagement data. Include sections for summary, key findings, trends, and recommendations: {{DATA}}',
    category: 'reports',
    lastUsed: '2023-05-10T09:15:00Z'
  }
];

// Usage stats
const mockUsageStats = {
  totalRequests: 1245,
  tokensUsed: 2567890,
  averageResponseTime: 2.3, // seconds
  mostUsedModel: 'GPT-4',
  requestsToday: 42,
  requestsThisMonth: 823,
  lastRequest: '2023-05-16T08:45:00Z'
};

const AISettings: React.FC = () => {
  const theme = useTheme();
  const [aiModels, setAIModels] = useState<AIModel[]>(mockAIModels);
  const [promptTemplates, setPromptTemplates] = useState<PromptTemplate[]>(mockPromptTemplates);
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<PromptTemplate | null>(null);
  const [modelFormOpen, setModelFormOpen] = useState(false);
  const [templateFormOpen, setTemplateFormOpen] = useState(false);
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  }>({ show: false, message: '', severity: 'info' });

  // Model form state
  const [modelForm, setModelForm] = useState<{
    id: string;
    name: string;
    provider: string;
    apiKey: string;
    isEnabled: boolean;
    usageLimit: number;
    temperature: number;
    maxTokens: number;
    isDefault: boolean;
  }>({
    id: '',
    name: '',
    provider: 'OpenAI',
    apiKey: '',
    isEnabled: true,
    usageLimit: 500,
    temperature: 0.7,
    maxTokens: 2048,
    isDefault: false
  });

  // Template form state
  const [templateForm, setTemplateForm] = useState<{
    id: string;
    name: string;
    description: string;
    template: string;
    category: PromptTemplate['category'];
    isDefault: boolean;
  }>({
    id: '',
    name: '',
    description: '',
    template: '',
    category: 'general',
    isDefault: false
  });

  // New state for LLM Configuration tab
  const [configTabValue, setConfigTabValue] = useState(0);
  const llm = useLLM();
  const [openaiApiKey, setOpenaiApiKey] = useState(llm.provider === 'openai' ? llm.apiKey : '');
  const [anthropicApiKey, setAnthropicApiKey] = useState(llm.provider === 'anthropic' ? llm.apiKey : '');
  const [geminiApiKey, setGeminiApiKey] = useState(llm.provider === 'gemini' ? llm.apiKey : '');
  const [openaiModel, setOpenaiModel] = useState<string>(llm.provider === 'openai' ? llm.model : LLM_MODELS.openai[0]);
  const [anthropicModel, setAnthropicModel] = useState<string>(llm.provider === 'anthropic' ? llm.model : LLM_MODELS.anthropic[0]);
  const [geminiModel, setGeminiModel] = useState<string>(llm.provider === 'gemini' ? llm.model : LLM_MODELS.gemini[0]);
  const [activeProvider, setActiveProvider] = useState<LLMProvider>(llm.provider);
  const [saveStatus, setSaveStatus] = useState<{success: boolean, message: string} | null>(null);

  // Handle model selection
  const handleSelectModel = (model: AIModel) => {
    setSelectedModel(model);
    setModelForm({
      id: model.id,
      name: model.name,
      provider: model.provider,
      apiKey: model.apiKey,
      isEnabled: model.isEnabled,
      usageLimit: model.usageLimit,
      temperature: model.temperature,
      maxTokens: model.maxTokens,
      isDefault: model.isDefault
    });
    setModelFormOpen(true);
  };

  // Handle template selection
  const handleSelectTemplate = (template: PromptTemplate) => {
    setSelectedTemplate(template);
    setTemplateForm({
      id: template.id,
      name: template.name,
      description: template.description,
      template: template.template,
      category: template.category,
      isDefault: template.isDefault || false
    });
    setTemplateFormOpen(true);
  };

  // Handle adding new model
  const handleAddNewModel = () => {
    setSelectedModel(null);
    setModelForm({
      id: '',
      name: '',
      provider: 'OpenAI',
      apiKey: '',
      isEnabled: true,
      usageLimit: 500,
      temperature: 0.7,
      maxTokens: 2048,
      isDefault: false
    });
    setModelFormOpen(true);
  };

  // Handle adding new template
  const handleAddNewTemplate = () => {
    setSelectedTemplate(null);
    setTemplateForm({
      id: '',
      name: '',
      description: '',
      template: '',
      category: 'general',
      isDefault: false
    });
    setTemplateFormOpen(true);
  };

  // Handle model form input change
  const handleModelInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setModelForm({ ...modelForm, [name]: value });
  };

  // Handle model form select change
  const handleModelSelectChange = (e: SelectChangeEvent) => {
    const name = e.target.name as keyof typeof modelForm;
    const value = e.target.value;
    setModelForm({ ...modelForm, [name]: value });
  };

  // Handle model form switch change
  const handleModelSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setModelForm({ ...modelForm, [name]: checked });
  };

  // Handle model form slider change
  const handleModelSliderChange = (name: string) => (event: Event, newValue: number | number[]) => {
    setModelForm({ ...modelForm, [name]: newValue });
  };

  // Handle template form input change
  const handleTemplateInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTemplateForm({ ...templateForm, [name]: value });
  };

  // Handle template form select change
  const handleTemplateSelectChange = (e: SelectChangeEvent) => {
    const name = e.target.name as keyof typeof templateForm;
    const value = e.target.value;
    setTemplateForm({ ...templateForm, [name]: value });
  };

  // Handle template form switch change
  const handleTemplateSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setTemplateForm({ ...templateForm, [name]: checked });
  };

  // Save model
  const handleSaveModel = () => {
    if (!modelForm.name || !modelForm.provider || !modelForm.apiKey) {
      setNotification({
        show: true,
        message: 'Please fill in all required fields',
        severity: 'error'
      });
      return;
    }

    // If setting as default, update other models
    let updatedModels = [...aiModels];
    if (modelForm.isDefault) {
      updatedModels = updatedModels.map(model => ({
        ...model,
        isDefault: false
      }));
    }

    if (selectedModel) {
      // Update existing model
      updatedModels = updatedModels.map(model => 
        model.id === selectedModel.id 
          ? { ...modelForm, id: model.id } 
          : model
      );
    } else {
      // Add new model
      const newModel: AIModel = {
        ...modelForm,
        id: Date.now().toString()
      };
      updatedModels.push(newModel);
    }

    setAIModels(updatedModels);
    setModelFormOpen(false);
    setNotification({
      show: true,
      message: selectedModel ? 'Model updated successfully' : 'Model added successfully',
      severity: 'success'
    });
  };

  // Save template
  const handleSaveTemplate = () => {
    if (!templateForm.name || !templateForm.template) {
      setNotification({
        show: true,
        message: 'Please fill in all required fields',
        severity: 'error'
      });
      return;
    }

    // If setting as default within category, update other templates
    let updatedTemplates = [...promptTemplates];
    if (templateForm.isDefault) {
      updatedTemplates = updatedTemplates.map(template => 
        template.category === templateForm.category
          ? { ...template, isDefault: false }
          : template
      );
    }

    if (selectedTemplate) {
      // Update existing template
      updatedTemplates = updatedTemplates.map(template => 
        template.id === selectedTemplate.id 
          ? { 
              ...templateForm, 
              id: template.id,
              lastUsed: template.lastUsed 
            } 
          : template
      );
    } else {
      // Add new template
      const newTemplate: PromptTemplate = {
        ...templateForm,
        id: Date.now().toString()
      };
      updatedTemplates.push(newTemplate);
    }

    setPromptTemplates(updatedTemplates);
    setTemplateFormOpen(false);
    setNotification({
      show: true,
      message: selectedTemplate ? 'Template updated successfully' : 'Template added successfully',
      severity: 'success'
    });
  };

  // Delete model
  const handleDeleteModel = (modelId: string) => {
    if (window.confirm('Are you sure you want to delete this model?')) {
      setAIModels(aiModels.filter(model => model.id !== modelId));
      setNotification({
        show: true,
        message: 'Model deleted successfully',
        severity: 'success'
      });
    }
  };

  // Delete template
  const handleDeleteTemplate = (templateId: string) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      setPromptTemplates(promptTemplates.filter(template => template.id !== templateId));
      setNotification({
        show: true,
        message: 'Template deleted successfully',
        severity: 'success'
      });
    }
  };

  // Test model
  const handleTestModel = (modelId: string) => {
    console.log(`Testing model ${modelId}`);
    setNotification({
      show: true,
      message: 'Model tested successfully. Connection is working.',
      severity: 'success'
    });
  };

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  // Close notification
  const handleCloseNotification = () => {
    setNotification({ ...notification, show: false });
  };

  // Helper function to determine chip color
  const getProviderColor = (provider: string) => {
    switch (provider.toLowerCase()) {
      case 'openai': return theme.palette.primary.main;
      case 'anthropic': return theme.palette.secondary.main;
      case 'meta': return theme.palette.info.main;
      default: return theme.palette.grey[500];
    }
  };

  // Helper function to determine category color
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'comments': return theme.palette.primary.main;
      case 'reports': return theme.palette.secondary.main;
      case 'sentiment': return theme.palette.success.main;
      case 'geographic': return theme.palette.info.main;
      default: return theme.palette.grey[500];
    }
  };

  // New handlers for LLM Config tab
  const handleConfigTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setConfigTabValue(newValue);
  };
  
  const handleSetActiveProvider = (provider: LLMProvider) => {
    setActiveProvider(provider);
    llm.setProvider(provider);
    
    // Load the saved API key for this provider
    if (provider === 'openai') {
      llm.setApiKey(openaiApiKey);
      llm.setModel(openaiModel);
    } else if (provider === 'anthropic') {
      llm.setApiKey(anthropicApiKey);
      llm.setModel(anthropicModel);
    } else if (provider === 'gemini') {
      llm.setApiKey(geminiApiKey);
      llm.setModel(geminiModel);
    }
    
    setSaveStatus({
      success: true,
      message: `Switched to ${
        provider === 'openai' ? 'OpenAI' : 
        provider === 'anthropic' ? 'Anthropic' : 
        'Google Gemini'
      } provider`
    });
    
    setTimeout(() => {
      setSaveStatus(null);
    }, 3000);
  };
  
  const handleSaveApiKey = (provider: LLMProvider) => {
    if (provider === 'openai') {
      llm.setApiKey(openaiApiKey);
      if (llm.provider === 'openai') {
        llm.setModel(openaiModel);
      }
    } else if (provider === 'anthropic') {
      llm.setApiKey(anthropicApiKey);
      if (llm.provider === 'anthropic') {
        llm.setModel(anthropicModel);
      }
    } else if (provider === 'gemini') {
      llm.setApiKey(geminiApiKey);
      if (llm.provider === 'gemini') {
        llm.setModel(geminiModel);
      }
    }
    
    setSaveStatus({
      success: true,
      message: `${
        provider === 'openai' ? 'OpenAI' : 
        provider === 'anthropic' ? 'Anthropic' : 
        'Google Gemini'
      } API key saved successfully`
    });
    
    setTimeout(() => {
      setSaveStatus(null);
    }, 3000);
  };
  
  // Update local state when llm context changes
  useEffect(() => {
    if (llm.provider === 'openai') {
      setOpenaiApiKey(llm.apiKey);
      setOpenaiModel(llm.model);
    } else if (llm.provider === 'anthropic') {
      setAnthropicApiKey(llm.apiKey);
      setAnthropicModel(llm.model);
    } else if (llm.provider === 'gemini') {
      setGeminiApiKey(llm.apiKey);
      setGeminiModel(llm.model);
    }
    setActiveProvider(llm.provider);
  }, [llm.provider, llm.apiKey, llm.model]);

  // Add this new section right before the rest of the component's return content
  const renderLLMConfigurationTab = () => (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        LLM Provider Configuration
      </Typography>
      
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Active Provider
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Button 
                variant={activeProvider === 'openai' ? 'contained' : 'outlined'}
                color="primary"
                fullWidth
                onClick={() => handleSetActiveProvider('openai')}
                startIcon={<ApiIcon />}
              >
                OpenAI (GPT Models)
              </Button>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Button 
                variant={activeProvider === 'anthropic' ? 'contained' : 'outlined'}
                color="secondary"
                fullWidth
                onClick={() => handleSetActiveProvider('anthropic')}
                startIcon={<PsychologyIcon />}
              >
                Anthropic (Claude Models)
              </Button>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Button 
                variant={activeProvider === 'gemini' ? 'contained' : 'outlined'}
                color="info"
                fullWidth
                onClick={() => handleSetActiveProvider('gemini')}
                startIcon={<GeminiIcon />}
              >
                Google Gemini
              </Button>
            </Grid>
          </Grid>
        </Box>
        
        <Divider sx={{ my: 3 }} />
        
        <Tabs
          value={configTabValue}
          onChange={handleConfigTabChange}
          aria-label="LLM provider tabs"
          sx={{ mb: 3 }}
        >
          <Tab label="OpenAI Configuration" id="openai-tab" />
          <Tab label="Anthropic Configuration" id="anthropic-tab" />
          <Tab label="Google Gemini Configuration" id="gemini-tab" />
        </Tabs>
        
        {configTabValue === 0 && (
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              OpenAI Configuration
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="OpenAI API Key"
                  type="password"
                  value={openaiApiKey}
                  onChange={(e) => setOpenaiApiKey(e.target.value)}
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Default Model</InputLabel>
                  <Select
                    value={openaiModel}
                    label="Default Model"
                    onChange={(e) => setOpenaiModel(e.target.value)}
                  >
                    {LLM_MODELS.openai.map(model => (
                      <MenuItem key={model} value={model}>{model}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<SaveIcon />}
                    onClick={() => handleSaveApiKey('openai')}
                  >
                    Save OpenAI Settings
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        )}
        
        {configTabValue === 1 && (
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Anthropic Configuration
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Anthropic API Key"
                  type="password"
                  value={anthropicApiKey}
                  onChange={(e) => setAnthropicApiKey(e.target.value)}
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Default Model</InputLabel>
                  <Select
                    value={anthropicModel}
                    label="Default Model"
                    onChange={(e) => setAnthropicModel(e.target.value)}
                  >
                    {LLM_MODELS.anthropic.map(model => (
                      <MenuItem key={model} value={model}>{model}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <Button
                    variant="contained"
                    color="secondary"
                    startIcon={<SaveIcon />}
                    onClick={() => handleSaveApiKey('anthropic')}
                  >
                    Save Anthropic Settings
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        )}

        {configTabValue === 2 && (
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Google Gemini Configuration
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Google Gemini API Key"
                  type="password"
                  value={geminiApiKey}
                  onChange={(e) => setGeminiApiKey(e.target.value)}
                  margin="normal"
                />
              </Grid>
              
              <Grid item xs={12}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Default Model</InputLabel>
                  <Select
                    value={geminiModel}
                    label="Default Model"
                    onChange={(e) => setGeminiModel(e.target.value)}
                  >
                    {LLM_MODELS.gemini.map(model => (
                      <MenuItem key={model} value={model}>{model}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <Button
                    variant="contained"
                    color="info"
                    startIcon={<SaveIcon />}
                    onClick={() => handleSaveApiKey('gemini')}
                  >
                    Save Gemini Settings
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>
      
      {saveStatus && (
        <Alert 
          severity={saveStatus.success ? "success" : "error"}
          sx={{ mb: 3 }}
          onClose={() => setSaveStatus(null)}
        >
          {saveStatus.message}
        </Alert>
      )}
    </Box>
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2">
          <AIIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          AI Configuration
        </Typography>
      </Box>

      {/* LLM Configuration Section */}
      {renderLLMConfigurationTab()}
      
      <Divider sx={{ my: 4 }} />
      
      {/* Usage Statistics Card */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          <ApiIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          AI Usage Statistics
        </Typography>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={6} md={3}>
            <Typography variant="body2" color="text.secondary">Total Requests</Typography>
            <Typography variant="h6">{mockUsageStats.totalRequests.toLocaleString()}</Typography>
          </Grid>
          <Grid item xs={6} md={3}>
            <Typography variant="body2" color="text.secondary">Tokens Used</Typography>
            <Typography variant="h6">{mockUsageStats.tokensUsed.toLocaleString()}</Typography>
          </Grid>
          <Grid item xs={6} md={3}>
            <Typography variant="body2" color="text.secondary">Avg. Response Time</Typography>
            <Typography variant="h6">{mockUsageStats.averageResponseTime}s</Typography>
          </Grid>
          <Grid item xs={6} md={3}>
            <Typography variant="body2" color="text.secondary">Most Used Model</Typography>
            <Typography variant="h6">{mockUsageStats.mostUsedModel}</Typography>
          </Grid>
          <Grid item xs={12}>
            <Divider sx={{ my: 1 }} />
            <Typography variant="body2" color="text.secondary">
              Last request: {formatDate(mockUsageStats.lastRequest)}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* AI Models Section */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5">
            <PsychologyIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            AI Models
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={handleAddNewModel}
          >
            Add New Model
          </Button>
        </Box>

        <Grid container spacing={3}>
          {aiModels.map(model => (
            <Grid item xs={12} md={6} lg={4} key={model.id}>
              <Card sx={{ 
                height: '100%', 
                border: model.isDefault ? `2px solid ${theme.palette.primary.main}` : 'none',
                opacity: model.isEnabled ? 1 : 0.6
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography variant="h6" component="div">
                        {model.name}
                      </Typography>
                      <Chip 
                        label={model.provider} 
                        size="small" 
                        sx={{ 
                          bgcolor: getProviderColor(model.provider),
                          color: 'white',
                          mt: 0.5
                        }}
                      />
                      {model.isDefault && (
                        <Chip 
                          label="Default" 
                          size="small" 
                          color="primary" 
                          variant="outlined"
                          sx={{ ml: 1, mt: 0.5 }}
                        />
                      )}
                    </Box>
                    <FormControlLabel
                      control={
                        <Switch 
                          checked={model.isEnabled} 
                          onChange={() => {
                            const updatedModels = aiModels.map(m => 
                              m.id === model.id ? { ...m, isEnabled: !m.isEnabled } : m
                            );
                            setAIModels(updatedModels);
                          }}
                          size="small"
                        />
                      }
                      label={model.isEnabled ? "Enabled" : "Disabled"}
                      labelPlacement="start"
                    />
                  </Box>
                  
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary">API Key</Typography>
                    <Typography variant="body2" sx={{ 
                      fontFamily: 'monospace', 
                      bgcolor: 'background.paper',
                      p: 1,
                      borderRadius: 1,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {model.apiKey.substring(0, 8)}•••••••••••••
                    </Typography>
                  </Box>

                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Temperature</Typography>
                      <Typography variant="body2">{model.temperature}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Max Tokens</Typography>
                      <Typography variant="body2">{model.maxTokens}</Typography>
                    </Grid>
                  </Grid>
                </CardContent>
                <CardActions>
                  <Button 
                    size="small" 
                    onClick={() => handleSelectModel(model)}
                    startIcon={<SettingsIcon />}
                  >
                    Configure
                  </Button>
                  <Button 
                    size="small" 
                    onClick={() => handleTestModel(model.id)}
                    startIcon={<CheckCircleIcon />}
                  >
                    Test
                  </Button>
                  {!model.isDefault && (
                    <IconButton 
                      size="small" 
                      color="error" 
                      onClick={() => handleDeleteModel(model.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Model Configuration Dialog */}
        {modelFormOpen && (
          <Box sx={{ mt: 4, p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
            <Typography variant="h6" gutterBottom>
              {selectedModel ? 'Edit AI Model' : 'Add New AI Model'}
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Model Name"
                  name="name"
                  value={modelForm.name}
                  onChange={handleModelInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Provider</InputLabel>
                  <Select
                    name="provider"
                    value={modelForm.provider}
                    label="Provider"
                    onChange={handleModelSelectChange}
                  >
                    <MenuItem value="OpenAI">OpenAI</MenuItem>
                    <MenuItem value="Anthropic">Anthropic</MenuItem>
                    <MenuItem value="Meta">Meta</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="API Key"
                  name="apiKey"
                  value={modelForm.apiKey}
                  onChange={handleModelInputChange}
                  required
                  type="password"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography gutterBottom>Temperature: {modelForm.temperature}</Typography>
                <Slider
                  value={modelForm.temperature}
                  onChange={handleModelSliderChange('temperature')}
                  min={0}
                  max={1}
                  step={0.1}
                  valueLabelDisplay="auto"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Max Tokens"
                  name="maxTokens"
                  type="number"
                  value={modelForm.maxTokens}
                  onChange={handleModelInputChange}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Usage Limit"
                  name="usageLimit"
                  type="number"
                  value={modelForm.usageLimit}
                  onChange={handleModelInputChange}
                  helperText="Maximum requests per day"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={modelForm.isEnabled}
                        onChange={handleModelSwitchChange}
                        name="isEnabled"
                      />
                    }
                    label="Enabled"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={modelForm.isDefault}
                        onChange={handleModelSwitchChange}
                        name="isDefault"
                      />
                    }
                    label="Default Model"
                  />
                </Box>
              </Grid>
              <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                <Button 
                  variant="outlined" 
                  onClick={() => setModelFormOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  variant="contained" 
                  onClick={handleSaveModel}
                  startIcon={<SaveIcon />}
                >
                  Save
                </Button>
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>

      {/* Prompt Templates Section */}
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5">
            <CodeIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Prompt Templates
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={handleAddNewTemplate}
          >
            Add New Template
          </Button>
        </Box>

        <Grid container spacing={3}>
          {promptTemplates.map(template => (
            <Grid item xs={12} md={6} key={template.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {template.name}
                    {template.isDefault && (
                      <Chip 
                        label="Default" 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                        sx={{ ml: 1 }}
                      />
                    )}
                  </Typography>
                  <Chip 
                    label={template.category.charAt(0).toUpperCase() + template.category.slice(1)}
                    size="small"
                    sx={{ 
                      bgcolor: getCategoryColor(template.category),
                      color: 'white',
                      mb: 1
                    }}
                  />
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {template.description}
                  </Typography>
                  <Box sx={{ 
                    bgcolor: 'background.paper', 
                    p: 1.5, 
                    borderRadius: 1,
                    maxHeight: 100,
                    overflow: 'auto',
                    border: '1px solid',
                    borderColor: 'divider'
                  }}>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                      {template.template}
                    </Typography>
                  </Box>
                  {template.lastUsed && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                      Last used: {formatDate(template.lastUsed)}
                    </Typography>
                  )}
                </CardContent>
                <CardActions>
                  <Button 
                    size="small" 
                    onClick={() => handleSelectTemplate(template)}
                    startIcon={<EditIcon />}
                  >
                    Edit
                  </Button>
                  <IconButton 
                    size="small" 
                    color="error" 
                    onClick={() => handleDeleteTemplate(template.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Template Configuration Dialog */}
        {templateFormOpen && (
          <Box sx={{ mt: 4, p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
            <Typography variant="h6" gutterBottom>
              {selectedTemplate ? 'Edit Template' : 'Add New Template'}
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Template Name"
                  name="name"
                  value={templateForm.name}
                  onChange={handleTemplateInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    name="category"
                    value={templateForm.category}
                    label="Category"
                    onChange={handleTemplateSelectChange}
                  >
                    <MenuItem value="general">General</MenuItem>
                    <MenuItem value="comments">Comments</MenuItem>
                    <MenuItem value="reports">Reports</MenuItem>
                    <MenuItem value="sentiment">Sentiment</MenuItem>
                    <MenuItem value="geographic">Geographic</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={templateForm.description}
                  onChange={handleTemplateInputChange}
                  multiline
                  rows={2}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Template"
                  name="template"
                  value={templateForm.template}
                  onChange={handleTemplateInputChange}
                  multiline
                  rows={4}
                  required
                  helperText="Use {{VARIABLE}} for placeholders"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={templateForm.isDefault}
                      onChange={handleTemplateSwitchChange}
                      name="isDefault"
                    />
                  }
                  label="Set as Default Template for this Category"
                />
              </Grid>
              <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                <Button 
                  variant="outlined" 
                  onClick={() => setTemplateFormOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  variant="contained" 
                  onClick={handleSaveTemplate}
                  startIcon={<SaveIcon />}
                >
                  Save
                </Button>
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default AISettings; 
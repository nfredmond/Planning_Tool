// client/src/components/admin/ai/AISettings.tsx
import React, { useState, useEffect } from 'react';
import {
  Typography,
  Paper,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Chip,
  Divider,
  Tooltip,
  Switch,
  FormControlLabel,
  Collapse,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
  Settings as SettingsIcon,
  SmartToy as AIIcon,
  Refresh as RefreshIcon,
  Key as KeyIcon,
  Api as ApiIcon,
  Build as BuildIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon
} from '@mui/icons-material';
import { 
  getAllAIProviders, 
  getAIProviderById, 
  createAIProvider, 
  updateAIProvider, 
  deleteAIProvider,
  testAIProvider,
  setDefaultProvider,
  updateFrontendVisibility
} from '../../../services/aiService';

interface AIProvider {
  _id: string;
  name: string;
  provider: 'openai' | 'anthropic' | 'huggingface' | 'custom';
  apiKey?: string;
  model: string;
  baseUrl?: string;
  settings: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  isVisibleToFrontend: boolean;
  isDefault: boolean;
}

const AISettings: React.FC = () => {
  const [providers, setProviders] = useState<AIProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [testResultOpen, setTestResultOpen] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [testLoading, setTestLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [providerToDelete, setProviderToDelete] = useState<AIProvider | null>(null);
  const [formData, setFormData] = useState<Partial<AIProvider>>({
    name: '',
    provider: 'openai',
    apiKey: '',
    model: '',
    baseUrl: '',
    settings: {},
    isVisibleToFrontend: false,
    isDefault: false
  });
  const [isEditing, setIsEditing] = useState(false);
  const [hideApiKeys, setHideApiKeys] = useState(true);
  const [availableModels, setAvailableModels] = useState<Record<string, string[]>>({
    openai: ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo', 'gpt-4o'],
    anthropic: ['claude-2', 'claude-instant-1', 'claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'],
    huggingface: ['mistral/mistral-7b', 'meta-llama/llama-2-7b', 'google/gemma-7b'],
    custom: []
  });

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const fetchedProviders = await getAllAIProviders();
      setProviders(fetchedProviders);
    } catch (error) {
      console.error('Error fetching AI providers:', error);
      setError('Failed to load AI providers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClick = () => {
    setFormData({
      name: '',
      provider: 'openai',
      apiKey: '',
      model: '',
      baseUrl: '',
      settings: {},
      isVisibleToFrontend: false,
      isDefault: false
    });
    setIsEditing(false);
    setFormOpen(true);
  };

  const handleEditClick = async (providerId: string) => {
    try {
      const provider = await getAIProviderById(providerId);
      setFormData({
        ...provider,
        apiKey: provider.apiKey // This will be masked in the backend response
      });
      setIsEditing(true);
      setFormOpen(true);
    } catch (error) {
      console.error('Error fetching provider details:', error);
      setError('Failed to load provider details. Please try again.');
    }
  };

  const handleDeleteClick = (provider: AIProvider) => {
    setProviderToDelete(provider);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!providerToDelete) return;
    
    try {
      await deleteAIProvider(providerToDelete._id);
      setProviders(providers.filter(p => p._id !== providerToDelete._id));
      setDeleteDialogOpen(false);
      setProviderToDelete(null);
      setSuccess('AI provider deleted successfully.');
    } catch (error) {
      console.error('Error deleting AI provider:', error);
      setError('Failed to delete AI provider. Please try again.');
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setProviderToDelete(null);
  };

  const handleFormClose = () => {
    setFormOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name!]: value
    });
  };

  const handleProviderChange = (e: React.ChangeEvent<{ name?: string; value: unknown }>) => {
    const provider = e.target.value as AIProvider['provider'];
    
    // Reset model when provider changes
    setFormData({
      ...formData,
      provider,
      model: availableModels[provider]?.[0] || '',
      baseUrl: provider === 'custom' ? 'https://' : '',
      settings: {}
    });
  };

  const handleSettingsChange = (key: string, value: any) => {
    setFormData({
      ...formData,
      settings: {
        ...formData.settings,
        [key]: value
      }
    });
  };

  const validateForm = (): boolean => {
    if (!formData.name || !formData.provider || !formData.model) {
      setError('Please fill in all required fields.');
      return false;
    }
    
    if (formData.provider !== 'custom' && !formData.apiKey) {
      setError('API key is required for this provider.');
      return false;
    }
    
    if (formData.provider === 'custom' && !formData.baseUrl) {
      setError('Base URL is required for custom providers.');
      return false;
    }
    
    return true;
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      if (isEditing && formData._id) {
        const updatedProvider = await updateAIProvider(formData._id, formData);
        setProviders(providers.map(p => p._id === updatedProvider._id ? updatedProvider : p));
        setSuccess('AI provider updated successfully.');
      } else {
        const newProvider = await createAIProvider(formData);
        setProviders([...providers, newProvider]);
        setSuccess('AI provider created successfully.');
      }
      
      setFormOpen(false);
    } catch (error) {
      console.error('Error saving AI provider:', error);
      setError('Failed to save AI provider. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTestProvider = async (providerId: string) => {
    setTestLoading(true);
    setError(null);
    
    try {
      const result = await testAIProvider(providerId);
      setTestResult(result);
      setTestResultOpen(true);
    } catch (error) {
      console.error('Error testing AI provider:', error);
      setError('Failed to test AI provider. Please check your settings and try again.');
    } finally {
      setTestLoading(false);
    }
  };

  const getProviderIcon = (provider: AIProvider['provider']) => {
    switch (provider) {
      case 'openai':
        return '🤖';
      case 'anthropic':
        return '🧠';
      case 'huggingface':
        return '🤗';
      case 'custom':
        return '⚙️';
      default:
        return <AIIcon />;
    }
  };

  const getProviderColor = (provider: AIProvider['provider']) => {
    switch (provider) {
      case 'openai':
        return '#10a37f';
      case 'anthropic':
        return '#b239ff';
      case 'huggingface':
        return '#ffbd59';
      case 'custom':
        return '#3f51b5';
      default:
        return '#757575';
    }
  };

  const handleToggleFrontendVisibility = async (provider: AIProvider) => {
    try {
      setLoading(true);
      const updatedVisibility = !provider.isVisibleToFrontend;
      await updateFrontendVisibility(provider._id, updatedVisibility);
      
      // Update local state
      setProviders(prevProviders => 
        prevProviders.map(p => 
          p._id === provider._id 
            ? { ...p, isVisibleToFrontend: updatedVisibility } 
            : p
        )
      );
      
      setSuccess(`Successfully ${updatedVisibility ? 'enabled' : 'disabled'} frontend visibility for ${provider.name}`);
    } catch (error) {
      console.error('Error updating frontend visibility:', error);
      setError('Failed to update frontend visibility');
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = async (provider: AIProvider) => {
    try {
      setLoading(true);
      await setDefaultProvider(provider._id);
      
      // Update local state
      setProviders(prevProviders => 
        prevProviders.map(p => 
          p._id === provider._id 
            ? { ...p, isDefault: true } 
            : { ...p, isDefault: false }
        )
      );
      
      setSuccess(`${provider.name} is now the default LLM`);
    } catch (error) {
      console.error('Error setting default provider:', error);
      setError('Failed to set default provider');
    } finally {
      setLoading(false);
    }
  };

  const renderProviderCard = (provider: AIProvider) => (
    <Card key={provider._id} sx={{ mb: 2, position: 'relative' }}>
      {provider.isDefault && (
        <Chip 
          icon={<StarIcon />} 
          label="Default" 
          color="primary" 
          size="small" 
          sx={{ position: 'absolute', top: 8, right: 8 }}
        />
      )}
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="h6" component="div" display="flex" alignItems="center">
              {getProviderIcon(provider.provider)}
              <Box sx={{ ml: 1 }}>{provider.name}</Box>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Provider: {provider.provider}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Model: {provider.model}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              API Key: {hideApiKeys ? '••••••••••••••••' : provider.apiKey}
              <IconButton 
                size="small" 
                onClick={() => setHideApiKeys(!hideApiKeys)}
                sx={{ ml: 1 }}
              >
                {hideApiKeys ? <VisibilityIcon fontSize="small" /> : <VisibilityOffIcon fontSize="small" />}
              </IconButton>
            </Typography>
            {provider.baseUrl && (
              <Typography variant="body2" color="text.secondary">
                Base URL: {provider.baseUrl}
              </Typography>
            )}
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box display="flex" flexDirection="column" gap={1}>
              <Typography variant="subtitle2">Frontend Visibility:</Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={provider.isVisibleToFrontend}
                    onChange={() => handleToggleFrontendVisibility(provider)}
                    color="primary"
                  />
                }
                label={provider.isVisibleToFrontend ? "Visible to users" : "Hidden from users"}
              />
              
              {!provider.isDefault && (
                <Button
                  variant="outlined"
                  startIcon={<StarBorderIcon />}
                  onClick={() => handleSetDefault(provider)}
                  size="small"
                  sx={{ mt: 1 }}
                >
                  Set as Default
                </Button>
              )}
            </Box>
          </Grid>
        </Grid>
      </CardContent>
      <CardActions>
        <Button
          size="small"
          startIcon={<EditIcon />}
          onClick={() => handleEditClick(provider._id)}
        >
          Edit
        </Button>
        <Button
          size="small"
          startIcon={<DeleteIcon />}
          onClick={() => handleDeleteClick(provider)}
          color="error"
        >
          Delete
        </Button>
        <Button
          size="small"
          startIcon={testLoading ? <CircularProgress size={16} /> : <RefreshIcon />}
          onClick={() => handleTestProvider(provider._id)}
          disabled={testLoading}
        >
          Test Connection
        </Button>
      </CardActions>
    </Card>
  );

  const renderProviderForm = () => {
    const currentProvider = formData.provider || 'openai';
    const modelOptions = availableModels[currentProvider] || [];
    
    return (
      <Dialog open={formOpen} onClose={handleFormClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {isEditing ? 'Edit AI Provider' : 'Add New AI Provider'}
        </DialogTitle>
        <form onSubmit={handleFormSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Provider Name"
                  name="name"
                  value={formData.name || ''}
                  onChange={handleInputChange}
                  required
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel id="provider-label">Provider Type</InputLabel>
                  <Select
                    labelId="provider-label"
                    id="provider"
                    name="provider"
                    value={currentProvider}
                    onChange={handleProviderChange}
                    label="Provider Type"
                    required
                  >
                    <MenuItem value="openai">OpenAI</MenuItem>
                    <MenuItem value="anthropic">Anthropic</MenuItem>
                    <MenuItem value="huggingface">Hugging Face</MenuItem>
                    <MenuItem value="custom">Custom</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel id="model-label">Model</InputLabel>
                  <Select
                    labelId="model-label"
                    id="model"
                    name="model"
                    value={formData.model || ''}
                    onChange={handleInputChange}
                    label="Model"
                    required
                  >
                    {modelOptions.map(model => (
                      <MenuItem key={model} value={model}>
                        {model}
                      </MenuItem>
                    ))}
                    <MenuItem value="custom">
                      <em>Custom (Enter below)</em>
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              {formData.model === 'custom' && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Custom Model Name"
                    name="customModel"
                    value={formData.settings?.customModel || ''}
                    onChange={(e) => handleSettingsChange('customModel', e.target.value)}
                    required
                    margin="normal"
                  />
                </Grid>
              )}
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="API Key"
                  name="apiKey"
                  value={formData.apiKey || ''}
                  onChange={handleInputChange}
                  required
                  margin="normal"
                  type={hideApiKeys ? 'password' : 'text'}
                  InputProps={{
                    endAdornment: (
                      <IconButton 
                        onClick={() => setHideApiKeys(!hideApiKeys)}
                        edge="end"
                      >
                        {hideApiKeys ? <VisibilityIcon /> : <VisibilityOffIcon />}
                      </IconButton>
                    ),
                  }}
                />
              </Grid>
              
              {(currentProvider === 'custom' || formData.baseUrl) && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Base URL"
                    name="baseUrl"
                    value={formData.baseUrl || ''}
                    onChange={handleInputChange}
                    margin="normal"
                    required={currentProvider === 'custom'}
                    placeholder="https://api.example.com/v1"
                  />
                </Grid>
              )}
              
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isVisibleToFrontend || false}
                      onChange={(e) => setFormData({...formData, isVisibleToFrontend: e.target.checked})}
                      name="isVisibleToFrontend"
                      color="primary"
                    />
                  }
                  label="Make available to frontend users"
                />
              </Grid>
              
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isDefault || false}
                      onChange={(e) => setFormData({...formData, isDefault: e.target.checked})}
                      name="isDefault"
                      color="primary"
                    />
                  }
                  label="Set as default model"
                />
              </Grid>
              
              {/* Advanced settings section */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" gutterBottom>
                  Advanced Settings
                </Typography>
                
                <TextField
                  fullWidth
                  label="Temperature"
                  name="temperature"
                  type="number"
                  value={formData.settings?.temperature || 0.7}
                  onChange={(e) => handleSettingsChange('temperature', parseFloat(e.target.value))}
                  inputProps={{ min: 0, max: 2, step: 0.1 }}
                  margin="normal"
                  helperText="Controls randomness: 0 is deterministic, 2 is maximum creativity"
                />
                
                <TextField
                  fullWidth
                  label="Max Tokens"
                  name="maxTokens"
                  type="number"
                  value={formData.settings?.maxTokens || 1000}
                  onChange={(e) => handleSettingsChange('maxTokens', parseInt(e.target.value))}
                  inputProps={{ min: 1, step: 50 }}
                  margin="normal"
                  helperText="Maximum number of tokens to generate"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleFormClose}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              {isEditing ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    );
  };

  const renderTestResultDialog = () => {
    return (
      <Dialog open={testResultOpen} onClose={() => setTestResultOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Test Result</DialogTitle>
        <DialogContent>
          {testResult && (
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Response
              </Typography>
              <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: '#f5f5f5' }}>
                <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                  {JSON.stringify(testResult, null, 2)}
                </pre>
              </Paper>
              
              <Alert severity="info" sx={{ mb: 2 }}>
                The test sends a simple query to the AI provider to verify connectivity and basic functionality.
              </Alert>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTestResultOpen(false)} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  const renderFrontendSection = () => {
    const visibleProviders = providers.filter(p => p.isVisibleToFrontend);
    const defaultProvider = providers.find(p => p.isDefault);
    
    return (
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Frontend LLM Configuration
        </Typography>
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="body1">
            {visibleProviders.length === 0 && (
              <Alert severity="warning">
                No models are currently visible to frontend users. Enable visibility for at least one model.
              </Alert>
            )}
            
            {visibleProviders.length === 1 && (
              <Alert severity="info">
                Users will see that "{visibleProviders[0].name}" is being used without any dropdown selection.
              </Alert>
            )}
            
            {visibleProviders.length > 1 && (
              <Alert severity="info">
                Users will see a dropdown to select between {visibleProviders.length} available models.
              </Alert>
            )}
          </Typography>
        </Box>
        
        {visibleProviders.length > 0 && (
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Models available to users:
            </Typography>
            <List>
              {visibleProviders.map(provider => (
                <ListItem key={provider._id}>
                  <ListItemText 
                    primary={provider.name} 
                    secondary={`${provider.provider} - ${provider.model}`}
                  />
                  <ListItemSecondaryAction>
                    {provider.isDefault && (
                      <Tooltip title="Default model">
                        <IconButton edge="end" disabled>
                          <StarIcon color="primary" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Box>
        )}
        
        {defaultProvider && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1">
              Default model: <strong>{defaultProvider.name}</strong>
            </Typography>
          </Box>
        )}
      </Paper>
    );
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        <AIIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        AI Settings
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}
      
      {renderFrontendSection()}
      
      <Box sx={{ mb: 2 }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleCreateClick}
        >
          Add New LLM
        </Button>
      </Box>
      
      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : (
        <Box>
          {providers.length === 0 ? (
            <Alert severity="info">
              No AI providers configured. Add a new provider to get started.
            </Alert>
          ) : (
            providers.map(renderProviderCard)
          )}
        </Box>
      )}
      
      {/* Render dialogs */}
      {renderProviderForm()}
      {renderTestResultDialog()}
      
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the provider "{providerToDelete?.name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AISettings;

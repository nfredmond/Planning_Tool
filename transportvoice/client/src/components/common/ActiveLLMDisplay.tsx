import React, { useState, useEffect } from 'react';
import { Box, Typography, Select, MenuItem, FormControl, InputLabel, CircularProgress, Tooltip } from '@mui/material';
import { SmartToy as AIIcon } from '@mui/icons-material';
import { getActiveFrontendProvider, getFrontendVisibleProviders } from '../../services/aiService';

interface LLMProvider {
  id: string;
  name: string;
  provider: string;
  model: string;
  isDefault?: boolean;
}

const ActiveLLMDisplay: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeProvider, setActiveProvider] = useState<LLMProvider | null>(null);
  const [availableProviders, setAvailableProviders] = useState<LLMProvider[]>([]);
  const [selectedProviderId, setSelectedProviderId] = useState<string>('');

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get all visible providers
      const providers = await getFrontendVisibleProviders();
      setAvailableProviders(providers);

      // Get the active provider
      const active = await getActiveFrontendProvider();
      setActiveProvider(active);
      setSelectedProviderId(active.id);
    } catch (error) {
      console.error('Error fetching LLM providers:', error);
      setError('Failed to load LLM information');
    } finally {
      setLoading(false);
    }
  };

  const handleProviderChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const newProviderId = event.target.value as string;
    setSelectedProviderId(newProviderId);
    
    // Find the selected provider in the available providers
    const selectedProvider = availableProviders.find(p => p.id === newProviderId);
    if (selectedProvider) {
      setActiveProvider(selectedProvider);
    }
  };

  if (loading) {
    return (
      <Box display="flex" alignItems="center" gap={1}>
        <CircularProgress size={16} />
        <Typography variant="body2">Loading LLM...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" alignItems="center" gap={1}>
        <AIIcon fontSize="small" color="error" />
        <Typography variant="body2" color="error">LLM unavailable</Typography>
      </Box>
    );
  }

  // If no providers are available
  if (!activeProvider || availableProviders.length === 0) {
    return null;
  }

  // If only one provider is available, show it without dropdown
  if (availableProviders.length === 1) {
    return (
      <Box display="flex" alignItems="center" gap={1}>
        <Tooltip title="AI Model">
          <AIIcon fontSize="small" color="primary" />
        </Tooltip>
        <Typography variant="body2">
          Using {activeProvider.name}
        </Typography>
      </Box>
    );
  }

  // If multiple providers are available, show dropdown
  return (
    <Box display="flex" alignItems="center" gap={1}>
      <Tooltip title="AI Model">
        <AIIcon fontSize="small" color="primary" />
      </Tooltip>
      <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
        <InputLabel id="llm-provider-label">LLM</InputLabel>
        <Select
          labelId="llm-provider-label"
          id="llm-provider-select"
          value={selectedProviderId}
          onChange={handleProviderChange}
          label="LLM"
        >
          {availableProviders.map((provider) => (
            <MenuItem key={provider.id} value={provider.id}>
              {provider.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default ActiveLLMDisplay; 
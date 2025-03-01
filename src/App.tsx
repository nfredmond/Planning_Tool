import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { CustomThemeProvider } from './theme/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { LLMProvider } from './context/LLMContext';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import MapPage from './pages/MapPage';
import ProjectsPage from './pages/ProjectsPage';
import CommunityForumsPage from './pages/CommunityForumsPage';
import EventsCalendarPage from './pages/EventsCalendarPage';
import MapLayersPage from './pages/MapLayersPage';
import AboutPage from './pages/AboutPage';
import HelpCenterPage from './pages/HelpCenterPage';
import { CssBaseline } from '@mui/material';
import Layout from './components/layout/Layout';

// Error Boundary Component to catch rendering errors
class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean, error: Error | null, errorInfo: ErrorInfo | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    console.error("Rendering error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Paper sx={{ p: 3, m: 2, maxWidth: '800px', mx: 'auto' }}>
          <Typography variant="h4" color="error" gutterBottom>
            Something went wrong
          </Typography>
          <Typography variant="body1" paragraph>
            {this.state.error?.toString()}
          </Typography>
          <Typography variant="h6">Component Stack:</Typography>
          <Box component="pre" sx={{ 
            p: 2, 
            bgcolor: '#f5f5f5', 
            borderRadius: 1,
            overflow: 'auto',
            maxHeight: '300px',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word'
          }}>
            {this.state.errorInfo?.componentStack}
          </Box>
          <Button 
            variant="contained" 
            color="primary" 
            sx={{ mt: 2 }} 
            onClick={() => window.location.reload()}
          >
            Reload Page
          </Button>
        </Paper>
      );
    }
    return this.props.children;
  }
}

function App() {
  // Get API keys from environment variables
  const openaiApiKey = process.env.REACT_APP_OPENAI_API_KEY || '';
  const anthropicApiKey = process.env.REACT_APP_ANTHROPIC_API_KEY || '';

  return (
    <ErrorBoundary>
      <CustomThemeProvider>
        <AuthProvider>
          <LLMProvider 
            initialProvider="openai"
            initialApiKey={openaiApiKey}
            initialModel="gpt-4"
          >
            <CssBaseline />
            <Router>
              <Layout>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/map" element={<MapPage />} />
                  <Route path="/projects" element={<ProjectsPage />} />
                  <Route path="/community-forums" element={<CommunityForumsPage />} />
                  <Route path="/events" element={<EventsCalendarPage />} />
                  <Route path="/map-layers" element={<MapLayersPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/help-center" element={<HelpCenterPage />} />
                </Routes>
              </Layout>
            </Router>
          </LLMProvider>
        </AuthProvider>
      </CustomThemeProvider>
    </ErrorBoundary>
  );
}

export default App; 
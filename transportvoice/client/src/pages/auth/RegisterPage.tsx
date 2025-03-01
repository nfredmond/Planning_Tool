import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Avatar,
  Button,
  TextField,
  FormControlLabel,
  Checkbox,
  Link,
  Paper,
  Box,
  Grid,
  Typography,
  Container,
  Alert,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import { PersonAdd as PersonAddIcon } from '@mui/icons-material';

const steps = ['Account Details', 'Personal Information', 'Preferences'];

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    organization: '',
    role: '',
    interests: {
      publicTransit: false,
      cycling: false,
      pedestrian: false,
      roadways: false,
      urbanPlanning: false,
    },
    acceptTerms: false,
    receiveUpdates: false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked, type } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent as keyof typeof formData] as Record<string, boolean>,
          [child]: type === 'checkbox' ? checked : value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value,
      });
    }
  };

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const validateStep = () => {
    setError(null);
    
    if (activeStep === 0) {
      if (!formData.email || !formData.password || !formData.confirmPassword) {
        setError('Please fill in all required fields');
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return false;
      }
      if (formData.password.length < 8) {
        setError('Password must be at least 8 characters long');
        return false;
      }
    } else if (activeStep === 1) {
      if (!formData.firstName || !formData.lastName) {
        setError('Please fill in all required fields');
        return false;
      }
    } else if (activeStep === 2) {
      if (!formData.acceptTerms) {
        setError('You must accept the terms and conditions to continue');
        return false;
      }
    }
    
    return true;
  };

  const handleStepAction = () => {
    if (!validateStep()) return;
    
    if (activeStep === steps.length - 1) {
      handleSubmit();
    } else {
      handleNext();
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    
    try {
      // In a real implementation, this would call an API
      // For demo purposes, we'll simulate a successful registration
      console.log('Registering with:', formData);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate successful registration
      localStorage.setItem('isAuthenticated', 'true');
      navigate('/dashboard');
    } catch (err) {
      setError('Registration failed. Please try again.');
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleInputChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              value={formData.password}
              onChange={handleInputChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              id="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
            />
          </>
        );
      case 1:
        return (
          <>
            <TextField
              margin="normal"
              required
              fullWidth
              id="firstName"
              label="First Name"
              name="firstName"
              autoComplete="given-name"
              value={formData.firstName}
              onChange={handleInputChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="lastName"
              label="Last Name"
              name="lastName"
              autoComplete="family-name"
              value={formData.lastName}
              onChange={handleInputChange}
            />
            <TextField
              margin="normal"
              fullWidth
              id="organization"
              label="Organization"
              name="organization"
              autoComplete="organization"
              value={formData.organization}
              onChange={handleInputChange}
            />
            <TextField
              margin="normal"
              fullWidth
              id="role"
              label="Role or Position"
              name="role"
              value={formData.role}
              onChange={handleInputChange}
            />
          </>
        );
      case 2:
        return (
          <>
            <Typography variant="subtitle1" gutterBottom>
              Areas of Interest
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="interests.publicTransit"
                      checked={formData.interests.publicTransit}
                      onChange={handleInputChange}
                    />
                  }
                  label="Public Transit"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="interests.cycling"
                      checked={formData.interests.cycling}
                      onChange={handleInputChange}
                    />
                  }
                  label="Cycling Infrastructure"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="interests.pedestrian"
                      checked={formData.interests.pedestrian}
                      onChange={handleInputChange}
                    />
                  }
                  label="Pedestrian Safety"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="interests.roadways"
                      checked={formData.interests.roadways}
                      onChange={handleInputChange}
                    />
                  }
                  label="Roadways & Highways"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="interests.urbanPlanning"
                      checked={formData.interests.urbanPlanning}
                      onChange={handleInputChange}
                    />
                  }
                  label="Urban Planning"
                />
              </Grid>
            </Grid>
            
            <Box mt={3}>
              <FormControlLabel
                control={
                  <Checkbox
                    required
                    name="acceptTerms"
                    checked={formData.acceptTerms}
                    onChange={handleInputChange}
                  />
                }
                label={
                  <Typography variant="body2">
                    I accept the {' '}
                    <Link component={RouterLink} to="/terms">
                      Terms and Conditions
                    </Link>
                    *
                  </Typography>
                }
              />
              <FormControlLabel
                control={
                  <Checkbox
                    name="receiveUpdates"
                    checked={formData.receiveUpdates}
                    onChange={handleInputChange}
                  />
                }
                label="I would like to receive updates about new features and projects"
              />
            </Box>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Container component="main" maxWidth="lg">
      <Grid container sx={{ minHeight: '100vh' }}>
        <Grid
          item
          xs={false}
          sm={4}
          md={7}
          sx={{
            backgroundImage: 'url(/images/register-background.jpg)',
            backgroundRepeat: 'no-repeat',
            backgroundColor: (t) => t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900],
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
          <Box
            sx={{
              my: 8,
              mx: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
              <PersonAddIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
              Sign up
            </Typography>
            
            <Stepper activeStep={activeStep} sx={{ width: '100%', my: 3 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
            
            {error && (
              <Alert severity="error" sx={{ width: '100%', mt: 2 }}>
                {error}
              </Alert>
            )}
            
            <Box component="form" noValidate sx={{ mt: 3, width: '100%' }}>
              {renderStepContent()}
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                <Button
                  disabled={activeStep === 0}
                  onClick={handleBack}
                >
                  Back
                </Button>
                <Button
                  variant="contained"
                  onClick={handleStepAction}
                  disabled={loading}
                >
                  {activeStep === steps.length - 1
                    ? loading ? 'Creating Account...' : 'Create Account'
                    : 'Next'}
                </Button>
              </Box>
              
              <Grid container justifyContent="flex-end" sx={{ mt: 3 }}>
                <Grid item>
                  <Link component={RouterLink} to="/login" variant="body2">
                    Already have an account? Sign in
                  </Link>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default RegisterPage; 
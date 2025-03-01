import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Link,
  Paper,
  CircularProgress,
  Alert,
} from '@mui/material';
import { CheckCircle as SuccessIcon, Error as ErrorIcon } from '@mui/icons-material';
import { verifyEmail } from '../../services/authService';

const VerifyEmailPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError('Invalid verification link');
      setLoading(false);
      return;
    }
    
    const verifyToken = async () => {
      try {
        await verifyEmail(token);
        setSuccess('Your email has been verified successfully!');
        
        // Redirect to login page after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } catch (err: any) {
        setError(err.message || 'Failed to verify email. The link may be expired or invalid.');
      } finally {
        setLoading(false);
      }
    };
    
    verifyToken();
  }, [token, navigate]);

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Email Verification
          </Typography>
        </Box>
        
        {loading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
            <CircularProgress size={60} />
            <Typography variant="h6" sx={{ mt: 3 }}>
              Verifying your email...
            </Typography>
          </Box>
        ) : error ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
            <ErrorIcon color="error" sx={{ fontSize: 60 }} />
            <Typography variant="h6" color="error" sx={{ mt: 2 }}>
              Verification Failed
            </Typography>
            <Alert severity="error" sx={{ mt: 2, mb: 3, width: '100%' }}>
              {error}
            </Alert>
            <Button
              component={RouterLink}
              to="/login"
              variant="contained"
              color="primary"
            >
              Back to Login
            </Button>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
            <SuccessIcon color="success" sx={{ fontSize: 60 }} />
            <Typography variant="h6" color="success.main" sx={{ mt: 2 }}>
              Verification Successful
            </Typography>
            <Alert severity="success" sx={{ mt: 2, mb: 3, width: '100%' }}>
              {success}
            </Alert>
            <Typography variant="body1" sx={{ mb: 3 }}>
              You will be redirected to the login page shortly.
            </Typography>
            <Button
              component={RouterLink}
              to="/login"
              variant="contained"
              color="primary"
            >
              Go to Login
            </Button>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default VerifyEmailPage; 
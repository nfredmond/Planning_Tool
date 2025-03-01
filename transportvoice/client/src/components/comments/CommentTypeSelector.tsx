import React, { useState, useEffect } from 'react';
import { 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  CircularProgress, 
  Alert, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button,
  Box
} from '@mui/material';
import { ICommentType } from '../../types/CommentType';
import { useProject } from '../../hooks/useProject';
import { SvgIcon } from '../common/SvgIcon';
import axios from 'axios';

interface CommentTypeSelectorProps {
  onSelect: (commentType: ICommentType) => void;
  selectedCommentTypeId?: string;
}

export const CommentTypeSelector: React.FC<CommentTypeSelectorProps> = ({ 
  onSelect,
  selectedCommentTypeId
}) => {
  const { currentProject } = useProject();
  
  const [commentTypes, setCommentTypes] = useState<ICommentType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState<boolean>(false);
  const [selectedType, setSelectedType] = useState<ICommentType | null>(null);

  useEffect(() => {
    const fetchCommentTypes = async () => {
      if (!currentProject) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Get token from localStorage
        const token = localStorage.getItem('token');
        
        // Fetch comment types for the current project
        const response = await axios.get(`/api/commentTypes/project/${currentProject._id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined
        });
        setCommentTypes(response.data);
      } catch (err: any) {
        console.error('Error fetching comment types:', err);
        setError(err.response?.data?.message || 'Failed to load comment types');
      } finally {
        setLoading(false);
      }
    };

    fetchCommentTypes();
  }, [currentProject]);

  const handleCardClick = (commentType: ICommentType) => {
    onSelect(commentType);
  };

  const handleDetailsClick = (event: React.MouseEvent, commentType: ICommentType) => {
    event.stopPropagation();
    setSelectedType(commentType);
    setDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={2}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (commentTypes.length === 0) {
    return <Alert severity="info">No comment types available for this project.</Alert>;
  }

  return (
    <>
      <Grid container spacing={2}>
        {commentTypes.map((commentType) => (
          <Grid item xs={6} sm={4} md={3} key={commentType._id}>
            <Card 
              onClick={() => handleCardClick(commentType)}
              sx={{ 
                cursor: 'pointer',
                border: selectedCommentTypeId === commentType._id ? 2 : 0,
                borderColor: 'primary.main',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'scale(1.05)',
                }
              }}
            >
              <CardContent sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                flexGrow: 1
              }}>
                <Box mb={1} display="flex" justifyContent="center" alignItems="center" height={48}>
                  {commentType.icon ? (
                    <SvgIcon svgString={commentType.icon} size={40} color={commentType.color} />
                  ) : (
                    <Box 
                      width={40} 
                      height={40} 
                      bgcolor={commentType.color || 'grey.300'} 
                      borderRadius="50%" 
                    />
                  )}
                </Box>
                <Typography variant="subtitle1" align="center" gutterBottom>
                  {commentType.name}
                </Typography>
                <Box mt="auto">
                  <Button 
                    size="small" 
                    onClick={(e) => handleDetailsClick(e, commentType)}
                  >
                    Details
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onClose={handleCloseDetails} maxWidth="sm" fullWidth>
        {selectedType && (
          <>
            <DialogTitle>
              <Box display="flex" alignItems="center">
                {selectedType.icon && (
                  <Box mr={1}>
                    <SvgIcon svgString={selectedType.icon} size={24} color={selectedType.color} />
                  </Box>
                )}
                {selectedType.name}
              </Box>
            </DialogTitle>
            <DialogContent>
              <Typography variant="body1" paragraph>
                {selectedType.description || 'No description available.'}
              </Typography>
              {selectedType.iconGeneratedByAI && selectedType.iconPrompt && (
                <Box mt={2}>
                  <Typography variant="subtitle2">Icon generated from prompt:</Typography>
                  <Typography variant="body2" color="text.secondary">
                    "{selectedType.iconPrompt}"
                  </Typography>
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDetails}>Close</Button>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={() => {
                  onSelect(selectedType);
                  handleCloseDetails();
                }}
              >
                Select This Type
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </>
  );
}; 
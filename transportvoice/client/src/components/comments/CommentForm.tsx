// client/src/components/comments/CommentForm.tsx
import React, { useState } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../hooks/useAuth';
import { 
  TextField, 
  Button, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  Box,
  FormControlLabel,
  Switch
} from '@mui/material';
import { FaImage, FaTimes } from 'react-icons/fa';
import IconWrapper from '../common/IconWrapper';
import { Comment } from '../../types/Comment';
import { useCommentsHook } from '../../hooks/useCommentsHook';
import { SelectChangeEvent } from '@mui/material/Select';
import * as commentService from '../../services/commentService';

interface CommentFormProps {
  projectId: string;
  location?: {
    type: string;
    coordinates: [number, number];
  };
  parentCommentId?: string;
  onCancel?: () => void;
  onSubmit?: (comment: Comment) => void;
}

const CommentForm: React.FC<CommentFormProps> = ({
  projectId,
  location,
  parentCommentId,
  onCancel,
  onSubmit
}) => {
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [anonymousName, setAnonymousName] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const { user } = useAuth();
  const { createComment } = useCommentsHook({
    projectId,
    parentCommentId
  });
  
  const handleContentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setContent(e.target.value);
  };
  
  const handleCategoryChange = (event: SelectChangeEvent<string>) => {
    setCategory(event.target.value);
  };
  
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    
    const files = Array.from(e.target.files);
    
    // Create preview URLs
    const newPreviewUrls = files.map(file => URL.createObjectURL(file));
    setImagePreviewUrls([...imagePreviewUrls, ...newPreviewUrls]);
    
    try {
      // Upload images to server
      const uploadedImageUrls = await commentService.uploadCommentImages(files);
      setImages([...images, ...uploadedImageUrls]);
    } catch (err) {
      console.error('Error uploading images:', err);
      setError('Failed to upload images. Please try again.');
      
      // Remove previews if upload failed
      setImagePreviewUrls(imagePreviewUrls);
    }
  };
  
  const handleRemoveImage = (index: number) => {
    const newImages = [...images];
    const newPreviewUrls = [...imagePreviewUrls];
    
    newImages.splice(index, 1);
    newPreviewUrls.splice(index, 1);
    
    setImages(newImages);
    setImagePreviewUrls(newPreviewUrls);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setError('Please enter a comment');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const formData = {
        content,
        category: category || undefined,
        images: images.length > 0 ? images : undefined,
        location,
        isAnonymous,
        anonymousName: isAnonymous ? anonymousName : undefined
      };
      
      const newComment = await createComment(formData);
      
      // Clear form
      setContent('');
      setCategory('');
      setImages([]);
      setImagePreviewUrls([]);
      setIsAnonymous(false);
      setAnonymousName('');
      
      // Call onSubmit callback if provided
      if (onSubmit) {
        onSubmit(newComment);
      }
    } catch (err) {
      console.error('Error submitting comment:', err);
      setError('Failed to submit comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <FormContainer>
      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          multiline
          rows={4}
          variant="outlined"
          placeholder="Share your thoughts..."
          value={content}
          onChange={handleContentChange}
          disabled={isSubmitting}
          error={!!error}
          helperText={error}
          sx={{ mb: 2 }}
        />
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
          <FormControl variant="outlined" size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={category}
              onChange={handleCategoryChange}
              label="Category"
            >
              <MenuItem value="">None</MenuItem>
              <MenuItem value="question">Question</MenuItem>
              <MenuItem value="suggestion">Suggestion</MenuItem>
              <MenuItem value="concern">Concern</MenuItem>
              <MenuItem value="support">Support</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </Select>
          </FormControl>
          
          <FormControlLabel
            control={
              <Switch
                checked={isAnonymous}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIsAnonymous(e.target.checked)}
                color="primary"
              />
            }
            label="Post anonymously"
          />
        </Box>
        
        {isAnonymous && (
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            placeholder="Your name (optional)"
            value={anonymousName}
            onChange={(e) => setAnonymousName(e.target.value)}
            disabled={isSubmitting}
            sx={{ mb: 2 }}
          />
        )}
        
        {imagePreviewUrls.length > 0 && (
          <ImagePreviewContainer>
            {imagePreviewUrls.map((url, index) => (
              <ImagePreviewItem key={index}>
                <img src={url} alt={`Preview ${index + 1}`} />
                <RemoveButton onClick={() => handleRemoveImage(index)}>
                  <IconWrapper icon={FaTimes} />
                </RemoveButton>
              </ImagePreviewItem>
            ))}
          </ImagePreviewContainer>
        )}
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
          <Box>
            <input
              accept="image/*"
              id="image-upload"
              type="file"
              multiple
              onChange={handleImageUpload}
              style={{ display: 'none' }}
              disabled={isSubmitting}
            />
            <label htmlFor="image-upload">
              <Button
                component="span"
                variant="outlined"
                startIcon={<IconWrapper icon={FaImage} />}
                disabled={isSubmitting}
              >
                Add Images
              </Button>
            </label>
          </Box>
          
          <Box>
            {onCancel && (
              <Button
                variant="outlined"
                onClick={onCancel}
                disabled={isSubmitting}
                sx={{ mr: 1 }}
              >
                Cancel
              </Button>
            )}
            
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isSubmitting || !content.trim()}
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </Button>
          </Box>
        </Box>
      </form>
    </FormContainer>
  );
};

const FormContainer = styled.div`
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  padding: 16px;
  border-radius: 8px;
  background-color: #fff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const ImagePreviewContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
`;

const ImagePreviewItem = styled.div`
  position: relative;
  width: 100px;
  height: 100px;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 4px;
  }
`;

const RemoveButton = styled.button`
  position: absolute;
  top: -8px;
  right: -8px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.8);
  }
`;

export default CommentForm; 
import api from '../utils/api';
import { DesignAlternative, DesignComment } from '../types/Design';

// Get all design alternatives for a project
export const getDesignAlternatives = async (projectId: string, alternativeId?: string): Promise<DesignAlternative | DesignAlternative[]> => {
  try {
    if (alternativeId) {
      const response = await api.get(`/designs/${alternativeId}`);
      return response.data.designAlternative;
    } else {
      const response = await api.get(`/projects/${projectId}/designs`);
      return response.data.designAlternatives;
    }
  } catch (error) {
    throw error;
  }
};

// Save a design alternative
export const saveDesignAlternative = async (designData: Partial<DesignAlternative>): Promise<DesignAlternative> => {
  try {
    if (designData._id) {
      // Update existing design
      const response = await api.put(`/designs/${designData._id}`, designData);
      return response.data.designAlternative;
    } else {
      // Create new design
      const response = await api.post('/designs', designData);
      return response.data.designAlternative;
    }
  } catch (error) {
    throw error;
  }
};

// Delete a design alternative
export const deleteDesignAlternative = async (designId: string): Promise<void> => {
  try {
    await api.delete(`/designs/${designId}`);
  } catch (error) {
    throw error;
  }
};

// Get design templates
export const getDesignTemplates = async (): Promise<any[]> => {
  try {
    const response = await api.get('/designs/templates');
    return response.data.templates;
  } catch (error) {
    throw error;
  }
};

// Get comments for a design
export const getDesignComments = async (designId: string): Promise<DesignComment[]> => {
  try {
    const response = await api.get(`/designs/${designId}/comments`);
    return response.data.comments;
  } catch (error) {
    throw error;
  }
};

// Add a comment to a design
export const addDesignComment = async (commentData: Partial<DesignComment>): Promise<DesignComment> => {
  try {
    const response = await api.post(`/designs/${commentData.designId}/comments`, commentData);
    return response.data.comment;
  } catch (error) {
    throw error;
  }
};

// Update a design comment
export const updateDesignComment = async (commentId: string, updateData: Partial<DesignComment>): Promise<DesignComment> => {
  try {
    const response = await api.put(`/comments/${commentId}`, updateData);
    return response.data.comment;
  } catch (error) {
    throw error;
  }
};

// Delete a design comment
export const deleteDesignComment = async (commentId: string): Promise<void> => {
  try {
    await api.delete(`/comments/${commentId}`);
  } catch (error) {
    throw error;
  }
};

// Create a design from template
export const createDesignFromTemplate = async (projectId: string, templateId: string, name: string): Promise<DesignAlternative> => {
  try {
    const response = await api.post(`/designs/from-template`, {
      projectId,
      templateId,
      name
    });
    return response.data.designAlternative;
  } catch (error) {
    throw error;
  }
};

// Save design as template
export const saveDesignAsTemplate = async (designId: string, templateData: { name: string, description: string, category: string, isPublic: boolean }): Promise<any> => {
  try {
    const response = await api.post(`/designs/${designId}/save-as-template`, templateData);
    return response.data.template;
  } catch (error) {
    throw error;
  }
};

// Share design with users
export const shareDesign = async (designId: string, userEmails: string[], permissionType: 'view' | 'edit'): Promise<void> => {
  try {
    await api.post(`/designs/${designId}/share`, {
      userEmails,
      permissionType
    });
  } catch (error) {
    throw error;
  }
};

// Export design to different formats
export const exportDesign = async (designId: string, format: 'png' | 'geojson' | 'shapefile' | 'pdf'): Promise<Blob> => {
  try {
    const response = await api.get(`/designs/${designId}/export/${format}`, {
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}; 
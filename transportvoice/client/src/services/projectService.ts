import api from './api';

// Get API URL from environment variable
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Define project interface
export interface Project {
  _id: string;
  name: string;
  description: string;
  slug: string;
  projectType: string;
  status: 'draft' | 'active' | 'archived';
  startDate: string;
  endDate?: string;
  image?: string;
  comments?: any[];
  basemap: string;
  layers: any[];
  owner: string;
  organization?: string;
  createdAt: string;
  updatedAt: string;
}

// Get all projects
export const getProjects = async (): Promise<Project[]> => {
  try {
    const response = await api.get('/projects');
    return response.data;
  } catch (error) {
    console.error('Error fetching projects:', error);
    throw error;
  }
};

// Get a single project by ID or slug
export const getProject = async (idOrSlug: string): Promise<Project> => {
  try {
    const response = await api.get(`/projects/${idOrSlug}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching project with ID or slug ${idOrSlug}:`, error);
    throw error;
  }
};

// Create a new project
export const createProject = async (projectData: Partial<Project>): Promise<Project> => {
  try {
    const response = await api.post('/projects', projectData);
    return response.data;
  } catch (error) {
    console.error('Error creating project:', error);
    throw error;
  }
};

// Update an existing project
export const updateProject = async (id: string, projectData: Partial<Project>): Promise<Project> => {
  try {
    const response = await api.put(`/projects/${id}`, projectData);
    return response.data;
  } catch (error) {
    console.error(`Error updating project with ID ${id}:`, error);
    throw error;
  }
};

// Delete a project
export const deleteProject = async (id: string): Promise<void> => {
  try {
    await api.delete(`/projects/${id}`);
  } catch (error) {
    console.error(`Error deleting project with ID ${id}:`, error);
    throw error;
  }
};

// Get project statistics
export const getProjectStats = async (id: string): Promise<any> => {
  try {
    const response = await api.get(`/projects/${id}/stats`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching stats for project with ID ${id}:`, error);
    throw error;
  }
}; 
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { useAuth } from './AuthContext';

// Define Project interface
interface Project {
  id: string;
  name: string;
  slug: string;
  description: string;
  status: 'draft' | 'active' | 'archived';
  projectType: string;
  location: {
    city: string;
    state: string;
    country: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// Define Project Context Type
interface ProjectContextType {
  project: Project | null;
  loading: boolean;
  error: string | null;
  refreshProject: () => Promise<void>;
  fetchProjectById: (id: string) => Promise<void>;
  fetchProjectBySlug: (slug: string) => Promise<void>;
}

// Create the Project Context
const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

// Custom hook to use the Project Context
export const useProject = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};

// Project Provider Component
export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { projectId, slug } = useParams<{ projectId: string; slug: string }>();
  const { getAuthHeaders } = useAuth();

  // Fetch project data on initial load
  useEffect(() => {
    if (projectId) {
      fetchProjectById(projectId);
    } else if (slug) {
      fetchProjectBySlug(slug);
    } else {
      setLoading(false);
    }
  }, [projectId, slug]);

  // Fetch project by ID
  const fetchProjectById = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`/api/projects/${id}`, {
        headers: getAuthHeaders()
      });
      
      setProject(response.data);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        'Failed to load project. Please try again.'
      );
      setProject(null);
    } finally {
      setLoading(false);
    }
  };

  // Fetch project by slug
  const fetchProjectBySlug = async (projectSlug: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`/api/projects/slug/${projectSlug}`, {
        headers: getAuthHeaders()
      });
      
      setProject(response.data);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        'Failed to load project. Please try again.'
      );
      setProject(null);
    } finally {
      setLoading(false);
    }
  };

  // Refresh project data
  const refreshProject = async () => {
    if (projectId) {
      await fetchProjectById(projectId);
    } else if (slug) {
      await fetchProjectBySlug(slug);
    }
  };

  // Create value object
  const value = {
    project,
    loading,
    error,
    refreshProject,
    fetchProjectById,
    fetchProjectBySlug
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
};

export default ProjectProvider; 
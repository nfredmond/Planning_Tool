import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import { axiosAuth } from '../utils/axiosConfig';
import { IProjectType } from '../types/ProjectType';

interface ProjectContextType {
  currentProject: IProjectType | null;
  loading: boolean;
  error: string | null;
  refreshProject: () => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { projectSlug } = useParams<{ projectSlug: string }>();
  const [currentProject, setCurrentProject] = useState<IProjectType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProject = async () => {
    if (!projectSlug) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await axiosAuth.get(`/api/projectTypes/slug/${projectSlug}`);
      setCurrentProject(response.data);
    } catch (err: any) {
      console.error('Error fetching project:', err);
      setError(err.response?.data?.message || 'Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [projectSlug]);

  const refreshProject = async () => {
    await fetchProject();
  };

  return (
    <ProjectContext.Provider value={{ currentProject, loading, error, refreshProject }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = (): ProjectContextType => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
}; 
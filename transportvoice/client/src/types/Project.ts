// Project types for TransportVoice application

export interface ProjectBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface ProjectLayer {
  id: string;
  name: string;
  type: 'geojson' | 'wms' | 'raster' | 'vector';
  url?: string;
  visible: boolean;
  opacity: number;
  zIndex: number;
  metadata?: Record<string, any>;
}

export interface ProjectSetting {
  key: string;
  value: any;
  category: string;
  name: string;
  description?: string;
}

export interface ProjectCollaborator {
  userId: string;
  userName: string;
  role: 'owner' | 'editor' | 'viewer' | 'commenter';
  addedAt: string;
  lastActive?: string;
}

export interface Project {
  _id: string;
  name: string;
  description?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'active' | 'archived' | 'completed';
  projectType: 'transportation' | 'urban' | 'infrastructure' | 'landscape' | 'other';
  location?: {
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    coordinates?: [number, number]; // [longitude, latitude]
  };
  bounds?: ProjectBounds;
  layers: ProjectLayer[];
  settings?: ProjectSetting[];
  collaborators?: ProjectCollaborator[];
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface ProjectSummary {
  _id: string;
  name: string;
  description?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'active' | 'archived' | 'completed';
  projectType: 'transportation' | 'urban' | 'infrastructure' | 'landscape' | 'other';
  location?: {
    city?: string;
    state?: string;
    country?: string;
  };
  thumbnail?: string;
  collaboratorCount: number;
  designCount: number;
  commentCount: number;
} 
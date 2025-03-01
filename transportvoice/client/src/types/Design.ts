// Design types for TransportVoice application

export interface DesignElement {
  id: string;
  type: string;
  elementType: string;
  name: string;
  description?: string;
  properties: Record<string, any>;
  geometry: any;
  style?: Record<string, any>;
}

export interface DesignAlternative {
  _id?: string;
  projectId: string;
  name: string;
  description?: string;
  createdBy: string;
  createdAt?: string;
  updatedAt?: string;
  features: any[];
  isPublished?: boolean;
  version?: number;
  parentId?: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface DesignComment {
  _id?: string;
  designId: string;
  userId: string;
  userName: string;
  text: string;
  location?: [number, number];
  elementId?: string;
  createdAt?: string;
  updatedAt?: string;
  replies?: string[];
  votes?: {
    up: number;
    down: number;
    voters: Array<{
      userId: string;
      vote: 'up' | 'down';
    }>;
  };
}

export interface DesignTemplate {
  _id: string;
  name: string;
  description: string;
  category: string;
  features: any[];
  createdBy: string;
  isPublic: boolean;
  thumbnail?: string;
  tags?: string[];
  usageCount?: number;
} 
/**
 * Interface representing a comment in the application
 */
export interface Comment {
  _id: string;
  project: string | any; // Project ID or Project object if populated
  user?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  }; // User object if not anonymous
  anonymous: boolean;
  anonymousName?: string;
  location: {
    type: string;
    coordinates: [number, number]; // [longitude, latitude]
  };
  content: string;
  images: string[]; // Array of image URLs
  category?: string;
  status: 'pending' | 'approved' | 'rejected';
  moderationNotes?: string;
  moderatedBy?: string; // User ID
  moderatedAt?: string | Date;
  aiModerated: boolean;
  aiModerationScore?: number;
  aiModerationNotes?: string;
  votes: {
    upvotes: number;
    downvotes: number;
    voters: Array<{
      user: string;
      vote: 'up' | 'down';
      createdAt: string | Date;
    }>;
  };
  parentComment?: string; // Comment ID
  replies: string[]; // Array of Comment IDs
  createdAt: string;
  updatedAt: string;
} 
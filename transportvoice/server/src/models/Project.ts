import mongoose, { Schema, Document } from 'mongoose';

export interface IProject extends Document {
  name: string;
  description: string;
  slug: string;
  startDate: Date;
  endDate?: Date;
  status: 'draft' | 'active' | 'archived';
  projectType: string; // Reference to project type slug
  basemap: string;
  commentTypes: mongoose.Types.ObjectId[]; // Reference to comment types
  layers: Array<{
    name: string;
    type: string;
    url: string;
    visible: boolean;
    opacity: number;
  }>;
  bounds?: {
    north: number;
    east: number;
    south: number;
    west: number;
  };
  owner: mongoose.Types.ObjectId;
  organization?: string;
  settings: {
    allowAnonymousComments: boolean;
    requireModeration: boolean;
    enableAIModeration: boolean;
    aiProvider?: string;
    aiApiKey?: string;
    enableVoting: boolean;
    enableImageUploads: boolean;
    enableSocialSharing: boolean;
    enableCustomCommentTypes: boolean;
    enableAIIconGeneration: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    status: { 
      type: String, 
      enum: ['draft', 'active', 'archived'], 
      default: 'draft' 
    },
    projectType: { type: String, required: true },
    basemap: { type: String, required: true, default: 'streets' },
    commentTypes: [{ type: Schema.Types.ObjectId, ref: 'CommentType' }],
    layers: [{
      name: { type: String, required: true },
      type: { type: String, required: true },
      url: { type: String, required: true },
      visible: { type: Boolean, default: true },
      opacity: { type: Number, default: 1.0 }
    }],
    bounds: {
      north: { type: Number },
      east: { type: Number },
      south: { type: Number },
      west: { type: Number }
    },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    organization: { type: String },
    settings: {
      allowAnonymousComments: { type: Boolean, default: true },
      requireModeration: { type: Boolean, default: true },
      enableAIModeration: { type: Boolean, default: false },
      aiProvider: { type: String },
      aiApiKey: { type: String },
      enableVoting: { type: Boolean, default: true },
      enableImageUploads: { type: Boolean, default: true },
      enableSocialSharing: { type: Boolean, default: true },
      enableCustomCommentTypes: { type: Boolean, default: false },
      enableAIIconGeneration: { type: Boolean, default: false }
    }
  },
  { timestamps: true }
);

// Hook to set default comment types based on project type when creating a new project
ProjectSchema.pre<IProject>('save', async function(next) {
  if (this.isNew && !this.commentTypes?.length) {
    try {
      // Get CommentType model
      const CommentType = mongoose.model('CommentType');
      
      // Find global comment types
      const globalCommentTypes = await CommentType.find({ isGlobal: true });
      
      // Find project type specific comment types
      const projectTypeCommentTypes = await CommentType.find({ 
        projectTypes: { $in: [this.projectType] } 
      });
      
      // Combine both types of comment types
      const commentTypeIds = [
        ...globalCommentTypes.map(ct => ct._id),
        ...projectTypeCommentTypes.map(ct => ct._id)
      ];
      
      // Set comment types
      this.commentTypes = commentTypeIds;
      
      next();
    } catch (error) {
      next(error as Error);
    }
  } else {
    next();
  }
});

export default mongoose.model<IProject>('Project', ProjectSchema); 
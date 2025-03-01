// server/src/models/User.ts
import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IUser extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'moderator' | 'user';
  organization?: string;
  verified: boolean;
  verificationToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema: Schema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    role: { 
      type: String, 
      enum: ['admin', 'moderator', 'user'], 
      default: 'user' 
    },
    organization: { type: String },
    verified: { type: Boolean, default: false },
    verificationToken: { type: String },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
  },
  { timestamps: true }
);

// Hash password before saving
UserSchema.pre<IUser>('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Password comparison method
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUser>('User', UserSchema);

// server/src/models/Project.ts
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

export default mongoose.model<IProject>('Project', ProjectSchema);

// server/src/models/Comment.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IComment extends Document {
  project: mongoose.Types.ObjectId;
  user?: mongoose.Types.ObjectId;
  anonymous: boolean;
  anonymousName?: string;
  location: {
    type: string;
    coordinates: [number, number];
  };
  content: string;
  images: string[];
  category?: string;
  status: 'pending' | 'approved' | 'rejected';
  moderationNotes?: string;
  moderatedBy?: mongoose.Types.ObjectId;
  moderatedAt?: Date;
  aiModerated: boolean;
  aiModerationScore?: number;
  aiModerationNotes?: string;
  votes: {
    upvotes: number;
    downvotes: number;
    voters: Array<{
      user: mongoose.Types.ObjectId;
      vote: 'up' | 'down';
      createdAt: Date;
    }>;
  };
  parentComment?: mongoose.Types.ObjectId;
  replies: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema: Schema = new Schema(
  {
    project: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    anonymous: { type: Boolean, default: false },
    anonymousName: { type: String },
    location: {
      type: { type: String, enum: ['Point'], required: true },
      coordinates: { type: [Number], required: true } // [longitude, latitude]
    },
    content: { type: String, required: true },
    images: [{ type: String }],
    category: { type: String },
    status: { 
      type: String, 
      enum: ['pending', 'approved', 'rejected'], 
      default: 'pending' 
    },
    moderationNotes: { type: String },
    moderatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    moderatedAt: { type: Date },
    aiModerated: { type: Boolean, default: false },
    aiModerationScore: { type: Number },
    aiModerationNotes: { type: String },
    votes: {
      upvotes: { type: Number, default: 0 },
      downvotes: { type: Number, default: 0 },
      voters: [{
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        vote: { type: String, enum: ['up', 'down'], required: true },
        createdAt: { type: Date, default: Date.now }
      }]
    },
    parentComment: { type: Schema.Types.ObjectId, ref: 'Comment' },
    replies: [{ type: Schema.Types.ObjectId, ref: 'Comment' }]
  },
  { timestamps: true }
);

// Create a 2dsphere index for geospatial queries
CommentSchema.index({ location: '2dsphere' });

export default mongoose.model<IComment>('Comment', CommentSchema);

// server/src/models/Layer.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface ILayer extends Document {
  name: string;
  description?: string;
  type: 'kml' | 'kmz' | 'geojson' | 'wms' | 'vector' | 'raster';
  fileName?: string;
  fileSize?: number;
  url: string;
  owner: mongoose.Types.ObjectId;
  organization?: string;
  public: boolean;
  projects: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const LayerSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    type: { 
      type: String, 
      enum: ['kml', 'kmz', 'geojson', 'wms', 'vector', 'raster'], 
      required: true 
    },
    fileName: { type: String },
    fileSize: { type: Number },
    url: { type: String, required: true },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    organization: { type: String },
    public: { type: Boolean, default: false },
    projects: [{ type: Schema.Types.ObjectId, ref: 'Project' }]
  },
  { timestamps: true }
);

export default mongoose.model<ILayer>('Layer', LayerSchema);

// server/src/models/Report.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IReport extends Document {
  name: string;
  description?: string;
  project: mongoose.Types.ObjectId;
  type: 'comments' | 'engagement' | 'sentiment' | 'geographic' | 'custom';
  parameters: Record<string, any>;
  createdBy: mongoose.Types.ObjectId;
  lastRun?: Date;
  schedule?: {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'monthly';
    nextRun?: Date;
    recipients: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

const ReportSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    project: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    type: { 
      type: String, 
      enum: ['comments', 'engagement', 'sentiment', 'geographic', 'custom'], 
      required: true 
    },
    parameters: { type: Schema.Types.Mixed, default: {} },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    lastRun: { type: Date },
    schedule: {
      enabled: { type: Boolean, default: false },
      frequency: { 
        type: String, 
        enum: ['daily', 'weekly', 'monthly'] 
      },
      nextRun: { type: Date },
      recipients: [{ type: String }]
    }
  },
  { timestamps: true }
);

export default mongoose.model<IReport>('Report', ReportSchema);

// server/src/models/AIProvider.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IAIProvider extends Document {
  name: string;
  provider: 'openai' | 'anthropic' | 'huggingface' | 'custom';
  apiKey?: string;
  model: string;
  baseUrl?: string;
  settings: Record<string, any>;
  owner: mongoose.Types.ObjectId;
  organization?: string;
  projects: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  isVisibleToFrontend: boolean;
  isDefault: boolean;
}

/**
 * AIProvider Schema
 * Represents configuration for an AI provider (OpenAI, Anthropic, etc.)
 */
const AIProviderSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    trim: true 
  },
  provider: { 
    type: String, 
    required: true, 
    enum: ['openai', 'anthropic', 'huggingface', 'custom'], 
    default: 'openai' 
  },
  apiKey: { 
    type: String, 
    required: true, 
    select: false // Don't include API key in default query results for security
  },
  model: { 
    type: String, 
    required: true 
  },
  baseUrl: { 
    type: String 
  },
  settings: { 
    type: mongoose.Schema.Types.Mixed, 
    default: {} 
  },
  isVisibleToFrontend: {
    type: Boolean,
    default: false
  },
  isDefault: {
    type: Boolean,
    default: false
  }
}, { 
  timestamps: true 
});

// Hide sensitive data when converting to JSON
AIProviderSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.apiKey;
  return obj;
};

// Encrypt API key before saving
AIProviderSchema.pre('save', async function(next) {
  // Only hash the API key if it's new or modified
  if (!this.isModified('apiKey')) return next();
  
  try {
    // In a real implementation, encrypt the API key
    // For this example, we're just adding a note that it would be encrypted
    this.apiKey = `encrypted:${this.apiKey}`;
    next();
  } catch (error) {
    next(error);
  }
});

const AIProvider = mongoose.model<IAIProvider>('AIProvider', AIProviderSchema);

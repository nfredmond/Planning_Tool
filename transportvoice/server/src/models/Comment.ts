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
  commentType: mongoose.Types.ObjectId; // Reference to the comment type
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
    commentType: { type: Schema.Types.ObjectId, ref: 'CommentType', required: true },
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
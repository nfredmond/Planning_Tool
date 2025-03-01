import mongoose, { Schema, Document } from 'mongoose';

export interface IProjectType extends Document {
  name: string;
  description: string;
  slug: string;
  defaultCommentTypes: mongoose.Types.ObjectId[];
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectTypeSchema: Schema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    defaultCommentTypes: [{ type: Schema.Types.ObjectId, ref: 'CommentType' }],
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
);

// Pre-defined project types
const PROJECT_TYPES = [
  {
    name: 'Regional Transportation Plan',
    description: 'Long-range planning document for transportation infrastructure in a region',
    slug: 'rtp'
  },
  {
    name: 'Community Plan',
    description: 'Comprehensive planning for a specific community or neighborhood',
    slug: 'community-plan'
  },
  {
    name: 'Complete Streets Plan',
    description: 'Planning for streets designed for all users including pedestrians, cyclists, transit, and vehicles',
    slug: 'complete-streets'
  },
  {
    name: 'Emergency Evacuation Plan',
    description: 'Planning for evacuation routes and procedures during emergencies',
    slug: 'emergency-evacuation'
  },
  {
    name: 'Wayfinding Plan',
    description: 'Planning for navigation systems to help people move through physical spaces',
    slug: 'wayfinding'
  },
  {
    name: 'Road Safety Plan',
    description: 'Planning focused on improving safety for all road users',
    slug: 'road-safety'
  }
];

export default mongoose.model<IProjectType>('ProjectType', ProjectTypeSchema);
export { PROJECT_TYPES }; 
import mongoose, { Schema, Document } from 'mongoose';

export interface ICommentType extends Document {
  name: string;
  description: string;
  icon: string; // SVG string or URL
  iconGeneratedByAI: boolean;
  iconPrompt?: string; // Used for AI-generated icons
  color: string;
  projectTypes: string[]; // Array of project type slugs this comment type is relevant for
  createdBy: mongoose.Types.ObjectId;
  organization?: string;
  projects: mongoose.Types.ObjectId[]; // Specific projects this comment type is associated with
  isGlobal: boolean; // If true, available to all projects regardless of type
  createdAt: Date;
  updatedAt: Date;
}

const CommentTypeSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String, required: true },
    iconGeneratedByAI: { type: Boolean, default: false },
    iconPrompt: { type: String },
    color: { type: String, required: true, default: '#1976d2' },
    projectTypes: [{ type: String }], // Reference to project type slugs
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    organization: { type: String },
    projects: [{ type: Schema.Types.ObjectId, ref: 'Project' }], // Specific projects
    isGlobal: { type: Boolean, default: false }
  },
  { timestamps: true }
);

// Pre-defined comment types for different project types
const DEFAULT_COMMENT_TYPES = {
  // General comment types for all projects
  general: [
    {
      name: 'General Comment',
      description: 'A general comment or feedback',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M240-400h480v-80H240v80Zm0-120h480v-80H240v80Zm0-120h480v-80H240v80ZM880-80 720-240H160q-33 0-56.5-23.5T80-320v-480q0-33 23.5-56.5T160-880h640q33 0 56.5 23.5T880-800v720Z"/></svg>',
      color: '#1976d2',
      projectTypes: [],
      isGlobal: true
    },
    {
      name: 'Question',
      description: 'A question about the project',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M480-360q17 0 28.5-11.5T520-400q0-17-11.5-28.5T480-440q-17 0-28.5 11.5T440-400q0 17 11.5 28.5T480-360Zm-40-160h80v-240h-80v240ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Z"/></svg>',
      color: '#ff9800',
      projectTypes: [],
      isGlobal: true
    }
  ],
  
  // Road Safety specific comment types
  'road-safety': [
    {
      name: 'Bicycle Safety Issue',
      description: 'Comment related to bicycle safety concerns',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M352-120q-30 0-51.5-21.5T279-193q0-30 21.5-51.5T352-266q30 0 51.5 21.5T425-193q0 30-21.5 51.5T352-120Zm360 0q-30 0-51.5-21.5T639-193q0-30 21.5-51.5T712-266q30 0 51.5 21.5T785-193q0 30-21.5 51.5T712-120ZM312-823l102 183h132l-99-183h-135Zm-32 583q-40 0-68-28t-28-68q0-40 28-68t68-28q40 0 68 28t28 68q0 40-28 68t-68 28Zm0-60q15 0 25.5-10.5T316-335q0-15-10.5-25.5T280-371q-15 0-25.5 10.5T244-335q0 15 10.5 25.5T280-299Zm432 0q15 0 25.5-10.5T748-335q0-15-10.5-25.5T712-371q-15 0-25.5 10.5T676-335q0 15 10.5 25.5T712-299Zm-271-60h79l44-80H397l44 80Zm-60-200 108-200h240q20 0 35 5.5t29 16.5q14 11 21.5 26t7.5 32q0 17-7.5 32T793-621q-14 11-29 16.5t-35 5.5H525l32 60h255v60H525l-44-79-45 79H323l-58-114 73-135-98-178h-80v-60h120l112 203-54 102h54Z"/></svg>',
      color: '#4caf50',
      projectTypes: ['road-safety'],
      isGlobal: false
    },
    {
      name: 'Pedestrian Safety Issue',
      description: 'Comment related to pedestrian safety concerns',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M400-80v-120H280v-80h120v-120h80v120h120v80H480v120h-80Zm40-320q-33 0-56.5-23.5T360-480q0-33 23.5-56.5T440-560q33 0 56.5 23.5T520-480q0 33-23.5 56.5T440-400Zm0-160q-66 0-113 47t-47 113q0 66 47 113t113 47q66 0 113-47t47-113q0-66-47-113t-113-47Zm0 80q33 0 56.5 23.5T520-400q0 33-23.5 56.5T440-320q-33 0-56.5-23.5T360-400q0-33 23.5-56.5T440-480Zm-160-80q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47Zm440 0q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47Z"/></svg>',
      color: '#f44336',
      projectTypes: ['road-safety'],
      isGlobal: false
    },
    {
      name: 'Intersection Safety Issue',
      description: 'Comment related to intersection safety concerns',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M200-120v-240h-80v-440h240v-40h240v40h240v440h-80v240H200Zm80-80h160v-280H280v280Zm-80-440h560v-40H200v40Z"/></svg>',
      color: '#9c27b0',
      projectTypes: ['road-safety'],
      isGlobal: false
    }
  ],
  
  // Emergency Evacuation specific comment types
  'emergency-evacuation': [
    {
      name: 'Evacuation Bottleneck',
      description: 'An area that could slow evacuation',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="m438-338 272-272-56-56-272 272 56 56ZM280-80v-80h400v80H280Zm-40-280-92-128q-20-28-20-60t20-60l92-128h480l92 128q20 28 20 60t-20 60l-92 128H240Zm48-80h384l52-72q8-11 8-23t-8-23l-52-72H288l-52 72q-8 11-8 23t8 23l52 72Zm192-95Z"/></svg>',
      color: '#e91e63',
      projectTypes: ['emergency-evacuation'],
      isGlobal: false
    },
    {
      name: 'Shelter Location',
      description: 'Potential emergency shelter location',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M160-120v-480l320-240 320 240v480H560v-280H400v280H160Zm360-520q33 0 56.5-23.5T600-720q0-33-23.5-56.5T520-800q-33 0-56.5 23.5T440-720q0 33 23.5 56.5T520-640Z"/></svg>',
      color: '#2196f3',
      projectTypes: ['emergency-evacuation'],
      isGlobal: false
    },
    {
      name: 'High Risk Area',
      description: 'Area with high risk during emergency',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="m40-120 440-760 440 760H40Zm138-80h604L480-720 178-200Zm302-40q17 0 28.5-11.5T520-280q0-17-11.5-28.5T480-320q-17 0-28.5 11.5T440-280q0 17 11.5 28.5T480-240Zm-40-120h80v-160h-80v160Zm40-80Z"/></svg>',
      color: '#ff5722',
      projectTypes: ['emergency-evacuation'],
      isGlobal: false
    }
  ],
  
  // Wayfinding specific comment types
  'wayfinding': [
    {
      name: 'Sign Location',
      description: 'Suggested location for wayfinding signage',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M240-80v-360h120v-120H240v-320h320v320H440v120h120v-120h160v120h80v360h-80v-280H240v280h-80v80h640v-80h-80Zm160-480h80v-240h-80v240Z"/></svg>',
      color: '#3f51b5',
      projectTypes: ['wayfinding'],
      isGlobal: false
    },
    {
      name: 'Confusing Area',
      description: 'Area that is confusing to navigate',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80ZM360-680h240v-80H360v80ZM240-280h480v-80H240v-80h160v-80h-60v-80h280v80h-60v80h160v160H240v-80Z"/></svg>',
      color: '#ffeb3b',
      projectTypes: ['wayfinding'],
      isGlobal: false
    }
  ],
  
  // Complete Streets specific comment types
  'complete-streets': [
    {
      name: 'Bicycle Facility Needed',
      description: 'Location where bicycle facilities are needed',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M352-120q-30 0-51.5-21.5T279-193q0-30 21.5-51.5T352-266q30 0 51.5 21.5T425-193q0 30-21.5 51.5T352-120Zm360 0q-30 0-51.5-21.5T639-193q0-30 21.5-51.5T712-266q30 0 51.5 21.5T785-193q0 30-21.5 51.5T712-120ZM312-823l102 183h132l-99-183h-135Zm-32 583q-40 0-68-28t-28-68q0-40 28-68t68-28q40 0 68 28t28 68q0 40-28 68t-68 28Zm0-60q15 0 25.5-10.5T316-335q0-15-10.5-25.5T280-371q-15 0-25.5 10.5T244-335q0 15 10.5 25.5T280-299Zm432 0q15 0 25.5-10.5T748-335q0-15-10.5-25.5T712-371q-15 0-25.5 10.5T676-335q0 15 10.5 25.5T712-299Zm-271-60h79l44-80H397l44 80Zm-60-200 108-200h240q20 0 35 5.5t29 16.5q14 11 21.5 26t7.5 32q0 17-7.5 32T793-621q-14 11-29 16.5t-35 5.5H525l32 60h255v60H525l-44-79-45 79H323l-58-114 73-135-98-178h-80v-60h120l112 203-54 102h54Z"/></svg>',
      color: '#4caf50',
      projectTypes: ['complete-streets'],
      isGlobal: false
    },
    {
      name: 'Pedestrian Facility Needed',
      description: 'Location where pedestrian facilities are needed',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M400-80v-120H280v-80h120v-120h80v120h120v80H480v120h-80Zm40-320q-33 0-56.5-23.5T360-480q0-33 23.5-56.5T440-560q33 0 56.5 23.5T520-480q0 33-23.5 56.5T440-400Zm0-80q-33 0-56.5-23.5T360-560q0-33 23.5-56.5T440-640q33 0 56.5 23.5T520-560q0 33-23.5 56.5T440-480Z"/></svg>',
      color: '#f44336',
      projectTypes: ['complete-streets'],
      isGlobal: false
    },
    {
      name: 'Transit Stop Needed',
      description: 'Location where a transit stop is needed',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M280-130q-25 0-42.5-17.5T220-190h-60v-525q0-33 23.5-56.5T240-795h480q33 0 56.5 23.5T800-715v525h-60q0 25-17.5 42.5T680-130q-25 0-42.5-17.5T620-190H340q0 25-17.5 42.5T280-130ZM240-270h480v-445H240v445Zm160 0q25 0 42.5-17.5T460-330q0-25-17.5-42.5T400-390q-25 0-42.5 17.5T340-330q0 25 17.5 42.5T400-270Zm160 0q25 0 42.5-17.5T620-330q0-25-17.5-42.5T560-390q-25 0-42.5 17.5T500-330q0 25 17.5 42.5T560-270Z"/></svg>',
      color: '#673ab7',
      projectTypes: ['complete-streets'],
      isGlobal: false
    }
  ]
};

export default mongoose.model<ICommentType>('CommentType', CommentTypeSchema);
export { DEFAULT_COMMENT_TYPES }; 
import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IUserProjectPermission {
  project: mongoose.Types.ObjectId;
  role: 'admin' | 'moderator' | 'contributor' | 'viewer';
}

export interface IUser extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'super_admin' | 'admin' | 'moderator' | 'user';
  organization?: string;
  verified: boolean;
  verificationToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  projectPermissions: IUserProjectPermission[];
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  hasProjectPermission(projectId: string, minRole: 'admin' | 'moderator' | 'contributor' | 'viewer'): boolean;
}

const UserProjectPermissionSchema = new Schema({
  project: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
  role: { 
    type: String, 
    enum: ['admin', 'moderator', 'contributor', 'viewer'], 
    required: true,
    default: 'viewer'
  }
}, { _id: false });

const UserSchema: Schema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    role: { 
      type: String, 
      enum: ['super_admin', 'admin', 'moderator', 'user'], 
      default: 'user' 
    },
    organization: { type: String },
    verified: { type: Boolean, default: false },
    verificationToken: { type: String },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    projectPermissions: [UserProjectPermissionSchema]
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

// Method to check if user has permission for a specific project
UserSchema.methods.hasProjectPermission = function(projectId: string, minRole: 'admin' | 'moderator' | 'contributor' | 'viewer'): boolean {
  // Super admins have access to everything
  if (this.role === 'super_admin') return true;
  
  // Find the project permission
  const projectPermission = this.projectPermissions.find(
    p => p.project.toString() === projectId
  );
  
  if (!projectPermission) return false;
  
  // Role hierarchy
  const roleHierarchy = {
    'admin': 4,
    'moderator': 3,
    'contributor': 2,
    'viewer': 1
  };
  
  // Check if the user's role for this project is at least the minimum required role
  return roleHierarchy[projectPermission.role] >= roleHierarchy[minRole];
};

export default mongoose.model<IUser>('User', UserSchema); 
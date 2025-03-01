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

const AIProviderSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    provider: {
      type: String,
      enum: ['openai', 'anthropic', 'huggingface', 'custom'],
      required: true
    },
    apiKey: { 
      type: String,
      required: function() {
        return this.provider !== 'custom' || !this.baseUrl;
      }
    },
    model: { type: String, required: true },
    baseUrl: { 
      type: String,
      required: function() {
        return this.provider === 'custom';
      }
    },
    settings: { type: Schema.Types.Mixed, default: {} },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    organization: { type: String },
    projects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }],
    isVisibleToFrontend: { type: Boolean, default: false },
    isDefault: { type: Boolean, default: false }
  },
  { timestamps: true }
);

// Only one default provider allowed
AIProviderSchema.pre<IAIProvider>('save', async function(next) {
  if (this.isDefault) {
    await this.model('AIProvider').updateMany(
      { _id: { $ne: this._id }, isDefault: true },
      { isDefault: false }
    );
  }
  next();
});

// Hide API key when sending to client
AIProviderSchema.set('toJSON', {
  transform: function(doc, ret) {
    if (ret.apiKey) {
      ret.apiKey = '•••••••••••••••••••••••••';
    }
    return ret;
  }
});

const AIProvider = mongoose.model<IAIProvider>('AIProvider', AIProviderSchema);

export default AIProvider; 
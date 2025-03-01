import mongoose, { Schema, Document } from 'mongoose';

export interface IMap extends Document {
  name: string;
  description?: string;
  type: 'tile' | 'vector' | 'raster' | 'wms';
  url: string;
  thumbnail?: string;
  attribution?: string;
  minZoom?: number;
  maxZoom?: number;
  defaultOpacity?: number;
  isBaseMap: boolean;
  isDefault?: boolean;
  owner: mongoose.Types.ObjectId;
  organization?: string;
  projects: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const MapSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    type: { 
      type: String, 
      enum: ['tile', 'vector', 'raster', 'wms'], 
      required: true,
      default: 'tile'
    },
    url: { type: String, required: true },
    thumbnail: { type: String },
    attribution: { type: String },
    minZoom: { type: Number, default: 0 },
    maxZoom: { type: Number, default: 18 },
    defaultOpacity: { type: Number, default: 1 },
    isBaseMap: { type: Boolean, default: true },
    isDefault: { type: Boolean, default: false },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    organization: { type: String },
    projects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }]
  },
  { timestamps: true }
);

// Only one default base map allowed
MapSchema.pre<IMap>('save', async function(next) {
  if (this.isDefault && this.isBaseMap) {
    await this.model('Map').updateMany(
      { _id: { $ne: this._id }, isDefault: true, isBaseMap: true },
      { isDefault: false }
    );
  }
  next();
});

const Map = mongoose.model<IMap>('Map', MapSchema);

export default Map; 
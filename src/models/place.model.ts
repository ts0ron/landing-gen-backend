import mongoose, { Schema, Document } from "mongoose";
import { logger } from "../utils/logger";

/**
 * Place photo interface
 */
export interface IPlacePhoto {
  photoReference: string;
  photoUri?: string;
  height: number;
  width: number;
}

/**
 * Place location interface
 */
export interface IPlaceLocation {
  lat: number;
  lng: number;
}

/**
 * Place geometry interface
 */
export interface IPlaceGeometry {
  location: IPlaceLocation;
}

/**
 * Place document interface
 */
export interface IPlace extends Document {
  _id: string;
  placeId: string;
  name: string;
  formattedAddress: string;
  geometry: IPlaceGeometry;
  photos: IPlacePhoto[];
  types: string[];
  rating?: number;
  userRatingsTotal?: number;
  aiDescription?: string;
  aiTags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Place schema definition
 */
const PlaceSchema = new Schema<IPlace>(
  {
    placeId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    formattedAddress: {
      type: String,
      required: true,
    },
    geometry: {
      location: {
        lat: {
          type: Number,
          required: true,
        },
        lng: {
          type: Number,
          required: true,
        },
      },
    },
    photos: [
      {
        photoReference: {
          type: String,
          required: true,
        },
        photoUri: String,
        height: {
          type: Number,
          required: true,
        },
        width: {
          type: Number,
          required: true,
        },
      },
    ],
    types: [
      {
        type: String,
        required: true,
      },
    ],
    rating: Number,
    userRatingsTotal: Number,
    aiDescription: String,
    aiTags: [String],
  },
  {
    timestamps: true,
  }
);

// Index for geospatial queries
PlaceSchema.index({ "geometry.location": "2dsphere" });

// Log place creation
PlaceSchema.post("save", function (doc) {
  logger.info(`Place saved: ${doc.placeId}`);
});

// Create and export the Place model
export const Place = mongoose.model<IPlace>("Place", PlaceSchema);

import mongoose, { Schema, Document } from "mongoose";
import { logger } from "../utils/logger";

/**
 * Address component interface
 */
export interface IAddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

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
  viewport?: {
    northeast: IPlaceLocation;
    southwest: IPlaceLocation;
  };
}

/**
 * Opening hours interface
 */
export interface IOpeningHours {
  open_now?: boolean;
  periods?: Array<{
    open: {
      day: number;
      time: string;
    };
    close?: {
      day: number;
      time: string;
    };
  }>;
  weekday_text?: string[];
}

/**
 * Review interface
 */
export interface IReview {
  author_name: string;
  rating: number;
  relative_time_description: string;
  time: number;
  text: string;
}

/**
 * Asset document interface
 */
export interface IAsset extends Document {
  _id: string;
  placeId: string;
  name: string;
  formattedAddress: string;
  addressComponents?: IAddressComponent[];
  adrAddress?: string;
  businessStatus?: string;
  geometry: IPlaceGeometry;
  icon?: string;
  iconBackgroundColor?: string;
  iconMaskBaseUri?: string;
  photos: IPlacePhoto[];
  permanentlyClosed?: boolean;
  plusCode?: {
    global_code: string;
    compound_code: string;
  };
  types: string[];
  url?: string;
  utcOffset?: number;
  vicinity?: string;
  formattedPhoneNumber?: string;
  internationalPhoneNumber?: string;
  openingHours?: IOpeningHours;
  website?: string;
  priceLevel?: number;
  rating?: number;
  userRatingsTotal?: number;
  reviews?: IReview[];
  wheelchairAccessibleEntrance?: boolean;
  aiDescription?: string;
  aiTags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Asset schema definition
 */
const AssetSchema = new Schema<IAsset>(
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
    addressComponents: [
      {
        long_name: String,
        short_name: String,
        types: [String],
      },
    ],
    adrAddress: String,
    businessStatus: String,
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
      viewport: {
        northeast: {
          lat: Number,
          lng: Number,
        },
        southwest: {
          lat: Number,
          lng: Number,
        },
      },
    },
    icon: String,
    iconBackgroundColor: String,
    iconMaskBaseUri: String,
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
    permanentlyClosed: Boolean,
    plusCode: {
      global_code: String,
      compound_code: String,
    },
    types: [
      {
        type: String,
        required: true,
      },
    ],
    url: String,
    utcOffset: Number,
    vicinity: String,
    formattedPhoneNumber: String,
    internationalPhoneNumber: String,
    openingHours: {
      open_now: Boolean,
      periods: [
        {
          open: {
            day: Number,
            time: String,
          },
          close: {
            day: Number,
            time: String,
          },
        },
      ],
      weekday_text: [String],
    },
    website: String,
    priceLevel: Number,
    rating: Number,
    userRatingsTotal: Number,
    reviews: [
      {
        author_name: String,
        rating: Number,
        relative_time_description: String,
        time: Number,
        text: String,
      },
    ],
    wheelchairAccessibleEntrance: Boolean,
    aiDescription: String,
    aiTags: [String],
  },
  {
    timestamps: true,
  }
);

// Index for geospatial queries
AssetSchema.index({ "geometry.location": "2dsphere" });

// Log place creation
AssetSchema.post("save", function (doc) {
  logger.info(`Asset saved: ${doc.placeId}`);
});

// Create and export the Asset model
export const Asset = mongoose.model<IAsset>("Asset", AssetSchema, "assets");

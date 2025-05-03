import mongoose, { Schema, Document } from "mongoose";
import { logger } from "../utils/logger";
import { GooglePlaceDetails } from "./google-place.model";

/**
 * Category type for asset classification
 */
export type Category =
  | "Cultural"
  | "Entertainment"
  | "Commerce"
  | "Transportation"
  | "PublicServices"
  | "Default";

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
 * Asset display name interface
 */
export interface IDisplayName {
  text: string;
  languageCode: string;
}

/**
 * Asset location interface
 */
export interface IAssetLocation {
  latitude: number;
  longitude: number;
}

/**
 * Opening hours period interface
 */
export interface IOpeningHoursPeriod {
  open: {
    day: number;
    hour: number;
    minute: number;
  };
  close: {
    day: number;
    hour: number;
    minute: number;
  };
}

/**
 * Regular opening hours interface
 */
export interface IRegularOpeningHours {
  periods: IOpeningHoursPeriod[];
  weekdayDescriptions: string[];
}

/**
 * Secondary opening hours interface
 */
export interface ISecondaryOpeningHours extends IRegularOpeningHours {
  secondaryHoursType: string;
}

/**
 * Photo author attribution interface
 */
export interface IPhotoAuthorAttribution {
  displayName: string;
  uri: string;
  photoUri: string;
}

/**
 * Asset photo interface
 */
export interface IAssetPhoto {
  name: string;
  widthPx: number;
  heightPx: number;
  authorAttributions: IPhotoAuthorAttribution[];
  photoUrl?: string;
}

/**
 * Parking options interface
 */
export interface IParkingOptions {
  freeParkingLot?: boolean;
  paidParkingLot?: boolean;
  freeStreetParking?: boolean;
  valetParking?: boolean;
  freeGarageParking?: boolean;
  paidGarageParking?: boolean;
}

/**
 * Payment options interface
 */
export interface IPaymentOptions {
  acceptsCreditCards?: boolean;
  acceptsDebitCards?: boolean;
  acceptsCashOnly?: boolean;
  acceptsNfc?: boolean;
}

/**
 * Accessibility options interface
 */
export interface IAccessibilityOptions {
  wheelchairAccessibleParking?: boolean;
  wheelchairAccessibleEntrance?: boolean;
  wheelchairAccessibleRestroom?: boolean;
  wheelchairAccessibleSeating?: boolean;
}

/**
 * Dine-in options interface
 */
export interface IDineInOptions {
  reservable?: boolean;
  servesCocktails?: boolean;
  servesDessert?: boolean;
  servesCoffee?: boolean;
  outdoorSeating?: boolean;
  liveMusic?: boolean;
  menuForChildren?: boolean;
  goodForChildren?: boolean;
  goodForGroups?: boolean;
  goodForWatchingSports?: boolean;
}

/**
 * Editorial summary interface
 */
export interface IEditorialSummary {
  text: string;
  languageCode: string;
}

/**
 * Review text interface
 */
export interface IReviewText {
  text: string;
  languageCode: string;
}

/**
 * Review author attribution interface
 */
export interface IReviewAuthorAttribution {
  displayName: string;
  uri: string;
  photoUri: string;
}

/**
 * Asset review interface
 */
export interface IAssetReview {
  name: string;
  relativePublishTimeDescription: string;
  rating: number;
  text: IReviewText;
  authorAttribution: IReviewAuthorAttribution;
}

/**
 * Asset document interface
 */
export interface IAsset extends Document {
  _id: string;
  externalId: string;
  displayName: IDisplayName;
  formattedAddress: string;
  shortFormattedAddress?: string;
  location: IAssetLocation;
  rating?: number;
  userRatingCount?: number;
  googleMapsUri: string;
  websiteUri?: string;

  // Category
  category?: Category;

  // Opening hours
  regularOpeningHours?: IRegularOpeningHours;
  regularSecondaryOpeningHours?: ISecondaryOpeningHours[];
  currentOpeningHours?: IRegularOpeningHours;

  // Types
  primaryType: string;
  types: string[];

  // Photos
  photos?: IAssetPhoto[];

  // Options and features
  parkingOptions?: IParkingOptions;
  paymentOptions?: IPaymentOptions;
  accessibilityOptions?: IAccessibilityOptions;
  dineInOptions?: IDineInOptions;

  // Summaries and descriptions
  editorialSummary?: IEditorialSummary;
  priceLevel?:
    | "PRICE_LEVEL_FREE"
    | "PRICE_LEVEL_INEXPENSIVE"
    | "PRICE_LEVEL_MODERATE"
    | "PRICE_LEVEL_EXPENSIVE"
    | "PRICE_LEVEL_VERY_EXPENSIVE";

  // Reviews
  reviews?: IAssetReview[];

  // Additional features
  allowsDogs?: boolean;
  hasRestroom?: boolean;

  // AI-generated content
  aiDescription?: string;
  aiTags?: string[];
  aiLandingPage?: string;

  // Document timestamps
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Asset schema
 */
const AssetSchema = new Schema<IAsset>(
  {
    externalId: { type: String, required: true, unique: true },
    displayName: {
      text: { type: String, required: true },
      languageCode: { type: String, required: true },
    },
    formattedAddress: { type: String, required: true },
    shortFormattedAddress: String,
    location: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
    },
    rating: Number,
    userRatingCount: Number,
    googleMapsUri: { type: String, required: true },
    websiteUri: String,

    // Category
    category: {
      type: String,
      enum: [
        "Cultural",
        "Entertainment",
        "Commerce",
        "Transportation",
        "PublicServices",
        "Default",
      ] as Category[],
    },

    // Opening hours
    regularOpeningHours: {
      periods: [
        {
          open: {
            day: Number,
            hour: Number,
            minute: Number,
          },
          close: {
            day: Number,
            hour: Number,
            minute: Number,
          },
        },
      ],
      weekdayDescriptions: [String],
    },
    regularSecondaryOpeningHours: [
      {
        periods: [
          {
            open: {
              day: Number,
              hour: Number,
              minute: Number,
            },
            close: {
              day: Number,
              hour: Number,
              minute: Number,
            },
          },
        ],
        weekdayDescriptions: [String],
        secondaryHoursType: String,
      },
    ],
    currentOpeningHours: {
      periods: [
        {
          open: {
            day: Number,
            hour: Number,
            minute: Number,
          },
          close: {
            day: Number,
            hour: Number,
            minute: Number,
          },
        },
      ],
      weekdayDescriptions: [String],
    },

    // Types
    primaryType: { type: String, required: true },
    types: [String],

    // Photos
    photos: [
      {
        name: String,
        widthPx: Number,
        heightPx: Number,
        authorAttributions: [
          {
            displayName: String,
            uri: String,
            photoUri: String,
          },
        ],
        photoUrl: String,
      },
    ],

    // Options and features
    parkingOptions: {
      freeParkingLot: Boolean,
      paidParkingLot: Boolean,
      freeStreetParking: Boolean,
      valetParking: Boolean,
      freeGarageParking: Boolean,
      paidGarageParking: Boolean,
    },
    paymentOptions: {
      acceptsCreditCards: Boolean,
      acceptsDebitCards: Boolean,
      acceptsCashOnly: Boolean,
      acceptsNfc: Boolean,
    },
    accessibilityOptions: {
      wheelchairAccessibleParking: Boolean,
      wheelchairAccessibleEntrance: Boolean,
      wheelchairAccessibleRestroom: Boolean,
      wheelchairAccessibleSeating: Boolean,
    },
    dineInOptions: {
      reservable: Boolean,
      servesCocktails: Boolean,
      servesDessert: Boolean,
      servesCoffee: Boolean,
      outdoorSeating: Boolean,
      liveMusic: Boolean,
      menuForChildren: Boolean,
      goodForChildren: Boolean,
      goodForGroups: Boolean,
      goodForWatchingSports: Boolean,
    },

    // Summaries and descriptions
    editorialSummary: {
      text: String,
      languageCode: String,
    },
    priceLevel: {
      type: String,
      enum: [
        "PRICE_LEVEL_FREE",
        "PRICE_LEVEL_INEXPENSIVE",
        "PRICE_LEVEL_MODERATE",
        "PRICE_LEVEL_EXPENSIVE",
        "PRICE_LEVEL_VERY_EXPENSIVE",
      ],
    },

    // Reviews
    reviews: [
      {
        name: String,
        relativePublishTimeDescription: String,
        rating: Number,
        text: {
          text: String,
          languageCode: String,
        },
        authorAttribution: {
          displayName: String,
          uri: String,
          photoUri: String,
        },
      },
    ],

    // Additional features
    allowsDogs: Boolean,
    hasRestroom: Boolean,

    // AI-generated content
    aiDescription: String,
    aiTags: [String],
    aiLandingPage: String,
  },
  {
    timestamps: true,
  }
);

// Indexes
AssetSchema.index({ location: "2dsphere" });
AssetSchema.index({ "displayName.text": "text", formattedAddress: "text" });

// Export the model
export const Asset = mongoose.model<IAsset>("Asset", AssetSchema);

logger.info("Asset model initialized");

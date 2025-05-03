import {
  AddressComponent,
  OpeningHours,
  PlusCode,
} from "@googlemaps/google-maps-services-js";

export interface GooglePlacePhoto {
  photo_reference: string;
  height: number;
  width: number;
}

export interface GooglePlaceReview {
  author_name: string;
  rating: number;
  relative_time_description: string;
  time: number | string;
  text: string;
}

export interface GooglePlaceGeometry {
  location: {
    lat: number;
    lng: number;
  };
  viewport?: {
    northeast: {
      lat: number;
      lng: number;
    };
    southwest: {
      lat: number;
      lng: number;
    };
  };
}

/**
 * Interface representing the response from Google Places API (New)
 */
export interface GooglePlaceDetails {
  id: string;
  displayName: {
    text: string;
    languageCode: string;
  };
  formattedAddress: string;
  shortFormattedAddress?: string;
  location: {
    latitude: number;
    longitude: number;
  };
  rating?: number;
  userRatingCount?: number;
  googleMapsUri: string;
  websiteUri?: string;
  regularOpeningHours?: {
    periods: OpeningHoursPeriod[];
    weekdayDescriptions: string[];
  };
  regularSecondaryOpeningHours?: {
    periods: OpeningHoursPeriod[];
    weekdayDescriptions: string[];
    secondaryHoursType: string;
  }[];
  currentOpeningHours?: {
    periods: OpeningHoursPeriod[];
    weekdayDescriptions: string[];
  };
  primaryType: string;
  types: string[];
  photos?: {
    name: string;
    widthPx: number;
    heightPx: number;
    authorAttributions: {
      displayName: string;
      uri: string;
      photoUri: string;
    }[];
  }[];
  parkingOptions?: {
    freeParkingLot?: boolean;
    paidParkingLot?: boolean;
    freeStreetParking?: boolean;
    valetParking?: boolean;
    freeGarageParking?: boolean;
    paidGarageParking?: boolean;
  };
  paymentOptions?: {
    acceptsCreditCards?: boolean;
    acceptsDebitCards?: boolean;
    acceptsCashOnly?: boolean;
    acceptsNfc?: boolean;
  };
  accessibilityOptions?: {
    wheelchairAccessibleParking?: boolean;
    wheelchairAccessibleEntrance?: boolean;
    wheelchairAccessibleRestroom?: boolean;
    wheelchairAccessibleSeating?: boolean;
  };
  dineInOptions?: {
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
  };
  editorialSummary?: {
    text: string;
    languageCode: string;
  };
  priceLevel?:
    | "PRICE_LEVEL_FREE"
    | "PRICE_LEVEL_INEXPENSIVE"
    | "PRICE_LEVEL_MODERATE"
    | "PRICE_LEVEL_EXPENSIVE"
    | "PRICE_LEVEL_VERY_EXPENSIVE";
  reviews?: {
    name: string;
    relativePublishTimeDescription: string;
    rating: number;
    text: {
      text: string;
      languageCode: string;
    };
    authorAttribution: {
      displayName: string;
      uri: string;
      photoUri: string;
    };
  }[];
  allowsDogs?: boolean;
  hasRestroom?: boolean;
}

interface OpeningHoursPeriod {
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

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

export interface GooglePlaceDetails {
  // Basic information
  place_id: string;
  name: string;
  formatted_address: string;

  // Address components
  address_components: AddressComponent[];
  adr_address?: string;

  // Business status
  business_status?: string;
  permanently_closed?: boolean;

  // Geometry and location
  geometry: GooglePlaceGeometry;

  // Icons
  icon?: string;
  icon_background_color?: string;
  icon_mask_base_uri?: string;

  // Photos
  photos?: GooglePlacePhoto[];

  // Location codes and types
  plus_code?: PlusCode;
  types?: string[];
  url?: string;
  utc_offset?: number;
  vicinity?: string;

  // Contact information
  formatted_phone_number?: string;
  international_phone_number?: string;
  website?: string;

  // Opening hours
  opening_hours?: OpeningHours;

  // Ratings and reviews
  price_level?: number;
  rating?: number;
  user_ratings_total?: number;
  reviews?: GooglePlaceReview[];

  // Accessibility
  wheelchair_accessible_entrance?: boolean;
}

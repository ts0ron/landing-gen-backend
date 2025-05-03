import { PlacesClient } from "@googlemaps/places";
import type { google } from "@googlemaps/places/build/protos/protos";
import { config } from "../config/env.config";
import { logger } from "../utils/logger";

type SearchTextRequest = google.maps.places.v1.ISearchTextRequest;
type SearchTextResponse = google.maps.places.v1.ISearchTextResponse;
type GetPlaceRequest = google.maps.places.v1.IGetPlaceRequest;
export type GooglePlace = google.maps.places.v1.IPlace;
type GetPhotoMediaRequest = google.maps.places.v1.IGetPhotoMediaRequest;
type PhotoMedia = google.maps.places.v1.IPhotoMedia;
type SearchNearbyRequest = google.maps.places.v1.ISearchNearbyRequest;
type SearchNearbyResponse = google.maps.places.v1.ISearchNearbyResponse;

/**
 * Google Maps Service
 * Handles all interactions with Google Places API (New)
 */
export class GoogleMapsService {
  private static instance: GoogleMapsService;
  private client: PlacesClient;

  constructor() {
    this.client = new PlacesClient({
      apiKey: config.GOOGLE_MAPS_API_KEY,
    });
    logger.info("GoogleMapsService initialized");
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): GoogleMapsService {
    if (!GoogleMapsService.instance) {
      GoogleMapsService.instance = new GoogleMapsService();
    }
    return GoogleMapsService.instance;
  }

  /**
   * Get place details by place ID
   */
  async getPlace(placeId: string): Promise<GooglePlace> {
    try {
      logger.info(`Fetching place details for ID: ${placeId}`);

      const request: GetPlaceRequest = {
        name: `places/${placeId}`,
      };

      const [response] = await this.client.getPlace(request, {
        otherArgs: {
          headers: {
            "X-Goog-FieldMask": "*",
          },
        },
      });

      if (!response) {
        throw new Error(`No place found for ID: ${placeId}`);
      }

      return response;
    } catch (error) {
      logger.error("Error fetching place details:", error);
      throw error;
    }
  }

  /**
   * Search for places by text query
   */
  async searchEntities(query: string): Promise<GooglePlace[]> {
    try {
      logger.info(`Searching places with query: ${query}`);

      const response = await this.client.searchText(
        {
          textQuery: query || "",
          languageCode: "en",
        },
        { otherArgs: { headers: { "X-Goog-FieldMask": "*" } } }
      );

      return response[0].places || [];
    } catch (error) {
      logger.error("Error searching places:", error);
      throw error;
    }
  }

  /**
   * Get nearby places
   */
  async getNearbyPlaces(
    lat: number,
    lng: number,
    radius: number,
    type?: string
  ): Promise<GooglePlace[]> {
    try {
      logger.info(
        `Fetching nearby places at ${lat},${lng} with radius ${radius}`
      );

      const request: SearchNearbyRequest = {
        locationRestriction: {
          circle: {
            center: { latitude: lat, longitude: lng },
            radius: radius,
          },
        },
        languageCode: "en",
      };

      // Add type filtering if specified
      if (type) {
        request.includedPrimaryTypes = [type];
      }

      const response = await this.client.searchNearby(request, {
        otherArgs: { headers: { "X-Goog-FieldMask": "*" } },
      });

      return response[0].places || [];
    } catch (error) {
      logger.error("Error fetching nearby places:", error);
      throw error;
    }
  }

  /**
   * Get photo URL for a place photo
   */
  async getPhotoUrl(
    photoName: string,
    maxWidth: number = 400
  ): Promise<string> {
    try {
      if (!photoName) {
        throw new Error("Photo name is required");
      }

      // Extract the photo reference from the photo name
      // Photo name format is typically: places/{place_id}/photos/{photo_reference}
      const photoReference = photoName.split("/").pop();

      if (!photoReference) {
        throw new Error("Invalid photo name format");
      }

      // Use the Places API client's authentication
      const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photo_reference=${photoReference}`;

      return photoUrl;
    } catch (error) {
      logger.error("Error generating photo URL:", error);
      throw error;
    }
  }
}

export const googleMapsService = new GoogleMapsService();

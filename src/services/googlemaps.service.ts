import {
  Client,
  PlaceInputType,
  Place,
} from "@googlemaps/google-maps-services-js";
import { config } from "../config/env.config";
import { logger } from "../utils/logger";
import { IPlace } from "../models/place.model";

/**
 * Google Maps Service
 * Handles all interactions with Google Places API
 */
export class GoogleMapsService {
  private static instance: GoogleMapsService;
  private client: Client;

  private constructor() {
    this.client = new Client({});
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
   * Get place details by ID
   * @param placeId - Google Place ID
   */
  async getEntity(placeId: string): Promise<Partial<IPlace>> {
    try {
      logger.debug(`Fetching place details for ID: ${placeId}`);

      const response = await this.client.placeDetails({
        params: {
          place_id: placeId,
          key: config.GOOGLE_MAPS_API_KEY,
          fields: [
            "place_id",
            "name",
            "formatted_address",
            "geometry",
            "photos",
            "types",
            "rating",
            "user_ratings_total",
          ],
        },
      });

      const place = response.data.result;

      if (!place.geometry?.location) {
        throw new Error("Place geometry or location is missing");
      }

      // Transform Google Places data to our schema
      const transformedPlace: Partial<IPlace> = {
        placeId: place.place_id || placeId,
        name: place.name || "",
        formattedAddress: place.formatted_address || "",
        geometry: {
          location: {
            lat: place.geometry.location.lat,
            lng: place.geometry.location.lng,
          },
        },
        photos:
          place.photos?.map((photo) => ({
            photoReference: photo.photo_reference || "",
            height: photo.height || 0,
            width: photo.width || 0,
          })) || [],
        types: place.types || [],
        rating: place.rating,
        userRatingsTotal: place.user_ratings_total,
      };

      logger.debug(`Place details fetched successfully: ${placeId}`);
      return transformedPlace;
    } catch (error) {
      logger.error(
        `Failed to fetch place details: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      throw error;
    }
  }

  /**
   * Search for places by text query
   * @param query - Search query
   */
  async searchEntities(query: string): Promise<Partial<IPlace>[]> {
    try {
      logger.debug(`Searching places with query: ${query}`);

      const response = await this.client.findPlaceFromText({
        params: {
          input: query,
          inputtype: PlaceInputType.textQuery,
          key: config.GOOGLE_MAPS_API_KEY,
          fields: ["place_id"],
        },
      });

      const validCandidates = response.data.candidates.filter(
        (candidate): candidate is Place & { place_id: string } => {
          if (!candidate.place_id) {
            logger.warn("Found a place without place_id, skipping");
            return false;
          }
          return true;
        }
      );

      const places = await Promise.all(
        validCandidates.map((candidate) => this.getEntity(candidate.place_id))
      );

      logger.debug(`Found ${places.length} places matching query`);
      return places;
    } catch (error) {
      logger.error(
        `Failed to search places: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      throw error;
    }
  }

  /**
   * Get places near a location
   * @param lat - Latitude
   * @param lng - Longitude
   * @param radius - Search radius in meters
   * @param type - Optional place type filter
   */
  async getNearbyPlaces(
    lat: number,
    lng: number,
    radius: number = 1000,
    type?: string
  ): Promise<Partial<IPlace>[]> {
    try {
      logger.debug(`Finding places near [${lat}, ${lng}] within ${radius}m`);

      const response = await this.client.placesNearby({
        params: {
          location: { lat, lng },
          radius,
          ...(type && { type }),
          key: config.GOOGLE_MAPS_API_KEY,
        },
      });

      const validResults = response.data.results.filter(
        (result): result is Place & { place_id: string } => {
          if (!result.place_id) {
            logger.warn("Found a place without place_id, skipping");
            return false;
          }
          return true;
        }
      );

      const places = await Promise.all(
        validResults.map((result) => this.getEntity(result.place_id))
      );

      logger.debug(`Found ${places.length} nearby places`);
      return places;
    } catch (error) {
      logger.error(
        `Failed to fetch nearby places: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      throw error;
    }
  }

  /**
   * Get photo URL for a photo reference
   * @param photoReference - Google Places photo reference
   * @param maxWidth - Maximum width of the photo
   */
  getPhotoUrl(photoReference: string, maxWidth: number = 800): string {
    return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photoreference=${photoReference}&key=${config.GOOGLE_MAPS_API_KEY}`;
  }
}

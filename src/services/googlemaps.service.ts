import {
  Client,
  PlaceInputType,
  Place,
} from "@googlemaps/google-maps-services-js";
import { config } from "../config/env.config";
import { logger } from "../utils/logger";
import { IPlace } from "../models/place.model";
import { PlaceMapper } from "../mappers/place.mapper";

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
            "address_component",
            "adr_address",
            "business_status",
            "formatted_address",
            "geometry",
            "icon",
            "icon_background_color",
            "icon_mask_base_uri",
            "name",
            "permanently_closed",
            "photo",
            "place_id",
            "plus_code",
            "type",
            "url",
            "utc_offset",
            "vicinity",
            "formatted_phone_number",
            "international_phone_number",
            "opening_hours",
            "website",
            "price_level",
            "rating",
            "review",
            "user_ratings_total",
            "wheelchair_accessible_entrance",
          ],
        },
      });

      const place = response.data.result;
      console.log("place fetched by googleService", place);

      return await PlaceMapper.toPlace(place, placeId, this);
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
    return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photoreference=${photoReference}`;
  }
}

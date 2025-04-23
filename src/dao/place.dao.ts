import { MongoDataAccessObject } from "./mongo.dao";
import { IPlace, Place } from "../models/place.model";
import { logger } from "../utils/logger";

/**
 * Place Data Access Object
 * Handles all database operations for places
 */
export class PlaceDAO extends MongoDataAccessObject<IPlace> {
  private static instance: PlaceDAO;

  private constructor() {
    super(Place);
    logger.info("PlaceDAO initialized");
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): PlaceDAO {
    if (!PlaceDAO.instance) {
      PlaceDAO.instance = new PlaceDAO();
    }
    return PlaceDAO.instance;
  }

  /**
   * Find a place by Google Place ID
   * @param placeId - Google Place ID
   */
  async findByPlaceId(placeId: string): Promise<IPlace | null> {
    logger.debug(`Finding place by ID: ${placeId}`);
    return this.findOne({ placeId });
  }

  /**
   * Find places near a location
   * @param lat - Latitude
   * @param lng - Longitude
   * @param radius - Search radius in meters
   * @param type - Optional place type filter
   */
  async findNearby(
    lat: number,
    lng: number,
    radius: number,
    type?: string
  ): Promise<IPlace[]> {
    logger.debug(`Finding places near [${lat}, ${lng}] within ${radius}m`);

    const query: any = {
      "geometry.location": {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [lng, lat],
          },
          $maxDistance: radius,
        },
      },
    };

    if (type) {
      query.types = type;
    }

    const places = await this.model.find(query);
    logger.debug(`Found ${places.length} nearby places`);
    return places;
  }

  /**
   * Search places by text query
   * @param query - Search query
   */
  async searchPlaces(query: string): Promise<IPlace[]> {
    logger.debug(`Searching places with query: ${query}`);

    const places = await this.model.find({
      $text: { $search: query },
    });

    logger.debug(`Found ${places.length} places matching query`);
    return places;
  }

  /**
   * Create a new place with validation
   * @param placeData - Place data to create
   */
  async createPlace(placeData: Partial<IPlace>): Promise<IPlace> {
    logger.debug("Creating new place:", { placeId: placeData.placeId });

    // Check if place already exists
    const existingPlace = await this.findByPlaceId(placeData.placeId!);
    if (existingPlace) {
      logger.warn(
        `Place creation failed: ID ${placeData.placeId} already exists`
      );
      throw new Error("Place already registered");
    }

    // Create place
    const place = await this.create(placeData);
    logger.info(`Place created with ID: ${place._id}`);
    return place;
  }

  /**
   * Update place photos
   * @param placeId - Google Place ID
   * @param photos - Updated photos array
   */
  async updatePhotos(
    placeId: string,
    photos: IPlace["photos"]
  ): Promise<IPlace | null> {
    logger.debug(`Updating photos for place: ${placeId}`);

    const place = await this.model.findOneAndUpdate(
      { placeId },
      { $set: { photos } },
      { new: true }
    );

    if (place) {
      logger.info(`Photos updated for place: ${placeId}`);
    } else {
      logger.warn(`Photo update failed: Place ${placeId} not found`);
    }

    return place;
  }
}

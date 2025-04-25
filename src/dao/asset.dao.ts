import { IAsset, Asset } from "../models/asset.model";
import { MongoDataAccessObject } from "./mongo.dao";
import { logger } from "../utils/logger";
import { FilterQuery } from "mongoose";

/**
 * Data Access Object for Asset entities
 */
export class AssetDAO extends MongoDataAccessObject<IAsset> {
  private static instance: AssetDAO;

  constructor() {
    super(Asset);
  }

  public static getInstance(): AssetDAO {
    if (!AssetDAO.instance) {
      AssetDAO.instance = new AssetDAO();
    }
    return AssetDAO.instance;
  }

  // TODO: Change the name of the function to findByExternalId
  // This will allow to make this entire structure of data more flexible and reusable
  // Each Asset will have a unique externalId that can be used to find it
  // Also it will hold a type (currently only placeId is used) so no type is saved.
  // the Pair<externalId, type> will be unique for each asset and will be used to find it.
  /**
   * Find an asset by its Google Place ID
   * @param placeId - Google Place ID
   * @returns Promise resolving to the asset or null if not found
   */
  async findByPlaceId(placeId: string): Promise<IAsset | null> {
    try {
      return await this.model.findOne({ placeId });
    } catch (error) {
      logger.error("Error finding asset by place ID:", error);
      throw error;
    }
  }

  /**
   * Find assets near a location
   * @param lat - Latitude
   * @param lng - Longitude
   * @param radius - Search radius in meters
   * @param type - Optional place type to filter by
   * @returns Promise resolving to array of assets
   */
  async findNearby(
    lat: number,
    lng: number,
    radius: number,
    type?: string
  ): Promise<IAsset[]> {
    try {
      const query: FilterQuery<IAsset> = {
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

      return await this.model.find(query);
    } catch (error) {
      logger.error("Error finding nearby assets:", error);
      throw error;
    }
  }

  /**
   * Search assets by text query
   * @param query - Search query
   * @returns Promise resolving to array of assets
   */
  async searchAssets(query: string): Promise<IAsset[]> {
    try {
      return await this.model.find({
        $text: { $search: query },
      });
    } catch (error) {
      logger.error("Error searching assets:", error);
      throw error;
    }
  }

  /**
   * Create a new asset
   * @param assetData - Asset data
   * @returns Promise resolving to created asset
   */
  async createAsset(assetData: Partial<IAsset>): Promise<IAsset> {
    try {
      const asset = new this.model(assetData);
      return await asset.save();
    } catch (error) {
      logger.error("Error creating asset:", error);
      throw error;
    }
  }

  /**
   * Update asset photos
   * @param placeId - Google Place ID
   * @param photos - Updated photos array
   * @returns Promise resolving to updated asset or null if not found
   */
  async updatePhotos(
    placeId: string,
    photos: IAsset["photos"]
  ): Promise<IAsset | null> {
    try {
      return await this.model.findOneAndUpdate(
        { placeId },
        { $set: { photos } },
        { new: true }
      );
    } catch (error) {
      logger.error("Error updating asset photos:", error);
      throw error;
    }
  }
}

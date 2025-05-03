import { IAsset, Asset, IAssetPhoto } from "../models/asset.model";
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

  /**
   * Find an asset by its external ID
   * @param externalId - External ID of the asset
   * @returns Promise resolving to the asset or null if not found
   */
  async findByExternalId(externalId: string): Promise<IAsset | null> {
    try {
      return await this.model.findOne({ externalId });
    } catch (error) {
      logger.error("Error finding asset by external ID:", error);
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
        location: {
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
   * @param externalId - External ID of the asset
   * @param photos - Updated photos array
   * @returns Promise resolving to updated asset or null if not found
   */
  async updatePhotos(
    externalId: string,
    photos: IAssetPhoto[]
  ): Promise<IAsset | null> {
    try {
      return await this.model.findOneAndUpdate(
        { externalId },
        { $set: { photos } },
        { new: true }
      );
    } catch (error) {
      logger.error("Error updating asset photos:", error);
      throw error;
    }
  }
}

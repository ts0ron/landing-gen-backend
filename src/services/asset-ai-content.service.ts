import { logger } from "../utils/logger";
import { OpenAIService } from "./openai.service";
import { IAsset, Category } from "../models/asset.model";

/**
 * Service for generating AI content for assets
 */
export class AssetAiContentService {
  private static instance: AssetAiContentService;
  private openAiService: OpenAIService;

  private constructor() {
    this.openAiService = OpenAIService.getInstance();
    logger.info("AssetAiContentService initialized");
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): AssetAiContentService {
    if (!AssetAiContentService.instance) {
      AssetAiContentService.instance = new AssetAiContentService();
    }
    return AssetAiContentService.instance;
  }

  /**
   * Generate a summary description for an asset
   * @param asset - Asset to generate summary for
   * @returns Generated summary description
   */
  async generateAssetSummary(asset: IAsset): Promise<string> {
    try {
      logger.debug("Generating asset summary for:", asset.displayName.text);

      const description = await this.openAiService.generateAssetDescription(
        asset
      );

      logger.info("Successfully generated asset summary");
      return description;
    } catch (error) {
      logger.error("Failed to generate asset summary:", {
        assetId: asset._id,
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  }

  /**
   * Classify an asset into a category
   * @param asset - Asset to classify
   * @returns The category the asset belongs to
   */
  async classifyCategory(asset: IAsset): Promise<Category> {
    try {
      logger.debug("Classifying asset category for:", asset.displayName.text);

      const category = await this.openAiService.classifyAssetCategory(asset);

      logger.info("Successfully classified asset category");
      return category;
    } catch (error) {
      logger.error("Failed to classify asset category:", {
        assetId: asset._id,
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  }
}

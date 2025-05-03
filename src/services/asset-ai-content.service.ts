import { logger } from "../utils/logger";
import { OpenAIService } from "./openai.service";
import { IAsset } from "../models/asset.model";

export interface AiContent {
  description: string;
  tags: string[];
  landingPage?: string;
}

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
   * Generate AI description and tags for an asset
   * @param asset - Asset to generate content for
   * @returns Generated AI content (description, tags, and optionally landing page)
   */
  async generateAiContent(asset: IAsset): Promise<AiContent> {
    let aiDescription = "";
    let aiTags: string[] = [];
    let aiLandingPage: string | undefined;

    try {
      logger.debug("Generating AI content for asset:", asset.displayName.text);

      // Generate description and tags in parallel
      logger.debug("Requesting AI-generated description and tags");

      // OpenAI implementation
      const [description, tags] = await Promise.all([
        this.openAiService.generateDescription(asset),
        this.openAiService.generateTags(asset),
      ]);

      logger.info("Successfully generated AI content");

      aiDescription = description;
      aiTags = tags;
    } catch (aiError) {
      logger.error("Failed to generate AI content:", {
        assetId: asset._id,
        error: aiError instanceof Error ? aiError.message : "Unknown error",
        stack: aiError instanceof Error ? aiError.stack : undefined,
      });
      // Non-critical error, continue without AI content
    }

    return {
      description: aiDescription,
      tags: aiTags,
      landingPage: aiLandingPage,
    };
  }

  /**
   * Generate a landing page for an asset
   * @param asset - Asset to generate landing page for
   * @returns Generated landing page HTML
   */
  async generateLandingPage(asset: IAsset): Promise<string> {
    try {
      logger.debug(
        "Generating landing page for asset:",
        asset.displayName.text
      );

      const landingPage = await this.openAiService.generateLandingPage(asset);

      logger.info("Successfully generated landing page");
      return landingPage;
    } catch (error) {
      logger.error("Failed to generate landing page:", {
        assetId: asset._id,
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  }
}

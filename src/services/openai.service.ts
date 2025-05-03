import OpenAI from "openai";
import { config } from "../config/env.config";
import { logger } from "../utils/logger";
import { GooglePlaceDetails } from "../models/google-place.model";
import { PromptManager, RequestType } from "../utils/prompts/prompt-manager";
import { IAsset, Category } from "../models/asset.model";
import { ASSET_DESCRIPTION_SYSTEM_PROMPT } from "../utils/prompts/asset-description-system.prompt";
import { ASSET_CATEGORY_SYSTEM_PROMPT } from "../utils/prompts/asset-category-system.prompt";

/**
 * OpenAI Service
 * Handles all interactions with OpenAI API
 */
export class OpenAIService {
  private static instance: OpenAIService;
  private client: OpenAI;
  private openAiModel: string = "gpt-4o";

  private constructor() {
    this.client = new OpenAI({
      apiKey: config.OPENAI_API_KEY,
    });
    this.openAiModel = "gpt-4o-mini";
    logger.info("OpenAIService initialized");
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): OpenAIService {
    if (!OpenAIService.instance) {
      OpenAIService.instance = new OpenAIService();
    }
    return OpenAIService.instance;
  }

  /**
   * Generate a description for a place
   * @param asset - Asset information about the place
   */
  async generateDescription(asset: IAsset): Promise<string> {
    try {
      logger.debug("Generating description for place:", asset.displayName.text);

      const { systemMessage, userMessage } = PromptManager.generatePrompt(
        asset,
        RequestType.DESCRIPTION
      );

      const response = await this.client.chat.completions.create({
        model: this.openAiModel,
        messages: [
          {
            role: "system",
            content: systemMessage,
          },
          {
            role: "user",
            content: userMessage,
          },
        ],
        max_tokens: 150,
        temperature: 0.7,
      });

      const description = response.choices[0]?.message?.content?.trim() || "";
      logger.debug("Description generated successfully");
      return description;
    } catch (error) {
      logger.error(
        `Failed to generate description: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      throw error;
    }
  }

  /**
   * Generate relevant tags for a place
   * @param asset - Asset information about the place
   */
  async generateTags(asset: IAsset): Promise<string[]> {
    try {
      logger.debug("Generating tags for place:", asset.displayName.text);

      const { systemMessage, userMessage } = PromptManager.generatePrompt(
        asset,
        RequestType.TAGS
      );

      const response = await this.client.chat.completions.create({
        model: this.openAiModel,
        messages: [
          {
            role: "system",
            content: systemMessage,
          },
          {
            role: "user",
            content: userMessage,
          },
        ],
        max_tokens: 50,
        temperature: 0.5,
      });

      const tagsString = response.choices[0]?.message?.content?.trim() || "";
      const tags = tagsString
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);

      logger.debug(`Generated ${tags.length} tags`);
      return tags;
    } catch (error) {
      logger.error(
        `Failed to generate tags: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      throw error;
    }
  }

  /**
   * Generate a landing page for a place
   * @param asset - Asset information about the place
   */
  async generateLandingPage(asset: IAsset): Promise<string> {
    try {
      logger.debug(
        "Generating landing page for place:",
        asset.displayName.text
      );

      const { systemMessage, userMessage } = PromptManager.generatePrompt(
        asset,
        RequestType.LANDING_PAGE
      );

      const response = await this.client.chat.completions.create({
        model: this.openAiModel,
        messages: [
          {
            role: "system",
            content: systemMessage,
          },
          {
            role: "user",
            content: userMessage,
          },
        ],
        max_tokens: 2000,
        temperature: 0.7,
      });

      const landingPage = response.choices[0]?.message?.content?.trim() || "";
      logger.debug("Landing page generated successfully");
      return landingPage;
    } catch (error) {
      logger.error(
        `Failed to generate landing page: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      throw error;
    }
  }

  /**
   * Generate a description for a place
   * @param asset - Asset information about the place
   */
  async generateAssetDescription(asset: IAsset): Promise<string> {
    try {
      logger.debug("Generating asset description for:", asset.displayName.text);

      const response = await this.client.chat.completions.create({
        model: this.openAiModel,
        messages: [
          {
            role: "system",
            content: ASSET_DESCRIPTION_SYSTEM_PROMPT,
          },
          {
            role: "user",
            content: JSON.stringify(asset),
          },
        ],
        max_tokens: 500,
        temperature: 0.7,
      });

      const description = response.choices[0]?.message?.content?.trim() || "";
      logger.debug("Asset description generated successfully");
      return description;
    } catch (error) {
      logger.error(
        `Failed to generate asset description: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      throw error;
    }
  }

  /**
   * Classify an asset into one of five high-level categories
   * @param asset - Asset information to classify
   * @returns The category the asset belongs to, or "Default" if classification fails
   */
  async classifyAssetCategory(asset: IAsset): Promise<Category> {
    try {
      logger.debug("Classifying asset category for:", asset.displayName.text);

      const response = await this.client.chat.completions.create({
        model: this.openAiModel,
        messages: [
          {
            role: "system",
            content: ASSET_CATEGORY_SYSTEM_PROMPT,
          },
          {
            role: "user",
            content: JSON.stringify(asset),
          },
        ],
        max_tokens: 50,
        temperature: 0.3,
      });

      const category = response.choices[0]?.message?.content?.trim() || "";

      // Validate the category is one of the allowed values
      const validCategories = [
        "Cultural",
        "Entertainment",
        "Commerce",
        "Transportation",
        "PublicServices",
      ] as const;
      if (!validCategories.includes(category as any)) {
        logger.warn(
          `Invalid category returned: ${category}, using Default category`
        );
        return "Default";
      }

      logger.info("Asset category classified successfully");
      return category as Category;
    } catch (error) {
      logger.error(
        `Failed to classify asset category: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      return "Default";
    }
  }
}

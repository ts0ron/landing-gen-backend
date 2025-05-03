import OpenAI from "openai";
import { config } from "../config/env.config";
import { logger } from "../utils/logger";
import { GooglePlaceDetails } from "../models/google-place.model";
import { PromptManager, RequestType } from "../utils/prompts/prompt-manager";
import { IAsset } from "../models/asset.model";

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
}

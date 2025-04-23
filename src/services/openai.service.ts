import OpenAI from "openai";
import { config } from "../config/env.config";
import { logger } from "../utils/logger";

/**
 * OpenAI Service
 * Handles all interactions with OpenAI API
 */
export class OpenAIService {
  private static instance: OpenAIService;
  private client: OpenAI;

  private constructor() {
    this.client = new OpenAI({
      apiKey: config.OPENAI_API_KEY,
    });
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
   * @param placeInfo - Basic information about the place
   */
  async generateDescription(placeInfo: string): Promise<string> {
    try {
      logger.debug("Generating description for place:", placeInfo);

      const response = await this.client.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant that generates engaging and informative descriptions for places. Keep the descriptions concise but descriptive, highlighting key features and appeal.",
          },
          {
            role: "user",
            content: `Please generate a brief description for the following place: ${placeInfo}`,
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
   * @param placeInfo - Basic information about the place
   */
  async generateTags(placeInfo: string): Promise<string[]> {
    try {
      logger.debug("Generating tags for place:", placeInfo);

      const response = await this.client.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant that generates relevant tags for places. Generate 5-10 tags that describe the place, its features, and target audience. Return only the tags separated by commas, without any additional text.",
          },
          {
            role: "user",
            content: `Please generate tags for the following place: ${placeInfo}`,
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
}

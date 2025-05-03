import axios from "axios";
import { logger } from "../utils/logger";
import { config } from "../config";

interface DeepSeekCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    text: string;
    index: number;
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
    prompt_cache_hit_tokens: number;
    prompt_cache_miss_tokens: number;
  };
}

interface CompletionOptions {
  temperature?: number;
  max_tokens?: number;
  model?: string;
}

interface PlaceDetails {
  name: string;
  types?: string[];
  formatted_address: string;
}

interface AiContent {
  description: string;
  tags: string[];
}

/**
 * Service for interacting with DeepSeek's AI models
 */
export class DeepSeekService {
  private static instance: DeepSeekService;
  private readonly apiKey: string;
  private readonly baseURL: string = "https://api.deepseek.com/v1";
  private readonly defaultModel: string = "deepseek-v3";

  private constructor() {
    this.apiKey = config.DEEPSEEK_API_KEY;
    if (!this.apiKey) {
      throw new Error("DEEPSEEK_API_KEY is not configured");
    }
    logger.info("DeepSeekService initialized");
  }

  /**
   * Get the singleton instance of DeepSeekService
   */
  public static getInstance(): DeepSeekService {
    if (!DeepSeekService.instance) {
      DeepSeekService.instance = new DeepSeekService();
    }
    return DeepSeekService.instance;
  }

  /**
   * Generate AI content (description and tags) for a place
   * @param placeDetails - Basic place information
   * @returns Promise resolving to generated description and tags
   */
  async generateAiContent(placeDetails: PlaceDetails): Promise<AiContent> {
    try {
      logger.debug("Generating AI content for place");
      const placeDescription = `${placeDetails.name} is a ${
        placeDetails.types?.join(", ") || "place"
      } located at ${placeDetails.formatted_address}`;

      // Generate description and tags in parallel
      logger.debug("Requesting AI-generated description and tags");
      const [description, tags] = await Promise.all([
        this.generateDescription(placeDescription),
        this.generateTags(placeDescription),
      ]);
      logger.info("Successfully generated AI content");

      return {
        description,
        tags,
      };
    } catch (error) {
      logger.error("Failed to generate AI content:", {
        placeName: placeDetails.name,
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      });
      // Return empty content on error
      return {
        description: "",
        tags: [],
      };
    }
  }

  /**
   * Generate a description for a place
   * @param placeDescription - Basic place description
   * @returns Promise resolving to generated description
   */
  private async generateDescription(placeDescription: string): Promise<string> {
    const prompt = `Generate a detailed, engaging description for the following place. Make it informative and appealing to potential visitors: "${placeDescription}"`;

    return this.generateCompletion(prompt, {
      temperature: 0.7,
      max_tokens: 200,
    });
  }

  /**
   * Generate relevant tags for a place
   * @param placeDescription - Basic place description
   * @returns Promise resolving to array of tags
   */
  private async generateTags(placeDescription: string): Promise<string[]> {
    const prompt = `Generate a list of relevant tags (keywords) for the following place. Return them as a comma-separated list: "${placeDescription}"`;

    const completion = await this.generateCompletion(prompt, {
      temperature: 0.6,
      max_tokens: 100,
    });

    return completion
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);
  }

  /**
   * Generate text completion using DeepSeek API
   * @param prompt - The input prompt for text completion
   * @param options - Optional parameters for the completion request
   * @returns Promise resolving to the generated text
   */
  async generateCompletion(
    prompt: string,
    options: CompletionOptions = {}
  ): Promise<string> {
    try {
      logger.debug("Generating completion with DeepSeek:", {
        prompt: prompt.substring(0, 100) + "...",
        options,
      });

      const response = await axios.post<DeepSeekCompletionResponse>(
        `${this.baseURL}/completions`,
        {
          model: options.model || this.defaultModel,
          prompt,
          temperature: options.temperature || 0.7,
          max_tokens: options.max_tokens || 1000,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      const completion = response.data.choices[0]?.text || "";

      // Log usage statistics for monitoring
      logger.debug("DeepSeek API usage:", {
        totalTokens: response.data.usage.total_tokens,
        cacheHitTokens: response.data.usage.prompt_cache_hit_tokens,
        cacheMissTokens: response.data.usage.prompt_cache_miss_tokens,
      });

      return completion;
    } catch (error) {
      logger.error("Error generating completion with DeepSeek:", {
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw new Error(
        `Failed to generate completion: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Calculate the estimated cost of a completion request based on token usage
   * @param usage - Token usage statistics
   * @returns Estimated cost in USD
   */
  private calculateCost(usage: DeepSeekCompletionResponse["usage"]): number {
    // Prices as of Feb 8, 2024
    const CACHE_MISS_PRICE = 0.27 / 1_000_000; // $0.27 per million tokens
    const CACHE_HIT_PRICE = 0.07 / 1_000_000; // $0.07 per million tokens
    const OUTPUT_PRICE = 1.1 / 1_000_000; // $1.10 per million tokens

    return (
      usage.prompt_cache_miss_tokens * CACHE_MISS_PRICE +
      usage.prompt_cache_hit_tokens * CACHE_HIT_PRICE +
      usage.completion_tokens * OUTPUT_PRICE
    );
  }
}

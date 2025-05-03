import axios from "axios";
import { logger } from "../utils/logger";
import { config } from "../config";

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface OllamaChatResponse {
  model: string;
  message: {
    role: "assistant";
    content: string;
  };
  done: boolean;
}

interface ChatOptions {
  model?: string;
  temperature?: number;
  system?: string;
}

/**
 * Service for interacting with local Ollama instance
 */
export class OllamaService {
  private static instance: OllamaService;
  private readonly baseURL: string;
  private readonly defaultModel: string = "llama2";

  private constructor() {
    this.baseURL = config.OLLAMA_API_URL || "http://localhost:11434/api";
    logger.info("OllamaService initialized");
  }

  /**
   * Get the singleton instance of OllamaService
   */
  public static getInstance(): OllamaService {
    if (!OllamaService.instance) {
      OllamaService.instance = new OllamaService();
    }
    return OllamaService.instance;
  }

  /**
   * Generate a chat completion using Ollama
   * @param messages - Array of chat messages
   * @param options - Optional parameters for the chat request
   * @returns Promise resolving to the assistant's response
   */
  async generateChatCompletion(
    messages: ChatMessage[],
    options: ChatOptions = {}
  ): Promise<string> {
    try {
      logger.debug("Generating chat completion with Ollama:", {
        model: options.model || this.defaultModel,
        messageCount: messages.length,
      });

      // Add system message if provided
      if (options.system) {
        messages.unshift({
          role: "system",
          content: options.system,
        });
      }

      const response = await axios.post<OllamaChatResponse>(
        `${this.baseURL}/chat`,
        {
          model: options.model || this.defaultModel,
          messages,
          ...(options.temperature && { temperature: options.temperature }),
        }
      );

      logger.debug("Response was received from Ollama:", response.data);

      const completion = response.data.message.content;
      logger.debug("Successfully generated chat completion");

      return completion;
    } catch (error) {
      logger.error("Error generating chat completion with Ollama:", {
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw new Error(
        `Failed to generate chat completion: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Generate a description for a place using Ollama
   * @param placeDescription - Basic place description
   * @returns Promise resolving to generated description
   */
  async generateDescription(placeDescription: string): Promise<string> {
    const messages: ChatMessage[] = [
      {
        role: "user",
        content: `Generate a detailed, engaging description for the following place. Make it informative and appealing to potential visitors: "${placeDescription}"`,
      },
    ];

    return this.generateChatCompletion(messages, {
      temperature: 0.7,
      system:
        "You are a skilled content writer specializing in creating engaging place descriptions.",
    });
  }

  /**
   * Generate relevant tags for a place using Ollama
   * @param placeDescription - Basic place description
   * @returns Promise resolving to array of tags
   */
  async generateTags(placeDescription: string): Promise<string[]> {
    const messages: ChatMessage[] = [
      {
        role: "user",
        content: `Generate a list of relevant tags (keywords) for the following place. Return them as a comma-separated list: "${placeDescription}"`,
      },
    ];

    const completion = await this.generateChatCompletion(messages, {
      temperature: 0.6,
      system:
        "You are a skilled content tagger. Return only comma-separated tags without any additional text.",
    });

    return completion
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);
  }
}

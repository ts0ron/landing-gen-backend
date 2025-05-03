import Handlebars, { HelperOptions } from "handlebars";
import { IAsset } from "../../models/asset.model";
import { systemMessage } from "./gplace-system.prompt";
import { userPromptTemplate } from "./gplace-user.prompt";

export enum RequestType {
  DESCRIPTION = "description",
  TAGS = "tags",
  LANDING_PAGE = "landing_page",
}

interface RequestConfig {
  type: RequestType;
  details: string;
}

const REQUEST_CONFIGS: Record<RequestType, RequestConfig> = {
  [RequestType.DESCRIPTION]: {
    type: RequestType.DESCRIPTION,
    details:
      "Please create a compelling and unique description for this place. Focus on its distinctive features, atmosphere, and what makes it special. Include any notable aspects that would interest potential visitors.",
  },
  [RequestType.TAGS]: {
    type: RequestType.TAGS,
    details:
      "Please analyze this place and generate relevant, witty tags that capture its essence. Consider the business type, atmosphere, offerings, and unique characteristics. Include both practical and creative tags.",
  },
  [RequestType.LANDING_PAGE]: {
    type: RequestType.LANDING_PAGE,
    details:
      "Please create a modern, responsive HTML landing page for this place. The design should be visually appealing, mobile-friendly, and effectively showcase the location's key features. Include appropriate styling and a clear call-to-action.",
  },
};

export interface PromptResponse {
  systemMessage: string;
  userMessage: string;
}

type HelperThis = Record<string, unknown>;

export class PromptManager {
  private static template: Handlebars.TemplateDelegate;

  private static initialize() {
    if (!this.template) {
      // Register helpers
      Handlebars.registerHelper(
        "if",
        function (
          this: HelperThis,
          conditional: unknown,
          options: HelperOptions
        ) {
          if (conditional) {
            return options.fn(this);
          }
          return options.inverse(this);
        }
      );

      this.template = Handlebars.compile(userPromptTemplate);
    }
  }

  public static generatePrompt(
    asset: IAsset,
    requestType: RequestType
  ): PromptResponse {
    this.initialize();

    const config = REQUEST_CONFIGS[requestType];
    if (!config) {
      throw new Error(`Unsupported request type: ${requestType}`);
    }

    const context = {
      ...asset,
      requestType: config.type,
      requestDetails: config.details,
    };

    return {
      systemMessage,
      userMessage: this.template(context),
    };
  }

  public static addRequestType(type: string, details: string): void {
    const newType = type as RequestType;
    REQUEST_CONFIGS[newType] = {
      type: newType,
      details,
    };
  }
}

export default PromptManager;

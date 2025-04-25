import express, { Request, Response } from "express";
import { GoogleMapsService } from "../services/googlemaps.service";
import { OpenAIService } from "../services/openai.service";
import { authenticate, requireAdmin } from "../middleware/auth.middleware";
import {
  validateRequest,
  PlaceIdValidator,
} from "../middleware/validation.middleware";
import { logger } from "../utils/logger";
import { AssetDAO } from "../dao/asset.dao";
import { AssetMapper } from "../mappers/asset.mapper";

const router = express.Router();
const assetDao = AssetDAO.getInstance();
const googleMapsService = GoogleMapsService.getInstance();
const openAiService = OpenAIService.getInstance();

/**
 * @swagger
 * /api/gplaces/register:
 *   post:
 *     summary: Register a new place
 *     tags: [Places]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - placeId
 *             properties:
 *               placeId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Place registered successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Not authenticated
 *       409:
 *         description: Place already registered
 */
router.post(
  "/register",
  authenticate,
  validateRequest(new PlaceIdValidator()),
  async (req: Request, res: Response) => {
    const { placeId } = req.body;
    logger.info(`Starting place registration process for ID: ${placeId}`);
    logger.debug("Registration request by user:", req.user?.id);

    try {
      // Check if place already exists
      logger.debug("Checking for existing place");
      const existingPlace = await assetDao.findByPlaceId(placeId);
      if (existingPlace) {
        logger.info(`Place already exists: ${placeId}`);
        res.status(200).json({
          place: existingPlace,
        });
        return;
      }

      // Fetch place details from Google Maps
      logger.debug("Fetching place details from Google Maps API");
      const placeDetails = await googleMapsService.getPlace(placeId);
      logger.info("Successfully retrieved place details from Google Maps");

      let aiDescription = "";
      let aiTags: string[] = [];
      // Generate AI content
      try {
        logger.debug("Generating AI content for place");
        const placeDescription = `${
          placeDetails.name
        } is a ${placeDetails.types?.join(", ")} located at ${
          placeDetails.formatted_address
        }`;

        // Generate description and tags in parallel
        logger.debug("Requesting AI-generated description and tags");
        const [description, tags] = await Promise.all([
          openAiService.generateDescription(placeDescription),
          openAiService.generateTags(placeDescription),
        ]);
        logger.info("Successfully generated AI content");

        aiDescription = description;
        aiTags = tags;
      } catch (aiError) {
        logger.error("Failed to generate AI content:", {
          placeId,
          error: aiError instanceof Error ? aiError.message : "Unknown error",
          stack: aiError instanceof Error ? aiError.stack : undefined,
        });
        // Non-critical error, continue without AI content
      }

      // Create place in database
      logger.debug("Creating place in database");
      const place = await assetDao.createAsset(
        AssetMapper.toAsset(
          placeDetails,
          aiDescription,
          aiTags,
          googleMapsService
        )
      );
      logger.info(`Place created in database with ID: ${place._id}`);

      res.status(201).json(place);
    } catch (error) {
      logger.error("Place registration failed:", {
        placeId,
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      });
      res.status(500).json({ error: "Failed to register place" });
    }
  }
);

export default router;

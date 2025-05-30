import express, { Request, Response } from "express";
import { GoogleMapsService } from "../services/googlemaps.service";
import { authenticate } from "../middleware/auth.middleware";
import {
  validateRequest,
  PlaceIdValidator,
} from "../middleware/validation.middleware";
import { logger } from "../utils/logger";
import { AssetDAO } from "../dao/asset.dao";
import { AssetMapper } from "../mappers/asset.mapper";

import { AssetAiContentService } from "../services/asset-ai-content.service";

const router = express.Router();
const assetDao = AssetDAO.getInstance();
const googleMapsService = GoogleMapsService.getInstance();
const assetAiContentService = AssetAiContentService.getInstance();

/**
 * @swagger
 * /api/gplaces/register:
 *   post:
 *     summary: Register a new place
 *     tags: [Google Places]
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

    if (!placeId) {
      return res.status(400).json({ error: "Place ID is required" });
    }

    logger.info("Processing place:", { placeId });

    try {
      // Check if place already exists
      const existingPlace = await assetDao.findByExternalId(placeId);
      if (existingPlace) {
        return res.status(200).json(existingPlace);
      }

      // Fetch place details from Google Maps
      const placeDetails = await googleMapsService.getPlace(placeId);
      if (!placeDetails) {
        return res.status(404).json({ error: "Place not found" });
      }

      // Create initial asset without AI content
      const assetData = await AssetMapper.mapGooglePlaceToAsset(
        placeDetails,
        "",
        [],
        undefined,
        googleMapsService
      );
      const initialAsset = await assetDao.createAsset(assetData);

      // Generate AI content using AssetAiContentService
      const [aiDescription, category] = await Promise.all([
        assetAiContentService.generateAssetSummary(initialAsset),
        assetAiContentService.classifyCategory(initialAsset),
      ]);

      // Update asset with AI content
      const updatedAsset = await assetDao.update(initialAsset._id, {
        aiDescription,
        category,
      });

      logger.info("Successfully processed place");
      return res.status(200).json(updatedAsset);
    } catch (error) {
      logger.error("Failed to process place:", {
        placeId,
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      });
      return res.status(500).json({ error: "Failed to process place" });
    }
  }
);

export default router;

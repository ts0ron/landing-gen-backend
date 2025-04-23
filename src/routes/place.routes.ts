import express, { Request, Response } from "express";
import { PlaceDAO } from "../dao/place.dao";
import { GoogleMapsService } from "../services/googlemaps.service";
import { OpenAIService } from "../services/openai.service";
import { authenticate, requireAdmin } from "../middleware/auth.middleware";
import {
  validateRequest,
  PlaceIdValidator,
} from "../middleware/validation.middleware";
import { logger } from "../utils/logger";

const router = express.Router();
const placeDao = PlaceDAO.getInstance();
const googleMapsService = GoogleMapsService.getInstance();
const openAiService = OpenAIService.getInstance();

/**
 * @swagger
 * /api/places/{placeId}:
 *   get:
 *     summary: Get a place by ID
 *     tags: [Places]
 *     parameters:
 *       - in: path
 *         name: placeId
 *         required: true
 *         schema:
 *           type: string
 *         description: Google Place ID
 *     responses:
 *       200:
 *         description: Place data
 *       404:
 *         description: Place not found
 */
router.get("/:placeId", async (req: Request, res: Response) => {
  try {
    const { placeId } = req.params;
    logger.debug(`Fetching place: ${placeId}`);

    const place = await placeDao.findByPlaceId(placeId);
    if (!place) {
      logger.warn(`Place not found: ${placeId}`);
      res.status(404).json({ error: "Place not found" });
      return;
    }

    logger.debug(`Place found: ${placeId}`);
    res.json(place);
  } catch (error) {
    logger.error(
      `Error fetching place: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
    res.status(500).json({ error: "Failed to fetch place" });
  }
});

/**
 * @swagger
 * /api/places/register:
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
    try {
      const { placeId } = req.body;
      logger.debug(`Registering place: ${placeId}`);

      // Check if place already exists
      const existingPlace = await placeDao.findByPlaceId(placeId);
      if (existingPlace) {
        logger.warn(`Place already registered: ${placeId}`);
        res.status(409).json({
          error: "Place already registered",
          place: existingPlace,
        });
        return;
      }

      // Fetch place details from Google Maps
      const placeDetails = await googleMapsService.getEntity(placeId);

      // Create place in database
      const place = await placeDao.createPlace(placeDetails);

      // Generate AI content
      try {
        const placeDescription = `${place.name} is a ${place.types?.join(
          ", "
        )} located at ${place.formattedAddress}`;

        // Generate description and tags in parallel
        const [description, tags] = await Promise.all([
          openAiService.generateDescription(placeDescription),
          openAiService.generateTags(placeDescription),
        ]);

        // Update place with AI content
        await placeDao.update(place._id.toString(), {
          aiDescription: description,
          aiTags: tags,
        });

        // Add AI content to response
        Object.assign(place, { aiDescription: description, aiTags: tags });
      } catch (aiError) {
        logger.error(
          `Failed to generate AI content: ${
            aiError instanceof Error ? aiError.message : "Unknown error"
          }`
        );
        // Non-critical error, continue without AI content
      }

      logger.info(`Place registered successfully: ${placeId}`);
      res.status(201).json(place);
    } catch (error) {
      logger.error(
        `Error registering place: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      res.status(500).json({ error: "Failed to register place" });
    }
  }
);

/**
 * @swagger
 * /api/places/search:
 *   get:
 *     summary: Search for places
 *     tags: [Places]
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         description: Text search query
 *       - in: query
 *         name: lat
 *         schema:
 *           type: number
 *         description: Latitude coordinate
 *       - in: query
 *         name: lng
 *         schema:
 *           type: number
 *         description: Longitude coordinate
 *       - in: query
 *         name: radius
 *         schema:
 *           type: integer
 *         description: Search radius in meters
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Place type filter
 *     responses:
 *       200:
 *         description: List of places
 *       400:
 *         description: Invalid query parameters
 */
router.get("/search", async (req: Request, res: Response) => {
  try {
    const { query, lat, lng, radius, type } = req.query;
    logger.debug("Searching places:", req.query);

    let places = [];

    if (query) {
      // Search by text query
      places = await googleMapsService.searchEntities(query as string);
    } else if (lat && lng) {
      // Search by location
      places = await googleMapsService.getNearbyPlaces(
        parseFloat(lat as string),
        parseFloat(lng as string),
        radius ? parseInt(radius as string) : undefined,
        type as string
      );
    } else {
      logger.warn("Invalid search parameters");
      res.status(400).json({
        error:
          'Invalid search parameters. Provide either "query" or "lat" and "lng"',
      });
      return;
    }

    logger.debug(`Found ${places.length} places`);
    res.json(places);
  } catch (error) {
    logger.error(
      `Error searching places: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
    res.status(500).json({ error: "Failed to search places" });
  }
});

/**
 * @swagger
 * /api/places/{placeId}:
 *   delete:
 *     summary: Delete a place
 *     tags: [Places]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: placeId
 *         required: true
 *         schema:
 *           type: string
 *         description: Google Place ID
 *     responses:
 *       200:
 *         description: Place deleted successfully
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Place not found
 */
router.delete(
  "/:placeId",
  authenticate,
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      const { placeId } = req.params;
      logger.debug(`Deleting place: ${placeId}`);

      const place = await placeDao.findByPlaceId(placeId);
      if (!place) {
        logger.warn(`Place not found: ${placeId}`);
        res.status(404).json({ error: "Place not found" });
        return;
      }

      await placeDao.delete(place._id.toString());
      logger.info(`Place deleted successfully: ${placeId}`);
      res.json({ message: "Place deleted successfully" });
    } catch (error) {
      logger.error(
        `Error deleting place: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      res.status(500).json({ error: "Failed to delete place" });
    }
  }
);

export default router;

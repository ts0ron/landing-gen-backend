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
  const { placeId } = req.params;
  logger.info(`Fetching place details for ID: ${placeId}`);

  try {
    logger.debug("Querying database for place");
    const place = await placeDao.findByPlaceId(placeId);

    if (!place) {
      logger.warn(`Place not found in database: ${placeId}`);
      res.status(404).json({ error: "Place not found" });
      return;
    }

    logger.info(`Successfully retrieved place: ${placeId}`);
    res.json(place);
  } catch (error) {
    logger.error("Error fetching place details:", {
      placeId,
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
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
    const { placeId } = req.body;
    logger.info(`Starting place registration process for ID: ${placeId}`);
    logger.debug("Registration request by user:", req.user?.id);

    try {
      // Check if place already exists
      logger.debug("Checking for existing place");
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
      logger.debug("Fetching place details from Google Maps API");
      const placeDetails = await googleMapsService.getEntity(placeId);
      logger.info("Successfully retrieved place details from Google Maps");

      // Create place in database
      logger.debug("Creating place in database");
      const place = await placeDao.createPlace(placeDetails);
      logger.info(`Place created in database with ID: ${place._id}`);

      // Generate AI content
      try {
        logger.debug("Generating AI content for place");
        const placeDescription = `${place.name} is a ${place.types?.join(
          ", "
        )} located at ${place.formattedAddress}`;

        // Generate description and tags in parallel
        logger.debug("Requesting AI-generated description and tags");
        const [description, tags] = await Promise.all([
          openAiService.generateDescription(placeDescription),
          openAiService.generateTags(placeDescription),
        ]);
        logger.info("Successfully generated AI content");

        // Update place with AI content
        logger.debug("Updating place with AI content");
        const updatedPlace = await placeDao.update(place._id, {
          aiDescription: description,
          aiTags: tags,
        });
        logger.info("Successfully updated place with AI content");

        res.status(201).json(updatedPlace || place);
      } catch (aiError) {
        logger.error("Failed to generate AI content:", {
          placeId,
          error: aiError instanceof Error ? aiError.message : "Unknown error",
          stack: aiError instanceof Error ? aiError.stack : undefined,
        });
        // Non-critical error, continue without AI content
        res.status(201).json(place);
      }
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
  logger.info("Starting place search");
  logger.debug("Search parameters:", req.query);

  try {
    const { query, lat, lng, radius, type } = req.query;
    let places = [];

    if (query) {
      // Search by text query
      logger.debug(`Performing text search with query: ${query}`);
      places = await googleMapsService.searchEntities(query as string);
      logger.info(`Found ${places.length} places matching text query`);
    } else if (lat && lng) {
      // Search by location
      logger.debug(`Performing nearby search at [${lat}, ${lng}]`);
      places = await googleMapsService.getNearbyPlaces(
        parseFloat(lat as string),
        parseFloat(lng as string),
        radius ? parseInt(radius as string) : undefined,
        type as string
      );
      logger.info(`Found ${places.length} nearby places`);
    } else {
      logger.warn("Invalid search parameters provided");
      res.status(400).json({
        error:
          'Invalid search parameters. Provide either "query" or "lat" and "lng"',
      });
      return;
    }

    res.json(places);
  } catch (error) {
    logger.error("Place search failed:", {
      query: req.query,
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
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
    const { placeId } = req.params;
    logger.info(`Starting place deletion process for ID: ${placeId}`);
    logger.debug("Deletion requested by admin:", req.user?.id);

    try {
      logger.debug("Checking if place exists");
      const place = await placeDao.findByPlaceId(placeId);
      if (!place) {
        logger.warn(`Place not found for deletion: ${placeId}`);
        res.status(404).json({ error: "Place not found" });
        return;
      }

      logger.debug("Deleting place from database");
      await placeDao.delete(place._id);
      logger.info(`Place deleted successfully: ${placeId}`);

      res.json({ message: "Place deleted successfully" });
    } catch (error) {
      logger.error("Place deletion failed:", {
        placeId,
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      });
      res.status(500).json({ error: "Failed to delete place" });
    }
  }
);

export default router;

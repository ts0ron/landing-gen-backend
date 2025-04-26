import { Router } from "express";
import { AssetDAO } from "../dao/asset.dao";
import { logger } from "../utils/logger";

const router = Router();
const assetDao = AssetDAO.getInstance();

/**
 * @swagger
 * /api/assets/{placeId}:
 *   get:
 *     summary: Get an asset by its Google Place ID
 *     tags: [Assets]
 *     parameters:
 *       - in: path
 *         name: placeId
 *         required: true
 *         schema:
 *           type: string
 *         description: Google Place ID of the asset
 *     responses:
 *       200:
 *         description: Asset found successfully
 *       404:
 *         description: Asset not found
 *       500:
 *         description: Server error
 */
router.get("/:externalId", async (req, res) => {
  const { externalId } = req.params;
  logger.debug(`Fetching asset with place ID: ${externalId}`);

  try {
    const asset = await assetDao.findByPlaceId(externalId);

    if (!asset) {
      logger.info(`Asset not found for place ID: ${externalId}`);
      return res.status(404).json({ error: "Asset not found" });
    }

    logger.debug(`Asset found: ${asset._id}`);
    res.json(asset);
  } catch (error) {
    logger.error("Error fetching asset:", {
      externalId,
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
    res.status(500).json({ error: "Failed to fetch asset" });
  }
});

export default router;

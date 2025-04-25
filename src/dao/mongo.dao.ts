import { Model, Document } from "mongoose";
import { DataAccessObject } from "../interfaces/dao.interface";
import { logger } from "../utils/logger";

/**
 * Base MongoDB Data Access Object implementation
 * Provides common CRUD operations for MongoDB documents
 */
export abstract class MongoDataAccessObject<T extends Document>
  implements DataAccessObject<T>
{
  protected constructor(protected model: Model<T>) {
    logger.debug(
      `MongoDataAccessObject initialized for model: ${model.modelName}`
    );
  }

  async create(data: Partial<T>): Promise<T> {
    logger.debug("Creating document:", data);
    const document = new this.model(data);
    const result = await document.save();
    logger.info(`Document created with ID: ${result._id}`);
    return result;
  }

  async findById(id: string): Promise<T | null> {
    logger.debug(`Finding document by ID: ${id}`);
    const document = await this.model.findById(id);
    if (!document) {
      logger.debug(`No document found with ID: ${id}`);
    }
    return document;
  }

  async findOne(filter: Partial<T>): Promise<T | null> {
    logger.debug("Finding one document with filter:", filter);
    const document = await this.model.findOne(filter as any);
    if (!document) {
      logger.debug("No document found matching filter");
    }
    return document;
  }

  async find(filter: Partial<T>): Promise<T[]> {
    logger.debug("Finding documents with filter:", filter);
    const documents = await this.model.find(filter as any);
    logger.debug(`Found ${documents.length} documents`);
    return documents;
  }

  async update(id: string, data: Partial<T>): Promise<T | null> {
    logger.debug(`Updating document ${id} with data:`, data);
    const document = await this.model.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true }
    );
    if (!document) {
      logger.debug(`No document found with ID: ${id}`);
    } else {
      logger.info(`Document ${id} updated successfully`);
    }
    return document;
  }

  async updateByPlacelId(id: string, data: Partial<T>): Promise<T | null> {
    logger.debug(`Updating document ${id} with data:`, data);
    const document = await this.model.findByIdAndUpdate(
      { placeId: id },
      { $set: data },
      { new: true }
    );
    if (!document) {
      logger.debug(`No document found with ID: ${id}`);
    } else {
      logger.info(`Document ${id} updated successfully`);
    }
    return document;
  }

  async delete(id: string): Promise<T | null> {
    logger.debug(`Deleting document: ${id}`);
    const document = await this.model.findByIdAndDelete(id);
    if (!document) {
      logger.debug(`No document found with ID: ${id}`);
    } else {
      logger.info(`Document ${id} deleted successfully`);
    }
    return document;
  }
}

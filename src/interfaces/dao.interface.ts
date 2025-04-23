import { Document } from "mongoose";

/**
 * Base Data Access Object interface
 * Defines common CRUD operations for MongoDB documents
 */
export interface DataAccessObject<T extends Document> {
  create(data: Partial<T>): Promise<T>;
  findById(id: string): Promise<T | null>;
  findOne(filter: Partial<T>): Promise<T | null>;
  find(filter: Partial<T>): Promise<T[]>;
  update(id: string, data: Partial<T>): Promise<T | null>;
  delete(id: string): Promise<T | null>;
}

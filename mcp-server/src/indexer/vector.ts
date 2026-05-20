/**
 * Vector store module for semantic search
 *
 * This module provides an in-memory vector store with similarity search
 * capabilities using cosine similarity.
 */

import { EmbeddingVector } from './embeddings';

/**
 * Vector store for managing and searching embeddings
 */
export class VectorStore {
  /** Map of vector ID to embedding vector */
  private vectors: Map<string, EmbeddingVector>;

  constructor() {
    this.vectors = new Map();
  }

  /**
   * Adds vectors to the store
   *
   * @param vectors - Array of embedding vectors to add
   */
  addVectors(vectors: EmbeddingVector[]): void {
    for (const vector of vectors) {
      this.vectors.set(vector.id, vector);
    }
  }

  /**
   * Performs similarity search using cosine similarity
   *
   * @param query - Query text to search for
   * @param limit - Maximum number of results to return (default: 5)
   * @returns Array of search results with id, score, and metadata
   */
  search(
    query: string,
    limit: number = 5
  ): Array<{ id: string; score: number; metadata: any }> {
    if (this.vectors.size === 0) {
      return [];
    }

    // Generate embedding for the query
    const queryVector = this.generateQueryEmbedding(query);

    // Calculate similarity scores for all vectors
    const results: Array<{ id: string; score: number; metadata: any }> = [];

    for (const [id, vector] of this.vectors.entries()) {
      const score = this.cosineSimilarity(queryVector, vector.vector);
      results.push({
        id,
        score,
        metadata: vector.metadata,
      });
    }

    // Sort by score (descending) and return top results
    results.sort((a, b) => b.score - a.score);
    return results.slice(0, limit);
  }

  /**
   * Retrieves a vector by its ID
   *
   * @param id - ID of the vector to retrieve
   * @returns The embedding vector if found, undefined otherwise
   */
  getById(id: string): EmbeddingVector | undefined {
    return this.vectors.get(id);
  }

  /**
   * Clears all vectors from the store
   */
  clear(): void {
    this.vectors.clear();
  }

  /**
   * Returns the number of vectors in the store
   *
   * @returns Number of vectors
   */
  size(): number {
    return this.vectors.size;
  }

  /**
   * Returns all vectors in the store
   *
   * @returns Array of all embedding vectors
   */
  getAllVectors(): EmbeddingVector[] {
    return Array.from(this.vectors.values());
  }

  /**
   * Calculates cosine similarity between two vectors
   *
   * @param vecA - First vector
   * @param vecB - Second vector
   * @returns Cosine similarity score between 0 and 1
   */
  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) {
      throw new Error('Vectors must have the same length');
    }

    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      magnitudeA += vecA[i] * vecA[i];
      magnitudeB += vecB[i] * vecB[i];
    }

    magnitudeA = Math.sqrt(magnitudeA);
    magnitudeB = Math.sqrt(magnitudeB);

    if (magnitudeA === 0 || magnitudeB === 0) {
      return 0;
    }

    return dotProduct / (magnitudeA * magnitudeB);
  }

  /**
   * Generates an embedding for a query string
   * Uses the same character frequency approach as generateEmbeddings
   *
   * @param query - Query string
   * @returns Vector representation of the query
   */
  private generateQueryEmbedding(query: string): number[] {
    // Define the character set for embedding (must match embeddings.ts)
    const characterSet =
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 .,!?;:()-\'"/';
    const embeddingDimension = characterSet.length;

    const vector = new Array(embeddingDimension).fill(0);
    const totalChars = query.length;

    // Count character frequencies
    for (const char of query) {
      const index = characterSet.indexOf(char);
      if (index !== -1) {
        vector[index]++;
      }
    }

    // Normalize the vector (divide by total characters)
    if (totalChars > 0) {
      for (let i = 0; i < embeddingDimension; i++) {
        vector[i] = vector[i] / totalChars;
      }
    }

    return vector;
  }

  /**
   * Serializes the vector store to JSON
   *
   * @returns JSON string representation of the store
   */
  toJSON(): string {
    const data = {
      vectors: Array.from(this.vectors.entries()),
    };
    return JSON.stringify(data);
  }

  /**
   * Loads vector store from JSON
   *
   * @param json - JSON string representation of the store
   */
  fromJSON(json: string): void {
    const data = JSON.parse(json);
    this.vectors = new Map(data.vectors);
  }
}

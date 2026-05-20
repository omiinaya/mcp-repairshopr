/**
 * Embedding generation module for semantic search
 *
 * This module provides functionality to chunk text into manageable pieces,
 * generate vector embeddings using a simple frequency-based approach, and
 * create text chunks from API endpoint metadata.
 */

import { ApiEndpoint } from '../utils/types';

/**
 * Represents a chunk of text with associated metadata
 */
export interface TextChunk {
  /** Unique identifier for the chunk */
  id: string;
  /** The text content of the chunk */
  text: string;
  /** Metadata about the chunk */
  metadata: {
    /** ID of the endpoint this chunk belongs to */
    endpointId: string;
    /** Type of content (description, parameter, response, permission) */
    type: 'description' | 'parameter' | 'response' | 'permission';
    /** Resource name */
    resource: string;
    /** HTTP method */
    method: string;
    /** API path */
    path: string;
  };
}

/**
 * Represents an embedding vector with metadata
 */
export interface EmbeddingVector {
  /** Unique identifier for the vector */
  id: string;
  /** The vector representation (array of numbers) */
  vector: number[];
  /** Metadata about the vector */
  metadata: any;
}

/**
 * Splits text into chunks of approximately maxChunkSize characters
 * Respects sentence boundaries when possible
 *
 * @param text - The text to chunk
 * @param maxChunkSize - Maximum size of each chunk in characters (default: 500)
 * @returns Array of text chunks
 */
export function chunkText(text: string, maxChunkSize: number = 500): string[] {
  if (!text || text.length === 0) {
    return [];
  }

  // If text is shorter than max chunk size, return as single chunk
  if (text.length <= maxChunkSize) {
    return [text];
  }

  const chunks: string[] = [];
  let startIndex = 0;

  while (startIndex < text.length) {
    let endIndex = startIndex + maxChunkSize;

    // If we're not at the end of the text, try to find a sentence boundary
    if (endIndex < text.length) {
      // Look for sentence terminators (. ! ?) followed by space or end of text
      const sentenceEndPattern = /[.!?]\s/;
      let bestBreak = -1;

      // Search backwards from endIndex for a sentence boundary
      for (let i = endIndex; i > startIndex; i--) {
        if (sentenceEndPattern.test(text[i - 1] + text[i])) {
          bestBreak = i;
          break;
        }
      }

      // If we found a sentence boundary, use it
      if (bestBreak !== -1) {
        endIndex = bestBreak;
      } else {
        // No sentence boundary found, try to find a word boundary
        const spacePattern = /\s/;
        for (let i = endIndex; i > startIndex; i--) {
          if (spacePattern.test(text[i])) {
            bestBreak = i;
            break;
          }
        }

        if (bestBreak !== -1) {
          endIndex = bestBreak;
        }
      }
    }

    // Extract the chunk and trim whitespace
    const chunk = text.substring(startIndex, endIndex).trim();
    if (chunk.length > 0) {
      chunks.push(chunk);
    }

    startIndex = endIndex;
  }

  return chunks;
}

/**
 * Generates embeddings for text chunks using a simple frequency-based approach
 * Uses character frequency to create vector representations
 *
 * @param chunks - Array of text chunks
 * @returns Array of vector representations for each chunk
 */
export async function generateEmbeddings(
  chunks: string[]
): Promise<number[][]> {
  if (!chunks || chunks.length === 0) {
    return [];
  }

  // Define the character set for embedding (ASCII printable characters)
  const characterSet =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 .,!?;:()-\'"/';
  const embeddingDimension = characterSet.length;

  const embeddings: number[][] = [];

  for (const chunk of chunks) {
    const vector = new Array(embeddingDimension).fill(0);
    const totalChars = chunk.length;

    // Count character frequencies
    for (const char of chunk) {
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

    embeddings.push(vector);
  }

  return embeddings;
}

/**
 * Creates text chunks from an API endpoint
 * Generates chunks from description, parameters, responses, and permissions
 *
 * @param endpoint - The API endpoint to create chunks from
 * @returns Array of TextChunk objects with metadata
 */
export function createTextChunks(endpoint: ApiEndpoint): TextChunk[] {
  const chunks: TextChunk[] = [];
  const baseMetadata = {
    endpointId: `${endpoint.method}:${endpoint.path}`,
    resource: endpoint.resource,
    method: endpoint.method,
    path: endpoint.path,
  };

  // Create chunks from endpoint description
  if (endpoint.description) {
    const descriptionChunks = chunkText(endpoint.description);
    for (let i = 0; i < descriptionChunks.length; i++) {
      chunks.push({
        id: `${baseMetadata.endpointId}:description:${i}`,
        text: descriptionChunks[i],
        metadata: {
          ...baseMetadata,
          type: 'description' as const,
        },
      });
    }
  }

  // Create chunks from parameter descriptions
  for (const param of endpoint.parameters) {
    if (param.description) {
      const paramChunks = chunkText(param.description);
      for (let i = 0; i < paramChunks.length; i++) {
        chunks.push({
          id: `${baseMetadata.endpointId}:param:${param.name}:${i}`,
          text: `${param.name}: ${paramChunks[i]}`,
          metadata: {
            ...baseMetadata,
            type: 'parameter' as const,
          },
        });
      }
    }
  }

  // Create chunks from request body parameters
  if (endpoint.requestBody) {
    for (const param of endpoint.requestBody) {
      if (param.description) {
        const paramChunks = chunkText(param.description);
        for (let i = 0; i < paramChunks.length; i++) {
          chunks.push({
            id: `${baseMetadata.endpointId}:body:${param.name}:${i}`,
            text: `${param.name}: ${paramChunks[i]}`,
            metadata: {
              ...baseMetadata,
              type: 'parameter' as const,
            },
          });
        }
      }
    }
  }

  // Create chunks from response descriptions
  for (const response of endpoint.responses) {
    if (response.description) {
      const responseChunks = chunkText(response.description);
      for (let i = 0; i < responseChunks.length; i++) {
        chunks.push({
          id: `${baseMetadata.endpointId}:response:${response.statusCode}:${i}`,
          text: `Response ${response.statusCode}: ${responseChunks[i]}`,
          metadata: {
            ...baseMetadata,
            type: 'response' as const,
          },
        });
      }
    }
  }

  // Create chunks from permission requirements
  if (endpoint.permission) {
    const permissionChunks = chunkText(endpoint.permission);
    for (let i = 0; i < permissionChunks.length; i++) {
      chunks.push({
        id: `${baseMetadata.endpointId}:permission:${i}`,
        text: `Permission: ${permissionChunks[i]}`,
        metadata: {
          ...baseMetadata,
          type: 'permission' as const,
        },
      });
    }
  }

  return chunks;
}

/**
 * Index builder module for RepairShopr API documentation
 *
 * This module provides functionality to build, rebuild, and incrementally update
 * indexes from documentation files. It includes validation, versioning, and
 * health monitoring capabilities.
 */

import * as fs from 'fs';
import * as fsPromises from 'fs/promises';
import * as path from 'path';
import * as crypto from 'crypto';
import { parseMarkdownFile } from '../parser/markdown';
import { buildMetadataIndex, MetadataIndex } from '../parser/metadata';
import { createTextChunks, generateEmbeddings, TextChunk } from './embeddings';
import { ApiDocument } from '../utils/types';

/**
 * Index information metadata
 */
export interface IndexInfo {
  /** Version of the index */
  version: string;
  /** Timestamp when the index was created */
  timestamp: string;
  /** Number of documentation files indexed */
  fileCount: number;
  /** Number of API endpoints indexed */
  endpointCount: number;
  /** Number of text chunks created */
  chunkCount: number;
  /** Hash of all documentation files for change detection */
  hash: string;
}

/**
 * Index health status
 */
export interface IndexHealth {
  /** Whether the index is healthy */
  healthy: boolean;
  /** List of issues found (empty if healthy) */
  issues: string[];
}

/**
 * Index builder class for creating and maintaining indexes
 */
export class IndexBuilder {
  private readonly INDEX_INFO_FILE = 'index-info.json';
  private readonly METADATA_INDEX_FILE = 'metadata-index.json';
  private readonly EMBEDDINGS_FILE = 'embeddings.json';
  private readonly CHUNKS_FILE = 'chunks.json';

  /**
   * Builds a complete index from all markdown files in the docs path
   *
   * @param docsPath - Path to the directory containing markdown documentation files
   * @param outputPath - Path where the index files should be saved
   * @returns Promise<IndexInfo> - Information about the built index
   */
  async buildIndex(docsPath: string, outputPath: string): Promise<IndexInfo> {
    console.log(`Building index from ${docsPath}...`);

    // Ensure output directory exists
    await fsPromises.mkdir(outputPath, { recursive: true });

    // Read all markdown files
    const files = await this.getMarkdownFiles(docsPath);
    console.log(`Found ${files.length} markdown files`);

    // Parse all documents
    const documents: ApiDocument[] = [];
    for (const file of files) {
      try {
        const document = await parseMarkdownFile(file);
        documents.push(document);
      } catch (error) {
        console.warn(`Failed to parse ${file}:`, error);
      }
    }

    // Calculate hash of all documentation files
    const hash = await this.calculateDocsHash(files);

    // Build metadata index
    const metadataIndex = buildMetadataIndex(documents);

    // Create text chunks and generate embeddings
    const chunks: TextChunk[] = [];
    for (const endpoint of metadataIndex.allEndpoints) {
      const endpointChunks = createTextChunks(endpoint);
      chunks.push(...endpointChunks);
    }

    const embeddings = await generateEmbeddings(chunks.map(c => c.text));

    // Save index files
    await this.saveMetadataIndex(outputPath, metadataIndex);
    await this.saveEmbeddings(outputPath, chunks, embeddings);
    await this.saveIndexInfo(outputPath, {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      fileCount: files.length,
      endpointCount: metadataIndex.allEndpoints.length,
      chunkCount: chunks.length,
      hash
    });

    console.log(`Index built successfully: ${files.length} files, ${metadataIndex.allEndpoints.length} endpoints, ${chunks.length} chunks`);

    return {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      fileCount: files.length,
      endpointCount: metadataIndex.allEndpoints.length,
      chunkCount: chunks.length,
      hash
    };
  }

  /**
   * Rebuilds the index from scratch
   *
   * @param docsPath - Path to the directory containing markdown documentation files
   * @param outputPath - Path where the index files should be saved
   * @returns Promise<IndexInfo> - Information about the rebuilt index
   */
  async rebuildIndex(docsPath: string, outputPath: string): Promise<IndexInfo> {
    console.log('Rebuilding index from scratch...');

    // Clear existing index files
    await this.clearIndex(outputPath);

    // Build fresh index
    return this.buildIndex(docsPath, outputPath);
  }

  /**
   * Performs an incremental update of the index with only changed files
   *
   * @param docsPath - Path to the directory containing markdown documentation files
   * @param outputPath - Path where the index files are saved
   * @returns Promise<IndexInfo> - Information about the updated index
   */
  async incrementalUpdate(docsPath: string, outputPath: string): Promise<IndexInfo> {
    console.log('Performing incremental update...');

    // Get current index info
    const currentIndexInfo = this.getIndexInfo(outputPath);
    if (!currentIndexInfo) {
      console.log('No existing index found, performing full build...');
      return this.buildIndex(docsPath, outputPath);
    }

    // Get all markdown files
    const files = await this.getMarkdownFiles(docsPath);

    // Calculate new hash
    const newHash = await this.calculateDocsHash(files);

    // Check if files have changed
    if (newHash === currentIndexInfo.hash) {
      console.log('No changes detected, index is up to date');
      return currentIndexInfo;
    }

    console.log('Changes detected, rebuilding index...');
    return this.rebuildIndex(docsPath, outputPath);
  }

  /**
   * Validates the integrity of the index
   *
   * @param indexPath - Path to the index directory
   * @returns boolean - True if index is valid, false otherwise
   */
  validateIndex(indexPath: string): boolean {
    try {
      const health = this.getIndexHealth(indexPath);
      return health.healthy;
    } catch (error) {
      console.error('Error validating index:', error);
      return false;
    }
  }

  /**
   * Gets index metadata information
   *
   * @param indexPath - Path to the index directory
   * @returns IndexInfo | null - Index information if found, null otherwise
   */
  getIndexInfo(indexPath: string): IndexInfo | null {
    try {
      const infoPath = path.join(indexPath, this.INDEX_INFO_FILE);
      const content = fs.readFileSync(infoPath, 'utf-8');
      return JSON.parse(content) as IndexInfo;
    } catch (error) {
      console.warn('Could not read index info:', error);
      return null;
    }
  }

  /**
   * Checks the health of the index
   *
   * @param indexPath - Path to the index directory
   * @returns IndexHealth - Health status with any issues found
   */
  getIndexHealth(indexPath: string): IndexHealth {
    const issues: string[] = [];

    try {
      // Check if index info file exists
      const infoPath = path.join(indexPath, this.INDEX_INFO_FILE);
      try {
        fs.accessSync(infoPath);
      } catch {
        issues.push('Index info file not found');
      }

      // Check if metadata index file exists
      const metadataPath = path.join(indexPath, this.METADATA_INDEX_FILE);
      try {
        fs.accessSync(metadataPath);
      } catch {
        issues.push('Metadata index file not found');
      }

      // Check if embeddings file exists
      const embeddingsPath = path.join(indexPath, this.EMBEDDINGS_FILE);
      try {
        fs.accessSync(embeddingsPath);
      } catch {
        issues.push('Embeddings file not found');
      }

      // Check if chunks file exists
      const chunksPath = path.join(indexPath, this.CHUNKS_FILE);
      try {
        fs.accessSync(chunksPath);
      } catch {
        issues.push('Chunks file not found');
      }

      // If all files exist, validate their content
      if (issues.length === 0) {
        const indexInfo = this.getIndexInfo(indexPath);
        if (!indexInfo) {
          issues.push('Could not parse index info file');
        } else {
          // Validate index info structure
          if (!indexInfo.version || !indexInfo.timestamp || !indexInfo.hash) {
            issues.push('Index info file is missing required fields');
          }

          // Validate counts are non-negative
          if (indexInfo.fileCount < 0 || indexInfo.endpointCount < 0 || indexInfo.chunkCount < 0) {
            issues.push('Index info contains invalid count values');
          }
        }

        // Validate metadata index
        try {
          const metadataContent = fs.readFileSync(metadataPath, 'utf-8');
          const metadata = JSON.parse(metadataContent);
          if (!metadata.resources || !metadata.endpointsByPath || !metadata.allEndpoints) {
            issues.push('Metadata index is missing required fields');
          }
        } catch (error) {
          issues.push('Could not parse metadata index file');
        }

        // Validate embeddings
        try {
          const embeddingsContent = fs.readFileSync(embeddingsPath, 'utf-8');
          const embeddings = JSON.parse(embeddingsContent);
          if (!Array.isArray(embeddings)) {
            issues.push('Embeddings file is not an array');
          }
        } catch (error) {
          issues.push('Could not parse embeddings file');
        }

        // Validate chunks
        try {
          const chunksContent = fs.readFileSync(chunksPath, 'utf-8');
          const chunks = JSON.parse(chunksContent);
          if (!Array.isArray(chunks)) {
            issues.push('Chunks file is not an array');
          }
        } catch (error) {
          issues.push('Could not parse chunks file');
        }
      }
    } catch (error) {
      issues.push(`Unexpected error checking index health: ${error}`);
    }

    return {
      healthy: issues.length === 0,
      issues
    };
  }

  /**
   * Gets all markdown files from a directory recursively
   *
   * @param dirPath - Path to the directory
   * @returns Promise<string[]> - Array of file paths
   */
  private async getMarkdownFiles(dirPath: string): Promise<string[]> {
    const files: string[] = [];

    async function walk(currentPath: string) {
      const entries = await fsPromises.readdir(currentPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(currentPath, entry.name);

        if (entry.isDirectory()) {
          await walk(fullPath);
        } else if (entry.isFile() && entry.name.endsWith('.md')) {
          files.push(fullPath);
        }
      }
    }

    await walk(dirPath);
    return files;
  }

  /**
   * Calculates a hash of all documentation files for change detection
   *
   * @param files - Array of file paths
   * @returns Promise<string> - SHA-256 hash of all file contents
   */
  private async calculateDocsHash(files: string[]): Promise<string> {
    const hash = crypto.createHash('sha256');

    // Sort files for consistent hashing
    const sortedFiles = [...files].sort();

    for (const file of sortedFiles) {
      const content = await fsPromises.readFile(file, 'utf-8');
      hash.update(content);
    }

    return hash.digest('hex');
  }

  /**
   * Saves the metadata index to a file
   *
   * @param outputPath - Path to the output directory
   * @param metadataIndex - Metadata index to save
   */
  private async saveMetadataIndex(outputPath: string, metadataIndex: MetadataIndex): Promise<void> {
    const filePath = path.join(outputPath, this.METADATA_INDEX_FILE);

    // Convert Maps to plain objects for JSON serialization
    const serialized = {
      resources: Object.fromEntries(metadataIndex.resources),
      endpointsByPath: Object.fromEntries(metadataIndex.endpointsByPath),
      endpointsByPermission: Object.fromEntries(metadataIndex.endpointsByPermission),
      endpointsByMethod: Object.fromEntries(metadataIndex.endpointsByMethod),
      allEndpoints: metadataIndex.allEndpoints
    };

    await fsPromises.writeFile(filePath, JSON.stringify(serialized, null, 2), 'utf-8');
  }

  /**
   * Saves embeddings and chunks to files
   *
   * @param outputPath - Path to the output directory
   * @param chunks - Text chunks to save
   * @param embeddings - Embedding vectors to save
   */
  private async saveEmbeddings(
    outputPath: string,
    chunks: TextChunk[],
    embeddings: number[][]
  ): Promise<void> {
    const chunksPath = path.join(outputPath, this.CHUNKS_FILE);
    const embeddingsPath = path.join(outputPath, this.EMBEDDINGS_FILE);

    await fsPromises.writeFile(chunksPath, JSON.stringify(chunks, null, 2), 'utf-8');
    await fsPromises.writeFile(embeddingsPath, JSON.stringify(embeddings), 'utf-8');
  }

  /**
   * Saves index info to a file
   *
   * @param outputPath - Path to the output directory
   * @param indexInfo - Index information to save
   */
  private async saveIndexInfo(outputPath: string, indexInfo: IndexInfo): Promise<void> {
    const filePath = path.join(outputPath, this.INDEX_INFO_FILE);
    await fsPromises.writeFile(filePath, JSON.stringify(indexInfo, null, 2), 'utf-8');
  }

  /**
   * Clears all index files from the output directory
   *
   * @param outputPath - Path to the index directory
   */
  private async clearIndex(outputPath: string): Promise<void> {
    const files = [
      this.INDEX_INFO_FILE,
      this.METADATA_INDEX_FILE,
      this.EMBEDDINGS_FILE,
      this.CHUNKS_FILE
    ];

    for (const file of files) {
      const filePath = path.join(outputPath, file);
      try {
        await fsPromises.unlink(filePath);
      } catch (error) {
        // File doesn't exist, that's okay
      }
    }
  }
}

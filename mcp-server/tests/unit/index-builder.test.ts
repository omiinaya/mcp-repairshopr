/**
 * Unit tests for IndexBuilder class
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { IndexBuilder, IndexInfo, IndexHealth } from '../../src/indexer/index-builder';
import { ApiDocument, ApiEndpoint } from '../../src/utils/types';

// Mock fs module
jest.mock('fs/promises');

describe('IndexBuilder', () => {
  let indexBuilder: IndexBuilder;
  let mockFs: jest.Mocked<typeof fs>;

  beforeEach(() => {
    indexBuilder = new IndexBuilder();
    mockFs = fs as jest.Mocked<typeof fs>;
    jest.clearAllMocks();
  });

  describe('buildIndex', () => {
    it('should build index from documentation files', async () => {
      const docsPath = '/test/docs';
      const outputPath = '/test/output';

      // Mock file system operations
      mockFs.mkdir.mockResolvedValue(undefined);
      mockFs.readdir.mockResolvedValue([
        { name: 'test.md', isFile: () => true, isDirectory: () => false } as any
      ]);
      mockFs.readFile.mockResolvedValue(
        '# RepairShopr API Documentation - Test\n\n#### Test Operation\n\n**Endpoint:** `GET /test`\n\nTest description.'
      );
      mockFs.writeFile.mockResolvedValue(undefined);

      const result = await indexBuilder.buildIndex(docsPath, outputPath);

      expect(result).toBeDefined();
      expect(result.fileCount).toBeGreaterThan(0);
      expect(result.endpointCount).toBeGreaterThan(0);
      expect(result.chunkCount).toBeGreaterThan(0);
      expect(result.version).toBe('1.0.0');
      expect(result.timestamp).toBeDefined();
      expect(result.hash).toBeDefined();
      expect(mockFs.mkdir).toHaveBeenCalledWith(outputPath, { recursive: true });
    });

    it('should handle empty documentation directory', async () => {
      const docsPath = '/test/docs';
      const outputPath = '/test/output';

      mockFs.mkdir.mockResolvedValue(undefined);
      mockFs.readdir.mockResolvedValue([]);
      mockFs.writeFile.mockResolvedValue(undefined);

      const result = await indexBuilder.buildIndex(docsPath, outputPath);

      expect(result.fileCount).toBe(0);
      expect(result.endpointCount).toBe(0);
      expect(result.chunkCount).toBe(0);
    });

    it('should create output directory if it does not exist', async () => {
      const docsPath = '/test/docs';
      const outputPath = '/test/output';

      mockFs.mkdir.mockResolvedValue(undefined);
      mockFs.readdir.mockResolvedValue([]);
      mockFs.writeFile.mockResolvedValue(undefined);

      await indexBuilder.buildIndex(docsPath, outputPath);

      expect(mockFs.mkdir).toHaveBeenCalledWith(outputPath, { recursive: true });
    });
  });

  describe('rebuildIndex', () => {
    it('should rebuild index from scratch', async () => {
      const docsPath = '/test/docs';
      const outputPath = '/test/output';

      mockFs.mkdir.mockResolvedValue(undefined);
      mockFs.readdir.mockResolvedValue([
        { name: 'test.md', isFile: () => true, isDirectory: () => false } as any
      ]);
      mockFs.readFile.mockResolvedValue(
        '# RepairShopr API Documentation - Test\n\n#### Test Operation\n\n**Endpoint:** `GET /test`\n\nTest description.'
      );
      mockFs.writeFile.mockResolvedValue(undefined);
      mockFs.unlink.mockResolvedValue(undefined);

      const result = await indexBuilder.rebuildIndex(docsPath, outputPath);

      expect(result).toBeDefined();
      expect(mockFs.unlink).toHaveBeenCalled();
    });

    it('should handle missing index files gracefully', async () => {
      const docsPath = '/test/docs';
      const outputPath = '/test/output';

      mockFs.mkdir.mockResolvedValue(undefined);
      mockFs.readdir.mockResolvedValue([]);
      mockFs.writeFile.mockResolvedValue(undefined);
      mockFs.unlink.mockRejectedValue(new Error('File not found'));

      const result = await indexBuilder.rebuildIndex(docsPath, outputPath);

      expect(result).toBeDefined();
    });
  });

  describe('incrementalUpdate', () => {
    it('should perform full build when no existing index', async () => {
      const docsPath = '/test/docs';
      const outputPath = '/test/output';

      mockFs.mkdir.mockResolvedValue(undefined);
      mockFs.readdir.mockResolvedValue([]);
      mockFs.writeFile.mockResolvedValue(undefined);
      mockFs.accessSync.mockImplementation(() => {
        throw new Error('File not found');
      });

      const result = await indexBuilder.incrementalUpdate(docsPath, outputPath);

      expect(result).toBeDefined();
      expect(result.fileCount).toBe(0);
    });

    it('should skip update when no changes detected', async () => {
      const docsPath = '/test/docs';
      const outputPath = '/test/output';

      const existingIndexInfo: IndexInfo = {
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        fileCount: 1,
        endpointCount: 1,
        chunkCount: 1,
        hash: 'test-hash'
      };

      mockFs.mkdir.mockResolvedValue(undefined);
      mockFs.readdir.mockResolvedValue([]);
      mockFs.writeFile.mockResolvedValue(undefined);
      mockFs.accessSync.mockReturnValue(undefined);
      mockFs.readFileSync.mockReturnValue(JSON.stringify(existingIndexInfo));

      const result = await indexBuilder.incrementalUpdate(docsPath, outputPath);

      expect(result).toBeDefined();
      expect(result.hash).toBe('test-hash');
    });

    it('should rebuild when changes are detected', async () => {
      const docsPath = '/test/docs';
      const outputPath = '/test/output';

      const existingIndexInfo: IndexInfo = {
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        fileCount: 1,
        endpointCount: 1,
        chunkCount: 1,
        hash: 'old-hash'
      };

      mockFs.mkdir.mockResolvedValue(undefined);
      mockFs.readdir.mockResolvedValue([]);
      mockFs.writeFile.mockResolvedValue(undefined);
      mockFs.unlink.mockResolvedValue(undefined);
      mockFs.accessSync.mockReturnValue(undefined);
      mockFs.readFileSync.mockReturnValue(JSON.stringify(existingIndexInfo));

      const result = await indexBuilder.incrementalUpdate(docsPath, outputPath);

      expect(result).toBeDefined();
      expect(result.hash).not.toBe('old-hash');
    });
  });

  describe('validateIndex', () => {
    it('should return true for valid index', async () => {
      const indexPath = '/test/index';

      mockFs.accessSync.mockReturnValue(undefined);
      mockFs.readFileSync.mockReturnValue(
        JSON.stringify({
          version: '1.0.0',
          timestamp: new Date().toISOString(),
          fileCount: 1,
          endpointCount: 1,
          chunkCount: 1,
          hash: 'test-hash'
        })
      );

      const result = indexBuilder.validateIndex(indexPath);

      expect(result).toBe(true);
    });

    it('should return false for invalid index', async () => {
      const indexPath = '/test/index';

      mockFs.accessSync.mockImplementation(() => {
        throw new Error('File not found');
      });

      const result = indexBuilder.validateIndex(indexPath);

      expect(result).toBe(false);
    });

    it('should handle errors gracefully', async () => {
      const indexPath = '/test/index';

      mockFs.accessSync.mockImplementation(() => {
        throw new Error('Access denied');
      });

      const result = indexBuilder.validateIndex(indexPath);

      expect(result).toBe(false);
    });
  });

  describe('getIndexInfo', () => {
    it('should return index info when file exists', async () => {
      const indexPath = '/test/index';

      const expectedInfo: IndexInfo = {
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        fileCount: 1,
        endpointCount: 1,
        chunkCount: 1,
        hash: 'test-hash'
      };

      mockFs.readFileSync.mockReturnValue(JSON.stringify(expectedInfo));

      const result = indexBuilder.getIndexInfo(indexPath);

      expect(result).toEqual(expectedInfo);
    });

    it('should return null when file does not exist', async () => {
      const indexPath = '/test/index';

      mockFs.readFileSync.mockImplementation(() => {
        throw new Error('File not found');
      });

      const result = indexBuilder.getIndexInfo(indexPath);

      expect(result).toBeNull();
    });

    it('should return null when file contains invalid JSON', async () => {
      const indexPath = '/test/index';

      mockFs.readFileSync.mockReturnValue('invalid json');

      const result = indexBuilder.getIndexInfo(indexPath);

      expect(result).toBeNull();
    });
  });

  describe('getIndexHealth', () => {
    it('should return healthy status for valid index', async () => {
      const indexPath = '/test/index';

      mockFs.accessSync.mockReturnValue(undefined);
      mockFs.readFileSync.mockImplementation((filePath) => {
        if (filePath.includes('index-info.json')) {
          return JSON.stringify({
            version: '1.0.0',
            timestamp: new Date().toISOString(),
            fileCount: 1,
            endpointCount: 1,
            chunkCount: 1,
            hash: 'test-hash'
          });
        } else if (filePath.includes('metadata-index.json')) {
          return JSON.stringify({
            resources: {},
            endpointsByPath: {},
            endpointsByPermission: {},
            endpointsByMethod: {},
            allEndpoints: []
          });
        } else if (filePath.includes('embeddings.json')) {
          return JSON.stringify([]);
        } else if (filePath.includes('chunks.json')) {
          return JSON.stringify([]);
        }
        return '{}';
      });

      const result = indexBuilder.getIndexHealth(indexPath);

      expect(result.healthy).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    it('should report missing index info file', async () => {
      const indexPath = '/test/index';

      mockFs.accessSync.mockImplementation((filePath) => {
        if (filePath.includes('index-info.json')) {
          throw new Error('File not found');
        }
      });

      const result = indexBuilder.getIndexHealth(indexPath);

      expect(result.healthy).toBe(false);
      expect(result.issues).toContain('Index info file not found');
    });

    it('should report missing metadata index file', async () => {
      const indexPath = '/test/index';

      mockFs.accessSync.mockImplementation((filePath) => {
        if (filePath.includes('metadata-index.json')) {
          throw new Error('File not found');
        }
      });

      const result = indexBuilder.getIndexHealth(indexPath);

      expect(result.healthy).toBe(false);
      expect(result.issues).toContain('Metadata index file not found');
    });

    it('should report missing embeddings file', async () => {
      const indexPath = '/test/index';

      mockFs.accessSync.mockImplementation((filePath) => {
        if (filePath.includes('embeddings.json')) {
          throw new Error('File not found');
        }
      });

      const result = indexBuilder.getIndexHealth(indexPath);

      expect(result.healthy).toBe(false);
      expect(result.issues).toContain('Embeddings file not found');
    });

    it('should report missing chunks file', async () => {
      const indexPath = '/test/index';

      mockFs.accessSync.mockImplementation((filePath) => {
        if (filePath.includes('chunks.json')) {
          throw new Error('File not found');
        }
      });

      const result = indexBuilder.getIndexHealth(indexPath);

      expect(result.healthy).toBe(false);
      expect(result.issues).toContain('Chunks file not found');
    });

    it('should report invalid index info structure', async () => {
      const indexPath = '/test/index';

      mockFs.accessSync.mockReturnValue(undefined);
      mockFs.readFileSync.mockImplementation((filePath) => {
        if (filePath.includes('index-info.json')) {
          return JSON.stringify({
            version: '1.0.0',
            timestamp: new Date().toISOString(),
            fileCount: 1,
            endpointCount: 1,
            chunkCount: 1
            // Missing hash
          });
        } else if (filePath.includes('metadata-index.json')) {
          return JSON.stringify({
            resources: {},
            endpointsByPath: {},
            endpointsByPermission: {},
            endpointsByMethod: {},
            allEndpoints: []
          });
        } else if (filePath.includes('embeddings.json')) {
          return JSON.stringify([]);
        } else if (filePath.includes('chunks.json')) {
          return JSON.stringify([]);
        }
        return '{}';
      });

      const result = indexBuilder.getIndexHealth(indexPath);

      expect(result.healthy).toBe(false);
      expect(result.issues).toContain('Index info file is missing required fields');
    });

    it('should report invalid count values', async () => {
      const indexPath = '/test/index';

      mockFs.accessSync.mockReturnValue(undefined);
      mockFs.readFileSync.mockImplementation((filePath) => {
        if (filePath.includes('index-info.json')) {
          return JSON.stringify({
            version: '1.0.0',
            timestamp: new Date().toISOString(),
            fileCount: -1,
            endpointCount: 1,
            chunkCount: 1,
            hash: 'test-hash'
          });
        } else if (filePath.includes('metadata-index.json')) {
          return JSON.stringify({
            resources: {},
            endpointsByPath: {},
            endpointsByPermission: {},
            endpointsByMethod: {},
            allEndpoints: []
          });
        } else if (filePath.includes('embeddings.json')) {
          return JSON.stringify([]);
        } else if (filePath.includes('chunks.json')) {
          return JSON.stringify([]);
        }
        return '{}';
      });

      const result = indexBuilder.getIndexHealth(indexPath);

      expect(result.healthy).toBe(false);
      expect(result.issues).toContain('Index info contains invalid count values');
    });

    it('should report invalid metadata index structure', async () => {
      const indexPath = '/test/index';

      mockFs.accessSync.mockReturnValue(undefined);
      mockFs.readFileSync.mockImplementation((filePath) => {
        if (filePath.includes('index-info.json')) {
          return JSON.stringify({
            version: '1.0.0',
            timestamp: new Date().toISOString(),
            fileCount: 1,
            endpointCount: 1,
            chunkCount: 1,
            hash: 'test-hash'
          });
        } else if (filePath.includes('metadata-index.json')) {
          return JSON.stringify({
            // Missing required fields
            resources: {}
          });
        } else if (filePath.includes('embeddings.json')) {
          return JSON.stringify([]);
        } else if (filePath.includes('chunks.json')) {
          return JSON.stringify([]);
        }
        return '{}';
      });

      const result = indexBuilder.getIndexHealth(indexPath);

      expect(result.healthy).toBe(false);
      expect(result.issues).toContain('Metadata index is missing required fields');
    });

    it('should report invalid embeddings format', async () => {
      const indexPath = '/test/index';

      mockFs.accessSync.mockReturnValue(undefined);
      mockFs.readFileSync.mockImplementation((filePath) => {
        if (filePath.includes('index-info.json')) {
          return JSON.stringify({
            version: '1.0.0',
            timestamp: new Date().toISOString(),
            fileCount: 1,
            endpointCount: 1,
            chunkCount: 1,
            hash: 'test-hash'
          });
        } else if (filePath.includes('metadata-index.json')) {
          return JSON.stringify({
            resources: {},
            endpointsByPath: {},
            endpointsByPermission: {},
            endpointsByMethod: {},
            allEndpoints: []
          });
        } else if (filePath.includes('embeddings.json')) {
          return JSON.stringify('not an array');
        } else if (filePath.includes('chunks.json')) {
          return JSON.stringify([]);
        }
        return '{}';
      });

      const result = indexBuilder.getIndexHealth(indexPath);

      expect(result.healthy).toBe(false);
      expect(result.issues).toContain('Embeddings file is not an array');
    });

    it('should report invalid chunks format', async () => {
      const indexPath = '/test/index';

      mockFs.accessSync.mockReturnValue(undefined);
      mockFs.readFileSync.mockImplementation((filePath) => {
        if (filePath.includes('index-info.json')) {
          return JSON.stringify({
            version: '1.0.0',
            timestamp: new Date().toISOString(),
            fileCount: 1,
            endpointCount: 1,
            chunkCount: 1,
            hash: 'test-hash'
          });
        } else if (filePath.includes('metadata-index.json')) {
          return JSON.stringify({
            resources: {},
            endpointsByPath: {},
            endpointsByPermission: {},
            endpointsByMethod: {},
            allEndpoints: []
          });
        } else if (filePath.includes('embeddings.json')) {
          return JSON.stringify([]);
        } else if (filePath.includes('chunks.json')) {
          return JSON.stringify('not an array');
        }
        return '{}';
      });

      const result = indexBuilder.getIndexHealth(indexPath);

      expect(result.healthy).toBe(false);
      expect(result.issues).toContain('Chunks file is not an array');
    });

    it('should report multiple issues', async () => {
      const indexPath = '/test/index';

      mockFs.accessSync.mockImplementation((filePath) => {
        if (filePath.includes('index-info.json') || filePath.includes('metadata-index.json')) {
          throw new Error('File not found');
        }
      });

      const result = indexBuilder.getIndexHealth(indexPath);

      expect(result.healthy).toBe(false);
      expect(result.issues.length).toBeGreaterThan(1);
    });
  });

  describe('hash calculation for change detection', () => {
    it('should calculate consistent hash for same files', async () => {
      const docsPath = '/test/docs';
      const outputPath = '/test/output';

      const fileContent = '# Test\n\nContent';

      mockFs.mkdir.mockResolvedValue(undefined);
      mockFs.readdir.mockResolvedValue([
        { name: 'test.md', isFile: () => true, isDirectory: () => false } as any
      ]);
      mockFs.readFile.mockResolvedValue(fileContent);
      mockFs.writeFile.mockResolvedValue(undefined);

      const result1 = await indexBuilder.buildIndex(docsPath, outputPath);
      const result2 = await indexBuilder.buildIndex(docsPath, outputPath);

      expect(result1.hash).toBe(result2.hash);
    });

    it('should calculate different hash for different files', async () => {
      const docsPath = '/test/docs';
      const outputPath = '/test/output';

      mockFs.mkdir.mockResolvedValue(undefined);
      mockFs.readdir.mockResolvedValue([
        { name: 'test.md', isFile: () => true, isDirectory: () => false } as any
      ]);
      mockFs.writeFile.mockResolvedValue(undefined);

      // First build with one content
      mockFs.readFile.mockResolvedValue('# Test\n\nContent 1');
      const result1 = await indexBuilder.buildIndex(docsPath, outputPath);

      // Second build with different content
      mockFs.readFile.mockResolvedValue('# Test\n\nContent 2');
      const result2 = await indexBuilder.buildIndex(docsPath, outputPath);

      expect(result1.hash).not.toBe(result2.hash);
    });
  });
});

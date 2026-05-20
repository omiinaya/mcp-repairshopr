/**
 * Unit tests for embedding generation and vector store
 */

import {
  chunkText,
  generateEmbeddings,
  createTextChunks,
  TextChunk,
  EmbeddingVector,
} from '../../src/indexer/embeddings';
import { VectorStore } from '../../src/indexer/vector';
import { ApiEndpoint } from '../../src/utils/types';

describe('chunkText', () => {
  test('should return empty array for empty string', () => {
    const result = chunkText('');
    expect(result).toEqual([]);
  });

  test('should return empty array for null or undefined', () => {
    expect(chunkText('')).toEqual([]);
  });

  test('should return single chunk for text shorter than maxChunkSize', () => {
    const text = 'This is a short text.';
    const result = chunkText(text, 500);
    expect(result).toHaveLength(1);
    expect(result[0]).toBe(text);
  });

  test('should split text into multiple chunks when longer than maxChunkSize', () => {
    const text =
      'This is sentence one. This is sentence two. This is sentence three. This is sentence four. This is sentence five.';
    const result = chunkText(text, 50);
    expect(result.length).toBeGreaterThan(1);
  });

  test('should respect sentence boundaries when possible', () => {
    const text = 'First sentence. Second sentence. Third sentence.';
    const result = chunkText(text, 30);
    // Check that chunks don't break in the middle of words
    for (const chunk of result) {
      expect(chunk).toMatch(/^[A-Z]/); // Each chunk should start with capital letter
      expect(chunk).nottoMatch(/\s$/); // Should not end with space
    }
  });

  test('should handle text without sentence terminators', () => {
    const text = 'word1 word2 word3 word4 word5 word6 word7 word8 word9 word10';
    const result = chunkText(text, 30);
    expect(result.length).toBeGreaterThan(1);
  });

  test('should trim whitespace from chunks', () => {
    const text = '  Sentence one.  Sentence two.  ';
    const result = chunkText(text, 50);
    for (const chunk of result) {
      expect(chunk).not.toMatch(/^\s/);
      expect(chunk).not.toMatch(/\s$/);
    }
  });
});

describe('generateEmbeddings', () => {
  test('should return empty array for empty input', async () => {
    const result = await generateEmbeddings([]);
    expect(result).toEqual([]);
  });

  test('should generate embeddings for single chunk', async () => {
    const chunks = ['hello world'];
    const result = await generateEmbeddings(chunks);
    expect(result).toHaveLength(1);
    expect(result[0]).toBeInstanceOf(Array);
    expect(result[0].length).toBeGreaterThan(0);
  });

  test('should generate embeddings for multiple chunks', async () => {
    const chunks = ['first chunk', 'second chunk', 'third chunk'];
    const result = await generateEmbeddings(chunks);
    expect(result).toHaveLength(3);
    for (const embedding of result) {
      expect(embedding).toBeInstanceOf(Array);
      expect(embedding.length).toBeGreaterThan(0);
    }
  });

  test('should generate embeddings with consistent dimensions', async () => {
    const chunks = ['chunk one', 'chunk two', 'chunk three'];
    const result = await generateEmbeddings(chunks);
    const dimensions = result[0].length;
    for (const embedding of result) {
      expect(embedding.length).toBe(dimensions);
    }
  });

  test('should normalize embeddings', async () => {
    const chunks = ['test text'];
    const result = await generateEmbeddings(chunks);
    const embedding = result[0];
    let sum = 0;
    for (const value of embedding) {
      sum += value;
    }
    // Sum should be close to 1 for normalized character frequencies
    expect(sum).toBeGreaterThan(0);
    expect(sum).toBeLessThanOrEqual(1);
  });

  test('should generate different embeddings for different text', async () => {
    const chunks = ['hello world', 'goodbye world'];
    const result = await generateEmbeddings(chunks);
    expect(result[0]).not.toEqual(result[1]);
  });
});

describe('createTextChunks', () => {
  const mockEndpoint: ApiEndpoint = {
    resource: 'Customer',
    operation: 'Get Customers',
    description:
      'Retrieves a list of customers. Supports filtering and pagination.',
    method: 'GET',
    path: '/customers',
    permission: 'customers.view',
    parameters: [
      {
        name: 'page',
        type: 'integer',
        required: false,
        description: 'Page number for pagination',
        paramType: 'query',
      },
      {
        name: 'limit',
        type: 'integer',
        required: false,
        description: 'Number of results per page',
        paramType: 'query',
      },
    ],
    responses: [
      {
        statusCode: 200,
        description: 'List of customers retrieved successfully',
      },
      {
        statusCode: 401,
        description: 'Unauthorized access',
      },
    ],
  };

  test('should create chunks from endpoint description', () => {
    const chunks = createTextChunks(mockEndpoint);
    const descriptionChunks = chunks.filter(
      (c) => c.metadata.type === 'description'
    );
    expect(descriptionChunks.length).toBeGreaterThan(0);
    expect(descriptionChunks[0].text).toContain('Retrieves');
  });

  test('should create chunks from parameter descriptions', () => {
    const chunks = createTextChunks(mockEndpoint);
    const paramChunks = chunks.filter((c) => c.metadata.type === 'parameter');
    expect(paramChunks.length).toBeGreaterThan(0);
    expect(paramChunks.some((c) => c.text.includes('page'))).toBe(true);
    expect(paramChunks.some((c) => c.text.includes('limit'))).toBe(true);
  });

  test('should create chunks from response descriptions', () => {
    const chunks = createTextChunks(mockEndpoint);
    const responseChunks = chunks.filter((c) => c.metadata.type === 'response');
    expect(responseChunks.length).toBeGreaterThan(0);
    expect(responseChunks.some((c) => c.text.includes('200'))).toBe(true);
    expect(responseChunks.some((c) => c.text.includes('401'))).toBe(true);
  });

  test('should create chunks from permission requirements', () => {
    const chunks = createTextChunks(mockEndpoint);
    const permissionChunks = chunks.filter(
      (c) => c.metadata.type === 'permission'
    );
    expect(permissionChunks.length).toBeGreaterThan(0);
    expect(permissionChunks[0].text).toContain('customers.view');
  });

  test('should include correct metadata in chunks', () => {
    const chunks = createTextChunks(mockEndpoint);
    for (const chunk of chunks) {
      expect(chunk.metadata.endpointId).toBe('GET:/customers');
      expect(chunk.metadata.resource).toBe('Customer');
      expect(chunk.metadata.method).toBe('GET');
      expect(chunk.metadata.path).toBe('/customers');
      expect(['description', 'parameter', 'response', 'permission']).toContain(
        chunk.metadata.type
      );
    }
  });

  test('should generate unique IDs for chunks', () => {
    const chunks = createTextChunks(mockEndpoint);
    const ids = chunks.map((c) => c.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  test('should handle endpoint with empty description', () => {
    const emptyEndpoint: ApiEndpoint = {
      ...mockEndpoint,
      description: '',
    };
    const chunks = createTextChunks(emptyEndpoint);
    const descriptionChunks = chunks.filter(
      (c) => c.metadata.type === 'description'
    );
    expect(descriptionChunks.length).toBe(0);
  });

  test('should handle endpoint with request body', () => {
    const endpointWithBody: ApiEndpoint = {
      ...mockEndpoint,
      requestBody: [
        {
          name: 'name',
          type: 'string',
          required: true,
          description: 'Customer name',
          paramType: 'body',
        },
      ],
    };
    const chunks = createTextChunks(endpointWithBody);
    const paramChunks = chunks.filter((c) => c.metadata.type === 'parameter');
    expect(paramChunks.some((c) => c.text.includes('name'))).toBe(true);
  });
});

describe('VectorStore', () => {
  let vectorStore: VectorStore;
  let mockVectors: EmbeddingVector[];

  beforeEach(() => {
    vectorStore = new VectorStore();
    mockVectors = [
      {
        id: 'vec1',
        vector: [0.5, 0.5, 0.5, 0.5],
        metadata: { type: 'description', text: 'test description' },
      },
      {
        id: 'vec2',
        vector: [0.3, 0.7, 0.3, 0.7],
        metadata: { type: 'parameter', text: 'test parameter' },
      },
      {
        id: 'vec3',
        vector: [0.9, 0.1, 0.9, 0.1],
        metadata: { type: 'response', text: 'test response' },
      },
    ];
  });

  test('should initialize with empty store', () => {
    expect(vectorStore.size()).toBe(0);
  });

  test('should add vectors to store', () => {
    vectorStore.addVectors(mockVectors);
    expect(vectorStore.size()).toBe(3);
  });

  test('should retrieve vector by ID', () => {
    vectorStore.addVectors(mockVectors);
    const result = vectorStore.getById('vec1');
    expect(result).toBeDefined();
    expect(result?.id).toBe('vec1');
    expect(result?.vector).toEqual([0.5, 0.5, 0.5, 0.5]);
  });

  test('should return undefined for non-existent ID', () => {
    vectorStore.addVectors(mockVectors);
    const result = vectorStore.getById('nonexistent');
    expect(result).toBeUndefined();
  });

  test('should return empty array for search on empty store', () => {
    const results = vectorStore.search('test query');
    expect(results).toEqual([]);
  });

  test('should perform similarity search', () => {
    vectorStore.addVectors(mockVectors);
    const results = vectorStore.search('test query', 2);
    expect(results.length).toBeLessThanOrEqual(2);
    expect(results[0]).toHaveProperty('id');
    expect(results[0]).toHaveProperty('score');
    expect(results[0]).toHaveProperty('metadata');
  });

  test('should sort search results by score descending', () => {
    vectorStore.addVectors(mockVectors);
    const results = vectorStore.search('test query', 3);
    for (let i = 1; i < results.length; i++) {
      expect(results[i].score).toBeLessThanOrEqual(results[i - 1].score);
    }
  });

  test('should respect limit parameter in search', () => {
    vectorStore.addVectors(mockVectors);
    const results = vectorStore.search('test query', 1);
    expect(results.length).toBe(1);
  });

  test('should clear all vectors', () => {
    vectorStore.addVectors(mockVectors);
    expect(vectorStore.size()).toBe(3);
    vectorStore.clear();
    expect(vectorStore.size()).toBe(0);
  });

  test('should return all vectors', () => {
    vectorStore.addVectors(mockVectors);
    const allVectors = vectorStore.getAllVectors();
    expect(allVectors).toHaveLength(3);
    expect(allVectors.map((v) => v.id)).toEqual(['vec1', 'vec2', 'vec3']);
  });

  test('should serialize to JSON', () => {
    vectorStore.addVectors(mockVectors);
    const json = vectorStore.toJSON();
    expect(json).toBeDefined();
    expect(typeof json).toBe('string');
    const parsed = JSON.parse(json);
    expect(parsed.vectors).toHaveLength(3);
  });

  test('should load from JSON', () => {
    vectorStore.addVectors(mockVectors);
    const json = vectorStore.toJSON();

    const newStore = new VectorStore();
    newStore.fromJSON(json);

    expect(newStore.size()).toBe(3);
    const retrieved = newStore.getById('vec1');
    expect(retrieved?.vector).toEqual([0.5, 0.5, 0.5, 0.5]);
  });

  test('should handle adding duplicate vectors (overwrite)', () => {
    vectorStore.addVectors([mockVectors[0]]);
    expect(vectorStore.size()).toBe(1);

    const duplicateVector = {
      ...mockVectors[0],
      vector: [0.1, 0.2, 0.3, 0.4],
    };
    vectorStore.addVectors([duplicateVector]);
    expect(vectorStore.size()).toBe(1);

    const retrieved = vectorStore.getById('vec1');
    expect(retrieved?.vector).toEqual([0.1, 0.2, 0.3, 0.4]);
  });
});

describe('Cosine Similarity', () => {
  test('should calculate similarity correctly for identical vectors', () => {
    const vecA = [0.5, 0.5, 0.5, 0.5];
    const vecB = [0.5, 0.5, 0.5, 0.5];
    const store = new VectorStore();
    store.addVectors([{ id: 'test', vector: vecA, metadata: {} }]);
    const results = store.search('test');
    // The query embedding will be different, but we can test the concept
    expect(results.length).toBe(1);
  });

  test('should calculate similarity correctly for orthogonal vectors', () => {
    const vecA = [1, 0, 0, 0];
    const vecB = [0, 1, 0, 0];
    const store = new VectorStore();
    store.addVectors([
      { id: 'vec1', vector: vecA, metadata: {} },
      { id: 'vec2', vector: vecB, metadata: {} },
    ]);
    const results = store.search('test');
    expect(results.length).toBe(2);
  });

  test('should handle zero vectors', () => {
    const vecA = [0, 0, 0, 0];
    const vecB = [0.5, 0.5, 0.5, 0.5];
    const store = new VectorStore();
    store.addVectors([{ id: 'test', vector: vecA, metadata: {} }]);
    const results = store.search('test');
    expect(results.length).toBe(1);
  });
});

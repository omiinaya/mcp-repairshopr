/**
 * Mock vector store for testing
 */

import { VectorStore, EmbeddingVector } from '../../src/indexer/vector';

export const mockVectors: EmbeddingVector[] = [
  {
    id: 'GET:/customers',
    vector: [0.5, 0.3, 0.7, 0.2, 0.8, 0.1, 0.6, 0.4, 0.9, 0.3],
    metadata: {
      endpointId: 'GET:/customers',
      resource: 'Customer',
      method: 'GET',
      path: '/customers',
      type: 'description'
    }
  },
  {
    id: 'GET:/customers/{id}',
    vector: [0.4, 0.5, 0.6, 0.3, 0.7, 0.2, 0.8, 0.1, 0.5, 0.9],
    metadata: {
      endpointId: 'GET:/customers/{id}',
      resource: 'Customer',
      method: 'GET',
      path: '/customers/{id}',
      type: 'description'
    }
  },
  {
    id: 'POST:/customers',
    vector: [0.6, 0.4, 0.5, 0.7, 0.3, 0.8, 0.2, 0.9, 0.1, 0.6],
    metadata: {
      endpointId: 'POST:/customers',
      resource: 'Customer',
      method: 'POST',
      path: '/customers',
      type: 'description'
    }
  },
  {
    id: 'GET:/tickets',
    vector: [0.3, 0.6, 0.4, 0.8, 0.5, 0.7, 0.1, 0.9, 0.2, 0.6],
    metadata: {
      endpointId: 'GET:/tickets',
      resource: 'Ticket',
      method: 'GET',
      path: '/tickets',
      type: 'description'
    }
  },
  {
    id: 'POST:/tickets',
    vector: [0.7, 0.2, 0.8, 0.4, 0.6, 0.5, 0.9, 0.3, 0.1, 0.7],
    metadata: {
      endpointId: 'POST:/tickets',
      resource: 'Ticket',
      method: 'POST',
      path: '/tickets',
      type: 'description'
    }
  },
  {
    id: 'GET:/invoices',
    vector: [0.2, 0.7, 0.3, 0.9, 0.4, 0.6, 0.5, 0.8, 0.1, 0.7],
    metadata: {
      endpointId: 'GET:/invoices',
      resource: 'Invoice',
      method: 'GET',
      path: '/invoices',
      type: 'description'
    }
  },
  {
    id: 'POST:/invoices',
    vector: [0.8, 0.1, 0.9, 0.5, 0.7, 0.4, 0.6, 0.2, 0.3, 0.8],
    metadata: {
      endpointId: 'POST:/invoices',
      resource: 'Invoice',
      method: 'POST',
      path: '/invoices',
      type: 'description'
    }
  }
];

export function createMockVectorStore(): VectorStore {
  const store = new VectorStore();
  store.addVectors(mockVectors);
  return store;
}

export function createEmptyVectorStore(): VectorStore {
  return new VectorStore();
}

export function createLargeVectorStore(count: number = 100): VectorStore {
  const store = new VectorStore();
  const vectors: EmbeddingVector[] = [];
  
  for (let i = 0; i < count; i++) {
    vectors.push({
      id: `endpoint-${i}`,
      vector: Array.from({ length: 10 }, () => Math.random()),
      metadata: {
        endpointId: `endpoint-${i}`,
        resource: `Resource${i % 3}`,
        method: ['GET', 'POST', 'PUT', 'DELETE'][i % 4],
        path: `/resource-${i % 3}/${i}`,
        type: 'description'
      }
    });
  }
  
  store.addVectors(vectors);
  return store;
}

/**
 * Build embeddings script
 *
 * This script loads the metadata index, creates text chunks from all endpoints,
 * generates embeddings, and saves them to a vector store file.
 */

import * as fs from 'fs';
import * as path from 'path';
import { ApiEndpoint } from '../src/utils/types';
import {
  createTextChunks,
  generateEmbeddings,
  TextChunk,
  EmbeddingVector
} from '../src/indexer/embeddings';
import { VectorStore } from '../src/indexer/vector';

// Paths
const METADATA_INDEX_PATH = path.join(__dirname, '../data/metadata-index.json');
const VECTOR_STORE_PATH = path.join(__dirname, '../data/vector-store.json');

/**
 * Loads the metadata index from JSON file
 */
function loadMetadataIndex(): { resources: Record<string, ApiEndpoint[]> } {
  console.log(`Loading metadata index from ${METADATA_INDEX_PATH}...`);
  
  const data = fs.readFileSync(METADATA_INDEX_PATH, 'utf-8');
  const index = JSON.parse(data);
  
  return index;
}

/**
 * Extracts all endpoints from the metadata index
 */
function getAllEndpoints(index: { resources: Record<string, ApiEndpoint[]> }): ApiEndpoint[] {
  const endpoints: ApiEndpoint[] = [];
  
  for (const [resourceName, resourceEndpoints] of Object.entries(index.resources)) {
    for (const endpoint of resourceEndpoints) {
      endpoints.push(endpoint);
    }
  }
  
  return endpoints;
}

/**
 * Builds embeddings from all endpoints
 */
async function buildEmbeddings(): Promise<void> {
  console.log('=== Building Embeddings ===\n');
  
  // Load metadata index
  const index = loadMetadataIndex();
  console.log(`Loaded metadata index with ${Object.keys(index.resources).length} resources\n`);
  
  // Extract all endpoints
  const endpoints = getAllEndpoints(index);
  console.log(`Found ${endpoints.length} total endpoints\n`);
  
  // Create text chunks from all endpoints
  console.log('Creating text chunks from endpoints...');
  const allChunks: TextChunk[] = [];
  
  for (const endpoint of endpoints) {
    const chunks = createTextChunks(endpoint);
    allChunks.push(...chunks);
  }
  
  console.log(`Created ${allChunks.length} text chunks\n`);
  
  // Generate embeddings for all chunks
  console.log('Generating embeddings...');
  const chunkTexts = allChunks.map(chunk => chunk.text);
  const embeddings = await generateEmbeddings(chunkTexts);
  console.log(`Generated ${embeddings.length} embeddings\n`);
  
  // Create embedding vectors
  console.log('Creating embedding vectors...');
  const embeddingVectors: EmbeddingVector[] = [];
  
  for (let i = 0; i < allChunks.length; i++) {
    embeddingVectors.push({
      id: allChunks[i].id,
      vector: embeddings[i],
      metadata: allChunks[i].metadata
    });
  }
  
  console.log(`Created ${embeddingVectors.length} embedding vectors\n`);
  
  // Create vector store and add vectors
  console.log('Building vector store...');
  const vectorStore = new VectorStore();
  vectorStore.addVectors(embeddingVectors);
  console.log(`Vector store now contains ${vectorStore.size()} vectors\n`);
  
  // Save vector store to file
  console.log(`Saving vector store to ${VECTOR_STORE_PATH}...`);
  const vectorStoreJson = vectorStore.toJSON();
  fs.writeFileSync(VECTOR_STORE_PATH, vectorStoreJson, 'utf-8');
  console.log('Vector store saved successfully\n');
  
  // Log statistics
  console.log('=== Statistics ===');
  console.log(`Total endpoints: ${endpoints.length}`);
  console.log(`Total text chunks: ${allChunks.length}`);
  console.log(`Total embeddings: ${embeddings.length}`);
  console.log(`Embedding dimensions: ${embeddings[0]?.length || 0}`);
  console.log(`Vector store size: ${vectorStore.size()} vectors`);
  
  // Test search functionality
  console.log('\n=== Testing Search ===');
  const testQueries = [
    'create customer',
    'get tickets',
    'update invoice',
    'delete appointment'
  ];
  
  for (const query of testQueries) {
    const results = vectorStore.search(query, 3);
    console.log(`\nQuery: "${query}"`);
    console.log(`Found ${results.length} results:`);
    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      console.log(`  ${i + 1}. [Score: ${result.score.toFixed(4)}] ${result.metadata.resource} - ${result.metadata.method} ${result.metadata.path}`);
    }
  }
  
  console.log('\n=== Build Complete ===');
}

/**
 * Main execution
 */
async function main(): Promise<void> {
  try {
    await buildEmbeddings();
    process.exit(0);
  } catch (error) {
    console.error('Error building embeddings:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

export { buildEmbeddings };

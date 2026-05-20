/**
 * Master build script for all indexes
 *
 * This script builds all indexes (metadata, embeddings, vector store) from
 * the documentation files, validates them, and reports comprehensive statistics.
 */

import * as path from 'path';
import {
  IndexBuilder,
  IndexInfo,
  IndexHealth,
} from '../src/indexer/index-builder';

// Configuration
const DOCS_PATH = path.join(__dirname, '../../docs/api');
const OUTPUT_PATH = path.join(__dirname, '../data');

/**
 * Main build function
 */
async function buildAllIndexes(): Promise<void> {
  console.log('='.repeat(60));
  console.log('Building All Indexes for RepairShopr API Documentation');
  console.log('='.repeat(60));
  console.log();

  const indexBuilder = new IndexBuilder();
  const startTime = Date.now();

  try {
    // Step 1: Build the index
    console.log('Step 1: Building index...');
    console.log(`  Documentation path: ${DOCS_PATH}`);
    console.log(`  Output path: ${OUTPUT_PATH}`);
    console.log();

    const indexInfo = await indexBuilder.buildIndex(DOCS_PATH, OUTPUT_PATH);

    console.log('✓ Index built successfully');
    console.log();

    // Step 2: Validate the index
    console.log('Step 2: Validating index...');
    const isValid = indexBuilder.validateIndex(OUTPUT_PATH);

    if (isValid) {
      console.log('✓ Index validation passed');
    } else {
      console.log('✗ Index validation failed');
    }
    console.log();

    // Step 3: Check index health
    console.log('Step 3: Checking index health...');
    const health = indexBuilder.getIndexHealth(OUTPUT_PATH);

    if (health.healthy) {
      console.log('✓ Index is healthy');
    } else {
      console.log('✗ Index has health issues:');
      for (const issue of health.issues) {
        console.log(`  - ${issue}`);
      }
    }
    console.log();

    // Step 4: Report comprehensive statistics
    const buildTime = Date.now() - startTime;
    console.log('Step 4: Index Statistics');
    console.log('-'.repeat(60));
    console.log(`Version:           ${indexInfo.version}`);
    console.log(`Timestamp:         ${indexInfo.timestamp}`);
    console.log(`Files Indexed:     ${indexInfo.fileCount}`);
    console.log(`Endpoints Indexed: ${indexInfo.endpointCount}`);
    console.log(`Chunks Created:    ${indexInfo.chunkCount}`);
    console.log(`Content Hash:      ${indexInfo.hash}`);
    console.log(`Build Time:        ${buildTime}ms`);
    console.log(
      `Health Status:     ${health.healthy ? 'Healthy' : 'Unhealthy'}`
    );
    console.log('-'.repeat(60));
    console.log();

    // Step 5: Report index files
    console.log('Step 5: Index Files Created');
    console.log('-'.repeat(60));
    console.log(`  ${path.join(OUTPUT_PATH, 'index-info.json')}`);
    console.log(`  ${path.join(OUTPUT_PATH, 'metadata-index.json')}`);
    console.log(`  ${path.join(OUTPUT_PATH, 'chunks.json')}`);
    console.log(`  ${path.join(OUTPUT_PATH, 'embeddings.json')}`);
    console.log('-'.repeat(60));
    console.log();

    // Final summary
    console.log('='.repeat(60));
    if (health.healthy && isValid) {
      console.log('✓ All indexes built and validated successfully!');
    } else {
      console.log('⚠ Index build completed with issues');
    }
    console.log('='.repeat(60));

    // Exit with appropriate code
    process.exit(health.healthy && isValid ? 0 : 1);
  } catch (error) {
    console.error('✗ Error building indexes:', error);
    console.log();
    console.log('='.repeat(60));
    console.log('✗ Index build failed');
    console.log('='.repeat(60));
    process.exit(1);
  }
}

/**
 * Rebuild all indexes from scratch
 */
async function rebuildAllIndexes(): Promise<void> {
  console.log('='.repeat(60));
  console.log('Rebuilding All Indexes from Scratch');
  console.log('='.repeat(60));
  console.log();

  const indexBuilder = new IndexBuilder();
  const startTime = Date.now();

  try {
    console.log('Rebuilding index...');
    const indexInfo = await indexBuilder.rebuildIndex(DOCS_PATH, OUTPUT_PATH);

    console.log('✓ Index rebuilt successfully');
    console.log();

    const isValid = indexBuilder.validateIndex(OUTPUT_PATH);
    const health = indexBuilder.getIndexHealth(OUTPUT_PATH);

    const buildTime = Date.now() - startTime;
    console.log('Rebuild Statistics');
    console.log('-'.repeat(60));
    console.log(`Version:           ${indexInfo.version}`);
    console.log(`Timestamp:         ${indexInfo.timestamp}`);
    console.log(`Files Indexed:     ${indexInfo.fileCount}`);
    console.log(`Endpoints Indexed: ${indexInfo.endpointCount}`);
    console.log(`Chunks Created:    ${indexInfo.chunkCount}`);
    console.log(`Content Hash:      ${indexInfo.hash}`);
    console.log(`Build Time:        ${buildTime}ms`);
    console.log(
      `Health Status:     ${health.healthy ? 'Healthy' : 'Unhealthy'}`
    );
    console.log('-'.repeat(60));
    console.log();

    console.log('='.repeat(60));
    if (health.healthy && isValid) {
      console.log('✓ All indexes rebuilt and validated successfully!');
    } else {
      console.log('⚠ Index rebuild completed with issues');
    }
    console.log('='.repeat(60));

    process.exit(health.healthy && isValid ? 0 : 1);
  } catch (error) {
    console.error('✗ Error rebuilding indexes:', error);
    console.log();
    console.log('='.repeat(60));
    console.log('✗ Index rebuild failed');
    console.log('='.repeat(60));
    process.exit(1);
  }
}

/**
 * Perform incremental update of indexes
 */
async function incrementalUpdateIndexes(): Promise<void> {
  console.log('='.repeat(60));
  console.log('Performing Incremental Index Update');
  console.log('='.repeat(60));
  console.log();

  const indexBuilder = new IndexBuilder();
  const startTime = Date.now();

  try {
    console.log('Checking for changes...');
    const indexInfo = await indexBuilder.incrementalUpdate(
      DOCS_PATH,
      OUTPUT_PATH
    );

    console.log('✓ Incremental update completed');
    console.log();

    const isValid = indexBuilder.validateIndex(OUTPUT_PATH);
    const health = indexBuilder.getIndexHealth(OUTPUT_PATH);

    const buildTime = Date.now() - startTime;
    console.log('Update Statistics');
    console.log('-'.repeat(60));
    console.log(`Version:           ${indexInfo.version}`);
    console.log(`Timestamp:         ${indexInfo.timestamp}`);
    console.log(`Files Indexed:     ${indexInfo.fileCount}`);
    console.log(`Endpoints Indexed: ${indexInfo.endpointCount}`);
    console.log(`Chunks Created:    ${indexInfo.chunkCount}`);
    console.log(`Content Hash:      ${indexInfo.hash}`);
    console.log(`Build Time:        ${buildTime}ms`);
    console.log(
      `Health Status:     ${health.healthy ? 'Healthy' : 'Unhealthy'}`
    );
    console.log('-'.repeat(60));
    console.log();

    console.log('='.repeat(60));
    if (health.healthy && isValid) {
      console.log('✓ Incremental update completed successfully!');
    } else {
      console.log('⚠ Incremental update completed with issues');
    }
    console.log('='.repeat(60));

    process.exit(health.healthy && isValid ? 0 : 1);
  } catch (error) {
    console.error('✗ Error performing incremental update:', error);
    console.log();
    console.log('='.repeat(60));
    console.log('✗ Incremental update failed');
    console.log('='.repeat(60));
    process.exit(1);
  }
}

/**
 * Check index health without rebuilding
 */
async function checkIndexHealth(): Promise<void> {
  console.log('='.repeat(60));
  console.log('Checking Index Health');
  console.log('='.repeat(60));
  console.log();

  const indexBuilder = new IndexBuilder();

  try {
    const indexInfo = indexBuilder.getIndexInfo(OUTPUT_PATH);
    const health = indexBuilder.getIndexHealth(OUTPUT_PATH);

    if (indexInfo) {
      console.log('Current Index Information');
      console.log('-'.repeat(60));
      console.log(`Version:           ${indexInfo.version}`);
      console.log(`Timestamp:         ${indexInfo.timestamp}`);
      console.log(`Files Indexed:     ${indexInfo.fileCount}`);
      console.log(`Endpoints Indexed: ${indexInfo.endpointCount}`);
      console.log(`Chunks Created:    ${indexInfo.chunkCount}`);
      console.log(`Content Hash:      ${indexInfo.hash}`);
      console.log('-'.repeat(60));
      console.log();
    } else {
      console.log('No index information found');
      console.log();
    }

    console.log('Health Status');
    console.log('-'.repeat(60));
    if (health.healthy) {
      console.log('✓ Index is healthy');
    } else {
      console.log('✗ Index has health issues:');
      for (const issue of health.issues) {
        console.log(`  - ${issue}`);
      }
    }
    console.log('-'.repeat(60));
    console.log();

    console.log('='.repeat(60));
    if (health.healthy) {
      console.log('✓ Index health check passed');
    } else {
      console.log('✗ Index health check failed');
    }
    console.log('='.repeat(60));

    process.exit(health.healthy ? 0 : 1);
  } catch (error) {
    console.error('✗ Error checking index health:', error);
    console.log();
    console.log('='.repeat(60));
    console.log('✗ Index health check failed');
    console.log('='.repeat(60));
    process.exit(1);
  }
}

// Parse command line arguments
const command = process.argv[2] || 'build';

switch (command) {
  case 'build':
    buildAllIndexes();
    break;
  case 'rebuild':
    rebuildAllIndexes();
    break;
  case 'update':
    incrementalUpdateIndexes();
    break;
  case 'health':
    checkIndexHealth();
    break;
  default:
    console.log('Usage: npm run build-indexes [command]');
    console.log();
    console.log('Commands:');
    console.log('  build    - Build all indexes (default)');
    console.log('  rebuild  - Rebuild all indexes from scratch');
    console.log('  update   - Perform incremental update');
    console.log('  health   - Check index health without rebuilding');
    console.log();
    process.exit(1);
}

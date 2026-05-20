/**
 * Script to build and save metadata index from all API documentation files
 *
 * This script:
 * 1. Parses all markdown files in the docs/api/ directory
 * 2. Builds a metadata index for fast lookups
 * 3. Saves the index to data/metadata-index.json
 * 4. Logs statistics about the parsed data
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { parseMarkdownFile } from '../src/parser/markdown';
import { buildMetadataIndex } from '../src/parser/metadata';
import { ApiDocument } from '../src/utils/types';

/**
 * Main function to build metadata index
 */
async function buildMetadataIndexScript(): Promise<void> {
  console.log('Building metadata index from API documentation...\n');

  // Path to API documentation directory
  const docsDir = path.join(process.cwd(), '..', 'docs', 'api');

  // Path to output data directory
  const dataDir = path.join(process.cwd(), 'data');

  try {
    // Read all markdown files from docs/api directory
    const files = await fs.readdir(docsDir);
    const markdownFiles = files.filter(
      (file) => file.endsWith('.md') && file !== 'index.md'
    );

    console.log(`Found ${markdownFiles.length} documentation files to parse\n`);

    // Parse all markdown files
    const documents: ApiDocument[] = [];
    for (const file of markdownFiles) {
      const filePath = path.join(docsDir, file);
      try {
        const document = await parseMarkdownFile(filePath);
        documents.push(document);
        console.log(
          `✓ Parsed: ${file} (${document.endpoints.length} endpoints)`
        );
      } catch (error) {
        console.error(`✗ Failed to parse ${file}:`, error);
      }
    }

    console.log(`\nSuccessfully parsed ${documents.length} documents\n`);

    // Build metadata index
    const index = buildMetadataIndex(documents);

    // Calculate statistics
    const totalEndpoints = index.allEndpoints.length;
    const totalResources = index.resources.size;
    const totalPermissions = index.endpointsByPermission.size;
    const totalMethods = index.endpointsByMethod.size;
    const totalParameters = index.allEndpoints.reduce(
      (sum, endpoint) =>
        sum + endpoint.parameters.length + (endpoint.requestBody?.length || 0),
      0
    );
    const totalResponses = index.allEndpoints.reduce(
      (sum, endpoint) => sum + endpoint.responses.length,
      0
    );

    // Log statistics
    console.log('=== Metadata Index Statistics ===');
    console.log(`Total Endpoints:      ${totalEndpoints}`);
    console.log(`Total Resources:      ${totalResources}`);
    console.log(`Total Permissions:    ${totalPermissions}`);
    console.log(`Total HTTP Methods:   ${totalMethods}`);
    console.log(`Total Parameters:     ${totalParameters}`);
    console.log(`Total Responses:      ${totalResponses}\n`);

    // Log resources
    console.log('=== Resources ===');
    for (const [resourceName, endpoints] of index.resources) {
      console.log(`  ${resourceName}: ${endpoints.length} endpoints`);
    }
    console.log();

    // Log HTTP methods
    console.log('=== HTTP Methods ===');
    for (const [method, endpoints] of index.endpointsByMethod) {
      console.log(`  ${method}: ${endpoints.length} endpoints`);
    }
    console.log();

    // Create data directory if it doesn't exist
    try {
      await fs.access(dataDir);
    } catch {
      await fs.mkdir(dataDir, { recursive: true });
      console.log(`Created data directory: ${dataDir}\n`);
    }

    // Save metadata index to JSON file
    const outputPath = path.join(dataDir, 'metadata-index.json');
    const indexData = {
      resources: Object.fromEntries(index.resources),
      endpointsByPath: Object.fromEntries(index.endpointsByPath),
      endpointsByPermission: Object.fromEntries(index.endpointsByPermission),
      endpointsByMethod: Object.fromEntries(index.endpointsByMethod),
      allEndpoints: index.allEndpoints,
      statistics: {
        totalEndpoints,
        totalResources,
        totalPermissions,
        totalMethods,
        totalParameters,
        totalResponses,
      },
    };

    await fs.writeFile(outputPath, JSON.stringify(indexData, null, 2), 'utf-8');
    console.log(`✓ Metadata index saved to: ${outputPath}\n`);

    console.log('Metadata index build complete!');
  } catch (error) {
    console.error('Error building metadata index:', error);
    process.exit(1);
  }
}

// Run the script
buildMetadataIndexScript().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

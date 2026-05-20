/**
 * Verification script to test the markdown parser against all documentation files
 *
 * This script attempts to parse all markdown files in docs/api/ and reports
 * any errors or issues encountered.
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { parseMarkdownFile } from '../src/parser/markdown';
import { ApiDocumentValidation } from '../src/parser/schema';

async function verifyParser(): Promise<void> {
  const apiDir = path.join(__dirname, '../../docs/api');
  const files = await fs.readdir(apiDir);
  // Skip index.md as it's a table of contents, not an API documentation file
  const markdownFiles = files
    .filter((f) => f.endsWith('.md') && f !== 'index.md')
    .sort();

  console.log(
    `Found ${markdownFiles.length} API documentation files to parse\n`
  );
  console.log('='.repeat(80));

  let successCount = 0;
  let errorCount = 0;
  const errors: Array<{ file: string; error: string }> = [];

  for (const file of markdownFiles) {
    const filePath = path.join(apiDir, file);
    console.log(`\nParsing: ${file}`);
    console.log('-'.repeat(80));

    try {
      const document = await parseMarkdownFile(filePath);

      // Validate the document
      const isValid = ApiDocumentValidation.validateDocument(document);

      if (!isValid) {
        throw new Error('Document validation failed');
      }

      console.log(`  ✓ Resource: ${document.resourceName}`);
      console.log(`  ✓ Endpoints: ${document.endpoints.length}`);

      // Validate each endpoint
      let endpointErrors = 0;
      document.endpoints.forEach((endpoint, index) => {
        const isValidEndpoint =
          ApiDocumentValidation.validateEndpoint(endpoint);
        if (!isValidEndpoint) {
          endpointErrors++;
          console.log(
            `    ✗ Endpoint ${index + 1} (${endpoint.operation}): Validation failed`
          );
        }
      });

      if (endpointErrors === 0) {
        console.log(
          `  ✓ All ${document.endpoints.length} endpoints validated successfully`
        );
        successCount++;
      } else {
        console.log(`  ✗ ${endpointErrors} endpoints failed validation`);
        errorCount++;
        errors.push({
          file,
          error: `${endpointErrors} endpoints failed validation`,
        });
      }
    } catch (error) {
      errorCount++;
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.log(`  ✗ Error: ${errorMessage}`);
      errors.push({ file, error: errorMessage });
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('\nSUMMARY');
  console.log('='.repeat(80));
  console.log(`Total files: ${markdownFiles.length}`);
  console.log(`Successfully parsed: ${successCount}`);
  console.log(`Failed: ${errorCount}`);

  if (errors.length > 0) {
    console.log('\nERRORS:');
    console.log('-'.repeat(80));
    errors.forEach(({ file, error }) => {
      console.log(`  ${file}: ${error}`);
    });
  }

  console.log('\n' + '='.repeat(80));

  if (errorCount === 0) {
    console.log('\n✓ All files parsed successfully!');
    process.exit(0);
  } else {
    console.log(`\n✗ ${errorCount} file(s) failed to parse`);
    process.exit(1);
  }
}

// Run verification
verifyParser().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

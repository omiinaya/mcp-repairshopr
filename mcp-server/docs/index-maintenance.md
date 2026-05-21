# Index Maintenance Guide

This guide describes the index building process, index structure, incremental update mechanism, maintenance procedures, and troubleshooting for the RepairShopr API documentation MCP server.

## Table of Contents

- [Overview](#overview)
- [Index Building Process](#index-building-process)
- [Index Structure and Files](#index-structure-and-files)
- [Incremental Update Mechanism](#incremental-update-mechanism)
- [Maintenance Procedures](#maintenance-procedures)
- [Troubleshooting Guide](#troubleshooting-guide)

## Overview

The MCP server uses a multi-layered indexing system to provide fast and accurate retrieval of API documentation. The indexing system consists of:

1. **Metadata Index** - Structured lookup maps for quick access by resource, path, permission, and method
2. **Text Chunks** - Segmented text content from descriptions, parameters, and responses
3. **Embeddings** - Vector representations of text chunks for semantic search
4. **Index Info** - Metadata about the index including version, timestamp, and content hash

The [`IndexBuilder`](../src/indexer/index-builder.ts) class provides functionality to build, rebuild, and incrementally update these indexes.

## Index Building Process

### Initial Build

The initial index build process follows these steps:

1. **File Discovery** - Recursively scan the documentation directory for all `.md` files
2. **Document Parsing** - Parse each markdown file using [`parseMarkdownFile()`](../src/parser/markdown.ts:26)
3. **Metadata Indexing** - Build lookup maps using [`buildMetadataIndex()`](../src/parser/metadata.ts:37)
4. **Text Chunking** - Create text chunks from endpoint content using [`createTextChunks()`](../src/indexer/embeddings.ts:165)
5. **Embedding Generation** - Generate vector embeddings using [`generateEmbeddings()`](../src/indexer/embeddings.ts:122)
6. **Hash Calculation** - Calculate SHA-256 hash of all documentation files for change detection
7. **File Persistence** - Save all indexes to JSON files in the data directory

### Running the Build

Use the master build script to build all indexes:

```bash
# Build all indexes (initial build or full rebuild)
npm run build-indexes build

# Or simply (build is the default command)
npm run build-indexes
```

The script will:

- Create the `data/` directory if it doesn't exist
- Build all indexes from documentation files
- Validate the indexes
- Report comprehensive statistics
- Exit with code 0 on success, 1 on failure

### Build Output

The build process outputs detailed information:

```
============================================================
Building All Indexes for RepairShopr API Documentation
============================================================

Step 1: Building index...
  Documentation path: /path/to/docs/api
  Output path: /path/to/data

Found 25 markdown files
Index built successfully: 25 files, 150 endpoints, 450 chunks

Step 2: Validating index...
✓ Index validation passed

Step 3: Checking index health...
✓ Index is healthy

Step 4: Index Statistics
------------------------------------------------------------
Version:           1.0.0
Timestamp:         2024-01-15T10:30:00.000Z
Files Indexed:     25
Endpoints Indexed: 150
Chunks Created:    450
Content Hash:      a1b2c3d4e5f6...
Build Time:        1250ms
Health Status:     Healthy
------------------------------------------------------------

Step 5: Index Files Created
------------------------------------------------------------
  /path/to/data/index-info.json
  /path/to/data/metadata-index.json
  /path/to/data/chunks.json
  /path/to/data/embeddings.json
------------------------------------------------------------

============================================================
✓ All indexes built and validated successfully!
============================================================
```

## Index Structure and Files

### Index Files

All index files are stored in the `data/` directory:

#### `index-info.json`

Contains metadata about the index:

```json
{
  "version": "1.0.0",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "fileCount": 25,
  "endpointCount": 150,
  "chunkCount": 450,
  "hash": "a1b2c3d4e5f6..."
}
```

**Fields:**

- `version` - Index version number
- `timestamp` - ISO 8601 timestamp when the index was created
- `fileCount` - Number of documentation files indexed
- `endpointCount` - Number of API endpoints indexed
- `chunkCount` - Number of text chunks created
- `hash` - SHA-256 hash of all documentation file contents

#### `metadata-index.json`

Contains structured lookup maps for fast access:

```json
{
  "resources": {
    "Customer": [...],
    "Ticket": [...]
  },
  "endpointsByPath": {
    "GET:/customers": {...},
    "POST:/tickets": {...}
  },
  "endpointsByPermission": {
    "customer.view": [...],
    "ticket.create": [...]
  },
  "endpointsByMethod": {
    "GET": [...],
    "POST": [...]
  },
  "allEndpoints": [...]
}
```

**Maps:**

- `resources` - Map of resource name to array of endpoints
- `endpointsByPath` - Map of "METHOD:path" to endpoint object
- `endpointsByPermission` - Map of permission to array of endpoints
- `endpointsByMethod` - Map of HTTP method to array of endpoints
- `allEndpoints` - Flat array of all endpoints

#### `chunks.json`

Contains text chunks with metadata:

```json
[
  {
    "id": "GET:/customers:description:0",
    "text": "Retrieves a list of customers...",
    "metadata": {
      "endpointId": "GET:/customers",
      "type": "description",
      "resource": "Customer",
      "method": "GET",
      "path": "/customers"
    }
  }
]
```

**Fields:**

- `id` - Unique identifier for the chunk
- `text` - The text content of the chunk
- `metadata` - Metadata about the chunk including endpoint ID, type, resource, method, and path

#### `embeddings.json`

Contains vector embeddings for each chunk:

```json
[
  [0.001, 0.002, 0.003, ...],
  [0.004, 0.005, 0.006, ...]
]
```

Each array is a vector representation of the corresponding chunk in `chunks.json`.

## Incremental Update Mechanism

### How It Works

The incremental update mechanism uses content hashing to detect changes:

1. **Read Current Index Info** - Load the existing `index-info.json` file
2. **Calculate New Hash** - Compute SHA-256 hash of all current documentation files
3. **Compare Hashes** - If hashes match, no changes detected; skip rebuild
4. **Rebuild if Changed** - If hashes differ, perform full rebuild

### Running Incremental Update

```bash
npm run build-indexes update
```

The script will:

- Check if an existing index exists
- Calculate the hash of current documentation files
- Compare with the stored hash
- Rebuild only if changes are detected
- Report whether an update was performed

### When to Use Incremental Update

Use incremental update when:

- Documentation files have been modified
- New documentation files have been added
- Documentation files have been removed
- You want to ensure the index is up-to-date without a full rebuild

### Incremental Update Output

```
============================================================
Performing Incremental Index Update
============================================================

Checking for changes...
Changes detected, rebuilding index...
Index built successfully: 26 files, 155 endpoints, 460 chunks

✓ Incremental update completed

Update Statistics
------------------------------------------------------------
Version:           1.0.0
Timestamp:         2024-01-15T11:00:00.000Z
Files Indexed:     26
Endpoints Indexed: 155
Chunks Created:    460
Content Hash:      b2c3d4e5f6a7...
Build Time:        1300ms
Health Status:     Healthy
------------------------------------------------------------

============================================================
✓ Incremental update completed successfully!
============================================================
```

If no changes are detected:

```
Checking for changes...
No changes detected, index is up to date

✓ Incremental update completed
```

## Maintenance Procedures

### Regular Maintenance Tasks

#### 1. Check Index Health

Check the health of existing indexes without rebuilding:

```bash
npm run build-indexes health
```

This will:

- Read the current index information
- Validate all index files exist
- Check index structure and content
- Report any issues found

#### 2. Rebuild from Scratch

Perform a complete rebuild of all indexes:

```bash
npm run build-indexes rebuild
```

This will:

- Delete all existing index files
- Build fresh indexes from documentation
- Validate the new indexes
- Report comprehensive statistics

Use this when:

- Index files are corrupted
- You want to ensure a clean build
- After major changes to the indexing system

#### 3. Update After Documentation Changes

After modifying documentation files:

```bash
npm run build-indexes update
```

This will:

- Detect changes using content hashing
- Rebuild only if necessary
- Ensure indexes are synchronized with documentation

### Automated Maintenance

Consider setting up automated maintenance:

#### Cron Job (Linux/macOS)

```bash
# Check index health daily at 2 AM
0 2 * * * cd /path/to/mcp-server && npm run build-indexes health

# Update indexes weekly on Sunday at 3 AM
0 3 * * 0 cd /path/to/mcp-server && npm run build-indexes update
```

#### GitHub Actions

```yaml
name: Update Indexes

on:
  push:
    paths:
      - 'docs/api/**/*.md'

jobs:
  update-indexes:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build-indexes update
      - run: git add data/
      - run: git commit -m "Update indexes"
      - run: git push
```

### Backup and Recovery

#### Backup Indexes

```bash
# Create a timestamped backup
tar -czf indexes-backup-$(date +%Y%m%d-%H%M%S).tar.gz data/
```

#### Restore Indexes

```bash
# Extract from backup
tar -xzf indexes-backup-20240115-100000.tar.gz
```

## Troubleshooting Guide

### Common Issues and Solutions

#### Issue: "Index info file not found"

**Cause:** The index has not been built yet.

**Solution:** Run the initial build:

```bash
npm run build-indexes build
```

#### Issue: "Metadata index is missing required fields"

**Cause:** The metadata index file is corrupted or incomplete.

**Solution:** Rebuild the index from scratch:

```bash
npm run build-indexes rebuild
```

#### Issue: "Could not parse markdown file"

**Cause:** A documentation file has invalid markdown format.

**Solution:**

1. Check the file mentioned in the error message
2. Ensure it follows the expected format:
   - Header: `# RepairShopr API Documentation - {Resource Name}`
   - Endpoint sections: `#### {Operation Name}`
   - Endpoint line: `**Endpoint:** `METHOD {path}``
3. Fix the formatting issues
4. Rebuild the index

#### Issue: "Embeddings file is not an array"

**Cause:** The embeddings file is corrupted or has invalid format.

**Solution:** Rebuild the index:

```bash
npm run build-indexes rebuild
```

#### Issue: "Index validation failed"

**Cause:** One or more index files are missing or invalid.

**Solution:**

1. Check index health for detailed issues:

```bash
npm run build-indexes health
```

2. Address the specific issues reported
3. Rebuild if necessary

#### Issue: "No changes detected, index is up to date" but documentation has changed

**Cause:** The hash calculation may not be detecting changes properly.

**Solution:** Force a rebuild:

```bash
npm run build-indexes rebuild
```

#### Issue: Build takes too long

**Cause:** Large number of documentation files or complex content.

**Solution:**

1. Check the number of files being indexed
2. Consider splitting documentation into smaller groups
3. Optimize the chunking process if needed

#### Issue: "Unexpected error checking index health"

**Cause:** File system permissions or disk issues.

**Solution:**

1. Check file permissions on the `data/` directory
2. Ensure sufficient disk space
3. Check for file system errors

### Debug Mode

To enable detailed logging for debugging:

1. Modify the [`IndexBuilder`](../src/indexer/index-builder.ts) class to add more console.log statements
2. Run the build script
3. Review the detailed output

### Getting Help

If you encounter issues not covered in this guide:

1. Check the console output for detailed error messages
2. Review the index health report for specific issues
3. Examine the index files for corruption or invalid data
4. Try rebuilding from scratch as a last resort

### Performance Considerations

#### Index Size

- **Small projects** (< 50 files): Build time < 1 second
- **Medium projects** (50-200 files): Build time 1-5 seconds
- **Large projects** (> 200 files): Build time 5+ seconds

#### Memory Usage

The indexing process loads all documentation files into memory. For very large projects:

1. Process files in batches
2. Increase Node.js memory limit: `node --max-old-space-size=4096`
3. Consider streaming approaches for extremely large datasets

#### Storage Requirements

Approximate storage requirements per 100 documentation files:

- `index-info.json`: < 1 KB
- `metadata-index.json`: 100-500 KB
- `chunks.json`: 1-5 MB
- `embeddings.json`: 5-20 MB

Total: ~6-25 MB per 100 files

## Best Practices

1. **Run incremental updates** after documentation changes instead of full rebuilds
2. **Check index health** regularly to catch issues early
3. **Backup indexes** before major updates
4. **Use version control** for index files to track changes
5. **Monitor build times** to detect performance degradation
6. **Validate documentation** before building indexes to avoid errors
7. **Automate maintenance** with cron jobs or CI/CD pipelines
8. **Document customizations** if you modify the indexing process

## API Reference

### IndexBuilder Class

#### Methods

- [`buildIndex(docsPath, outputPath)`](../src/indexer/index-builder.ts:40) - Build complete index from all markdown files
- [`rebuildIndex(docsPath, outputPath)`](../src/indexer/index-builder.ts:95) - Rebuild index from scratch
- [`incrementalUpdate(docsPath, outputPath)`](../src/indexer/index-builder.ts:115) - Update index with only changed files
- [`validateIndex(indexPath)`](../src/indexer/index-builder.ts:148) - Validate index integrity
- [`getIndexInfo(indexPath)`](../src/indexer/index-builder.ts:160) - Get index metadata
- [`getIndexHealth(indexPath)`](../src/indexer/index-builder.ts:178) - Check index health

### Interfaces

#### IndexInfo

```typescript
interface IndexInfo {
  version: string;
  timestamp: string;
  fileCount: number;
  endpointCount: number;
  chunkCount: number;
  hash: string;
}
```

#### IndexHealth

```typescript
interface IndexHealth {
  healthy: boolean;
  issues: string[];
}
```

## Related Documentation

- [Parsed Data Structure](./parsed-data-structure.md) - Details on the data structures used in parsing
- [MCP Server Plan](../MCP_SERVER_PLAN.md) - Overall project plan and architecture
- [API Documentation](../api/) - RepairShopr API documentation

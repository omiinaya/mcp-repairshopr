# MCP RepairShopr

MCP server for RepairShopr API documentation.

## Installation

```bash
npm install
```

## Development Setup

```bash
npm run dev
```

## Build Instructions

```bash
npm run build
```

## Test Instructions

```bash
npm test
```

## Project Structure

```
mcp-server/
├── src/
│   ├── tools/          # Tool implementations
│   ├── parser/         # Document parsing
│   ├── indexer/        # Indexing and embeddings
│   ├── retrieval/      # Context retrieval
│   ├── cache/          # Caching layer
│   └── utils/          # Utilities
├── tests/
│   ├── unit/           # Unit tests
│   ├── integration/    # Integration tests
│   └── performance/    # Performance tests
├── docs/               # Documentation
├── config/             # Configuration files
├── package.json
├── tsconfig.json
├── .eslintrc.json
├── .prettierrc
└── .gitignore
```

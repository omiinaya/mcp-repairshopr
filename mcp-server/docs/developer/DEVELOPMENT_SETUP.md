# MCP RepairShopr Development Setup Guide

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Repository Setup](#repository-setup)
3. [Development Environment](#development-environment)
4. [Building the Project](#building-the-project)
5. [Running Tests](#running-tests)
6. [Debugging](#debugging)
7. [Code Style](#code-style)
8. [Development Workflow](#development-workflow)

## Prerequisites

### Required Software

- **Node.js**: 18.0.0 or higher (20.x LTS recommended)
- **npm**: 9.0.0 or higher
- **Git**: Latest version
- **TypeScript**: 5.0.0 or higher

### Recommended Tools

- **VS Code**: Visual Studio Code with TypeScript extension
- **Docker**: For containerized development
- **Postman**: For API testing

### Verify Installation

```bash
node --version    # Should be 18.0.0 or higher
npm --version     # Should be 9.0.0 or higher
git --version     # Should show git version
tsc --version     # Should be 5.0.0 or higher
```

## Repository Setup

### Clone the Repository

```bash
git clone https://github.com/yourusername/mcp-repairshopr.git
cd mcp-repairshopr/mcp-server
```

### Install Dependencies

```bash
npm install
```

This installs all production and development dependencies.

### Verify Installation

```bash
npm run build
npm test
```

Both commands should complete without errors.

## Development Environment

### VS Code Setup

Install the recommended VS Code extensions:

1. **TypeScript** - TypeScript language support
2. **ESLint** - JavaScript/TypeScript linting
3. **Prettier** - Code formatting
4. **Jest** - Testing framework support

### Configure VS Code

Create `.vscode/settings.json`:

```json
{
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "files.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/coverage": true
  }
}
```

### Environment Configuration

Create a development environment file:

```bash
cp deploy/.env.example deploy/.env.development
```

Edit the file with your development settings:

```bash
nano deploy/.env.development
```

Recommended development settings:

```bash
NODE_ENV=development
PORT=3000
LOG_LEVEL=debug
LOG_FORMAT=text
ENABLE_HOT_RELOAD=true
ENABLE_METRICS=true
```

## Building the Project

### Development Build

For development with watch mode:

```bash
npm run dev
```

This starts the server with hot reload enabled.

### Production Build

For production build:

```bash
npm run build
```

This compiles TypeScript to JavaScript in the `dist/` directory.

### Build Output

The build process creates:

- `dist/` - Compiled JavaScript files
- `dist/**/*.js` - Transpiled source files
- `dist/**/*.d.ts` - TypeScript declaration files

### Clean Build

To clean build artifacts:

```bash
rm -rf dist/
npm run build
```

## Running Tests

### Run All Tests

```bash
npm test
```

### Run Specific Test Suites

```bash
# Unit tests only
npm run test:unit

# Integration tests only
npm run test:integration

# Performance tests only
npm run test:performance

# Accuracy tests only
npm run test:accuracy

# UAT tests only
npm run test:uat
```

### Watch Mode

Run tests in watch mode for continuous testing:

```bash
npm run test:watch
```

### Coverage Report

Generate test coverage report:

```bash
npm run test:coverage
```

The coverage report is generated in `coverage/` directory.

### Coverage Thresholds

The project aims for:
- **Statements**: 80%+
- **Branches**: 75%+
- **Functions**: 80%+
- **Lines**: 80%+

## Debugging

### VS Code Debugging

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Server",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen",
      "skipFiles": ["<node_internals>/**"]
    },
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Tests",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "test:watch", "--", "--runInBand"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

### Debugging with Node Inspector

```bash
node --inspect-brk dist/index.js
```

Then open Chrome DevTools and navigate to `chrome://inspect`.

### Logging

Enable debug logging:

```bash
export LOG_LEVEL=debug
npm run dev
```

Logs are written to `logs/mcp-server.log`.

### Common Debugging Scenarios

#### Debugging Search Issues

1. Enable debug logging
2. Check query analysis in logs
3. Verify vector store is initialized
4. Check metadata index is loaded

#### Debugging Cache Issues

1. Check cache statistics
2. Verify cache configuration
3. Monitor cache hit/miss rates
4. Check TTL settings

#### Debugging Performance Issues

1. Run performance tests
2. Monitor metrics endpoint
3. Check memory usage
4. Profile with Node.js profiler

## Code Style

### ESLint

Lint the code:

```bash
npm run lint
```

Fix linting issues automatically:

```bash
npm run lint -- --fix
```

### Prettier

Format the code:

```bash
npx prettier --write "src/**/*.ts"
```

Check formatting:

```bash
npx prettier --check "src/**/*.ts"
```

### TypeScript Type Checking

Check TypeScript types:

```bash
npx tsc --noEmit
```

### Code Style Guidelines

- Use **camelCase** for variables and functions
- Use **PascalCase** for classes and interfaces
- Use **UPPER_SNAKE_CASE** for constants
- Use **kebab-case** for file names
- Maximum line length: 100 characters
- Maximum function complexity: 15

### Example

```typescript
// Good
const maxCacheSize = 1024 * 1024;
interface CacheOptions {
  maxSize: number;
  defaultTTL: number;
}

class CacheManager {
  private cache: Map<string, any>;
  
  constructor(options: CacheOptions) {
    this.cache = new Map();
  }
  
  public get(key: string): any {
    return this.cache.get(key);
  }
}
```

## Development Workflow

### 1. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

### 2. Make Changes

- Write code following the style guidelines
- Add tests for new functionality
- Update documentation as needed

### 3. Run Tests

```bash
npm test
npm run lint
npm run build
```

### 4. Commit Changes

```bash
git add .
git commit -m "feat: add your feature description"
```

Use conventional commit messages:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Test changes
- `chore:` Maintenance tasks

### 5. Push Changes

```bash
git push origin feature/your-feature-name
```

### 6. Create Pull Request

- Create a pull request on GitHub
- Fill in the PR template
- Request review from maintainers

### 7. Address Feedback

- Make requested changes
- Update tests if needed
- Re-run tests to ensure everything passes

### 8. Merge

After approval, merge the pull request:
- Squash and merge for clean history
- Delete the feature branch

## Useful Commands

### Development

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
```

### Testing

```bash
npm test             # Run all tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Generate coverage report
```

### Code Quality

```bash
npm run lint         # Lint code
npm run lint -- --fix # Fix linting issues
npx prettier --write "src/**/*.ts" # Format code
```

### Scripts

```bash
npm run benchmark    # Run performance benchmarks
npm run validate-accuracy # Validate accuracy
npm run uat:report   # Generate UAT report
```

## Troubleshooting

### Build Errors

**Problem**: TypeScript compilation fails

**Solution**:
```bash
rm -rf dist/ node_modules/
npm install
npm run build
```

### Test Failures

**Problem**: Tests fail unexpectedly

**Solution**:
```bash
npm run test:watch
# Check test output for specific failures
```

### Port Already in Use

**Problem**: Port 3000 is already in use

**Solution**:
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use a different port
export PORT=3001
npm run dev
```

### Module Not Found

**Problem**: "Module not found" errors

**Solution**:
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

## Additional Resources

- [Architecture Documentation](./ARCHITECTURE.md)
- [API Reference](./API_REFERENCE.md)
- [Testing Guide](./TESTING.md)
- [Contribution Guide](./CONTRIBUTING.md)

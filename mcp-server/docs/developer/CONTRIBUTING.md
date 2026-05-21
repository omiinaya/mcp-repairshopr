# MCP RepairShopr Contribution Guide

## Table of Contents

1. [Getting Started](#getting-started)
2. [Code of Conduct](#code-of-conduct)
3. [Development Workflow](#development-workflow)
4. [Coding Standards](#coding-standards)
5. [Testing Guidelines](#testing-guidelines)
6. [Documentation](#documentation)
7. [Pull Request Process](#pull-request-process)
8. [Release Process](#release-process)

## Getting Started

### Prerequisites

Before contributing, ensure you have:

- Read the [Development Setup Guide](./DEVELOPMENT_SETUP.md)
- Set up your development environment
- Familiarized yourself with the [Architecture](./ARCHITECTURE.md)

### First Contribution

1. Fork the repository
2. Clone your fork locally
3. Create a feature branch
4. Make your changes
5. Submit a pull request

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors.

### Our Standards

- Use welcoming and inclusive language
- Be respectful of differing viewpoints and experiences
- Gracefully accept constructive criticism
- Focus on what is best for the community
- Show empathy towards other community members

### Unacceptable Behavior

- Harassment, trolling, or derogatory comments
- Personal or political attacks
- Public or private harassment
- Publishing others' private information
- Other unethical or unprofessional conduct

## Development Workflow

### 1. Choose an Issue

- Browse [GitHub Issues](https://github.com/yourusername/mcp-repairshopr/issues)
- Look for issues labeled `good first issue` for beginners
- Comment on the issue to claim it

### 2. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

Branch naming conventions:

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Test changes
- `chore/` - Maintenance tasks

### 3. Make Changes

Follow the coding standards outlined below.

### 4. Write Tests

Ensure all changes have appropriate test coverage.

### 5. Update Documentation

Update relevant documentation for your changes.

### 6. Run Tests

```bash
npm test
npm run lint
npm run build
```

All tests must pass before submitting a pull request.

### 7. Commit Changes

Use conventional commit messages:

```
feat: add new feature
fix: resolve bug in search functionality
docs: update API documentation
style: format code with prettier
refactor: simplify cache implementation
test: add unit tests for endpoint tool
chore: update dependencies
```

Example:

```bash
git add .
git commit -m "feat: add support for filtering by permission"
```

### 8. Push Changes

```bash
git push origin feature/your-feature-name
```

### 9. Create Pull Request

- Go to the repository on GitHub
- Click "New Pull Request"
- Select your branch
- Fill in the PR template
- Request review from maintainers

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Enable strict mode in `tsconfig.json`
- Define interfaces for all complex types
- Use type assertions sparingly
- Prefer `const` over `let`
- Use arrow functions for callbacks

### Code Style

- Follow ESLint rules
- Use Prettier for formatting
- Maximum line length: 100 characters
- Maximum function complexity: 15
- Use meaningful variable and function names

### Example

```typescript
// Good
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

  public set(key: string, value: any): void {
    this.cache.set(key, value);
  }
}

// Bad
class c {
  private x: Map<string, any>;

  constructor(o: any) {
    this.x = new Map();
  }

  public g(k: string): any {
    return this.x.get(k);
  }
}
```

### Error Handling

- Use try-catch blocks for error-prone operations
- Log errors with context
- Provide meaningful error messages
- Use custom error types when appropriate

```typescript
try {
  const result = await this.fetchData();
  return result;
} catch (error) {
  logger.error('Failed to fetch data', {
    error: error.message,
    context: { url, params },
  });
  throw new Error(`Failed to fetch data: ${error.message}`);
}
```

### Logging

- Use the structured logger
- Include relevant context
- Use appropriate log levels
- Avoid logging sensitive information

```typescript
logger.info('Processing request', {
  requestId,
  endpoint,
  method,
});

logger.error('Request failed', {
  requestId,
  error: error.message,
  stack: error.stack,
});
```

### Comments

- Document complex logic
- Explain why, not what
- Keep comments up to date
- Use JSDoc for public APIs

```typescript
/**
 * Calculate relevance score for search results
 *
 * @param query - The search query
 * @param endpoint - The endpoint to score
 * @param options - Scoring options
 * @returns Relevance score between 0 and 1
 */
public calculateScore(
  query: string,
  endpoint: Endpoint,
  options?: ScoringOptions
): number {
  // Implementation
}
```

## Testing Guidelines

### Test Structure

Organize tests by type:

```
tests/
├── unit/           # Unit tests
├── integration/    # Integration tests
├── performance/    # Performance tests
├── accuracy/       # Accuracy tests
└── uat/           # User acceptance tests
```

### Unit Tests

- Test individual functions and classes
- Mock external dependencies
- Test edge cases and error conditions
- Aim for high code coverage

```typescript
describe('CacheManager', () => {
  let cacheManager: CacheManager;

  beforeEach(() => {
    cacheManager = new CacheManager({ maxSize: 1024 });
  });

  describe('get', () => {
    it('should return cached value', () => {
      cacheManager.set('key', 'value');
      expect(cacheManager.get('key')).toBe('value');
    });

    it('should return undefined for non-existent key', () => {
      expect(cacheManager.get('nonexistent')).toBeUndefined();
    });
  });
});
```

### Integration Tests

- Test component interactions
- Use real dependencies where possible
- Test complete workflows
- Verify end-to-end functionality

```typescript
describe('Search Integration', () => {
  it('should search and return results', async () => {
    const results = await searchApiDocs(
      {
        query: 'customer',
        limit: 5,
      },
      vectorStore,
      metadataIndex
    );

    expect(results).toBeDefined();
    expect(results.length).toBeGreaterThan(0);
  });
});
```

### Performance Tests

- Measure execution time
- Test under load
- Identify bottlenecks
- Verify performance requirements

```typescript
describe('Search Performance', () => {
  it('should complete search within 100ms', async () => {
    const start = Date.now();
    await searchApiDocs({ query: 'customer' }, vectorStore, metadataIndex);
    const duration = Date.now() - start;

    expect(duration).toBeLessThan(100);
  });
});
```

### Test Coverage

Aim for:

- **Statements**: 80%+
- **Branches**: 75%+
- **Functions**: 80%+
- **Lines**: 80%+

Run coverage report:

```bash
npm run test:coverage
```

## Documentation

### Code Documentation

- Document all public APIs with JSDoc
- Include parameter descriptions
- Provide return type information
- Add usage examples

### README Updates

Update the README when:

- Adding new features
- Changing configuration options
- Modifying installation steps
- Updating dependencies

### API Documentation

Update API documentation when:

- Adding new tools
- Modifying tool parameters
- Changing response formats
- Deprecating functionality

### User Documentation

Update user documentation when:

- Changing user-facing functionality
- Adding new features
- Modifying configuration options
- Fixing bugs that affect users

## Pull Request Process

### PR Template

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing

- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] All tests passing
- [ ] Manual testing completed

## Documentation

- [ ] Code documented
- [ ] README updated
- [ ] API docs updated
- [ ] User docs updated

## Checklist

- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] No new warnings generated
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] Commit messages follow conventions
```

### Review Process

1. **Automated Checks**: CI/CD runs tests and linting
2. **Code Review**: Maintainers review the code
3. **Feedback**: Address review comments
4. **Approval**: Get approval from maintainers
5. **Merge**: Squash and merge the PR

### Review Guidelines

- Be constructive and respectful
- Focus on code quality and best practices
- Ask questions to understand the changes
- Suggest improvements when appropriate
- Approve when satisfied with the changes

## Release Process

### Versioning

Follow [Semantic Versioning](https://semver.org/):

- **MAJOR**: Incompatible API changes
- **MINOR**: Backwards-compatible functionality
- **PATCH**: Backwards-compatible bug fixes

### Release Checklist

- [ ] All tests passing
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] Version bumped in package.json
- [ ] Release notes prepared
- [ ] Tagged commit created
- [ ] Published to npm (if applicable)

### Creating a Release

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Commit changes
4. Create git tag
5. Push tag to repository
6. Create GitHub release

```bash
# Update version
npm version patch  # or minor, major

# Push changes and tags
git push origin main
git push origin --tags
```

## Getting Help

### Questions

- Ask questions in GitHub Discussions
- Check existing issues first
- Provide context and code examples

### Bug Reports

- Use GitHub Issues
- Include reproduction steps
- Provide environment details
- Attach relevant logs

### Feature Requests

- Use GitHub Issues
- Describe the use case
- Suggest implementation approach
- Consider impact on existing functionality

## Recognition

Contributors will be recognized in:

- CONTRIBUTORS.md file
- Release notes
- Project documentation

Thank you for contributing to MCP RepairShopr!

## Additional Resources

- [Development Setup Guide](./DEVELOPMENT_SETUP.md)
- [Architecture Documentation](./ARCHITECTURE.md)
- [API Reference](./API_REFERENCE.md)
- [Testing Guide](./TESTING.md)

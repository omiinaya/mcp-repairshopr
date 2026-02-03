/**
 * Test helpers and utilities for unit tests
 */

import { ApiEndpoint, ApiParameter, ApiResponse, ApiDocument } from '../../src/utils/types';
import { MetadataIndex } from '../../src/parser/metadata';
import { buildMetadataIndex } from '../../src/parser/metadata';

/**
 * Create a mock metadata index from endpoints
 */
export function createMockMetadataIndex(endpoints: ApiEndpoint[]): MetadataIndex {
  const documents: ApiDocument[] = [];
  const resourceMap = new Map<string, ApiEndpoint[]>();

  // Group endpoints by resource
  for (const endpoint of endpoints) {
    if (!resourceMap.has(endpoint.resource)) {
      resourceMap.set(endpoint.resource, []);
    }
    resourceMap.get(endpoint.resource)!.push(endpoint);
  }

  // Create documents
  for (const [resourceName, resourceEndpoints] of resourceMap) {
    documents.push({
      resourceName,
      endpoints: resourceEndpoints
    });
  }

  return buildMetadataIndex(documents);
}

/**
 * Create a minimal metadata index
 */
export function createMinimalMetadataIndex(): MetadataIndex {
  const endpoint: ApiEndpoint = {
    resource: 'Test',
    operation: 'Test Operation',
    description: 'Test description',
    method: 'GET',
    path: '/test',
    permission: 'test.view',
    parameters: [],
    responses: [
      {
        statusCode: 200,
        description: 'Success'
      }
    ]
  };

  return createMockMetadataIndex([endpoint]);
}

/**
 * Create an empty metadata index
 */
export function createEmptyMetadataIndex(): MetadataIndex {
  return {
    resources: new Map(),
    endpointsByPath: new Map(),
    endpointsByPermission: new Map(),
    endpointsByMethod: new Map(),
    allEndpoints: []
  };
}

/**
 * Wait for a specified amount of time
 */
export function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Create a mock function that can be called multiple times
 */
export function createMockFunction<T>(...returns: T[]): jest.Mock<() => T> {
  let callCount = 0;
  const mockFn = jest.fn(() => {
    const result = returns[callCount % returns.length];
    callCount++;
    return result;
  });
  return mockFn;
}

/**
 * Create a mock async function
 */
export function createMockAsyncFunction<T>(...returns: T[]): jest.Mock<() => Promise<T>> {
  let callCount = 0;
  const mockFn = jest.fn(async () => {
    const result = returns[callCount % returns.length];
    callCount++;
    return result;
  });
  return mockFn;
}

/**
 * Create a spy on an object method
 */
export function spyOnMethod<T extends object, K extends keyof T>(
  obj: T,
  method: K
): jest.SpyInstance<T[K]> {
  return jest.spyOn(obj, method as string);
}

/**
 * Restore all mocked functions
 */
export function restoreAllMocks(): void {
  jest.restoreAllMocks();
}

/**
 * Clear all mocks
 */
export function clearAllMocks(): void {
  jest.clearAllMocks();
}

/**
 * Reset all mocks
 */
export function resetAllMocks(): void {
  jest.resetAllMocks();
}

/**
 * Reset modules for testing
 */
export async function resetModules(): Promise<void> {
  jest.resetModules();
}

/**
 * Set system time for testing (mock Date.now)
 */
export function mockSystemTime(timestamp: number): void {
  jest.spyOn(Date, 'now').mockReturnValue(timestamp);
}

/**
 * Restore system time
 */
export function restoreSystemTime(): void {
  jest.spyOn(Date, 'now').mockRestore();
}

/**
 * Create a mock file system
 */
export function createMockFileSystem(files: Record<string, string>): any {
  const fs = require('fs');
  const originalReadFileSync = fs.readFileSync;
  const originalReadFile = fs.readFile;
  const originalExistsSync = fs.existsSync;
  const originalExists = fs.exists;

  // Mock readFileSync
  fs.readFileSync = jest.fn((path: string) => {
    const normalizedPath = path.replace(/^\.\//, '');
    if (files[normalizedPath]) {
      return files[normalizedPath];
    }
    throw new Error(`File not found: ${path}`);
  });

  // Mock readFile
  fs.readFile = jest.fn((path: string, callback: any) => {
    const normalizedPath = path.replace(/^\.\//, '');
    if (files[normalizedPath]) {
      callback(null, files[normalizedPath]);
    } else {
      callback(new Error(`File not found: ${path}`));
    }
  });

  // Mock existsSync
  fs.existsSync = jest.fn((path: string) => {
    const normalizedPath = path.replace(/^\.\//, '');
    return files.hasOwnProperty(normalizedPath);
  });

  // Mock exists
  fs.exists = jest.fn((path: string, callback: any) => {
    const normalizedPath = path.replace(/^\.\//, '');
    callback(files.hasOwnProperty(normalizedPath));
  });

  return {
    restore: () => {
      fs.readFileSync = originalReadFileSync;
      fs.readFile = originalReadFile;
      fs.existsSync = originalExistsSync;
      fs.exists = originalExists;
    }
  };
}

/**
 * Create a mock console for testing
 */
export function createMockConsole(): {
  logs: string[];
  errors: string[];
  warns: string[];
  infos: string[];
  originalConsole: typeof console;
} {
  const logs: string[] = [];
  const errors: string[] = [];
  const warns: string[] = [];
  const infos: string[] = [];

  const originalConsole = { ...console };

  console.log = (...args: any[]) => logs.push(args.join(' '));
  console.error = (...args: any[]) => errors.push(args.join(' '));
  console.warn = (...args: any[]) => warns.push(args.join(' '));
  console.info = (...args: any[]) => infos.push(args.join(' '));

  return {
    logs,
    errors,
    warns,
    infos,
    originalConsole,
    restore: () => {
      Object.assign(console, originalConsole);
    }
  };
}

/**
 * Assert that a function throws an error
 */
export async function assertThrows(
  fn: () => any,
  errorMessage?: string
): Promise<void> {
  try {
    await fn();
    throw new Error('Expected function to throw an error');
  } catch (error) {
    if (errorMessage && !(error as Error).message.includes(errorMessage)) {
      throw new Error(`Expected error message to include "${errorMessage}"`);
    }
  }
}

/**
 * Assert that a promise rejects
 */
export async function assertRejects(
  promise: Promise<any>,
  errorMessage?: string
): Promise<void> {
  try {
    await promise;
    throw new Error('Expected promise to reject');
  } catch (error) {
    if (errorMessage && !(error as Error).message.includes(errorMessage)) {
      throw new Error(`Expected error message to include "${errorMessage}"`);
    }
  }
}

/**
 * Create a mock event emitter
 */
export function createMockEventEmitter(): {
  listeners: Map<string, Function[]>;
  on: jest.Mock;
  emit: jest.Mock;
  off: jest.Mock;
} {
  const listeners = new Map<string, Function[]>();

  return {
    listeners,
    on: jest.fn((event: string, listener: Function) => {
      if (!listeners.has(event)) {
        listeners.set(event, []);
      }
      listeners.get(event)!.push(listener);
    }),
    emit: jest.fn((event: string, ...args: any[]) => {
      if (listeners.has(event)) {
        listeners.get(event)!.forEach(listener => listener(...args));
      }
    }),
    off: jest.fn((event: string, listener: Function) => {
      if (listeners.has(event)) {
        const index = listeners.get(event)!.indexOf(listener);
        if (index > -1) {
          listeners.get(event)!.splice(index, 1);
        }
      }
    })
  };
}

/**
 * Create a mock stream
 */
export function createMockStream(): {
  data: any[];
  ended: boolean;
  write: jest.Mock;
  end: jest.Mock;
  on: jest.Mock;
} {
  const data: any[] = [];
  let ended = false;

  return {
    data,
    ended,
    write: jest.fn((chunk: any) => {
      if (!ended) {
        data.push(chunk);
      }
    }),
    end: jest.fn(() => {
      ended = true;
    }),
    on: jest.fn()
  };
}

/**
 * Generate a random string
 */
export function randomString(length: number = 10): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Generate a random number
 */
export function randomNumber(min: number = 0, max: number = 100): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate a random boolean
 */
export function randomBoolean(): boolean {
  return Math.random() < 0.5;
}

/**
 * Generate a random date
 */
export function randomDate(start: Date = new Date(2020, 0, 1), end: Date = new Date()): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

/**
 * Generate a random email
 */
export function randomEmail(): string {
  const domains = ['example.com', 'test.com', 'demo.com', 'sample.com'];
  const username = randomString(8).toLowerCase();
  const domain = domains[randomNumber(0, domains.length - 1)];
  return `${username}@${domain}`;
}

/**
 * Generate a random URL
 */
export function randomUrl(): string {
  const paths = ['api/v1', 'api/v2', 'rest', 'graphql'];
  const resources = ['users', 'posts', 'comments', 'likes'];
  const path = paths[randomNumber(0, paths.length - 1)];
  const resource = resources[randomNumber(0, resources.length - 1)];
  return `https://example.com/${path}/${resource}`;
}

/**
 * Generate a random UUID
 */
export function randomUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Create a deep clone of an object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Compare two objects for deep equality
 */
export function deepEqual(a: any, b: any): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

/**
 * Measure execution time of a function
 */
export async function measureTime<T>(fn: () => Promise<T>): Promise<{ result: T; time: number }> {
  const start = Date.now();
  const result = await fn();
  const time = Date.now() - start;
  return { result, time };
}

/**
 * Retry a function with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  delay: number = 100
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxAttempts) {
        await wait(delay * Math.pow(2, attempt - 1));
      }
    }
  }
  
  throw lastError;
}

/**
 * Create a mock cache entry
 */
export function createMockCacheEntry<T>(
  key: string,
  value: T,
  ttl: number = 60000
): {
  key: string;
  value: T;
  timestamp: number;
  ttl: number;
  expired: boolean;
} {
  const timestamp = Date.now();
  return {
    key,
    value,
    timestamp,
    ttl,
    expired: Date.now() - timestamp > ttl
  };
}

/**
 * Create a batch of mock cache entries
 */
export function createMockCacheEntries<T>(
  count: number,
  valueGenerator: (index: number) => T,
  ttl: number = 60000
): ReturnType<typeof createMockCacheEntry<T>>[] {
  return Array.from({ length: count }, (_, i) =>
    createMockCacheEntry(`key-${i}`, valueGenerator(i), ttl)
  );
}

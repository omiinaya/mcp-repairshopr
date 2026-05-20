/**
 * Caching module for query result caching
 * Implements LRU (Least Recently Used) eviction policy and TTL (Time To Live) expiration
 */

/**
 * Cache entry interface
 */
export interface CacheEntry<T> {
  key: string;
  value: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  size: number;
}

/**
 * Cache statistics interface
 */
export interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
  totalEntries: number;
  totalSize: number;
  evictions: number;
}

/**
 * Cache configuration interface
 */
export interface CacheConfig {
  maxSize: number;
  defaultTTL: number;
  maxEntries: number;
  enableWarming: boolean;
}

/**
 * Default cache configuration
 */
const DEFAULT_CONFIG: CacheConfig = {
  maxSize: 10 * 1024 * 1024, // 10MB
  defaultTTL: 5 * 60 * 1000, // 5 minutes
  maxEntries: 1000,
  enableWarming: true,
};

/**
 * Cache class implementing LRU eviction and TTL expiration
 */
export class Cache<T> {
  private cache: Map<string, CacheEntry<T>>;
  private accessOrder: string[];
  private config: CacheConfig;
  private stats: {
    hits: number;
    misses: number;
    evictions: number;
  };

  constructor(config?: Partial<CacheConfig>) {
    this.cache = new Map();
    this.accessOrder = [];
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
    };
  }

  /**
   * Get value from cache
   * @param key - Cache key
   * @returns Cached value or null if not found or expired
   */
  get(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.misses++;
      return null;
    }

    // Check if entry has expired
    if (this.isExpired(entry)) {
      this.delete(key);
      this.stats.misses++;
      return null;
    }

    // Update access count and move to end of access order (most recently used)
    entry.accessCount++;
    this.updateAccessOrder(key);

    this.stats.hits++;
    return entry.value;
  }

  /**
   * Set value in cache
   * @param key - Cache key
   * @param value - Value to cache
   * @param ttl - Optional TTL in milliseconds (uses default if not provided)
   */
  set(key: string, value: T, ttl?: number): void {
    const entryTTL = ttl ?? this.config.defaultTTL;
    const size = this.calculateSize(value);

    // Check if we need to evict entries before adding
    this.evictIfNeeded(size);

    const entry: CacheEntry<T> = {
      key,
      value,
      timestamp: Date.now(),
      ttl: entryTTL,
      accessCount: 0,
      size,
    };

    this.cache.set(key, entry);
    this.updateAccessOrder(key);
  }

  /**
   * Delete entry from cache
   * @param key - Cache key
   * @returns True if entry was deleted, false if not found
   */
  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.removeFromAccessOrder(key);
    }
    return deleted;
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
    this.accessOrder = [];
  }

  /**
   * Invalidate entries matching pattern
   * @param pattern - Pattern to match (supports wildcards *)
   * @returns Number of entries invalidated
   */
  invalidate(pattern: string): number {
    let count = 0;
    const keysToDelete: string[] = [];

    for (const key of this.cache.keys()) {
      if (this.matchesPattern(key, pattern)) {
        keysToDelete.push(key);
      }
    }

    for (const key of keysToDelete) {
      if (this.delete(key)) {
        count++;
      }
    }

    return count;
  }

  /**
   * Warm cache with entries
   * @param entries - Entries to warm the cache with
   */
  warmCache(entries: CacheEntry<T>[]): void {
    if (!this.config.enableWarming) {
      return;
    }

    for (const entry of entries) {
      // Skip expired entries
      if (this.isExpired(entry)) {
        continue;
      }

      // Check if we need to evict entries before adding
      this.evictIfNeeded(entry.size);

      this.cache.set(entry.key, entry);
      this.updateAccessOrder(entry.key);
    }
  }

  /**
   * Get cache statistics
   * @returns Cache statistics
   */
  getStats(): CacheStats {
    const totalRequests = this.stats.hits + this.stats.misses;
    const hitRate = totalRequests > 0 ? this.stats.hits / totalRequests : 0;

    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate,
      totalEntries: this.cache.size,
      totalSize: this.getSize(),
      evictions: this.stats.evictions,
    };
  }

  /**
   * Get current cache size in bytes
   * @returns Total size of all cached entries
   */
  getSize(): number {
    let totalSize = 0;
    for (const entry of this.cache.values()) {
      totalSize += entry.size;
    }
    return totalSize;
  }

  /**
   * Get number of cached entries
   * @returns Number of entries in cache
   */
  getEntryCount(): number {
    return this.cache.size;
  }

  /**
   * Evict oldest entry when full
   */
  evictOldest(): void {
    if (this.accessOrder.length === 0) {
      return;
    }

    const oldestKey = this.accessOrder[0];
    if (this.delete(oldestKey)) {
      this.stats.evictions++;
    }
  }

  /**
   * Evict least recently used entry
   */
  evictLeastRecentlyUsed(): void {
    if (this.accessOrder.length === 0) {
      return;
    }

    const lruKey = this.accessOrder[0];
    if (this.delete(lruKey)) {
      this.stats.evictions++;
    }
  }

  /**
   * Check if cache entry has expired
   * @param entry - Cache entry to check
   * @returns True if entry has expired
   */
  private isExpired(entry: CacheEntry<T>): boolean {
    const now = Date.now();
    return now - entry.timestamp > entry.ttl;
  }

  /**
   * Update access order for LRU tracking
   * @param key - Cache key to update
   */
  private updateAccessOrder(key: string): void {
    // Remove key from current position
    this.removeFromAccessOrder(key);
    // Add to end (most recently used)
    this.accessOrder.push(key);
  }

  /**
   * Remove key from access order
   * @param key - Cache key to remove
   */
  private removeFromAccessOrder(key: string): void {
    const index = this.accessOrder.indexOf(key);
    if (index > -1) {
      this.accessOrder.splice(index, 1);
    }
  }

  /**
   * Check if key matches pattern
   * @param key - Cache key
   * @param pattern - Pattern to match (supports wildcards *)
   * @returns True if key matches pattern
   */
  private matchesPattern(key: string, pattern: string): boolean {
    const regexPattern = pattern.replace(/\*/g, '.*').replace(/\?/g, '.');
    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(key);
  }

  /**
   * Calculate size of value in bytes
   * @param value - Value to calculate size for
   * @returns Size in bytes
   */
  private calculateSize(value: T): number {
    try {
      const jsonString = JSON.stringify(value);
      return new Blob([jsonString]).size;
    } catch {
      // Fallback to string length if JSON serialization fails
      return String(value).length * 2; // Assume 2 bytes per character
    }
  }

  /**
   * Evict entries if needed based on size and entry count limits
   * @param entrySize - Size of entry to be added
   */
  private evictIfNeeded(entrySize: number): void {
    const currentSize = this.getSize();
    const currentEntries = this.getEntryCount();

    // Evict based on size limit
    while (
      currentSize + entrySize > this.config.maxSize &&
      this.accessOrder.length > 0
    ) {
      this.evictLeastRecentlyUsed();
    }

    // Evict based on entry count limit
    while (
      currentEntries >= this.config.maxEntries &&
      this.accessOrder.length > 0
    ) {
      this.evictLeastRecentlyUsed();
    }
  }

  /**
   * Get cache configuration
   * @returns Current cache configuration
   */
  getConfig(): CacheConfig {
    return { ...this.config };
  }

  /**
   * Update cache configuration
   * @param config - New configuration (partial)
   */
  updateConfig(config: Partial<CacheConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Reset cache statistics
   */
  resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
    };
  }
}

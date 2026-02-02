/**
 * Unit tests for cache module
 */

import { Cache, CacheEntry, CacheStats, CacheConfig } from '../../src/cache/cache';

describe('Cache', () => {
  let cache: Cache<any>;

  beforeEach(() => {
    cache = new Cache();
  });

  describe('get/set operations', () => {
    test('should set and get a value', () => {
      cache.set('key1', 'value1');
      expect(cache.get('key1')).toBe('value1');
    });

    test('should return null for non-existent key', () => {
      expect(cache.get('nonexistent')).toBeNull();
    });

    test('should update existing key', () => {
      cache.set('key1', 'value1');
      cache.set('key1', 'value2');
      expect(cache.get('key1')).toBe('value2');
    });

    test('should store complex objects', () => {
      const complexValue = {
        name: 'test',
        nested: { value: 123 },
        array: [1, 2, 3]
      };
      cache.set('complex', complexValue);
      expect(cache.get('complex')).toEqual(complexValue);
    });

    test('should track access count', () => {
      cache.set('key1', 'value1');
      cache.get('key1');
      cache.get('key1');
      cache.get('key1');
      const stats = cache.getStats();
      expect(stats.hits).toBe(3);
    });
  });

  describe('cache invalidation with patterns', () => {
    test('should invalidate entries matching wildcard pattern', () => {
      cache.set('user:1', { id: 1 });
      cache.set('user:2', { id: 2 });
      cache.set('product:1', { id: 1 });
      
      const count = cache.invalidate('user:*');
      expect(count).toBe(2);
      expect(cache.get('user:1')).toBeNull();
      expect(cache.get('user:2')).toBeNull();
      expect(cache.get('product:1')).not.toBeNull();
    });

    test('should invalidate entries matching exact pattern', () => {
      cache.set('exact-key', 'value');
      cache.set('other-key', 'value2');
      
      const count = cache.invalidate('exact-key');
      expect(count).toBe(1);
      expect(cache.get('exact-key')).toBeNull();
      expect(cache.get('other-key')).not.toBeNull();
    });

    test('should return 0 when no entries match pattern', () => {
      cache.set('key1', 'value1');
      const count = cache.invalidate('nonexistent:*');
      expect(count).toBe(0);
    });

    test('should handle multiple wildcards in pattern', () => {
      cache.set('a:b:c', 'value1');
      cache.set('a:b:d', 'value2');
      cache.set('x:y:z', 'value3');
      
      const count = cache.invalidate('a:*:*');
      expect(count).toBe(2);
      expect(cache.get('a:b:c')).toBeNull();
      expect(cache.get('a:b:d')).toBeNull();
      expect(cache.get('x:y:z')).not.toBeNull();
    });
  });

  describe('cache warming', () => {
    test('should warm cache with entries', () => {
      const entries: CacheEntry<string>[] = [
        {
          key: 'warm1',
          value: 'value1',
          timestamp: Date.now(),
          ttl: 60000,
          accessCount: 0,
          size: 10
        },
        {
          key: 'warm2',
          value: 'value2',
          timestamp: Date.now(),
          ttl: 60000,
          accessCount: 0,
          size: 10
        }
      ];

      cache.warmCache(entries);
      expect(cache.get('warm1')).toBe('value1');
      expect(cache.get('warm2')).toBe('value2');
    });

    test('should skip expired entries during warming', () => {
      const entries: CacheEntry<string>[] = [
        {
          key: 'expired',
          value: 'value1',
          timestamp: Date.now() - 100000,
          ttl: 1000,
          accessCount: 0,
          size: 10
        },
        {
          key: 'valid',
          value: 'value2',
          timestamp: Date.now(),
          ttl: 60000,
          accessCount: 0,
          size: 10
        }
      ];

      cache.warmCache(entries);
      expect(cache.get('expired')).toBeNull();
      expect(cache.get('valid')).toBe('value2');
    });

    test('should not warm cache when disabled', () => {
      const cacheNoWarming = new Cache({ enableWarming: false });
      const entries: CacheEntry<string>[] = [
        {
          key: 'warm1',
          value: 'value1',
          timestamp: Date.now(),
          ttl: 60000,
          accessCount: 0,
          size: 10
        }
      ];

      cacheNoWarming.warmCache(entries);
      expect(cacheNoWarming.get('warm1')).toBeNull();
    });
  });

  describe('cache statistics', () => {
    test('should track cache hits and misses', () => {
      cache.set('key1', 'value1');
      cache.get('key1'); // hit
      cache.get('key1'); // hit
      cache.get('nonexistent'); // miss

      const stats = cache.getStats();
      expect(stats.hits).toBe(2);
      expect(stats.misses).toBe(1);
      expect(stats.hitRate).toBe(2 / 3);
    });

    test('should calculate hit rate correctly', () => {
      cache.set('key1', 'value1');
      cache.get('key1'); // hit
      cache.get('key2'); // miss

      const stats = cache.getStats();
      expect(stats.hitRate).toBe(0.5);
    });

    test('should return 0 hit rate when no requests', () => {
      const stats = cache.getStats();
      expect(stats.hitRate).toBe(0);
    });

    test('should track total entries', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');

      const stats = cache.getStats();
      expect(stats.totalEntries).toBe(3);
    });

    test('should track total size', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');

      const stats = cache.getStats();
      expect(stats.totalSize).toBeGreaterThan(0);
    });

    test('should track evictions', () => {
      const smallCache = new Cache({ maxEntries: 2 });
      smallCache.set('key1', 'value1');
      smallCache.set('key2', 'value2');
      smallCache.set('key3', 'value3'); // Should evict one

      const stats = smallCache.getStats();
      expect(stats.evictions).toBeGreaterThan(0);
    });

    test('should reset statistics', () => {
      cache.set('key1', 'value1');
      cache.get('key1');
      cache.get('nonexistent');

      cache.resetStats();
      const stats = cache.getStats();
      expect(stats.hits).toBe(0);
      expect(stats.misses).toBe(0);
      expect(stats.evictions).toBe(0);
    });
  });

  describe('cache size management', () => {
    test('should get current cache size', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');

      const size = cache.getSize();
      expect(size).toBeGreaterThan(0);
    });

    test('should get entry count', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');

      expect(cache.getEntryCount()).toBe(3);
    });

    test('should evict based on max entries limit', () => {
      const smallCache = new Cache({ maxEntries: 2 });
      smallCache.set('key1', 'value1');
      smallCache.set('key2', 'value2');
      smallCache.set('key3', 'value3');

      expect(smallCache.getEntryCount()).toBe(2);
      expect(smallCache.get('key1')).toBeNull(); // Oldest evicted
    });

    test('should evict based on max size limit', () => {
      const sizeLimitedCache = new Cache({ maxSize: 50 });
      sizeLimitedCache.set('key1', 'x'.repeat(30));
      sizeLimitedCache.set('key2', 'x'.repeat(30));
      sizeLimitedCache.set('key3', 'x'.repeat(30));

      expect(sizeLimitedCache.getSize()).toBeLessThanOrEqual(50);
    });

    test('should update access order on get', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.get('key1'); // key1 becomes most recently used
      cache.set('key3', 'value3');

      // With maxEntries=2, key2 should be evicted (least recently used)
      const smallCache = new Cache({ maxEntries: 2 });
      smallCache.set('key1', 'value1');
      smallCache.set('key2', 'value2');
      smallCache.get('key1'); // key1 becomes most recently used
      smallCache.set('key3', 'value3');

      expect(smallCache.get('key1')).not.toBeNull();
      expect(smallCache.get('key2')).toBeNull();
      expect(smallCache.get('key3')).not.toBeNull();
    });
  });

  describe('cache eviction policies', () => {
    test('should evict oldest entry', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.evictOldest();

      expect(cache.get('key1')).toBeNull();
      expect(cache.get('key2')).not.toBeNull();
    });

    test('should evict least recently used entry', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');
      cache.get('key1'); // key1 becomes most recently used
      cache.evictLeastRecentlyUsed();

      expect(cache.get('key1')).not.toBeNull();
      expect(cache.get('key2')).toBeNull(); // LRU
      expect(cache.get('key3')).not.toBeNull();
    });

    test('should handle eviction when cache is empty', () => {
      expect(() => cache.evictOldest()).not.toThrow();
      expect(() => cache.evictLeastRecentlyUsed()).not.toThrow();
    });
  });

  describe('TTL expiration', () => {
    test('should expire entries after TTL', (done) => {
      cache.set('key1', 'value1', 100); // 100ms TTL
      setTimeout(() => {
        expect(cache.get('key1')).toBeNull();
        done();
      }, 150);
    });

    test('should not expire entries before TTL', (done) => {
      cache.set('key1', 'value1', 1000); // 1s TTL
      setTimeout(() => {
        expect(cache.get('key1')).toBe('value1');
        done();
      }, 100);
    });

    test('should use default TTL when not specified', (done) => {
      const cacheWithShortTTL = new Cache({ defaultTTL: 100 });
      cacheWithShortTTL.set('key1', 'value1');
      setTimeout(() => {
        expect(cacheWithShortTTL.get('key1')).toBeNull();
        done();
      }, 150);
    });

    test('should count expired entries as misses', (done) => {
      cache.set('key1', 'value1', 100);
      setTimeout(() => {
        cache.get('key1'); // Should be a miss
        const stats = cache.getStats();
        expect(stats.misses).toBe(1);
        done();
      }, 150);
    });
  });

  describe('delete and clear operations', () => {
    test('should delete entry', () => {
      cache.set('key1', 'value1');
      const deleted = cache.delete('key1');
      expect(deleted).toBe(true);
      expect(cache.get('key1')).toBeNull();
    });

    test('should return false when deleting non-existent entry', () => {
      const deleted = cache.delete('nonexistent');
      expect(deleted).toBe(false);
    });

    test('should clear all entries', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');

      cache.clear();
      expect(cache.getEntryCount()).toBe(0);
      expect(cache.get('key1')).toBeNull();
      expect(cache.get('key2')).toBeNull();
      expect(cache.get('key3')).toBeNull();
    });
  });

  describe('configuration', () => {
    test('should use default configuration', () => {
      const config = cache.getConfig();
      expect(config.maxSize).toBe(10 * 1024 * 1024);
      expect(config.defaultTTL).toBe(5 * 60 * 1000);
      expect(config.maxEntries).toBe(1000);
      expect(config.enableWarming).toBe(true);
    });

    test('should use custom configuration', () => {
      const customCache = new Cache({
        maxSize: 1024,
        defaultTTL: 10000,
        maxEntries: 10,
        enableWarming: false
      });

      const config = customCache.getConfig();
      expect(config.maxSize).toBe(1024);
      expect(config.defaultTTL).toBe(10000);
      expect(config.maxEntries).toBe(10);
      expect(config.enableWarming).toBe(false);
    });

    test('should update configuration', () => {
      cache.updateConfig({ maxEntries: 50 });
      const config = cache.getConfig();
      expect(config.maxEntries).toBe(50);
      expect(config.defaultTTL).toBe(5 * 60 * 1000); // Unchanged
    });
  });

  describe('edge cases', () => {
    test('should handle empty string keys', () => {
      cache.set('', 'value');
      expect(cache.get('')).toBe('value');
    });

    test('should handle null and undefined values', () => {
      cache.set('null', null);
      cache.set('undefined', undefined);
      expect(cache.get('null')).toBeNull();
      expect(cache.get('undefined')).toBeUndefined();
    });

    test('should handle very large values', () => {
      const largeValue = 'x'.repeat(1000000);
      cache.set('large', largeValue);
      expect(cache.get('large')).toBe(largeValue);
    });

    test('should handle special characters in keys', () => {
      const specialKeys = ['key:with:colons', 'key/with/slashes', 'key.with.dots'];
      for (const key of specialKeys) {
        cache.set(key, `value-${key}`);
        expect(cache.get(key)).toBe(`value-${key}`);
      }
    });
  });
});

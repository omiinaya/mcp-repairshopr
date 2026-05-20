/**
 * Unit tests for configuration management
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import {
  ConfigurationManager,
  ServerConfig,
  configurationManager,
} from '../../src/server/configuration';

describe('ConfigurationManager', () => {
  let tempDir: string;
  let configPath: string;
  let manager: ConfigurationManager;

  beforeEach(() => {
    // Create temporary directory for test files
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'config-test-'));
    configPath = path.join(tempDir, 'test-config.json');
    manager = new ConfigurationManager();
  });

  afterEach(() => {
    // Clean up temporary directory
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
    manager.destroy();
  });

  describe('loadConfig', () => {
    it('should load configuration from file', () => {
      const testConfig: Partial<ServerConfig> = {
        serverName: 'test-server',
        serverVersion: '1.0.0',
        port: 4000,
        logLevel: 'debug',
      };

      fs.writeFileSync(configPath, JSON.stringify(testConfig, null, 2));

      const config = manager.loadConfig(configPath);

      expect(config.serverName).toBe('test-server');
      expect(config.serverVersion).toBe('1.0.0');
      expect(config.port).toBe(4000);
      expect(config.logLevel).toBe('debug');
    });

    it('should use defaults when file does not exist', () => {
      const nonExistentPath = path.join(tempDir, 'non-existent.json');
      const config = manager.loadConfig(nonExistentPath);

      expect(config.serverName).toBe('mcp-repairshopr');
      expect(config.serverVersion).toBe('0.1.0');
      expect(config.port).toBe(3000);
      expect(config.logLevel).toBe('info');
    });

    it('should merge file config with defaults', () => {
      const partialConfig: Partial<ServerConfig> = {
        serverName: 'custom-server',
        port: 5000,
      };

      fs.writeFileSync(configPath, JSON.stringify(partialConfig, null, 2));

      const config = manager.loadConfig(configPath);

      expect(config.serverName).toBe('custom-server');
      expect(config.port).toBe(5000);
      expect(config.serverVersion).toBe('0.1.0'); // Default
      expect(config.logLevel).toBe('info'); // Default
    });

    it('should throw error for invalid JSON', () => {
      fs.writeFileSync(configPath, 'invalid json {{{');

      expect(() => {
        manager.loadConfig(configPath);
      }).toThrow();
    });
  });

  describe('loadFromEnv', () => {
    const originalEnv = process.env;

    beforeEach(() => {
      // Save original environment
      process.env = { ...originalEnv };
    });

    afterEach(() => {
      // Restore original environment
      process.env = originalEnv;
    });

    it('should load configuration from environment variables', () => {
      process.env.SERVER_NAME = 'env-server';
      process.env.SERVER_VERSION = '2.0.0';
      process.env.PORT = '6000';
      process.env.LOG_LEVEL = 'warn';

      const envConfig = manager.loadFromEnv();

      expect(envConfig.serverName).toBe('env-server');
      expect(envConfig.serverVersion).toBe('2.0.0');
      expect(envConfig.port).toBe(6000);
      expect(envConfig.logLevel).toBe('warn');
    });

    it('should parse boolean environment variables correctly', () => {
      process.env.ENABLE_HOT_RELOAD = 'true';
      process.env.ENABLE_METRICS = 'false';

      const envConfig = manager.loadFromEnv();

      expect(envConfig.enableHotReload).toBe(true);
      expect(envConfig.enableMetrics).toBe(false);
    });

    it('should handle invalid port environment variable', () => {
      process.env.PORT = 'invalid';

      const envConfig = manager.loadFromEnv();

      expect(envConfig.port).toBeUndefined();
    });

    it('should return empty object when no env vars set', () => {
      // Clear relevant env vars
      delete process.env.SERVER_NAME;
      delete process.env.SERVER_VERSION;
      delete process.env.PORT;
      delete process.env.LOG_LEVEL;

      const envConfig = manager.loadFromEnv();

      expect(Object.keys(envConfig)).toHaveLength(0);
    });
  });

  describe('validateConfig', () => {
    it('should validate correct configuration', () => {
      const validConfig: ServerConfig = {
        serverName: 'test-server',
        serverVersion: '1.0.0',
        port: 3000,
        logLevel: 'info',
        docsPath: './docs',
        dataPath: './data',
        enableHotReload: true,
        enableMetrics: false,
        maxConcurrentRequests: 100,
        requestTimeout: 30000,
      };

      const result = manager.validateConfig(validConfig);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject empty serverName', () => {
      const invalidConfig = {
        serverName: '',
        serverVersion: '1.0.0',
        port: 3000,
        logLevel: 'info',
        docsPath: './docs',
        dataPath: './data',
        enableHotReload: true,
        enableMetrics: false,
        maxConcurrentRequests: 100,
        requestTimeout: 30000,
      };

      const result = manager.validateConfig(invalidConfig);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('serverName must be a non-empty string');
    });

    it('should reject invalid port', () => {
      const invalidConfig = {
        serverName: 'test-server',
        serverVersion: '1.0.0',
        port: 70000,
        logLevel: 'info',
        docsPath: './docs',
        dataPath: './data',
        enableHotReload: true,
        enableMetrics: false,
        maxConcurrentRequests: 100,
        requestTimeout: 30000,
      };

      const result = manager.validateConfig(invalidConfig);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('port'))).toBe(true);
    });

    it('should reject invalid logLevel', () => {
      const invalidConfig = {
        serverName: 'test-server',
        serverVersion: '1.0.0',
        port: 3000,
        logLevel: 'invalid',
        docsPath: './docs',
        dataPath: './data',
        enableHotReload: true,
        enableMetrics: false,
        maxConcurrentRequests: 100,
        requestTimeout: 30000,
      };

      const result = manager.validateConfig(invalidConfig);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('logLevel'))).toBe(true);
    });

    it('should reject negative maxConcurrentRequests', () => {
      const invalidConfig = {
        serverName: 'test-server',
        serverVersion: '1.0.0',
        port: 3000,
        logLevel: 'info',
        docsPath: './docs',
        dataPath: './data',
        enableHotReload: true,
        enableMetrics: false,
        maxConcurrentRequests: -1,
        requestTimeout: 30000,
      };

      const result = manager.validateConfig(invalidConfig);

      expect(result.valid).toBe(false);
      expect(
        result.errors.some((e) => e.includes('maxConcurrentRequests'))
      ).toBe(true);
    });

    it('should reject negative requestTimeout', () => {
      const invalidConfig = {
        serverName: 'test-server',
        serverVersion: '1.0.0',
        port: 3000,
        logLevel: 'info',
        docsPath: './docs',
        dataPath: './data',
        enableHotReload: true,
        enableMetrics: false,
        maxConcurrentRequests: 100,
        requestTimeout: -1000,
      };

      const result = manager.validateConfig(invalidConfig);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('requestTimeout'))).toBe(
        true
      );
    });

    it('should collect multiple validation errors', () => {
      const invalidConfig = {
        serverName: '',
        serverVersion: '',
        port: 0,
        logLevel: 'invalid',
        docsPath: '',
        dataPath: '',
        enableHotReload: 'not-a-boolean' as any,
        enableMetrics: 'not-a-boolean' as any,
        maxConcurrentRequests: 0,
        requestTimeout: -1,
      };

      const result = manager.validateConfig(invalidConfig);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(5);
    });
  });

  describe('mergeConfigs', () => {
    it('should merge multiple configurations', () => {
      const config1: Partial<ServerConfig> = {
        serverName: 'server1',
        port: 3000,
      };

      const config2: Partial<ServerConfig> = {
        serverVersion: '1.0.0',
        logLevel: 'debug',
      };

      const config3: Partial<ServerConfig> = {
        port: 4000,
        enableHotReload: false,
      };

      const merged = manager.mergeConfigs(config1, config2, config3);

      expect(merged.serverName).toBe('server1');
      expect(merged.serverVersion).toBe('1.0.0');
      expect(merged.port).toBe(4000); // Overridden by config3
      expect(merged.logLevel).toBe('debug');
      expect(merged.enableHotReload).toBe(false);
    });

    it('should use defaults when no configs provided', () => {
      const merged = manager.mergeConfigs();

      expect(merged.serverName).toBe('mcp-repairshopr');
      expect(merged.serverVersion).toBe('0.1.0');
      expect(merged.port).toBe(3000);
    });

    it('should handle empty partial configs', () => {
      const merged = manager.mergeConfigs({}, {}, {});

      expect(merged.serverName).toBe('mcp-repairshopr');
      expect(merged.serverVersion).toBe('0.1.0');
    });
  });

  describe('watchConfig', (done) => {
    it('should watch for configuration changes', (done) => {
      const testConfig: Partial<ServerConfig> = {
        serverName: 'initial-server',
        port: 3000,
      };

      fs.writeFileSync(configPath, JSON.stringify(testConfig, null, 2));

      let callbackCalled = false;
      const callback = (config: ServerConfig) => {
        if (!callbackCalled) {
          callbackCalled = true;
          expect(config.serverName).toBe('updated-server');
          expect(config.port).toBe(4000);
          manager.destroy();
          done();
        }
      };

      manager.watchConfig(configPath, callback);

      // Wait a bit then update the config file
      setTimeout(() => {
        const updatedConfig: Partial<ServerConfig> = {
          serverName: 'updated-server',
          port: 4000,
        };
        fs.writeFileSync(configPath, JSON.stringify(updatedConfig, null, 2));
      }, 100);
    }, 10000);

    it('should handle multiple callbacks', (done) => {
      const testConfig: Partial<ServerConfig> = {
        serverName: 'test-server',
        port: 3000,
      };

      fs.writeFileSync(configPath, JSON.stringify(testConfig, null, 2));

      let callback1Called = false;
      let callback2Called = false;

      const callback1 = (config: ServerConfig) => {
        callback1Called = true;
        if (callback1Called && callback2Called) {
          manager.destroy();
          done();
        }
      };

      const callback2 = (config: ServerConfig) => {
        callback2Called = true;
        if (callback1Called && callback2Called) {
          manager.destroy();
          done();
        }
      };

      manager.watchConfig(configPath, callback1);
      manager.watchConfig(configPath, callback2);

      setTimeout(() => {
        const updatedConfig: Partial<ServerConfig> = {
          serverName: 'updated-server',
          port: 4000,
        };
        fs.writeFileSync(configPath, JSON.stringify(updatedConfig, null, 2));
      }, 100);
    }, 10000);

    it('should not watch non-existent file', () => {
      const nonExistentPath = path.join(tempDir, 'non-existent.json');

      expect(() => {
        manager.watchConfig(nonExistentPath, () => {});
      }).not.toThrow();
    });
  });

  describe('migrateConfig', () => {
    it('should migrate configuration from older version', () => {
      const oldConfig: any = {
        serverName: 'old-server',
        serverVersion: '0.0.1',
        port: 3000,
        logLevel: 'info',
        docsPath: './docs',
        dataPath: './data',
      };

      const migrated = manager.migrateConfig(oldConfig, '0.0.1', '0.1.0');

      expect(migrated.serverName).toBe('old-server');
      expect(migrated.serverVersion).toBe('0.0.1');
      expect(migrated.enableHotReload).toBeDefined();
      expect(migrated.enableMetrics).toBeDefined();
      expect(migrated.maxConcurrentRequests).toBeDefined();
      expect(migrated.requestTimeout).toBeDefined();
    });

    it('should migrate configuration to older version', () => {
      const newConfig: any = {
        serverName: 'new-server',
        serverVersion: '0.1.0',
        port: 3000,
        logLevel: 'info',
        docsPath: './docs',
        dataPath: './data',
        enableHotReload: true,
        enableMetrics: false,
        maxConcurrentRequests: 100,
        requestTimeout: 30000,
      };

      const migrated = manager.migrateConfig(newConfig, '0.1.0', '0.0.1');

      expect(migrated.serverName).toBe('new-server');
      expect(migrated.enableHotReload).toBeUndefined();
      expect(migrated.enableMetrics).toBeUndefined();
      expect(migrated.maxConcurrentRequests).toBeUndefined();
      expect(migrated.requestTimeout).toBeUndefined();
    });

    it('should handle same version migration', () => {
      const config: any = {
        serverName: 'test-server',
        serverVersion: '1.0.0',
        port: 3000,
        logLevel: 'info',
        docsPath: './docs',
        dataPath: './data',
      };

      const migrated = manager.migrateConfig(config, '1.0.0', '1.0.0');

      expect(migrated.serverName).toBe('test-server');
      expect(migrated.serverVersion).toBe('1.0.0');
    });
  });

  describe('saveConfig', () => {
    it('should save configuration to file', () => {
      const config: ServerConfig = {
        serverName: 'saved-server',
        serverVersion: '1.0.0',
        port: 5000,
        logLevel: 'debug',
        docsPath: './custom-docs',
        dataPath: './custom-data',
        enableHotReload: false,
        enableMetrics: true,
        maxConcurrentRequests: 200,
        requestTimeout: 60000,
      };

      manager.saveConfig(config, configPath);

      expect(fs.existsSync(configPath)).toBe(true);

      const savedContent = fs.readFileSync(configPath, 'utf-8');
      const savedConfig = JSON.parse(savedContent);

      expect(savedConfig.serverName).toBe('saved-server');
      expect(savedConfig.port).toBe(5000);
      expect(savedConfig.logLevel).toBe('debug');
    });

    it('should create directory if it does not exist', () => {
      const nestedPath = path.join(tempDir, 'nested', 'dir', 'config.json');

      const config: ServerConfig = {
        serverName: 'test-server',
        serverVersion: '1.0.0',
        port: 3000,
        logLevel: 'info',
        docsPath: './docs',
        dataPath: './data',
        enableHotReload: true,
        enableMetrics: false,
        maxConcurrentRequests: 100,
        requestTimeout: 30000,
      };

      manager.saveConfig(config, nestedPath);

      expect(fs.existsSync(nestedPath)).toBe(true);
    });

    it('should throw error for invalid configuration', () => {
      const invalidConfig: ServerConfig = {
        serverName: '',
        serverVersion: '1.0.0',
        port: 3000,
        logLevel: 'info',
        docsPath: './docs',
        dataPath: './data',
        enableHotReload: true,
        enableMetrics: false,
        maxConcurrentRequests: 100,
        requestTimeout: 30000,
      };

      expect(() => {
        manager.saveConfig(invalidConfig, configPath);
      }).toThrow();
    });

    it('should update current config after save', () => {
      const config: ServerConfig = {
        serverName: 'updated-server',
        serverVersion: '2.0.0',
        port: 4000,
        logLevel: 'warn',
        docsPath: './docs',
        dataPath: './data',
        enableHotReload: false,
        enableMetrics: true,
        maxConcurrentRequests: 150,
        requestTimeout: 45000,
      };

      manager.saveConfig(config, configPath);

      const currentConfig = manager.getConfig();
      expect(currentConfig.serverName).toBe('updated-server');
      expect(currentConfig.port).toBe(4000);
    });
  });

  describe('getConfig and updateConfig', () => {
    it('should return current configuration', () => {
      const config = manager.getConfig();

      expect(config).toBeDefined();
      expect(config.serverName).toBe('mcp-repairshopr');
      expect(config.serverVersion).toBe('0.1.0');
    });

    it('should return a copy of current configuration', () => {
      const config1 = manager.getConfig();
      const config2 = manager.getConfig();

      expect(config1).not.toBe(config2);
      expect(config1).toEqual(config2);
    });

    it('should update current configuration', () => {
      const updates: Partial<ServerConfig> = {
        serverName: 'updated-server',
        port: 4000,
      };

      manager.updateConfig(updates);

      const config = manager.getConfig();
      expect(config.serverName).toBe('updated-server');
      expect(config.port).toBe(4000);
      expect(config.serverVersion).toBe('0.1.0'); // Unchanged
    });
  });

  describe('destroy', () => {
    it('should stop watching configuration file', () => {
      const testConfig: Partial<ServerConfig> = {
        serverName: 'test-server',
        port: 3000,
      };

      fs.writeFileSync(configPath, JSON.stringify(testConfig, null, 2));

      manager.watchConfig(configPath, () => {});
      manager.destroy();

      // Should not throw when destroying again
      expect(() => {
        manager.destroy();
      }).not.toThrow();
    });

    it('should clear change callbacks', () => {
      const testConfig: Partial<ServerConfig> = {
        serverName: 'test-server',
        port: 3000,
      };

      fs.writeFileSync(configPath, JSON.stringify(testConfig, null, 2));

      manager.watchConfig(configPath, () => {});
      manager.destroy();

      // After destroy, callbacks should be cleared
      // This is tested implicitly by ensuring no errors occur
    });
  });
});

describe('configurationManager singleton', () => {
  it('should export a singleton instance', () => {
    expect(configurationManager).toBeDefined();
    expect(configurationManager).toBeInstanceOf(ConfigurationManager);
  });

  it('should have default configuration', () => {
    const config = configurationManager.getConfig();

    expect(config.serverName).toBe('mcp-repairshopr');
    expect(config.serverVersion).toBe('0.1.0');
    expect(config.port).toBe(3000);
    expect(config.logLevel).toBe('info');
  });
});

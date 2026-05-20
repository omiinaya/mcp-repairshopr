/**
 * Configuration management for the MCP server
 * Supports file-based configuration, environment variables, validation, hot-reload, and migration
 */

import * as fs from 'fs';
import * as path from 'path';
import { logger } from '../utils/logger';

/**
 * Server configuration interface
 */
export interface ServerConfig {
  serverName: string;
  serverVersion: string;
  port: number;
  logLevel: string;
  docsPath: string;
  dataPath: string;
  enableHotReload: boolean;
  enableMetrics: boolean;
  maxConcurrentRequests: number;
  requestTimeout: number;
}

/**
 * Default configuration values
 */
const DEFAULT_CONFIG: ServerConfig = {
  serverName: 'mcp-repairshopr',
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

/**
 * Configuration manager class
 */
export class ConfigurationManager {
  private currentConfig: ServerConfig;
  private configPath: string | null = null;
  private watcher: fs.FSWatcher | null = null;
  private changeCallbacks: Array<(config: ServerConfig) => void> = [];

  constructor() {
    this.currentConfig = { ...DEFAULT_CONFIG };
  }

  /**
   * Load configuration from file
   * @param configPath - Optional path to configuration file
   * @returns Loaded configuration
   */
  loadConfig(configPath?: string): ServerConfig {
    const resolvedPath =
      configPath || path.join(process.cwd(), 'config', 'default.json');
    this.configPath = resolvedPath;

    try {
      if (!fs.existsSync(resolvedPath)) {
        logger.warn(
          `Configuration file not found at ${resolvedPath}, using defaults`
        );
        return this.currentConfig;
      }

      const fileContent = fs.readFileSync(resolvedPath, 'utf-8');
      const fileConfig = JSON.parse(fileContent);

      // Merge with defaults
      this.currentConfig = this.mergeConfigs(DEFAULT_CONFIG, fileConfig);

      // Load environment variables
      const envConfig = this.loadFromEnv();
      this.currentConfig = this.mergeConfigs(this.currentConfig, envConfig);

      // Validate configuration
      const validation = this.validateConfig(this.currentConfig);
      if (!validation.valid) {
        throw new Error(
          `Invalid configuration: ${validation.errors.join(', ')}`
        );
      }

      logger.info('Configuration loaded from file', {
        path: resolvedPath,
        config: this.currentConfig,
      });

      return this.currentConfig;
    } catch (error) {
      logger.error('Failed to load configuration from file', {
        error,
        path: resolvedPath,
      });
      throw error;
    }
  }

  /**
   * Load configuration from environment variables
   * @returns Partial configuration from environment variables
   */
  loadFromEnv(): Partial<ServerConfig> {
    const envConfig: Partial<ServerConfig> = {};

    if (process.env.SERVER_NAME) {
      envConfig.serverName = process.env.SERVER_NAME;
    }

    if (process.env.SERVER_VERSION) {
      envConfig.serverVersion = process.env.SERVER_VERSION;
    }

    if (process.env.PORT) {
      const port = parseInt(process.env.PORT, 10);
      if (!isNaN(port)) {
        envConfig.port = port;
      }
    }

    if (process.env.LOG_LEVEL) {
      envConfig.logLevel = process.env.LOG_LEVEL;
    }

    if (process.env.DOCS_PATH) {
      envConfig.docsPath = process.env.DOCS_PATH;
    }

    if (process.env.DATA_PATH) {
      envConfig.dataPath = process.env.DATA_PATH;
    }

    if (process.env.ENABLE_HOT_RELOAD !== undefined) {
      envConfig.enableHotReload = process.env.ENABLE_HOT_RELOAD === 'true';
    }

    if (process.env.ENABLE_METRICS !== undefined) {
      envConfig.enableMetrics = process.env.ENABLE_METRICS === 'true';
    }

    if (process.env.MAX_CONCURRENT_REQUESTS) {
      const maxRequests = parseInt(process.env.MAX_CONCURRENT_REQUESTS, 10);
      if (!isNaN(maxRequests)) {
        envConfig.maxConcurrentRequests = maxRequests;
      }
    }

    if (process.env.REQUEST_TIMEOUT) {
      const timeout = parseInt(process.env.REQUEST_TIMEOUT, 10);
      if (!isNaN(timeout)) {
        envConfig.requestTimeout = timeout;
      }
    }

    if (Object.keys(envConfig).length > 0) {
      logger.info('Configuration loaded from environment variables', {
        envConfig,
      });
    }

    return envConfig;
  }

  /**
   * Validate configuration
   * @param config - Configuration to validate
   * @returns Validation result with errors if any
   */
  validateConfig(config: ServerConfig): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate serverName
    if (
      !config.serverName ||
      typeof config.serverName !== 'string' ||
      config.serverName.trim().length === 0
    ) {
      errors.push('serverName must be a non-empty string');
    }

    // Validate serverVersion
    if (
      !config.serverVersion ||
      typeof config.serverVersion !== 'string' ||
      config.serverVersion.trim().length === 0
    ) {
      errors.push('serverVersion must be a non-empty string');
    }

    // Validate port
    if (
      typeof config.port !== 'number' ||
      config.port < 1 ||
      config.port > 65535
    ) {
      errors.push('port must be a number between 1 and 65535');
    }

    // Validate logLevel
    const validLogLevels = ['error', 'warn', 'info', 'debug', 'trace'];
    if (
      !config.logLevel ||
      typeof config.logLevel !== 'string' ||
      !validLogLevels.includes(config.logLevel)
    ) {
      errors.push(`logLevel must be one of: ${validLogLevels.join(', ')}`);
    }

    // Validate docsPath
    if (
      !config.docsPath ||
      typeof config.docsPath !== 'string' ||
      config.docsPath.trim().length === 0
    ) {
      errors.push('docsPath must be a non-empty string');
    }

    // Validate dataPath
    if (
      !config.dataPath ||
      typeof config.dataPath !== 'string' ||
      config.dataPath.trim().length === 0
    ) {
      errors.push('dataPath must be a non-empty string');
    }

    // Validate enableHotReload
    if (typeof config.enableHotReload !== 'boolean') {
      errors.push('enableHotReload must be a boolean');
    }

    // Validate enableMetrics
    if (typeof config.enableMetrics !== 'boolean') {
      errors.push('enableMetrics must be a boolean');
    }

    // Validate maxConcurrentRequests
    if (
      typeof config.maxConcurrentRequests !== 'number' ||
      config.maxConcurrentRequests < 1
    ) {
      errors.push('maxConcurrentRequests must be a positive number');
    }

    // Validate requestTimeout
    if (
      typeof config.requestTimeout !== 'number' ||
      config.requestTimeout < 0
    ) {
      errors.push('requestTimeout must be a non-negative number');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Merge multiple configurations
   * @param configs - Configurations to merge (later configs override earlier ones)
   * @returns Merged configuration
   */
  mergeConfigs(...configs: Partial<ServerConfig>[]): ServerConfig {
    return configs.reduce<ServerConfig>(
      (merged, config) => {
        return {
          ...merged,
          ...config,
        };
      },
      { ...DEFAULT_CONFIG }
    );
  }

  /**
   * Watch for configuration changes (hot-reload)
   * @param configPath - Path to configuration file to watch
   * @param callback - Callback function to execute on configuration change
   */
  watchConfig(
    configPath: string,
    callback: (config: ServerConfig) => void
  ): void {
    if (!fs.existsSync(configPath)) {
      logger.warn(
        `Cannot watch configuration file: ${configPath} does not exist`
      );
      return;
    }

    // Stop existing watcher if any
    this.stopWatching();

    try {
      this.changeCallbacks.push(callback);

      this.watcher = fs.watch(configPath, (eventType, filename) => {
        if (eventType === 'change') {
          logger.info(`Configuration file changed: ${filename}`);

          try {
            // Reload configuration
            const newConfig = this.loadConfig(configPath);

            // Notify all callbacks
            this.changeCallbacks.forEach((cb) => {
              try {
                cb(newConfig);
              } catch (error) {
                logger.error('Error in configuration change callback', {
                  error,
                });
              }
            });

            logger.info('Configuration hot-reloaded successfully');
          } catch (error) {
            logger.error('Failed to hot-reload configuration', { error });
          }
        }
      });

      logger.info(`Watching configuration file for changes: ${configPath}`);
    } catch (error) {
      logger.error('Failed to watch configuration file', {
        error,
        path: configPath,
      });
      throw error;
    }
  }

  /**
   * Stop watching configuration file
   */
  private stopWatching(): void {
    if (this.watcher) {
      this.watcher.close();
      this.watcher = null;
      logger.info('Stopped watching configuration file');
    }
  }

  /**
   * Migrate configuration between versions
   * @param config - Configuration to migrate
   * @param fromVersion - Source version
   * @param toVersion - Target version
   * @returns Migrated configuration
   */
  migrateConfig(
    config: any,
    fromVersion: string,
    toVersion: string
  ): ServerConfig {
    logger.info(`Migrating configuration from ${fromVersion} to ${toVersion}`);

    let migratedConfig = { ...config };

    // Migration logic for version changes
    // Example: Add new fields with defaults when upgrading
    if (this.compareVersions(fromVersion, toVersion) < 0) {
      // Upgrading
      migratedConfig = this.applyUpgrades(
        migratedConfig,
        fromVersion,
        toVersion
      );
    } else if (this.compareVersions(fromVersion, toVersion) > 0) {
      // Downgrading
      migratedConfig = this.applyDowngrades(
        migratedConfig,
        fromVersion,
        toVersion
      );
    }

    // Ensure all required fields exist
    migratedConfig = this.mergeConfigs(DEFAULT_CONFIG, migratedConfig);

    logger.info('Configuration migrated successfully', {
      fromVersion,
      toVersion,
    });

    return migratedConfig;
  }

  /**
   * Apply version upgrades
   */
  private applyUpgrades(
    config: any,
    fromVersion: string,
    toVersion: string
  ): any {
    let upgraded = { ...config };

    // Example: Add new fields introduced in specific versions
    if (this.compareVersions(fromVersion, '0.1.0') < 0) {
      // Add fields introduced in 0.1.0
      if (!upgraded.enableHotReload) {
        upgraded.enableHotReload = DEFAULT_CONFIG.enableHotReload;
      }
      if (!upgraded.enableMetrics) {
        upgraded.enableMetrics = DEFAULT_CONFIG.enableMetrics;
      }
      if (!upgraded.maxConcurrentRequests) {
        upgraded.maxConcurrentRequests = DEFAULT_CONFIG.maxConcurrentRequests;
      }
      if (!upgraded.requestTimeout) {
        upgraded.requestTimeout = DEFAULT_CONFIG.requestTimeout;
      }
    }

    return upgraded;
  }

  /**
   * Apply version downgrades
   */
  private applyDowngrades(
    config: any,
    fromVersion: string,
    toVersion: string
  ): any {
    let downgraded = { ...config };

    // Remove fields that don't exist in older versions
    if (this.compareVersions(toVersion, '0.1.0') < 0) {
      // Remove fields introduced after 0.1.0
      delete downgraded.enableHotReload;
      delete downgraded.enableMetrics;
      delete downgraded.maxConcurrentRequests;
      delete downgraded.requestTimeout;
    }

    return downgraded;
  }

  /**
   * Compare version strings
   * @returns -1 if v1 < v2, 0 if v1 == v2, 1 if v1 > v2
   */
  private compareVersions(v1: string, v2: string): number {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);

    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
      const p1 = parts1[i] || 0;
      const p2 = parts2[i] || 0;

      if (p1 < p2) return -1;
      if (p1 > p2) return 1;
    }

    return 0;
  }

  /**
   * Save configuration to file
   * @param config - Configuration to save
   * @param configPath - Path to save configuration file
   */
  saveConfig(config: ServerConfig, configPath: string): void {
    try {
      // Validate before saving
      const validation = this.validateConfig(config);
      if (!validation.valid) {
        throw new Error(
          `Cannot save invalid configuration: ${validation.errors.join(', ')}`
        );
      }

      // Ensure directory exists
      const dir = path.dirname(configPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Write configuration file
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');

      // Update current config
      this.currentConfig = { ...config };
      this.configPath = configPath;

      logger.info('Configuration saved successfully', { path: configPath });
    } catch (error) {
      logger.error('Failed to save configuration', { error, path: configPath });
      throw error;
    }
  }

  /**
   * Get current configuration
   * @returns Current configuration
   */
  getConfig(): ServerConfig {
    return { ...this.currentConfig };
  }

  /**
   * Update current configuration
   * @param config - New configuration values
   */
  updateConfig(config: Partial<ServerConfig>): void {
    this.currentConfig = this.mergeConfigs(this.currentConfig, config);
    logger.info('Configuration updated', { updates: config });
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.stopWatching();
    this.changeCallbacks = [];
    logger.info('Configuration manager destroyed');
  }
}

// Export singleton instance
export const configurationManager = new ConfigurationManager();

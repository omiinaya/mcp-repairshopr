/**
 * Startup validation module
 * Validates that all required files and configurations exist before server starts
 */

import fs from 'fs';
import path from 'path';
import { logger } from './logger';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ValidationConfig {
  requiredFiles: string[];
  optionalFiles: string[];
  requiredEnvVars: string[];
  optionalEnvVars: string[];
  maxFileSizeMB?: number;
}

const DEFAULT_CONFIG: ValidationConfig = {
  requiredFiles: [
    'data/metadata-index.json',
    'config/default.json'
  ],
  optionalFiles: [
    'config/production.json',
    'data/vector-index.json'
  ],
  requiredEnvVars: [
    'NODE_ENV',
    'PORT'
  ],
  optionalEnvVars: [
    'LOG_LEVEL',
    'LOG_FORMAT',
    'CACHE_MAX_SIZE',
    'CACHE_DEFAULT_TTL',
    'MAX_CONCURRENT_REQUESTS',
    'REQUEST_TIMEOUT',
    'ENABLE_METRICS',
    'REPAIRSHOPR_API_KEY',
    'REPAIRSHOPR_SUBDOMAIN'
  ],
  maxFileSizeMB: 100
};

export class StartupValidator {
  private config: ValidationConfig;
  private basePath: string;

  constructor(config: Partial<ValidationConfig> = {}, basePath: string = process.cwd()) {
    this.config = {
      ...DEFAULT_CONFIG,
      ...config
    };
    this.basePath = basePath;
  }

  /**
   * Run all validations
   */
  validate(): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate required files
    const fileValidation = this.validateFiles();
    errors.push(...fileValidation.errors);
    warnings.push(...fileValidation.warnings);

    // Validate environment variables
    const envValidation = this.validateEnvironment();
    errors.push(...envValidation.errors);
    warnings.push(...envValidation.warnings);

    // Validate data integrity
    const dataValidation = this.validateDataIntegrity();
    errors.push(...dataValidation.errors);
    warnings.push(...dataValidation.warnings);

    const result: ValidationResult = {
      valid: errors.length === 0,
      errors,
      warnings
    };

    this.logResult(result);
    return result;
  }

  /**
   * Validate that required files exist and are readable
   */
  private validateFiles(): { errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check required files
    for (const file of this.config.requiredFiles) {
      const filePath = path.join(this.basePath, file);
      
      if (!fs.existsSync(filePath)) {
        errors.push(`Required file not found: ${file}`);
        continue;
      }

      try {
        const stats = fs.statSync(filePath);
        
        if (!stats.isFile()) {
          errors.push(`Required path is not a file: ${file}`);
          continue;
        }

        // Check file size
        const fileSizeMB = stats.size / (1024 * 1024);
        if (this.config.maxFileSizeMB && fileSizeMB > this.config.maxFileSizeMB) {
          warnings.push(`File ${file} is very large (${fileSizeMB.toFixed(2)} MB)`);
        }

        // Try to read file to verify it's not corrupted
        fs.accessSync(filePath, fs.constants.R_OK);
        
        // Validate JSON files
        if (file.endsWith('.json')) {
          try {
            const content = fs.readFileSync(filePath, 'utf-8');
            JSON.parse(content);
          } catch (parseError) {
            errors.push(`Invalid JSON in file: ${file}`);
          }
        }
      } catch (error) {
        errors.push(`Cannot read file: ${file} - ${error}`);
      }
    }

    // Check optional files
    for (const file of this.config.optionalFiles) {
      const filePath = path.join(this.basePath, file);
      
      if (!fs.existsSync(filePath)) {
        warnings.push(`Optional file not found: ${file}`);
      }
    }

    return { errors, warnings };
  }

  /**
   * Validate environment variables
   */
  private validateEnvironment(): { errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check required environment variables
    for (const envVar of this.config.requiredEnvVars) {
      if (!process.env[envVar]) {
        errors.push(`Required environment variable not set: ${envVar}`);
      }
    }

    // Check optional environment variables
    for (const envVar of this.config.optionalEnvVars) {
      if (!process.env[envVar]) {
        warnings.push(`Optional environment variable not set: ${envVar}`);
      }
    }

    // Validate specific environment variables
    if (process.env.PORT) {
      const port = parseInt(process.env.PORT, 10);
      if (isNaN(port) || port < 1 || port > 65535) {
        errors.push(`Invalid PORT value: ${process.env.PORT}`);
      }
    }

    if (process.env.LOG_LEVEL) {
      const validLevels = ['error', 'warn', 'info', 'debug', 'trace'];
      if (!validLevels.includes(process.env.LOG_LEVEL.toLowerCase())) {
        warnings.push(`Invalid LOG_LEVEL: ${process.env.LOG_LEVEL}. Using default.`);
      }
    }

    return { errors, warnings };
  }

  /**
   * Validate data integrity of metadata index
   */
  private validateDataIntegrity(): { errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    const metadataPath = path.join(this.basePath, 'data/metadata-index.json');
    
    if (!fs.existsSync(metadataPath)) {
      return { errors, warnings }; // Already reported as missing file
    }

    try {
      const content = fs.readFileSync(metadataPath, 'utf-8');
      const data = JSON.parse(content);

      // Check for required fields
      if (!data.resources || typeof data.resources !== 'object') {
        errors.push('Metadata index missing required field: resources');
      } else {
        const resourceCount = Object.keys(data.resources).length;
        if (resourceCount === 0) {
          errors.push('Metadata index contains no resources');
        } else if (resourceCount < 5) {
          warnings.push(`Metadata index contains only ${resourceCount} resources`);
        }
      }

      if (!data.endpoints || !Array.isArray(data.endpoints)) {
        errors.push('Metadata index missing required field: endpoints');
      } else {
        if (data.endpoints.length === 0) {
          errors.push('Metadata index contains no endpoints');
        } else if (data.endpoints.length < 10) {
          warnings.push(`Metadata index contains only ${data.endpoints.length} endpoints`);
        }
      }

      if (!data.permissions || !Array.isArray(data.permissions)) {
        warnings.push('Metadata index missing permissions data');
      }

      if (!data.parsedAt) {
        warnings.push('Metadata index missing parsedAt timestamp');
      } else {
        const parsedDate = new Date(data.parsedAt);
        const now = new Date();
        const ageDays = (now.getTime() - parsedDate.getTime()) / (1000 * 60 * 60 * 24);
        
        if (ageDays > 30) {
          warnings.push(`Metadata index is ${ageDays.toFixed(0)} days old. Consider regenerating.`);
        }
      }

    } catch (error) {
      errors.push(`Failed to validate data integrity: ${error}`);
    }

    return { errors, warnings };
  }

  /**
   * Log validation result
   */
  private logResult(result: ValidationResult): void {
    if (result.valid && result.warnings.length === 0) {
      logger.info('Startup validation passed');
    } else if (result.valid) {
      logger.info('Startup validation passed with warnings', {
        warningCount: result.warnings.length
      });
      for (const warning of result.warnings) {
        logger.warn(`Validation warning: ${warning}`);
      }
    } else {
      logger.error('Startup validation failed', {
        errorCount: result.errors.length,
        warningCount: result.warnings.length
      });
      for (const error of result.errors) {
        logger.error(`Validation error: ${error}`);
      }
      for (const warning of result.warnings) {
        logger.warn(`Validation warning: ${warning}`);
      }
    }
  }
}

// Export singleton instance
export const startupValidator = new StartupValidator();

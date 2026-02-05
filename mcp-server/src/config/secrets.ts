/**
 * Secrets management for RepairShopr API integration
 * Handles API keys and sensitive configuration
 */

import { logger } from '../utils/logger';

export interface RepairShoprConfig {
  apiKey: string;
  subdomain: string;
  baseUrl: string;
  timeoutMs: number;
  retryAttempts: number;
  retryDelayMs: number;
}

export interface SecretsConfig {
  repairshopr?: RepairShoprConfig;
  encryptionKey?: string;
}

export class SecretsManager {
  private secrets: SecretsConfig = {};
  private initialized: boolean = false;

  /**
   * Initialize secrets from environment variables
   */
  initialize(): void {
    if (this.initialized) {
      logger.warn('Secrets manager already initialized');
      return;
    }

    try {
      // RepairShopr configuration
      const repairshoprApiKey = process.env.REPAIRSHOPR_API_KEY;
      const repairshoprSubdomain = process.env.REPAIRSHOPR_SUBDOMAIN;

      if (repairshoprApiKey && repairshoprSubdomain) {
        this.secrets.repairshopr = {
          apiKey: repairshoprApiKey,
          subdomain: repairshoprSubdomain,
          baseUrl: `https://${repairshoprSubdomain}.repairshopr.com`,
          timeoutMs: parseInt(process.env.REPAIRSHOPR_TIMEOUT_MS || '30000', 10),
          retryAttempts: parseInt(process.env.REPAIRSHOPR_RETRY_ATTEMPTS || '3', 10),
          retryDelayMs: parseInt(process.env.REPAIRSHOPR_RETRY_DELAY_MS || '1000', 10)
        };

        logger.info('RepairShopr API configuration loaded', {
          subdomain: repairshoprSubdomain,
          timeoutMs: this.secrets.repairshopr.timeoutMs,
          retryAttempts: this.secrets.repairshopr.retryAttempts
        });
      } else {
        logger.warn('RepairShopr API credentials not configured. Live API access disabled.');
      }

      // Encryption key (for future use with encrypted secrets)
      this.secrets.encryptionKey = process.env.ENCRYPTION_KEY;

      this.initialized = true;
      logger.info('Secrets manager initialized successfully');

    } catch (error) {
      logger.error('Failed to initialize secrets manager', { error });
      throw error;
    }
  }

  /**
   * Get RepairShopr configuration
   */
  getRepairShoprConfig(): RepairShoprConfig | undefined {
    return this.secrets.repairshopr;
  }

  /**
   * Check if RepairShopr API is configured
   */
  isRepairShoprConfigured(): boolean {
    return !!this.secrets.repairshopr?.apiKey && !!this.secrets.repairshopr?.subdomain;
  }

  /**
   * Get API key (masked for logging)
   */
  getMaskedApiKey(): string {
    const apiKey = this.secrets.repairshopr?.apiKey;
    if (!apiKey) return 'not configured';
    
    // Show only first 4 and last 4 characters
    if (apiKey.length <= 8) return '****';
    return `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}`;
  }

  /**
   * Validate API credentials (basic format validation)
   */
  validateCredentials(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.secrets.repairshopr) {
      return { valid: false, errors: ['RepairShopr configuration not found'] };
    }

    const { apiKey, subdomain } = this.secrets.repairshopr;

    if (!apiKey) {
      errors.push('API key is missing');
    } else if (apiKey.length < 10) {
      errors.push('API key appears to be too short');
    }

    if (!subdomain) {
      errors.push('Subdomain is missing');
    } else if (!/^[a-z0-9-]+$/.test(subdomain)) {
      errors.push('Subdomain contains invalid characters');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Check if initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Get raw secrets (use with caution - for internal use only)
   */
  private getSecrets(): SecretsConfig {
    return this.secrets;
  }
}

// Export singleton instance
export const secretsManager = new SecretsManager();

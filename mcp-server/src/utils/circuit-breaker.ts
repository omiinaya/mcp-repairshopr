/**
 * Circuit Breaker pattern implementation
 * Provides resilience against external API failures
 */

import { logger } from './logger';

export enum CircuitState {
  CLOSED = 'CLOSED', // Normal operation
  OPEN = 'OPEN', // Failing, rejecting requests
  HALF_OPEN = 'HALF_OPEN', // Testing if service is back
}

export interface CircuitBreakerConfig {
  failureThreshold: number;
  successThreshold: number;
  timeout: number;
  halfOpenMaxCalls: number;
  resetTimeout: number;
}

const DEFAULT_CONFIG: CircuitBreakerConfig = {
  failureThreshold: 5,
  successThreshold: 3,
  timeout: 30000,
  halfOpenMaxCalls: 3,
  resetTimeout: 60000,
};

export interface CircuitBreakerStats {
  state: CircuitState;
  failures: number;
  successes: number;
  lastFailureTime: Date | null;
  lastSuccessTime: Date | null;
  consecutiveSuccesses: number;
  consecutiveFailures: number;
  totalCalls: number;
  rejectedCalls: number;
}

export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failures = 0;
  private successes = 0;
  private lastFailureTime: Date | null = null;
  private lastSuccessTime: Date | null = null;
  private consecutiveSuccesses = 0;
  private consecutiveFailures = 0;
  private totalCalls = 0;
  private rejectedCalls = 0;
  private halfOpenCalls = 0;
  private nextAttempt: number = Date.now();
  private config: CircuitBreakerConfig;

  constructor(
    private name: string,
    config: Partial<CircuitBreakerConfig> = {}
  ) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Execute a function with circuit breaker protection
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (Date.now() < this.nextAttempt) {
        this.rejectedCalls++;
        throw new CircuitBreakerError(
          `Circuit breaker is OPEN for ${this.name}`,
          this.state,
          this.getStats()
        );
      }
      // Transition to half-open
      this.transitionTo(CircuitState.HALF_OPEN);
    }

    if (
      this.state === CircuitState.HALF_OPEN &&
      this.halfOpenCalls >= this.config.halfOpenMaxCalls
    ) {
      this.rejectedCalls++;
      throw new CircuitBreakerError(
        `Circuit breaker HALF_OPEN limit reached for ${this.name}`,
        this.state,
        this.getStats()
      );
    }

    if (this.state === CircuitState.HALF_OPEN) {
      this.halfOpenCalls++;
    }

    this.totalCalls++;

    try {
      // Set timeout for the function
      const result = await this.executeWithTimeout(fn);
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  /**
   * Execute function with timeout
   */
  private async executeWithTimeout<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`Operation timed out after ${this.config.timeout}ms`));
      }, this.config.timeout);

      fn()
        .then((result) => {
          clearTimeout(timeoutId);
          resolve(result);
        })
        .catch((error) => {
          clearTimeout(timeoutId);
          reject(error);
        });
    });
  }

  /**
   * Handle successful execution
   */
  private onSuccess(): void {
    this.successes++;
    this.lastSuccessTime = new Date();
    this.consecutiveSuccesses++;
    this.consecutiveFailures = 0;

    if (this.state === CircuitState.HALF_OPEN) {
      if (this.consecutiveSuccesses >= this.config.successThreshold) {
        this.transitionTo(CircuitState.CLOSED);
      }
    }

    logger.debug(`Circuit breaker success: ${this.name}`, {
      state: this.state,
      consecutiveSuccesses: this.consecutiveSuccesses,
    });
  }

  /**
   * Handle failed execution
   */
  private onFailure(): void {
    this.failures++;
    this.lastFailureTime = new Date();
    this.consecutiveFailures++;
    this.consecutiveSuccesses = 0;

    if (this.state === CircuitState.HALF_OPEN) {
      this.transitionTo(CircuitState.OPEN);
    } else if (this.state === CircuitState.CLOSED) {
      if (this.consecutiveFailures >= this.config.failureThreshold) {
        this.transitionTo(CircuitState.OPEN);
      }
    }

    logger.warn(`Circuit breaker failure: ${this.name}`, {
      state: this.state,
      consecutiveFailures: this.consecutiveFailures,
      threshold: this.config.failureThreshold,
    });
  }

  /**
   * Transition to a new state
   */
  private transitionTo(newState: CircuitState): void {
    const oldState = this.state;
    this.state = newState;

    if (newState === CircuitState.OPEN) {
      this.nextAttempt = Date.now() + this.config.resetTimeout;
      this.halfOpenCalls = 0;
      this.consecutiveSuccesses = 0;
    } else if (newState === CircuitState.HALF_OPEN) {
      this.halfOpenCalls = 0;
    } else if (newState === CircuitState.CLOSED) {
      this.failures = 0;
      this.consecutiveFailures = 0;
      this.halfOpenCalls = 0;
    }

    logger.info(`Circuit breaker state transition: ${this.name}`, {
      from: oldState,
      to: newState,
      nextAttempt:
        this.state === CircuitState.OPEN
          ? new Date(this.nextAttempt).toISOString()
          : null,
    });
  }

  /**
   * Get current statistics
   */
  getStats(): CircuitBreakerStats {
    return {
      state: this.state,
      failures: this.failures,
      successes: this.successes,
      lastFailureTime: this.lastFailureTime,
      lastSuccessTime: this.lastSuccessTime,
      consecutiveSuccesses: this.consecutiveSuccesses,
      consecutiveFailures: this.consecutiveFailures,
      totalCalls: this.totalCalls,
      rejectedCalls: this.rejectedCalls,
    };
  }

  /**
   * Get current state
   */
  getState(): CircuitState {
    return this.state;
  }

  /**
   * Force open the circuit
   */
  forceOpen(): void {
    this.transitionTo(CircuitState.OPEN);
  }

  /**
   * Force close the circuit
   */
  forceClose(): void {
    this.transitionTo(CircuitState.CLOSED);
  }

  /**
   * Reset statistics
   */
  reset(): void {
    this.failures = 0;
    this.successes = 0;
    this.consecutiveSuccesses = 0;
    this.consecutiveFailures = 0;
    this.totalCalls = 0;
    this.rejectedCalls = 0;
    this.halfOpenCalls = 0;
    this.state = CircuitState.CLOSED;
  }
}

/**
 * Circuit breaker error
 */
export class CircuitBreakerError extends Error {
  constructor(
    message: string,
    public state: CircuitState,
    public stats: CircuitBreakerStats
  ) {
    super(message);
    this.name = 'CircuitBreakerError';
  }
}

/**
 * Circuit breaker registry
 */
class CircuitBreakerRegistry {
  private breakers: Map<string, CircuitBreaker> = new Map();

  /**
   * Get or create a circuit breaker
   */
  get(name: string, config?: Partial<CircuitBreakerConfig>): CircuitBreaker {
    if (!this.breakers.has(name)) {
      this.breakers.set(name, new CircuitBreaker(name, config));
    }
    return this.breakers.get(name)!;
  }

  /**
   * Get all circuit breakers
   */
  getAll(): Map<string, CircuitBreaker> {
    return new Map(this.breakers);
  }

  /**
   * Get statistics for all circuit breakers
   */
  getAllStats(): Map<string, CircuitBreakerStats> {
    const stats = new Map();
    for (const [name, breaker] of this.breakers.entries()) {
      stats.set(name, breaker.getStats());
    }
    return stats;
  }

  /**
   * Reset all circuit breakers
   */
  resetAll(): void {
    for (const breaker of this.breakers.values()) {
      breaker.reset();
    }
  }
}

export const circuitBreakerRegistry = new CircuitBreakerRegistry();

/**
 * Create a circuit breaker for RepairShopr API calls
 */
export function createRepairShoprCircuitBreaker(): CircuitBreaker {
  return circuitBreakerRegistry.get('repairshopr-api', {
    failureThreshold: 3,
    successThreshold: 2,
    timeout: 30000,
    resetTimeout: 30000,
  });
}

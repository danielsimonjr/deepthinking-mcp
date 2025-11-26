/**
 * Validator Registry and Factory (v4.3.0)
 * Sprint 9.3: Lazy loading - validators loaded on-demand
 *
 * Manages mode-specific validators with lazy instantiation
 */

import type { ModeValidator } from './base.js';

/**
 * Mode to validator module path mapping
 */
const VALIDATOR_MODULES: Record<string, string> = {
  sequential: './modes/sequential.js',
  shannon: './modes/shannon.js',
  mathematics: './modes/mathematics.js',
  physics: './modes/physics.js',
  hybrid: './modes/hybrid.js',
  abductive: './modes/abductive.js',
  causal: './modes/causal.js',
  bayesian: './modes/bayesian.js',
  counterfactual: './modes/counterfactual.js',
  analogical: './modes/analogical.js',
  temporal: './modes/temporal.js',
  gametheory: './modes/gametheory.js',
  evidential: './modes/evidential.js',
  firstprinciples: './modes/firstprinciples.js',
  systemsthinking: './modes/systemsthinking.js',
  scientificmethod: './modes/scientificmethod.js',
  optimization: './modes/optimization.js',
  formallogic: './modes/formallogic.js',
};

/**
 * Validator class name mapping (for dynamic import extraction)
 */
const VALIDATOR_CLASSES: Record<string, string> = {
  sequential: 'SequentialValidator',
  shannon: 'ShannonValidator',
  mathematics: 'MathematicsValidator',
  physics: 'PhysicsValidator',
  hybrid: 'HybridValidator',
  abductive: 'AbductiveValidator',
  causal: 'CausalValidator',
  bayesian: 'BayesianValidator',
  counterfactual: 'CounterfactualValidator',
  analogical: 'AnalogicalValidator',
  temporal: 'TemporalValidator',
  gametheory: 'GameTheoryValidator',
  evidential: 'EvidentialValidator',
  firstprinciples: 'FirstPrinciplesValidator',
  systemsthinking: 'SystemsThinkingValidator',
  scientificmethod: 'ScientificMethodValidator',
  optimization: 'OptimizationValidator',
  formallogic: 'FormalLogicValidator',
};

/**
 * Lazy-loading validator registry
 * Validators are only instantiated when first requested
 */
class ValidatorRegistry {
  private validators: Map<string, ModeValidator> = new Map();
  private loadPromises: Map<string, Promise<ModeValidator | undefined>> = new Map();

  /**
   * Register a custom validator (for testing or extensions)
   */
  register(validator: ModeValidator): void {
    this.validators.set(validator.getMode(), validator);
  }

  /**
   * Get validator for a specific mode (async lazy loading)
   */
  async getAsync(mode: string): Promise<ModeValidator | undefined> {
    // Return cached validator if available
    if (this.validators.has(mode)) {
      return this.validators.get(mode);
    }

    // Check if mode is supported
    if (!VALIDATOR_MODULES[mode]) {
      return undefined;
    }

    // Return existing load promise if in progress
    if (this.loadPromises.has(mode)) {
      return this.loadPromises.get(mode);
    }

    // Create and cache load promise
    const loadPromise = this.loadValidator(mode);
    this.loadPromises.set(mode, loadPromise);

    return loadPromise;
  }

  /**
   * Synchronous get - returns cached validator or undefined
   * Use getAsync for lazy loading
   */
  get(mode: string): ModeValidator | undefined {
    return this.validators.get(mode);
  }

  /**
   * Load and instantiate a validator
   */
  private async loadValidator(mode: string): Promise<ModeValidator | undefined> {
    try {
      const modulePath = VALIDATOR_MODULES[mode];
      const className = VALIDATOR_CLASSES[mode];

      if (!modulePath || !className) {
        return undefined;
      }

      const module = await import(modulePath);
      const ValidatorClass = module[className];

      if (!ValidatorClass) {
        return undefined;
      }

      const validator = new ValidatorClass() as ModeValidator;
      this.validators.set(mode, validator);
      this.loadPromises.delete(mode);

      return validator;
    } catch {
      this.loadPromises.delete(mode);
      return undefined;
    }
  }

  /**
   * Preload specific validators (useful for known high-use modes)
   */
  async preload(modes: string[]): Promise<void> {
    await Promise.all(modes.map((mode) => this.getAsync(mode)));
  }

  /**
   * Check if a validator exists for a mode (sync check for supported modes)
   */
  has(mode: string): boolean {
    return mode in VALIDATOR_MODULES;
  }

  /**
   * Check if validator is loaded (cached)
   */
  isLoaded(mode: string): boolean {
    return this.validators.has(mode);
  }

  /**
   * Get all supported modes
   */
  getModes(): string[] {
    return Object.keys(VALIDATOR_MODULES);
  }

  /**
   * Get all loaded modes
   */
  getLoadedModes(): string[] {
    return Array.from(this.validators.keys());
  }

  /**
   * Clear all registered validators (useful for testing)
   */
  clear(): void {
    this.validators.clear();
    this.loadPromises.clear();
  }
}

/**
 * Singleton instance
 */
export const validatorRegistry = new ValidatorRegistry();

/**
 * Factory function to get validator for a mode (async)
 */
export async function getValidatorForMode(mode: string): Promise<ModeValidator | undefined> {
  return validatorRegistry.getAsync(mode);
}

/**
 * Synchronous factory - returns cached validator only
 */
export function getValidatorForModeSync(mode: string): ModeValidator | undefined {
  return validatorRegistry.get(mode);
}

/**
 * Check if validator exists for mode
 */
export function hasValidatorForMode(mode: string): boolean {
  return validatorRegistry.has(mode);
}

/**
 * Get all supported modes
 */
export function getSupportedModes(): string[] {
  return validatorRegistry.getModes();
}

/**
 * Preload validators for specific modes
 */
export async function preloadValidators(modes: string[]): Promise<void> {
  return validatorRegistry.preload(modes);
}

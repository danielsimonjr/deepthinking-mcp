/**
 * Validator Registry and Factory (v4.3.0)
 * Sprint 9.3: Lazy loading - validators loaded on-demand
 * Sprint 10: Consolidated registry mapping
 *
 * Manages mode-specific validators with lazy instantiation
 */

import type { ModeValidator } from './base.js';

/**
 * Validator configuration entry
 */
interface ValidatorConfig {
  module: string;
  className: string;
}

/**
 * Consolidated validator registry (Sprint 10: merged dual mappings)
 * Format: mode -> { module path, class name }
 */
const VALIDATOR_REGISTRY: Record<string, ValidatorConfig> = {
  sequential: { module: './modes/sequential.js', className: 'SequentialValidator' },
  shannon: { module: './modes/shannon.js', className: 'ShannonValidator' },
  mathematics: { module: './modes/mathematics.js', className: 'MathematicsValidator' },
  physics: { module: './modes/physics.js', className: 'PhysicsValidator' },
  hybrid: { module: './modes/hybrid.js', className: 'HybridValidator' },
  engineering: { module: './modes/engineering.js', className: 'EngineeringValidator' }, // Phase 10 v7.1.0
  inductive: { module: './modes/inductive.js', className: 'InductiveValidator' },
  deductive: { module: './modes/deductive.js', className: 'DeductiveValidator' },
  abductive: { module: './modes/abductive.js', className: 'AbductiveValidator' },
  causal: { module: './modes/causal.js', className: 'CausalValidator' },
  bayesian: { module: './modes/bayesian.js', className: 'BayesianValidator' },
  counterfactual: { module: './modes/counterfactual.js', className: 'CounterfactualValidator' },
  analogical: { module: './modes/analogical.js', className: 'AnalogicalValidator' },
  temporal: { module: './modes/temporal.js', className: 'TemporalValidator' },
  gametheory: { module: './modes/gametheory.js', className: 'GameTheoryValidator' },
  evidential: { module: './modes/evidential.js', className: 'EvidentialValidator' },
  firstprinciples: { module: './modes/firstprinciples.js', className: 'FirstPrinciplesValidator' },
  systemsthinking: { module: './modes/systemsthinking.js', className: 'SystemsThinkingValidator' },
  scientificmethod: { module: './modes/scientificmethod.js', className: 'ScientificMethodValidator' },
  optimization: { module: './modes/optimization.js', className: 'OptimizationValidator' },
  formallogic: { module: './modes/formallogic.js', className: 'FormalLogicValidator' },
  metareasoning: { module: './modes/metareasoning.js', className: 'MetaReasoningValidator' },
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
    if (!VALIDATOR_REGISTRY[mode]) {
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
      const config = VALIDATOR_REGISTRY[mode];

      if (!config) {
        return undefined;
      }

      const mod = await import(config.module);
      const ValidatorClass = mod[config.className];

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
    return mode in VALIDATOR_REGISTRY;
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
    return Object.keys(VALIDATOR_REGISTRY);
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

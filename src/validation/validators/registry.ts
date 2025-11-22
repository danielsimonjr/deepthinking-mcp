/**
 * Validator Registry and Factory
 *
 * Manages mode-specific validators and provides factory methods
 */

import { ModeValidator } from './base.js';
import { SequentialValidator } from './modes/sequential.js';
import { ShannonValidator } from './modes/shannon.js';
import { MathematicsValidator } from './modes/mathematics.js';
import { PhysicsValidator } from './modes/physics.js';
import { HybridValidator } from './modes/hybrid.js';
import { AbductiveValidator } from './modes/abductive.js';
import { CausalValidator } from './modes/causal.js';
import { BayesianValidator } from './modes/bayesian.js';
import { CounterfactualValidator } from './modes/counterfactual.js';
import { AnalogicalValidator } from './modes/analogical.js';
import { TemporalValidator } from './modes/temporal.js';
import { GameTheoryValidator } from './modes/gametheory.js';
import { EvidentialValidator } from './modes/evidential.js';
import { FirstPrinciplesValidator } from './modes/firstprinciples.js';
import { SystemsThinkingValidator } from './modes/systemsthinking.js';
import { ScientificMethodValidator } from './modes/scientificmethod.js';
import { OptimizationValidator } from './modes/optimization.js';
import { FormalLogicValidator } from './modes/formallogic.js';

/**
 * Singleton registry of all mode validators
 */
class ValidatorRegistry {
  private validators: Map<string, ModeValidator>;

  constructor() {
    this.validators = new Map();
    this.registerDefaultValidators();
  }

  /**
   * Register all default mode validators
   */
  private registerDefaultValidators(): void {
    this.register(new SequentialValidator());
    this.register(new ShannonValidator());
    this.register(new MathematicsValidator());
    this.register(new PhysicsValidator());
    this.register(new HybridValidator());
    this.register(new AbductiveValidator());
    this.register(new CausalValidator());
    this.register(new BayesianValidator());
    this.register(new CounterfactualValidator());
    this.register(new AnalogicalValidator());
    this.register(new TemporalValidator());
    this.register(new GameTheoryValidator());
    this.register(new EvidentialValidator());
    this.register(new FirstPrinciplesValidator());
    this.register(new SystemsThinkingValidator());
    this.register(new ScientificMethodValidator());
    this.register(new OptimizationValidator());
    this.register(new FormalLogicValidator());
  }

  /**
   * Register a custom validator
   */
  register(validator: ModeValidator): void {
    this.validators.set(validator.getMode(), validator);
  }

  /**
   * Get validator for a specific mode
   */
  get(mode: string): ModeValidator | undefined {
    return this.validators.get(mode);
  }

  /**
   * Check if a validator exists for a mode
   */
  has(mode: string): boolean {
    return this.validators.has(mode);
  }

  /**
   * Get all registered modes
   */
  getModes(): string[] {
    return Array.from(this.validators.keys());
  }

  /**
   * Clear all registered validators (useful for testing)
   */
  clear(): void {
    this.validators.clear();
  }
}

/**
 * Singleton instance
 */
export const validatorRegistry = new ValidatorRegistry();

/**
 * Factory function to get validator for a mode
 */
export function getValidatorForMode(mode: string): ModeValidator | undefined {
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

/**
 * Validator Registry and Factory (v4.3.0)
 * Sprint 9.3: Lazy loading - validators loaded on-demand
 * Sprint 10: Consolidated registry mapping
 *
 * Manages mode-specific validators with lazy instantiation
 */

import type { ModeValidator } from "./base.js";

/**
 * Validator configuration entry
 *
 * `load` holds a dynamic `import()` with a LITERAL specifier. A bundler can
 * resolve a literal specifier at build time, so the single-file bundle
 * (`dist/index.js`) carries every validator and still initialises each one
 * only on first use. A specifier held in a variable cannot be resolved at
 * build time: the bundle then looks for `./modes/<mode>.js` next to
 * `dist/index.js`, finds nothing, and every mode loses its validator.
 */
interface ValidatorConfig {
  load: () => Promise<Record<string, unknown>>;
  className: string;
}

/**
 * Consolidated validator registry (Sprint 10: merged dual mappings)
 * Format: mode -> { load function, class name }
 */
const VALIDATOR_REGISTRY: Record<string, ValidatorConfig> = {
  sequential: {
    load: () => import("./modes/sequential.js"),
    className: "SequentialValidator",
  },
  shannon: {
    load: () => import("./modes/shannon.js"),
    className: "ShannonValidator",
  },
  mathematics: {
    load: () => import("./modes/mathematics.js"),
    className: "MathematicsValidator",
  },
  physics: {
    load: () => import("./modes/physics.js"),
    className: "PhysicsValidator",
  },
  hybrid: {
    load: () => import("./modes/hybrid.js"),
    className: "HybridValidator",
  },
  engineering: {
    load: () => import("./modes/engineering.js"),
    className: "EngineeringValidator",
  }, // Phase 10 v7.1.0
  computability: {
    load: () => import("./modes/computability.js"),
    className: "ComputabilityValidator",
  }, // Phase 11 v7.2.0
  cryptanalytic: {
    load: () => import("./modes/cryptanalytic.js"),
    className: "CryptanalyticValidator",
  }, // Phase 11 v7.2.0
  inductive: {
    load: () => import("./modes/inductive.js"),
    className: "InductiveValidator",
  },
  deductive: {
    load: () => import("./modes/deductive.js"),
    className: "DeductiveValidator",
  },
  abductive: {
    load: () => import("./modes/abductive.js"),
    className: "AbductiveValidator",
  },
  causal: {
    load: () => import("./modes/causal.js"),
    className: "CausalValidator",
  },
  bayesian: {
    load: () => import("./modes/bayesian.js"),
    className: "BayesianValidator",
  },
  counterfactual: {
    load: () => import("./modes/counterfactual.js"),
    className: "CounterfactualValidator",
  },
  analogical: {
    load: () => import("./modes/analogical.js"),
    className: "AnalogicalValidator",
  },
  temporal: {
    load: () => import("./modes/temporal.js"),
    className: "TemporalValidator",
  },
  gametheory: {
    load: () => import("./modes/gametheory.js"),
    className: "GameTheoryValidator",
  },
  evidential: {
    load: () => import("./modes/evidential.js"),
    className: "EvidentialValidator",
  },
  firstprinciples: {
    load: () => import("./modes/firstprinciples.js"),
    className: "FirstPrinciplesValidator",
  },
  systemsthinking: {
    load: () => import("./modes/systemsthinking.js"),
    className: "SystemsThinkingValidator",
  },
  scientificmethod: {
    load: () => import("./modes/scientificmethod.js"),
    className: "ScientificMethodValidator",
  },
  optimization: {
    load: () => import("./modes/optimization.js"),
    className: "OptimizationValidator",
  },
  formallogic: {
    load: () => import("./modes/formallogic.js"),
    className: "FormalLogicValidator",
  },
  metareasoning: {
    load: () => import("./modes/metareasoning.js"),
    className: "MetaReasoningValidator",
  },
  // Phase 14: Academic and algorithmic validators (cherry-picked from PR #166)
  algorithmic: {
    load: () => import("./modes/algorithmic.js"),
    className: "AlgorithmicValidator",
  },
  synthesis: {
    load: () => import("./modes/synthesis.js"),
    className: "SynthesisValidator",
  },
  argumentation: {
    load: () => import("./modes/argumentation.js"),
    className: "ArgumentationValidator",
  },
  critique: {
    load: () => import("./modes/critique.js"),
    className: "CritiqueValidator",
  },
  analysis: {
    load: () => import("./modes/analysis.js"),
    className: "AnalysisValidator",
  },
  historical: {
    load: () => import("./modes/historical.js"),
    className: "HistoricalValidator",
  }, // v9.1.0
  // Advanced runtime modes. Their validators existed from Phase 10 Sprint 3
  // but were never mapped here, so every thought in one of these modes got
  // "No validator registered for thinking mode: X" instead. v9.4.1
  constraint: {
    load: () => import("./modes/constraint.js"),
    className: "ConstraintValidator",
  },
  modal: {
    load: () => import("./modes/modal.js"),
    className: "ModalValidator",
  },
  recursive: {
    load: () => import("./modes/recursive.js"),
    className: "RecursiveValidator",
  },
  stochastic: {
    load: () => import("./modes/stochastic.js"),
    className: "StochasticValidator",
  },
  // Not registered: `meta` (src/validation/validators/modes/meta.ts). Its
  // getMode() returns "meta", but no such ThinkingMode member exists —
  // `metareasoning` is the real mode and has its own entry above — so no
  // thought could ever reach it. ThinkingMode.CUSTOM is also absent: a
  // user-defined mode has no fixed shape a mode validator could check.
};

/**
 * Lazy-loading validator registry
 * Validators are only instantiated when first requested
 */
class ValidatorRegistry {
  private validators: Map<string, ModeValidator> = new Map();
  private loadPromises: Map<string, Promise<ModeValidator | undefined>> =
    new Map();

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
  private async loadValidator(
    mode: string,
  ): Promise<ModeValidator | undefined> {
    try {
      const config = VALIDATOR_REGISTRY[mode];

      if (!config) {
        return undefined;
      }

      const mod = await config.load();
      const ValidatorClass = mod[config.className] as
        (new () => ModeValidator) | undefined;

      if (!ValidatorClass) {
        return undefined;
      }

      const validator = new ValidatorClass();
      this.validators.set(mode, validator);
      this.loadPromises.delete(mode);

      return validator;
    } catch {
      // Module loading failed - could be missing file, syntax error, or missing export
      // Clean up promise cache and return undefined to indicate validator unavailable
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
export async function getValidatorForMode(
  mode: string,
): Promise<ModeValidator | undefined> {
  return validatorRegistry.getAsync(mode);
}

/**
 * Synchronous factory - returns cached validator only
 */
export function getValidatorForModeSync(
  mode: string,
): ModeValidator | undefined {
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

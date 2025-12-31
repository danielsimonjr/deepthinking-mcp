/**
 * Mode Handlers Index - v9.1.0
 *
 * Exports for the ModeHandler pattern implementation.
 * Part of the Strategy Pattern to replace ThoughtFactory's switch statement.
 * All 34 reasoning modes now have fully implemented handlers.
 *
 * Handler Categories:
 * - Core (5): Sequential, Shannon, Mathematics, Physics, Hybrid
 * - Fundamental Triad (3): Inductive, Deductive, Abductive
 * - Causal/Probabilistic (7): Causal, Bayesian, Counterfactual, Temporal, Historical, GameTheory, Evidential
 * - Analogical/First Principles (2): Analogical, FirstPrinciples
 * - Systems/Scientific (3): SystemsThinking, ScientificMethod, FormalLogic
 * - Academic (4): Synthesis, Argumentation, Critique, Analysis
 * - Engineering (4): Engineering, Computability, Cryptanalytic, Algorithmic
 * - Advanced Runtime (6): MetaReasoning, Recursive, Modal, Stochastic, Constraint, Optimization
 * - User-Defined (1): Custom
 */

// Core interface and types
export {
  ModeHandler,
  ValidationResult,
  ValidationError,
  ValidationWarning,
  ModeEnhancements,
  ModeStatus,
  DetectedArchetype,
  validationSuccess,
  validationFailure,
  createValidationError,
  createValidationWarning,
} from './handlers/ModeHandler.js';

// Generic handler (fallback implementation - deprecated, kept for backwards compatibility)
export { GenericModeHandler } from './handlers/GenericModeHandler.js';

// ===== CORE HANDLERS (5) =====
export { SequentialHandler } from './handlers/SequentialHandler.js';
export { ShannonHandler } from './handlers/ShannonHandler.js';
export { MathematicsHandler } from './handlers/MathematicsHandler.js';
export { PhysicsHandler } from './handlers/PhysicsHandler.js';
export { HybridHandler } from './handlers/HybridHandler.js';

// ===== FUNDAMENTAL TRIAD HANDLERS (3) =====
export { InductiveHandler } from './handlers/InductiveHandler.js';
export { DeductiveHandler } from './handlers/DeductiveHandler.js';
export { AbductiveHandler } from './handlers/AbductiveHandler.js';

// ===== CAUSAL/PROBABILISTIC HANDLERS (7) =====
export { CausalHandler } from './handlers/CausalHandler.js';
export { BayesianHandler } from './handlers/BayesianHandler.js';
export { CounterfactualHandler } from './handlers/CounterfactualHandler.js';
export { TemporalHandler } from './handlers/TemporalHandler.js';
export { HistoricalHandler } from './handlers/HistoricalHandler.js';
export { GameTheoryHandler } from './handlers/GameTheoryHandler.js';
export { EvidentialHandler } from './handlers/EvidentialHandler.js';

// ===== ANALOGICAL/FIRST PRINCIPLES HANDLERS (2) =====
export { AnalogicalHandler } from './handlers/AnalogicalHandler.js';
export { FirstPrinciplesHandler } from './handlers/FirstPrinciplesHandler.js';

// ===== SYSTEMS/SCIENTIFIC HANDLERS (3) =====
export { SystemsThinkingHandler } from './handlers/SystemsThinkingHandler.js';
export { ScientificMethodHandler } from './handlers/ScientificMethodHandler.js';
export { FormalLogicHandler } from './handlers/FormalLogicHandler.js';

// ===== ACADEMIC HANDLERS (4) =====
export { SynthesisHandler } from './handlers/SynthesisHandler.js';
export { ArgumentationHandler } from './handlers/ArgumentationHandler.js';
export { CritiqueHandler } from './handlers/CritiqueHandler.js';
export { AnalysisHandler } from './handlers/AnalysisHandler.js';

// ===== ENGINEERING HANDLERS (4) =====
export { EngineeringHandler } from './handlers/EngineeringHandler.js';
export { ComputabilityHandler } from './handlers/ComputabilityHandler.js';
export { CryptanalyticHandler } from './handlers/CryptanalyticHandler.js';
export { AlgorithmicHandler } from './handlers/AlgorithmicHandler.js';

// ===== ADVANCED RUNTIME HANDLERS (6) =====
export { MetaReasoningHandler } from './handlers/MetaReasoningHandler.js';
export { RecursiveHandler } from './handlers/RecursiveHandler.js';
export { ModalHandler } from './handlers/ModalHandler.js';
export { StochasticHandler } from './handlers/StochasticHandler.js';
export { ConstraintHandler } from './handlers/ConstraintHandler.js';
export { OptimizationHandler } from './handlers/OptimizationHandler.js';

// ===== USER-DEFINED HANDLER (1) =====
export { CustomHandler } from './handlers/CustomHandler.js';

// Registry
export {
  ModeHandlerRegistry,
  RegistryStats,
  getRegistry,
  registerHandler,
  createThought,
} from './registry.js';

/**
 * Register all specialized handlers with the registry
 *
 * Call this function to initialize the registry with all 33 specialized handlers.
 * This eliminates the need for GenericModeHandler fallback.
 * Should be called once at startup.
 */
export function registerAllHandlers(): void {
  const registry = getRegistry();

  // ===== CORE HANDLERS (5) =====
  registry.replace(new SequentialHandler());
  registry.replace(new ShannonHandler());
  registry.replace(new MathematicsHandler());
  registry.replace(new PhysicsHandler());
  registry.replace(new HybridHandler());

  // ===== FUNDAMENTAL TRIAD HANDLERS (3) =====
  registry.replace(new InductiveHandler());
  registry.replace(new DeductiveHandler());
  registry.replace(new AbductiveHandler());

  // ===== CAUSAL/PROBABILISTIC HANDLERS (7) =====
  registry.replace(new CausalHandler());
  registry.replace(new BayesianHandler());
  registry.replace(new CounterfactualHandler());
  registry.replace(new TemporalHandler());
  registry.replace(new HistoricalHandler());
  registry.replace(new GameTheoryHandler());
  registry.replace(new EvidentialHandler());

  // ===== ANALOGICAL/FIRST PRINCIPLES HANDLERS (2) =====
  registry.replace(new AnalogicalHandler());
  registry.replace(new FirstPrinciplesHandler());

  // ===== SYSTEMS/SCIENTIFIC HANDLERS (3) =====
  registry.replace(new SystemsThinkingHandler());
  registry.replace(new ScientificMethodHandler());
  registry.replace(new FormalLogicHandler());

  // ===== ACADEMIC HANDLERS (4) =====
  registry.replace(new SynthesisHandler());
  registry.replace(new ArgumentationHandler());
  registry.replace(new CritiqueHandler());
  registry.replace(new AnalysisHandler());

  // ===== ENGINEERING HANDLERS (4) =====
  registry.replace(new EngineeringHandler());
  registry.replace(new ComputabilityHandler());
  registry.replace(new CryptanalyticHandler());
  registry.replace(new AlgorithmicHandler());

  // ===== ADVANCED RUNTIME HANDLERS (6) =====
  registry.replace(new MetaReasoningHandler());
  registry.replace(new RecursiveHandler());
  registry.replace(new ModalHandler());
  registry.replace(new StochasticHandler());
  registry.replace(new ConstraintHandler());
  registry.replace(new OptimizationHandler());

  // ===== USER-DEFINED HANDLER (1) =====
  registry.replace(new CustomHandler());
}

// Import all handlers for registerAllHandlers
// Core handlers
import { SequentialHandler } from './handlers/SequentialHandler.js';
import { ShannonHandler } from './handlers/ShannonHandler.js';
import { MathematicsHandler } from './handlers/MathematicsHandler.js';
import { PhysicsHandler } from './handlers/PhysicsHandler.js';
import { HybridHandler } from './handlers/HybridHandler.js';

// Fundamental triad handlers
import { InductiveHandler } from './handlers/InductiveHandler.js';
import { DeductiveHandler } from './handlers/DeductiveHandler.js';
import { AbductiveHandler } from './handlers/AbductiveHandler.js';

// Causal/Probabilistic handlers
import { CausalHandler } from './handlers/CausalHandler.js';
import { BayesianHandler } from './handlers/BayesianHandler.js';
import { CounterfactualHandler } from './handlers/CounterfactualHandler.js';
import { TemporalHandler } from './handlers/TemporalHandler.js';
import { HistoricalHandler } from './handlers/HistoricalHandler.js';
import { GameTheoryHandler } from './handlers/GameTheoryHandler.js';
import { EvidentialHandler } from './handlers/EvidentialHandler.js';

// Analogical/First Principles handlers
import { AnalogicalHandler } from './handlers/AnalogicalHandler.js';
import { FirstPrinciplesHandler } from './handlers/FirstPrinciplesHandler.js';

// Systems/Scientific handlers
import { SystemsThinkingHandler } from './handlers/SystemsThinkingHandler.js';
import { ScientificMethodHandler } from './handlers/ScientificMethodHandler.js';
import { FormalLogicHandler } from './handlers/FormalLogicHandler.js';

// Academic handlers
import { SynthesisHandler } from './handlers/SynthesisHandler.js';
import { ArgumentationHandler } from './handlers/ArgumentationHandler.js';
import { CritiqueHandler } from './handlers/CritiqueHandler.js';
import { AnalysisHandler } from './handlers/AnalysisHandler.js';

// Engineering handlers
import { EngineeringHandler } from './handlers/EngineeringHandler.js';
import { ComputabilityHandler } from './handlers/ComputabilityHandler.js';
import { CryptanalyticHandler } from './handlers/CryptanalyticHandler.js';
import { AlgorithmicHandler } from './handlers/AlgorithmicHandler.js';

// Advanced runtime handlers
import { MetaReasoningHandler } from './handlers/MetaReasoningHandler.js';
import { RecursiveHandler } from './handlers/RecursiveHandler.js';
import { ModalHandler } from './handlers/ModalHandler.js';
import { StochasticHandler } from './handlers/StochasticHandler.js';
import { ConstraintHandler } from './handlers/ConstraintHandler.js';
import { OptimizationHandler } from './handlers/OptimizationHandler.js';

// User-defined handler
import { CustomHandler } from './handlers/CustomHandler.js';

import { getRegistry } from './registry.js';

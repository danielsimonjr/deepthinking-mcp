# Format Grammar: Modelica

How to encode a deepthinking-plugin thought into Modelica, an object-oriented language for modeling physical and dynamical systems.

## Format Overview

Modelica is designed to describe systems via differential equations and `connect()` statements rather than imperative code. It is ideal for Physics, Systems Thinking, and Stochastic modes where dynamic system behavior is central. A thought is encoded as one or more `model` blocks, each representing a discrete system or subsystem. Models compile to executable simulations via OpenModelica, Wolfram System Modeler, or Dymola.

**Best for:**
- Physics: Differential equations, state evolution, conservation laws
- Systems Thinking: Stocks, flows, feedback loops, feedback equations
- Stochastic: State transition models, stochastic differential equations
- Computability/Algorithmic: State machines and automata (less natural)

**Less suitable for:**
- Analytical modes (hypothesis testing, argumentation, critique)
- Non-dynamical modes (deductive, synthesis, analysis)

## Encoding Rules

### Variable Declarations

- **Real variables** (continuous, floating-point): `Real x(start=0.0, unit="m");`
  - Include `start=` parameter for initial value
  - Include `unit=` parameter if applicable (e.g., "kg", "s", "m/s")
- **Integer variables** (discrete): `Integer count(start=0);`
- **Boolean variables** (logical): `Boolean isActive(start=false);`
- **Parameters** (constants): `parameter Real k = 0.5;` (no start value; fixed at compile time)
- **Arrays**: `Real stockArray[3](each start=0.0);`

### Stocks (Accumulating Quantities)

Stocks are `Real` variables with a differential equation showing how they evolve:

```modelica
Real stock(start=100.0, unit="unit");
equation
  der(stock) = inflow - outflow;
```

- `der(stock)` represents the time derivative (rate of change)
- `inflow` and `outflow` are expressions or variables
- Always assign stocks a meaningful `start=` value and `unit=`

### Flows (Rates of Change)

Flows are typically expressions or variables that feed into `der()` equations:

```modelica
Real inflow(unit="unit/s");
Real outflow(unit="unit/s");
equation
  inflow = source_rate * multiplier;
  outflow = stock * decay_constant;
```

- Keep flow names clear and descriptive
- Always include time-based units (e.g., "/s", "/day")

### Feedback Loops and Algebraic Equations

Feedback relationships are encoded as algebraic equations in the `equation` block:

```modelica
equation
  // Reinforcing loop: stock growth accelerates stock growth
  der(stock) = stock * growth_rate;
  
  // Balancing loop: larger stock increases outflow (damping)
  outflow = stock / time_constant;
  
  // Coupling: output of one stock drives input to another
  feedback = stock_1 - setpoint;
  der(stock_2) = feedback * controller_gain;
```

- List all differential equations and algebraic equations in the `equation` block
- Order equations logically (stocks first, then flows, then couplings)
- Use descriptive equation comments to clarify reinforcing/balancing intent

### Component Composition

For complex thoughts split across multiple models, use `connect()` statements:

```modelica
model System
  SubsystemA subsystem_a;
  SubsystemB subsystem_b;
equation
  connect(subsystem_a.output_port, subsystem_b.input_port);
end System;
```

- Each subsystem is a separate `model` block with standardized ports
- Ports are `Real` variables with `flow=true` annotation for bidirectional exchange
- `connect()` establishes constraints between ports (variables must equal)

### Key Annotations

- **initial equation**: Used for initial conditions beyond `start=`
  ```modelica
  initial equation
    der(stock) = initial_rate_of_change;
  ```
- **unit**: Always specify units for clarity and dimensional analysis
- **min/max**: Constrain variable ranges
  ```modelica
  Real probability(start=0.5, min=0.0, max=1.0);
  ```

## Template

### Minimal Systems Thinking Model

```modelica
model FeedbackLoop
  "A simple stock-flow model with one reinforcing loop"
  
  // Stocks
  Real stock(start=100.0, unit="units");
  
  // Flows
  Real inflow(unit="units/s");
  Real outflow(unit="units/s");
  
  // Parameters (feedback gains)
  parameter Real growth_rate = 0.1;
  parameter Real decay_constant = 0.05;
  
  equation
    // Stock evolution
    der(stock) = inflow - outflow;
    
    // Inflow driven by stock (reinforcing loop)
    inflow = stock * growth_rate;
    
    // Outflow as decay
    outflow = stock * decay_constant;
end FeedbackLoop;
```

### Physics Model (Oscillation)

```modelica
model HarmonicOscillator
  "A mass-spring system (second-order ODE)"
  
  // State variables
  Real position(start=1.0, unit="m");
  Real velocity(start=0.0, unit="m/s");
  
  // Parameters
  parameter Real mass = 1.0;  // kg
  parameter Real spring_constant = 10.0;  // N/m
  parameter Real damping = 0.5;  // N·s/m
  
  equation
    // State equations
    der(position) = velocity;
    der(velocity) = -(spring_constant * position + damping * velocity) / mass;
end HarmonicOscillator;
```

## Worked Example

**Scenario**: Systems Thinking thought about on-call alert fatigue with three stocks and two feedback loops.

```modelica
model AlertFatigue
  "On-call alert fatigue system with reinforcing and balancing loops"
  
  // Stocks: accumulating quantities
  Real alertQueue(start=10, unit="alerts");
  Real engineerEnergy(start=100, unit="energy_units");
  Real unresolvedCount(start=0, unit="alerts");
  
  // Flows
  Real alertGeneration(unit="alerts/hour");
  Real responseTime(unit="hours/alert");
  
  // Parameters
  parameter Real alertRate = 2.0;  // alerts/hour (constant external input)
  parameter Real energyDecay = 0.1;  // 1/hour (fatigue)
  parameter Real recoveryRate = 0.05;  // 1/hour (rest)
  parameter Real responseEfficiency = 0.8;  // fraction resolved per unit energy
  
  equation
    // Stock evolution equations
    
    // Alert queue: increases with generation, decreases with response
    der(alertQueue) = alertGeneration - responseTime;
    
    // Engineer energy: decreases with work (alert response), recovers with rest
    der(engineerEnergy) = recoveryRate * 100 - energyDecay * engineerEnergy - 
                          (responseTime * responseEfficiency);
    
    // Unresolved alerts: increases when response time is slow
    der(unresolvedCount) = responseTime * (1 - responseEfficiency);
    
    // Flow equations (reinforcing and balancing loops)
    
    // R1: More alerts accelerate energy depletion (reinforcing loop)
    alertGeneration = alertRate + 0.1 * alertQueue;
    
    // B1: Lower energy increases response time (balancing/destabilizing loop)
    responseTime = 0.5 + (100 - engineerEnergy) * 0.01;
end AlertFatigue;
```

**Key features:**
- Three stocks with clear physical units
- Two feedback mechanisms encoded as algebraic equations
- Parameters labeled with typical ranges
- Reinforcing loop (R1): Queue growth → fatigue → slower response → more backlog
- Balancing loop (B1) that destabilizes: Low energy → long response time → unresolved alerts

## Per-Mode Considerations

### Physics
Modelica is **native**: Differential equations are the primary language.
- Encode Newton's laws, conservation of energy, fluid dynamics, etc.
- Use multiple coupled `der()` equations for multi-body systems
- Example: pendulum, circuit, thermal dynamics

### Systems Thinking
Modelica is **ideal**: Stock-flow architecture maps directly.
- Use `Real` variables as stocks; `der()` equations capture flows
- Feedback loops are algebraic equations that close cycles
- Example: supply-demand, predator-prey, alert fatigue

### Stochastic
Modelica is **partially suitable**: Use for deterministic evolution with initial variability.
- Stochastic differential equations (Wiener processes) require specialized libraries (Openmodelica.Media, Modelica.Utilities.Streams)
- Example: Monte Carlo simulation of system behavior with random initial conditions

### Temporal / Historical
Modelica is **not suitable**: Time is implicit (the independent variable); no explicit time-event syntax.
- Recommend switching to a sequence diagram (UML) or timeline (Gantt) format instead

### Other Modes (Analytical, Deductive, Bayesian, etc.)
Modelica is **not recommended**: These modes involve logical reasoning, not physical dynamics.
- If mode captures a decision process or state machine, use UML state diagram instead
- If mode is purely analytical, use Mermaid, GraphML, or Markdown instead

## Rendering Tools

### Open-Source
- **OpenModelica** (https://openmodelica.org/): Free, cross-platform (Windows, Linux, macOS). Supports compilation to executable simulation, visualization, and debugging.
- **Installation**: Available via package managers (`brew install openmodelica` on macOS, `apt-get install openmodelica` on Ubuntu) or direct download.

### Commercial
- **Wolfram System Modeler** (https://www.wolfram.com/system-modeler/): Integration with Mathematica, advanced visualization, multi-physics libraries.
- **Dymola** (https://www.3ds.com/products-services/catia/products/dymola/): Industry-standard, advanced optimization, real-time simulation.

### Workflow
```bash
# Compile and simulate with OpenModelica
omc model.mo  # Compile to C executable
./model       # Run simulation, generates results.csv

# View results in spreadsheet or plotting tool
python plot_results.py results.csv
```

### Integration
- Models can be exported to FMU (Functional Mock-up Unit) format for co-simulation with other tools
- Results are typically `.csv` files that can be plotted with Gnuplot, Python (Matplotlib), or Excel

---

**Last Updated**: 2026-04-11  
**Format Stability**: Stable  
**Target Audience**: Physics modelers, systems dynamics analysts, control engineers, simulation specialists

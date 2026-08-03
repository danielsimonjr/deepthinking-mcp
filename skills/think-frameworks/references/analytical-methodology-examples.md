# Analytical Methodologies

Structured frameworks for systematic problem analysis.

## Overview

**Reasoning Modes** (e.g., Abductive, Causal, Bayesian): Define cognitive approaches  
**Methodologies** (e.g., 5W1H, SWOT): Provide structured inquiry frameworks

Methodologies organize analysis within reasoning modes, ensuring comprehensive coverage of problem space.

-----

## 5W1H (Systematic Inquiry)

**Origin**: Classical rhetoric’s *circumstances* (Quis, Quid, Quando, Ubi, Cur, Quomodo)  
**Also**: Kipling’s Questions, Hexadic Framework

### Framework

|Question|Focus                            |
|--------|---------------------------------|
|Who     |Actors, stakeholders, authorities|
|What    |Events, specifics, evidence      |
|When    |Timeline, constraints, deadlines |
|Where   |Location, context, scope         |
|Why     |Motivations, causes, significance|
|How     |Mechanisms, processes, approach  |

### Example: Abductive Mode

```javascript
{
  "mode": "abductive",
  "observations": [{
    "who": "Production team",
    "what": "System crashes",
    "when": "Daily at 3 AM",
    "where": "Primary database server",
    "confidence": 0.95
  }],
  "hypotheses": [{
    "why": "Memory leak in scheduled backup job",
    "how": "Job allocates memory without releasing",
    "predictions": ["Memory usage spikes before crash"]
  }]
}
```

### Example: Shannon Mode (Problem Definition)

```javascript
{
  "mode": "shannon",
  "stage": "problem_definition",
  "problemAnalysis": {
    "who": "E-commerce platform, 10M users",
    "what": "Page load times >5 seconds",
    "when": "Peak hours (6-9 PM)",
    "where": "Product listing pages",
    "why": "UX degradation, lost conversions",
    "how": "Database queries bottleneck under load"
  }
}
```

-----

## SWOT Analysis

**Purpose**: Strategic planning, decision evaluation

### Structure

|Internal (Present)                |External (Future)                      |
|----------------------------------|---------------------------------------|
|**Strengths**: Positive attributes|**Opportunities**: Potential advantages|
|**Weaknesses**: Limitations       |**Threats**: Potential risks           |

### Example: Counterfactual Mode

```javascript
{
  "mode": "counterfactual",
  "actual": {
    "name": "Monolithic architecture",
    "swot": {
      "strengths": ["Simple deployment", "Easy debugging"],
      "weaknesses": ["Scaling limitations", "Deployment bottlenecks"],
      "opportunities": ["Incremental refactoring possible"],
      "threats": ["Technical debt accumulation"]
    }
  },
  "counterfactuals": [{
    "name": "Microservices architecture",
    "swot": {
      "strengths": ["Independent scaling", "Team autonomy"],
      "weaknesses": ["Operational complexity", "Network overhead"],
      "opportunities": ["Cloud-native benefits"],
      "threats": ["Data consistency challenges"]
    }
  }]
}
```

-----

## Root Cause Analysis (5 Whys)

**Origin**: Toyota Production System (Sakichi Toyoda)  
**Purpose**: Identify fundamental causes

### Process

1. State problem
1. Ask “Why did this happen?”
1. For each answer, ask “Why?” again
1. Repeat until root cause identified (typically 5 iterations)
1. Implement solution addressing root cause

### Example: Causal Mode

```javascript
{
  "mode": "causal",
  "problem": "Customer churn increased 15%",
  "causalChain": [
    {"level": 1, "cause": "Support response time increased to 48 hours"},
    {"level": 2, "cause": "Support team understaffed"},
    {"level": 3, "cause": "Hiring freeze implemented"},
    {"level": 4, "cause": "Revenue projections missed by 20%"},
    {"level": 5, "cause": "Market conditions changed unexpectedly", "rootCause": true}
  ]
}
```

-----

## Fishbone Diagram (Ishikawa)

**Also**: Cause-and-Effect Diagram  
**Purpose**: Categorize potential causes

### Categories

**6Ms (Manufacturing)**: Methods, Machines, Materials, Measurements, Man (People), Mother Nature (Environment)

**8Ps (Services)**: Product/Service, Price, Place, Promotion, People, Process, Physical Evidence, Productivity

### Example: Causal Mode

```javascript
{
  "mode": "causal",
  "problem": "15% defect rate (target: 2%)",
  "fishboneAnalysis": {
    "methods": [{
      "cause": "Inadequate testing procedures",
      "subCauses": ["No automated tests", "Manual testing insufficient"],
      "impact": "high"
    }],
    "machines": [{
      "cause": "Insufficient test environments",
      "subCauses": ["Only 2 staging servers for 5 teams"],
      "impact": "high"
    }],
    "people": [{
      "cause": "High team turnover",
      "subCauses": ["Knowledge loss", "Insufficient onboarding"],
      "impact": "medium"
    }]
  }
}
```

-----

## PESTLE Analysis

**Purpose**: Macro-environmental scanning  
**Scope**: Political, Economic, Social, Technological, Legal, Environmental factors

### Example: Sequential Mode

```javascript
{
  "mode": "sequential",
  "pestleAnalysis": {
    "political": [{
      "factor": "GDPR compliance requirements",
      "impact": "high",
      "effect": "neutral",
      "details": "Requires investment but manageable"
    }],
    "economic": [{
      "factor": "Strong Euro",
      "impact": "medium",
      "effect": "positive",
      "details": "Favorable USD exchange rate"
    }],
    "technological": [{
      "factor": "Advanced 5G infrastructure",
      "impact": "medium",
      "effect": "positive"
    }]
  }
}
```

-----

## Force Field Analysis

**Origin**: Kurt Lewin (1951)  
**Purpose**: Visualize forces supporting/opposing change

### Components

- **Driving Forces**: Push toward change (strength: 1-5)
- **Restraining Forces**: Resist change (strength: 1-5)
- **Net Force**: Driving total - Restraining total

### Example: Sequential Mode

```javascript
{
  "mode": "sequential",
  "decision": "Cloud migration",
  "forceFieldAnalysis": {
    "drivingForces": [
      {"force": "Scalability requirements", "strength": 5},
      {"force": "Cost reduction (30% savings)", "strength": 4}
    ],
    "restrainingForces": [
      {"force": "Migration complexity", "strength": 5},
      {"force": "Security concerns", "strength": 4}
    ],
    "netForce": 0,
    "strategy": "Weaken restraining forces through phased approach"
  }
}
```

-----

## Decision Matrix

**Also**: Pugh Matrix, Grid Analysis, MCDA  
**Purpose**: Evaluate options against weighted criteria

### Process

1. List options
1. Define criteria with weights (importance: 1-10)
1. Score each option per criterion (1-10)
1. Calculate: `Score × Weight`
1. Sum weighted scores

### Example: Bayesian Mode

```javascript
{
  "mode": "bayesian",
  "decision": "Cloud provider selection",
  "decisionMatrix": {
    "criteria": [
      {"id": "cost", "weight": 8},
      {"id": "security", "weight": 9},
      {"id": "performance", "weight": 7}
    ],
    "options": [
      {
        "id": "aws",
        "scores": {
          "cost": {"score": 6, "weighted": 48},
          "security": {"score": 9, "weighted": 81},
          "performance": {"score": 9, "weighted": 63}
        },
        "totalScore": 192
      },
      {
        "id": "azure",
        "scores": {
          "cost": {"score": 7, "weighted": 56},
          "security": {"score": 9, "weighted": 81},
          "performance": {"score": 8, "weighted": 56}
        },
        "totalScore": 193
      }
    ]
  }
}
```

-----

## Pareto Analysis (80/20 Rule)

**Principle**: ~80% of effects from ~20% of causes  
**Purpose**: Prioritize high-impact factors

### Example: Causal Mode

```javascript
{
  "mode": "causal",
  "problem": "10,000 support tickets/month",
  "paretoAnalysis": {
    "categories": [
      {"issue": "Password resets", "count": 4200, "percentage": 42, "cumulative": 42},
      {"issue": "Payment errors", "count": 2100, "percentage": 21, "cumulative": 63},
      {"issue": "Account activation", "count": 1500, "percentage": 15, "cumulative": 78}
    ],
    "vitalFew": ["Password resets", "Payment errors", "Account activation"],
    "impact": "3 categories (30% of types) = 78% of tickets",
    "recommendations": [
      {"category": "Password resets", "solution": "Self-service reset", "reduction": "90%"}
    ]
  }
}
```

-----

## Stakeholder Analysis

**Purpose**: Map influence and interest for change management

### Dimensions

- **Power/Influence**: Ability to affect outcomes
- **Interest/Impact**: Level of concern
- **Attitude**: Supportive, neutral, resistant
- **Role**: Decision-maker, implementer, affected party

### Example: Game Theory Mode

```javascript
{
  "mode": "gametheory",
  "stakeholders": [
    {
      "id": "executives",
      "power": "high",
      "interest": "high",
      "attitude": "supportive",
      "role": "decision-maker",
      "strategy": "Keep engaged"
    },
    {
      "id": "managers",
      "power": "medium",
      "interest": "high",
      "attitude": "resistant",
      "role": "implementer",
      "influence": "Can sabotage implementation",
      "strategy": "Involve in design"
    }
  ]
}
```

-----

## Cost-Benefit Analysis

**Purpose**: Compare total costs vs. total benefits over time

### Components

- **Costs**: Direct, indirect, opportunity costs
- **Benefits**: Direct, indirect, intangible
- **NPV**: Net Present Value (benefits - costs, time-adjusted)
- **Discount Rate**: Time value of money

### Example: Bayesian Mode

```javascript
{
  "mode": "bayesian",
  "decision": "AI chatbot implementation",
  "costBenefitAnalysis": {
    "timeHorizon": "3 years",
    "discountRate": 0.08,
    "costs": {
      "development": {"oneTime": 500000, "confidence": 0.85},
      "operations": {"annual": 200000, "confidence": 0.80}
    },
    "benefits": {
      "costReduction": {"annual": 400000, "confidence": 0.75},
      "satisfaction": {"annual": 150000, "confidence": 0.65}
    },
    "npvCalculation": {
      "year0": {"netCashFlow": -500000, "discountedValue": -500000},
      "year1": {"netCashFlow": 350000, "discountedValue": 324074},
      "year2": {"netCashFlow": 350000, "discountedValue": 300069},
      "year3": {"netCashFlow": 350000, "discountedValue": 277842},
      "totalNPV": 401985,
      "roi": 0.80
    },
    "recommendation": "Proceed - positive NPV ($402k), 80% ROI"
  }
}
```

-----

## Risk Assessment Matrix

**Purpose**: Prioritize risks by probability × impact

### Matrix

|                      |Low Impact|Medium Impact|High Impact|
|----------------------|----------|-------------|-----------|
|**High Probability**  |Medium    |High         |Critical   |
|**Medium Probability**|Low       |Medium       |High       |
|**Low Probability**   |Low       |Low          |Medium     |

### Example: Evidential Mode

```javascript
{
  "mode": "evidential",
  "riskAssessment": {
    "risks": [
      {
        "id": "r1",
        "risk": "Data loss during migration",
        "probability": {"assessment": "low", "value": 0.15},
        "impact": {"assessment": "critical", "value": 0.95},
        "riskLevel": "high",
        "mitigations": [
          {"action": "Multi-stage backup", "effectiveness": 0.85, "residualProb": 0.02}
        ]
      },
      {
        "id": "r2",
        "risk": "Security breach from misconfiguration",
        "probability": {"assessment": "medium", "value": 0.30},
        "impact": {"assessment": "critical", "value": 0.90},
        "riskLevel": "critical",
        "mitigations": [
          {"action": "Security audit per phase", "effectiveness": 0.75, "residualProb": 0.075}
        ]
      }
    ]
  }
}
```

-----

## Gap Analysis

**Purpose**: Compare current state vs. desired state

### Components

1. **Current State** (as-is)
1. **Desired State** (to-be)
1. **Gaps** (differences)
1. **Action Plan** (bridge the gap)

### Example: Sequential Mode

```javascript
{
  "mode": "sequential",
  "gapAnalysis": {
    "domain": "ML capabilities",
    "currentState": {
      "capabilities": [{"capability": "Rule-based recommendations", "maturityLevel": 2}],
      "metrics": {"recommendationCTR": "2.5%"},
      "team": {"dataScientists": 0, "mlEngineers": 1}
    },
    "desiredState": {
      "capabilities": [{"capability": "Real-time ML recommendations", "maturityLevel": 4}],
      "metrics": {"recommendationCTR": "8-10%"},
      "team": {"dataScientists": 3, "mlEngineers": 3}
    },
    "gaps": [
      {
        "id": "gap1",
        "category": "technology",
        "description": "No real-time ML inference",
        "impact": "high",
        "actions": [
          {"action": "Deploy model serving platform", "duration": "3 months"}
        ]
      },
      {
        "id": "gap2",
        "category": "capability",
        "description": "Lack of deep learning expertise",
        "impact": "high",
        "actions": [
          {"action": "Hire 2 senior data scientists", "duration": "4-6 months"}
        ]
      }
    ]
  }
}
```

-----

## Methodology Combinations

Effective pairings:

|Combination                   |Use Case                                      |
|------------------------------|----------------------------------------------|
|5W1H + SWOT                   |Thoroughly understand each SWOT element       |
|5 Whys + Fishbone             |Drill into each Fishbone category             |
|SWOT + Force Field            |Convert SWOT into forces for/against change   |
|Gap Analysis + Decision Matrix|Evaluate alternative gap closure approaches   |
|Stakeholder + Force Field     |Map stakeholders to driving/restraining forces|
|Pareto + Risk Assessment      |Focus on high-impact risks (80/20)            |

-----

## Mode-Methodology Mapping

|Methodology    |Best Modes                |Primary Use                 |
|---------------|--------------------------|----------------------------|
|5W1H           |Shannon, Abductive        |Problem definition          |
|SWOT           |Sequential, Counterfactual|Strategic planning          |
|5 Whys         |Abductive, Causal         |Root cause analysis         |
|Fishbone       |Causal, Abductive         |Comprehensive cause analysis|
|PESTLE         |Sequential, Temporal      |Environmental scanning      |
|Force Field    |Sequential, Counterfactual|Change management           |
|Decision Matrix|Bayesian, Sequential      |Multi-criteria decisions    |
|Pareto         |Causal, Sequential        |Prioritization              |
|Stakeholder    |Game Theory, Causal       |Change management           |
|Cost-Benefit   |Bayesian, Counterfactual  |Investment decisions        |
|Risk Assessment|Evidential, Bayesian      |Risk management             |
|Gap Analysis   |Sequential, Temporal      |Capability building         |

-----

## References

- **5W1H**: Classical rhetoric, Rudyard Kipling’s “Six Honest Serving-Men” (1902)
- **SWOT**: Learned, Christensen, Andrews, Guth (1965)
- **5 Whys**: Toyota Production System
- **Fishbone**: Kaoru Ishikawa, “Guide to Quality Control” (1968)
- **PESTLE**: Francis Aguilar, “Scanning the Business Environment” (1967)
- **Force Field**: Kurt Lewin, “Field Theory in Social Science” (1951)
- **Decision Matrix**: Stuart Pugh, “Total Design” (1990)
- **Pareto**: Vilfredo Pareto (economic distribution)
- **Stakeholder**: R. Edward Freeman, “Strategic Management” (1984)

-----

*Version 1.0 | Last Updated: November 19, 2025*
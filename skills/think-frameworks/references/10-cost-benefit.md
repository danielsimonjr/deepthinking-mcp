# Cost-Benefit Analysis

### Description

A systematic approach to estimating the strengths and weaknesses of alternatives by comparing total expected costs against total expected benefits. Used to determine the best approach or whether a project is worthwhile.

### Components

1. **Costs** - All expenses (direct, indirect, opportunity costs, risks)
1. **Benefits** - All gains (direct, indirect, intangible)
1. **Time horizon** - Period over which costs and benefits are evaluated
1. **Discount rate** - Accounts for time value of money
1. **Net Present Value (NPV)** - Benefits minus costs, adjusted for time

### Application Within Reasoning Modes

#### In Bayesian Mode

Incorporate uncertainty:

```javascript
{
  "mode": "bayesian",
  "decision": "Implement AI-powered customer support chatbot",
  "costBenefitAnalysis": {
    "timeHorizon": "3 years",
    "discountRate": 0.08,
    "costs": {
      "development": {
        "oneTime": 500000,
        "description": "Custom AI model, integration, testing",
        "confidence": 0.85,
        "range": { "low": 400000, "high": 650000 }
      },
      "implementation": {
        "oneTime": 150000,
        "description": "Training, change management, initial support",
        "confidence": 0.90,
        "range": { "low": 120000, "high": 180000 }
      },
      "operations": {
        "annual": 200000,
        "description": "Maintenance, model updates, hosting",
        "confidence": 0.80,
        "range": { "low": 160000, "high": 250000 }
      },
      "opportunityCost": {
        "oneTime": 100000,
        "description": "Team focus diverted from other initiatives",
        "confidence": 0.60,
        "range": { "low": 50000, "high": 200000 }
      }
    },
    "benefits": {
      "supportCostReduction": {
        "annual": 400000,
        "description": "30% reduction in support staff costs",
        "confidence": 0.75,
        "range": { "low": 300000, "high": 500000 },
        "assumptions": ["Chatbot handles 60% of tier-1 inquiries"]
      },
      "customerSatisfaction": {
        "annual": 150000,
        "description": "24/7 availability, faster response times",
        "confidence": 0.65,
        "range": { "low": 80000, "high": 220000 },
        "metric": "Reduced churn, increased NPS",
        "assumptions": ["5% churn reduction valued at $150k annually"]
      },
      "scalability": {
        "annual": 100000,
        "description": "Support volume growth without proportional cost increase",
        "confidence": 0.70,
        "range": { "low": 50000, "high": 180000 },
        "assumptions": ["Business growth of 20% annually"]
      },
      "dataInsights": {
        "annual": 50000,
        "description": "ML insights into customer issues, product improvements",
        "confidence": 0.50,
        "range": { "low": 0, "high": 100000 },
        "metric": "Hard to quantify"
      }
    },
    "npvCalculation": {
      "year0": {
        "costs": 750000,
        "benefits": 0,
        "netCashFlow": -750000,
        "discountedValue": -750000
      },
      "year1": {
        "costs": 200000,
        "benefits": 700000,
        "netCashFlow": 500000,
        "discountedValue": 462963
      },
      "year2": {
        "costs": 200000,
        "benefits": 700000,
        "netCashFlow": 500000,
        "discountedValue": 428669
      },
      "year3": {
        "costs": 200000,
        "benefits": 700000,
        "netCashFlow": 500000,
        "discountedValue": 396916
      },
      "totalNPV": 538548,
      "roi": 0.72,
      "roiPercentage": "72%",
      "paybackPeriod": "1.5 years"
    },
    "sensitivityAnalysis": {
      "optimistic": {
        "npv": 892000,
        "scenario": "High adoption, low costs"
      },
      "expected": {
        "npv": 538548,
        "scenario": "Base case"
      },
      "pessimistic": {
        "npv": 125000,
        "scenario": "Low adoption, high costs"
      }
    },
    "probabilisticAnalysis": {
      "priorProbability": {
        "projectSuccess": 0.7,
        "justification": "Similar projects in industry have 70% success rate"
      },
      "evidence": [
        {
          "factor": "Experienced AI team",
          "likelihoodGivenSuccess": 0.9,
          "likelihoodGivenFailure": 0.3
        },
        {
          "factor": "Clear requirements",
          "likelihoodGivenSuccess": 0.85,
          "likelihoodGivenFailure": 0.4
        }
      ],
      "posteriorProbability": {
        "projectSuccess": 0.85,
        "calculation": "Bayesian update based on evidence"
      }
    },
    "recommendation": {
      "decision": "Proceed with implementation",
      "reasoning": "Positive NPV ($538k) with 85% probability of success. Even in pessimistic scenario, NPV remains positive ($125k). Strong ROI (72%) with payback in 1.5 years.",
      "conditions": [
        "Secure executive sponsorship",
        "Phase 1 pilot to validate assumptions",
        "Quarterly reviews to reassess benefits realization"
      ]
    }
  }
}
```

#### In Counterfactual Mode

Compare alternative scenarios:

```javascript
{
  "mode": "counterfactual",
  "alternatives": [
    {
      "name": "Build custom AI chatbot",
      "npv": 538548,
      "roi": 0.72,
      "risks": ["Development complexity", "Long timeline"]
    },
    {
      "name": "Purchase off-the-shelf solution",
      "npv": 425000,
      "roi": 0.65,
      "risks": ["Limited customization", "Vendor dependency"]
    },
    {
      "name": "Hire additional support staff",
      "npv": -200000,
      "roi": -0.15,
      "risks": ["Ongoing high costs", "Scaling challenges"]
    },
    {
      "name": "Status quo",
      "npv": 0,
      "roi": 0,
      "risks": ["Competitive disadvantage", "Customer satisfaction decline"]
    }
  ]
}
```

### Best Practices

1. **Include all relevant costs** - Don’t forget indirect, opportunity, and sunk costs
1. **Quantify intangibles** - Attempt to value benefits like brand reputation
1. **Use appropriate discount rate** - Reflects risk and time value of money
1. **Sensitivity analysis** - Test how results change with different assumptions
1. **Monte Carlo simulation** - For complex analyses with many uncertainties
1. **Document assumptions** - Make them explicit and testable
1. **Consider non-financial factors** - Some things can’t be monetized

### Limitations

- Difficulty quantifying intangible benefits (e.g., employee morale)
- Assumption-heavy, especially for long time horizons
- May overlook qualitative strategic considerations
- Can be manipulated by adjusting assumptions
- Doesn’t account for option value (flexibility to change course)
- Ethical concerns may not be captured in monetary terms

-----

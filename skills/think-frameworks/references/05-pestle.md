# PESTLE Analysis

### Description

A strategic framework for analyzing macro-environmental factors that impact organizations, projects, or decisions. Used primarily in strategic planning, market research, and risk assessment.

### Six Factors

1. **Political** - Government policies, regulations, political stability, trade restrictions, tax policy
1. **Economic** - Economic growth, interest rates, inflation, unemployment, exchange rates
1. **Social** - Demographics, cultural attitudes, lifestyle changes, education levels
1. **Technological** - Technological innovation, automation, R&D activity, tech infrastructure
1. **Legal** - Employment law, consumer protection, health & safety, intellectual property
1. **Environmental** - Climate change, sustainability, waste disposal, carbon footprint

### Application Within Reasoning Modes

#### In Strategic Planning with Sequential Mode

```javascript
{
  "mode": "sequential",
  "thought": "PESTLE analysis for expanding into European market",
  "pestleAnalysis": {
    "political": [
      {
        "factor": "Brexit implications",
        "impact": "high",
        "effect": "negative",
        "details": "Trade barriers with UK, regulatory divergence",
        "mitigation": "Focus on EU27 markets initially"
      },
      {
        "factor": "GDPR compliance requirements",
        "impact": "high",
        "effect": "neutral",
        "details": "Requires significant investment but manageable"
      }
    ],
    "economic": [
      {
        "factor": "Strong Euro",
        "impact": "medium",
        "effect": "positive",
        "details": "Favorable exchange rate for USD operations",
        "timeframe": "short-term"
      },
      {
        "factor": "Rising labor costs",
        "impact": "medium",
        "effect": "negative",
        "details": "Especially in Western Europe"
      }
    ],
    "social": [
      {
        "factor": "Growing digital adoption among seniors",
        "impact": "high",
        "effect": "positive",
        "details": "Expanding addressable market"
      },
      {
        "factor": "Privacy-conscious consumer base",
        "impact": "high",
        "effect": "neutral",
        "details": "Requires privacy-first approach"
      }
    ],
    "technological": [
      {
        "factor": "Advanced 5G infrastructure",
        "impact": "medium",
        "effect": "positive",
        "details": "Enables better mobile experience"
      }
    ],
    "legal": [
      {
        "factor": "DSA/DMA regulations",
        "impact": "high",
        "effect": "negative",
        "details": "Compliance costs, operational restrictions"
      }
    ],
    "environmental": [
      {
        "factor": "EU carbon border adjustment",
        "impact": "low",
        "effect": "negative",
        "details": "May affect supply chain costs"
      }
    ]
  }
}
```

#### Combined with Counterfactual Mode

```javascript
{
  "mode": "counterfactual",
  "actual": {
    "name": "Current market conditions",
    "pestleSnapshot": {
      "political": "Stable",
      "economic": "Growth phase",
      "social": "Pro-technology"
    }
  },
  "counterfactuals": [
    {
      "name": "Economic recession scenario",
      "pestleChanges": {
        "economic": {
          "from": "2% GDP growth",
          "to": "-1% GDP contraction",
          "implications": [
            "Reduced consumer spending",
            "B2B contracts delayed",
            "Investment capital scarce"
          ]
        }
      },
      "adjustedStrategy": "Focus on cost-saving value proposition"
    }
  ]
}
```

### Best Practices

1. **Regular updates** - PESTLE factors change; reassess quarterly or semi-annually
1. **Prioritize factors** - Not all are equally relevant to your context
1. **Quantify impact** - Where possible, use metrics (e.g., “15% tariff increase”)
1. **Consider interactions** - Factors influence each other (e.g., political → legal)
1. **Scenario planning** - Use multiple PESTLE scenarios (optimistic, pessimistic, likely)
1. **Connect to strategy** - Don’t just list factors; derive strategic implications

### Limitations

- External focus only; doesn’t address internal capabilities
- Can generate overwhelming amounts of data
- Factors may overlap between categories
- May miss rapid, unexpected changes
- Effectiveness depends on quality of information sources

-----

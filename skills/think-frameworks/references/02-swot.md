# SWOT Analysis

### Description

A strategic planning framework that evaluates **S**trengths, **W**eaknesses, **O**pportunities, and **T**hreats related to a project, business, initiative, or decision.

### Framework Structure

#### Internal Factors (Present State)

- **Strengths**: Internal positive attributes and resources
- **Weaknesses**: Internal negative attributes and limitations

#### External Factors (Future Potential)

- **Opportunities**: External factors that could be advantageous
- **Threats**: External factors that could cause problems

### Application Within Reasoning Modes

#### In Strategic Analysis

```javascript
{
  "mode": "sequential",
  "thought": "SWOT analysis for microservices migration",
  "swotAnalysis": {
    "strengths": [
      {
        "factor": "Strong DevOps culture",
        "impact": "high",
        "evidence": "99.9% deployment success rate"
      },
      {
        "factor": "Experienced team with distributed systems knowledge",
        "impact": "high"
      }
    ],
    "weaknesses": [
      {
        "factor": "Legacy monolithic codebase with tight coupling",
        "impact": "high",
        "mitigation": "Incremental strangler pattern approach"
      },
      {
        "factor": "Limited observability infrastructure",
        "impact": "medium",
        "mitigation": "Implement distributed tracing first"
      }
    ],
    "opportunities": [
      {
        "factor": "Independent scaling of high-traffic services",
        "benefit": "Cost savings estimated at 30%",
        "timeframe": "6-12 months"
      },
      {
        "factor": "Faster feature deployment cycles",
        "benefit": "Competitive advantage"
      }
    ],
    "threats": [
      {
        "factor": "Increased operational complexity",
        "probability": "high",
        "severity": "medium",
        "mitigation": "Invest in automation and monitoring"
      },
      {
        "factor": "Data consistency challenges",
        "probability": "medium",
        "severity": "high",
        "mitigation": "Implement saga pattern, eventual consistency"
      }
    ]
  }
}
```

#### Combined with Counterfactual Mode

Use SWOT to structure “what-if” scenario analysis:

```javascript
{
  "mode": "counterfactual",
  "actual": {
    "name": "Current monolithic architecture",
    "swot": {
      "strengths": ["Simple deployment", "Easy debugging"],
      "weaknesses": ["Scaling limitations", "Deployment bottlenecks"]
    }
  },
  "counterfactuals": [
    {
      "name": "Microservices architecture",
      "swot": {
        "strengths": ["Independent scaling", "Team autonomy"],
        "weaknesses": ["Operational complexity", "Network overhead"],
        "opportunities": ["Cloud-native benefits", "Technology diversity"],
        "threats": ["Service mesh complexity", "Data consistency"]
      }
    }
  ]
}
```

### Best Practices

1. **Be specific and evidence-based** - Avoid vague statements like “good team”
1. **Prioritize factors** - Not all items are equally important
1. **Consider relationships** - How can strengths address weaknesses? How can opportunities mitigate threats?
1. **Include quantification** - Add metrics, percentages, or magnitudes where possible
1. **Update regularly** - SWOT is a snapshot; revisit periodically
1. **Action-oriented** - Convert insights into strategies and decisions

### Limitations

- Tends to generate lists without prioritization
- Can be subjective without proper evidence
- Doesn’t provide solutions, only highlights factors
- May oversimplify complex situations

-----

# Fishbone Diagram (Ishikawa)

### Also Known As

- Cause-and-Effect Diagram
- Ishikawa Diagram

### Description

A visual tool for categorizing potential causes of a problem to identify root causes. Developed by Kaoru Ishikawa, it organizes causes into categories (typically 6Ms or 8Ps) radiating from a central “spine.”

### Standard Categories

#### 6Ms (Manufacturing)

1. **Methods** - Processes, procedures, requirements
1. **Machines** - Equipment, tools, technology
1. **Materials** - Raw materials, inputs, components
1. **Measurements** - Inspections, data, metrics
1. **Man** (People) - Personnel, skills, training
1. **Mother Nature** (Environment) - Conditions, location, time

#### 8Ps (Service Industries)

1. **Product/Service** - What is being delivered
1. **Price** - Cost considerations
1. **Place** - Location, distribution
1. **Promotion** - Marketing, awareness
1. **People** - Personnel, skills
1. **Process** - Workflows, procedures
1. **Physical Evidence** - Tangible elements
1. **Productivity** - Efficiency, output

### Application Within Reasoning Modes

#### In Causal Mode

Structure comprehensive cause analysis:

```javascript
{
  "mode": "causal",
  "problem": "High defect rate in production",
  "fishboneAnalysis": {
    "effect": "15% defect rate (target: 2%)",
    "categories": {
      "methods": [
        {
          "cause": "Inadequate testing procedures",
          "subCauses": [
            "No automated integration tests",
            "Manual testing insufficient for scale"
          ],
          "impact": "high"
        },
        {
          "cause": "Unclear deployment process",
          "subCauses": ["Documentation outdated", "Process varies by team"],
          "impact": "medium"
        }
      ],
      "machines": [
        {
          "cause": "Insufficient test environments",
          "subCauses": [
            "Only 2 staging servers for 5 teams",
            "Test data doesn't match production"
          ],
          "impact": "high"
        }
      ],
      "materials": [
        {
          "cause": "Third-party library vulnerabilities",
          "subCauses": ["Dependencies not regularly updated"],
          "impact": "medium"
        }
      ],
      "measurements": [
        {
          "cause": "No defect tracking metrics",
          "subCauses": ["Can't identify patterns", "No early warning system"],
          "impact": "high"
        }
      ],
      "people": [
        {
          "cause": "High team turnover",
          "subCauses": [
            "Knowledge loss",
            "Onboarding insufficient"
          ],
          "impact": "medium"
        }
      ],
      "environment": [
        {
          "cause": "Tight release deadlines",
          "subCauses": ["Pressure to skip testing", "Technical debt accumulation"],
          "impact": "high"
        }
      ]
    },
    "rootCauseHypothesis": "Combination of inadequate testing procedures (methods) and insufficient test environments (machines) amplified by tight deadlines (environment)"
  }
}
```

#### In Abductive Mode

Use categories to systematically generate hypotheses:

```javascript
{
  "mode": "abductive",
  "observation": "Website conversion rate dropped 40% overnight",
  "categoryHypotheses": {
    "methods": ["Checkout process changed", "Payment gateway updated"],
    "machines": ["Server performance degraded", "CDN issues"],
    "materials": ["Third-party script broke", "API integration failed"],
    "measurements": ["Analytics tracking misconfigured"],
    "people": ["Code deployment error"],
    "environment": ["Browser update incompatibility", "Mobile platform changes"]
  }
}
```

### Best Practices

1. **Start with clear problem statement** - The “effect” must be specific and measurable
1. **Brainstorm causes systematically** - Go through each category methodically
1. **Dig deeper with sub-causes** - Each major cause may have contributing factors
1. **Use visual representation** - Drawing the diagram helps see relationships
1. **Involve diverse perspectives** - Different team members see different causes
1. **Verify with data** - Not all identified causes are actual root causes

### Limitations

- Can become overwhelming with too many causes
- Doesn’t prioritize causes by impact
- Requires facilitation skills for group sessions
- May miss systemic or cultural issues
- Visual format doesn’t translate well to some documentation systems

-----

# Force Field Analysis

### Description

A decision-making technique developed by Kurt Lewin that visualizes forces for and against a change or decision. Helps identify factors that support or hinder progress toward a goal.

### Components

- **Driving Forces** - Factors pushing toward the desired change (pros, enablers)
- **Restraining Forces** - Factors resisting or blocking the change (cons, barriers)
- **Equilibrium** - Current state maintained by balance of forces
- **Force Strength** - Magnitude/importance of each force (typically 1-5 scale)

### Application Within Reasoning Modes

#### In Decision Analysis

```javascript
{
  "mode": "sequential",
  "decision": "Migrate from on-premise to cloud infrastructure",
  "forceFieldAnalysis": {
    "currentState": "On-premise data centers",
    "desiredState": "Cloud-native infrastructure",
    "drivingForces": [
      {
        "force": "Scalability requirements",
        "strength": 5,
        "description": "Need to handle 10x traffic growth",
        "stakeholder": "Engineering, Product"
      },
      {
        "force": "Operational cost reduction",
        "strength": 4,
        "description": "30% projected savings on infrastructure",
        "stakeholder": "Finance, Executive"
      },
      {
        "force": "Faster deployment cycles",
        "strength": 4,
        "description": "Enable CI/CD, reduce time-to-market",
        "stakeholder": "Engineering, Product"
      },
      {
        "force": "Global availability",
        "strength": 3,
        "description": "Serve international customers with low latency",
        "stakeholder": "Sales, Product"
      }
    ],
    "restrainingForces": [
      {
        "force": "Migration complexity",
        "strength": 5,
        "description": "200+ legacy applications, 6-12 month effort",
        "stakeholder": "Engineering"
      },
      {
        "force": "Security concerns",
        "strength": 4,
        "description": "Data sovereignty, compliance requirements",
        "stakeholder": "Security, Legal"
      },
      {
        "force": "Team skill gaps",
        "strength": 3,
        "description": "Need to train staff on cloud technologies",
        "stakeholder": "Engineering, HR"
      },
      {
        "force": "Upfront migration costs",
        "strength": 3,
        "description": "$2M investment before cost savings realized",
        "stakeholder": "Finance"
      },
      {
        "force": "Vendor lock-in risk",
        "strength": 2,
        "description": "Concern about dependency on cloud provider",
        "stakeholder": "Architecture, Executive"
      }
    ],
    "netForce": 1,
    "analysis": {
      "drivingTotal": 16,
      "restrainingTotal": 17,
      "assessment": "Forces nearly balanced; slight resistance to change",
      "strategy": "Strengthen driving forces and/or weaken restraining forces"
    },
    "actionItems": [
      {
        "type": "strengthen_driving",
        "action": "Secure executive sponsorship for scalability mandate",
        "targetForce": "Scalability requirements",
        "expectedImpact": "+1 strength"
      },
      {
        "type": "weaken_restraining",
        "action": "Implement multi-cloud strategy to address vendor lock-in",
        "targetForce": "Vendor lock-in risk",
        "expectedImpact": "-1 strength"
      },
      {
        "type": "weaken_restraining",
        "action": "Phase migration approach reduces complexity perception",
        "targetForce": "Migration complexity",
        "expectedImpact": "-2 strength"
      },
      {
        "type": "weaken_restraining",
        "action": "Comprehensive training program addresses skill gaps",
        "targetForce": "Team skill gaps",
        "expectedImpact": "-2 strength"
      }
    ]
  }
}
```

#### Combined with Counterfactual Mode

```javascript
{
  "mode": "counterfactual",
  "scenarios": [
    {
      "name": "Strengthen driving forces strategy",
      "forceFieldChanges": {
        "drivingTotal": 18,
        "restrainingTotal": 17,
        "netForce": 1,
        "outcome": "Slight momentum for change"
      }
    },
    {
      "name": "Weaken restraining forces strategy",
      "forceFieldChanges": {
        "drivingTotal": 16,
        "restrainingTotal": 12,
        "netForce": 4,
        "outcome": "Strong momentum for change - recommended approach"
      }
    }
  ]
}
```

### Best Practices

1. **Involve stakeholders** - Different perspectives reveal hidden forces
1. **Be realistic about force strength** - Avoid wishful thinking
1. **Prioritize actionable forces** - Focus on forces you can influence
1. **Create action plans** - Identify specific ways to strengthen/weaken forces
1. **Reassess after actions** - Update the analysis as conditions change
1. **Consider timing** - Some forces may be stronger/weaker at different times

### Limitations

- Subjective assessment of force strength
- May oversimplify complex organizational dynamics
- Doesn’t address root causes behind forces
- Static snapshot; doesn’t capture dynamic changes
- Can be manipulated to justify predetermined decisions

-----

# Stakeholder Analysis

### Description

A technique for identifying and analyzing individuals or groups who have an interest in or influence over a project, decision, or initiative. Essential for change management and strategic planning.

### Dimensions Analyzed

1. **Power/Influence** - Ability to affect outcomes
1. **Interest/Impact** - Level of concern or effect on stakeholder
1. **Attitude** - Supportive, neutral, or resistant
1. **Role** - Decision-maker, influencer, implementer, affected party

### Application Within Reasoning Modes

#### In Game Theory Mode

Model stakeholder interactions:

```javascript
{
  "mode": "gametheory",
  "scenario": "Implementing new performance review system",
  "stakeholderAnalysis": {
    "stakeholders": [
      {
        "id": "executives",
        "name": "Executive Leadership",
        "power": "high",
        "interest": "high",
        "attitude": "supportive",
        "role": "decision-maker",
        "objectives": ["Improve retention", "Data-driven decisions"],
        "concerns": ["Cost", "Implementation disruption"],
        "influence": "Final approval authority",
        "strategy": "Keep satisfied and engaged"
      },
      {
        "id": "managers",
        "name": "Middle Management",
        "power": "medium",
        "interest": "high",
        "attitude": "neutral-resistant",
        "role": "implementer",
        "objectives": ["Manageable workload", "Fair process"],
        "concerns": ["Additional work", "Difficult conversations"],
        "influence": "Can sabotage implementation",
        "strategy": "Involve in design, provide training"
      },
      {
        "id": "employees",
        "name": "Individual Contributors",
        "power": "low-medium",
        "interest": "high",
        "attitude": "skeptical",
        "role": "affected party",
        "objectives": ["Fair evaluation", "Career growth"],
        "concerns": ["Subjectivity", "Negative impact on compensation"],
        "influence": "Collective resistance possible",
        "strategy": "Transparent communication, pilot program"
      },
      {
        "id": "hr",
        "name": "HR Department",
        "power": "medium",
        "interest": "high",
        "attitude": "supportive",
        "role": "implementer",
        "objectives": ["Successful rollout", "Compliance"],
        "concerns": ["Resource availability", "System integration"],
        "influence": "Design and execution",
        "strategy": "Empower as champions"
      },
      {
        "id": "legal",
        "name": "Legal/Compliance",
        "power": "medium",
        "interest": "medium",
        "attitude": "neutral",
        "role": "gatekeeper",
        "objectives": ["Legal compliance", "Risk mitigation"],
        "concerns": ["Discrimination claims", "Documentation"],
        "influence": "Veto power on legal grounds",
        "strategy": "Early involvement, clear guidelines"
      }
    ],
    "powerInterestMatrix": {
      "highPowerHighInterest": ["executives", "managers", "hr"],
      "highPowerLowInterest": [],
      "lowPowerHighInterest": ["employees"],
      "lowPowerLowInterest": ["legal"]
    },
    "engagementStrategies": {
      "executives": "Monthly steering committee, regular updates",
      "managers": "Co-design workshops, early access, dedicated support",
      "employees": "Town halls, FAQ sessions, feedback channels",
      "hr": "Dedicated project team, authority to make decisions",
      "legal": "Compliance review at milestones"
    },
    "risks": [
      {
        "risk": "Manager resistance derails implementation",
        "probability": "medium",
        "mitigation": "Involve managers in design phase"
      },
      {
        "risk": "Employee mistrust reduces participation",
        "probability": "high",
        "mitigation": "Pilot with volunteers, transparent communication"
      }
    ]
  }
}
```

#### In Causal Mode

Map stakeholder influence chains:

```javascript
{
  "mode": "causal",
  "causalGraph": {
    "nodes": [
      { "id": "executives", "type": "actor" },
      { "id": "managers", "type": "actor" },
      { "id": "budget_approval", "type": "decision" },
      { "id": "implementation_quality", "type": "outcome" },
      { "id": "employee_adoption", "type": "outcome" }
    ],
    "edges": [
      {
        "from": "executives",
        "to": "budget_approval",
        "strength": 1.0,
        "mechanism": "direct authority"
      },
      {
        "from": "budget_approval",
        "to": "implementation_quality",
        "strength": 0.8,
        "mechanism": "resources enable quality"
      },
      {
        "from": "managers",
        "to": "employee_adoption",
        "strength": 0.9,
        "mechanism": "managers influence team attitudes"
      },
      {
        "from": "implementation_quality",
        "to": "employee_adoption",
        "strength": 0.7,
        "mechanism": "quality drives acceptance"
      }
    ]
  }
}
```

### Best Practices

1. **Cast a wide net initially** - Better to identify too many than miss key stakeholders
1. **Update regularly** - Stakeholder power and interest shift over time
1. **Consider indirect stakeholders** - Those affected even if not directly involved
1. **Map relationships** - Stakeholders influence each other
1. **Differentiate strategies** - One-size-fits-all doesn’t work
1. **Document assumptions** - Power and attitude assessments are subjective

### Limitations

- Difficult to assess power and influence objectively
- Stakeholder positions may be unclear or hidden
- Dynamic situations require constant reassessment
- May miss informal influencers without formal power
- Can become overly complex with too many stakeholders

-----

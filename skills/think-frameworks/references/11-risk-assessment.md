# Risk Assessment Matrix

### Description

A visual tool for assessing and prioritizing risks by plotting them on a matrix based on two dimensions: **Probability** (likelihood of occurrence) and **Impact** (severity if it occurs).

### Matrix Structure

|                      |Low Impact |Medium Impact|High Impact  |
|----------------------|-----------|-------------|-------------|
|**High Probability**  |Medium Risk|High Risk    |Critical Risk|
|**Medium Probability**|Low Risk   |Medium Risk  |High Risk    |
|**Low Probability**   |Low Risk   |Low Risk     |Medium Risk  |

### Application Within Reasoning Modes

#### In Evidential Mode

Incorporate uncertainty and incomplete information:

```javascript
{
  "mode": "evidential",
  "project": "Cloud infrastructure migration",
  "riskAssessment": {
    "risks": [
      {
        "id": "r1",
        "risk": "Data loss during migration",
        "category": "technical",
        "probability": {
          "assessment": "low",
          "numericValue": 0.15,
          "beliefFunction": {
            "low": 0.7,
            "medium": 0.2,
            "high": 0.1
          },
          "evidence": [
            {
              "source": "Historical data",
              "reliability": 0.9,
              "supports": "low probability"
            },
            {
              "source": "Expert assessment",
              "reliability": 0.8,
              "supports": "low probability"
            }
          ]
        },
        "impact": {
          "assessment": "critical",
          "numericValue": 0.95,
          "consequences": [
            "Business disruption",
            "Regulatory penalties",
            "Customer trust damage"
          ],
          "financialImpact": "$2M - $5M"
        },
        "riskLevel": "high",
        "riskScore": 0.14,
        "mitigations": [
          {
            "mitigation": "Multi-stage backup and verification",
            "effectiveness": 0.85,
            "cost": 50000,
            "residualProbability": 0.02
          },
          {
            "mitigation": "Pilot migration with non-critical systems",
            "effectiveness": 0.7,
            "cost": 20000,
            "residualProbability": 0.045
          }
        ],
        "owner": "Infrastructure Lead",
        "status": "Active mitigation"
      },
      {
        "id": "r2",
        "risk": "Team skill gaps delay migration",
        "category": "resource",
        "probability": {
          "assessment": "medium",
          "numericValue": 0.45,
          "beliefFunction": {
            "low": 0.2,
            "medium": 0.6,
            "high": 0.2
          }
        },
        "impact": {
          "assessment": "medium",
          "numericValue": 0.50,
          "consequences": [
            "Timeline extension 2-3 months",
            "Budget overrun 15-20%"
          ],
          "financialImpact": "$150k - $300k"
        },
        "riskLevel": "medium",
        "riskScore": 0.225,
        "mitigations": [
          {
            "mitigation": "Comprehensive training program",
            "effectiveness": 0.6,
            "cost": 40000,
            "residualProbability": 0.18
          },
          {
            "mitigation": "Hire external consultants",
            "effectiveness": 0.8,
            "cost": 120000,
            "residualProbability": 0.09
          }
        ],
        "owner": "Engineering Manager",
        "status": "Training program initiated"
      },
      {
        "id": "r3",
        "risk": "Cost overruns exceed budget by 50%",
        "category": "financial",
        "probability": {
          "assessment": "medium",
          "numericValue": 0.35,
          "beliefFunction": {
            "low": 0.3,
            "medium": 0.5,
            "high": 0.2
          }
        },
        "impact": {
          "assessment": "high",
          "numericValue": 0.80,
          "consequences": [
            "Budget reallocation required",
            "Other projects delayed",
            "Executive scrutiny"
          ],
          "financialImpact": "$500k - $750k"
        },
        "riskLevel": "high",
        "riskScore": 0.28,
        "mitigations": [
          {
            "mitigation": "Phased approach with go/no-go gates",
            "effectiveness": 0.7,
            "cost": 0,
            "residualProbability": 0.105
          },
          {
            "mitigation": "Contingency reserve 20%",
            "effectiveness": 0.5,
            "cost": 200000,
            "residualProbability": 0.175
          }
        ],
        "owner": "Program Manager",
        "status": "Contingency approved"
      },
      {
        "id": "r4",
        "risk": "Security breach due to misconfiguration",
        "category": "security",
        "probability": {
          "assessment": "medium",
          "numericValue": 0.30,
          "beliefFunction": {
            "low": 0.4,
            "medium": 0.4,
            "high": 0.2
          }
        },
        "impact": {
          "assessment": "critical",
          "numericValue": 0.90,
          "consequences": [
            "Data breach",
            "Regulatory fines",
            "Reputation damage",
            "Customer churn"
          ],
          "financialImpact": "$1M - $10M"
        },
        "riskLevel": "critical",
        "riskScore": 0.27,
        "mitigations": [
          {
            "mitigation": "Security audit at each migration phase",
            "effectiveness": 0.75,
            "cost": 80000,
            "residualProbability": 0.075
          },
          {
            "mitigation": "Infrastructure-as-code with security scanning",
            "effectiveness": 0.8,
            "cost": 60000,
            "residualProbability": 0.06
          }
        ],
        "owner": "Security Lead",
        "status": "Active mitigation"
      }
    ],
    "riskMatrix": {
      "critical": ["r1", "r4"],
      "high": ["r3"],
      "medium": ["r2"],
      "low": []
    },
    "overallRiskProfile": {
      "totalRisks": 4,
      "criticalRisks": 2,
      "aggregateRiskScore": 0.935,
      "topRisks": ["r4", "r3", "r1"],
      "mitigationStatus": {
        "fullyMitigated": 0,
        "activeMitigation": 3,
        "planned": 0,
        "accepted": 0
      }
    }
  }
}
```

#### In Bayesian Mode

Update risk assessments with new evidence:

```javascript
{
  "mode": "bayesian",
  "riskUpdate": {
    "risk": "Data loss during migration",
    "prior": {
      "probability": 0.15,
      "basis": "Industry statistics and expert judgment"
    },
    "evidence": {
      "description": "Pilot migration of non-critical system completed successfully",
      "likelihoodGivenRisk": 0.4,
      "likelihoodGivenNoRisk": 0.95
    },
    "posterior": {
      "probability": 0.07,
      "calculation": "Bayesian update reduces probability by more than half",
      "interpretation": "Successful pilot significantly reduces assessed risk"
    },
    "updatedRiskLevel": "medium (downgraded from high)"
  }
}
```

### Best Practices

1. **Use consistent scales** - Define probability and impact scales clearly
1. **Involve diverse perspectives** - Different stakeholders see different risks
1. **Quantify where possible** - Use percentages and dollar amounts
1. **Update regularly** - Risk profiles change as projects progress
1. **Focus on top risks** - Concentrate mitigation efforts on critical/high risks
1. **Document assumptions** - Explain how probability and impact were assessed
1. **Consider risk interdependencies** - Some risks increase probability of others

### Limitations

- Subjective assessments of probability and impact
- Doesn’t capture risk interdependencies well
- Binary thinking (risk happens or doesn’t) vs. partial outcomes
- May miss “unknown unknowns” (unidentified risks)
- Static snapshot; doesn’t show how risks evolve

-----

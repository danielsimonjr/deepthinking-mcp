# Pareto Analysis (80/20 Rule)

### Description

A statistical technique based on the Pareto Principle, which states that roughly 80% of effects come from 20% of causes. Used to identify the most significant factors in a set of data.

### Key Concept

Focus effort on the “vital few” rather than the “trivial many” to maximize impact.

### Application Within Reasoning Modes

#### In Causal Mode

Identify high-impact causes:

```javascript
{
  "mode": "causal",
  "problem": "Customer support ticket volume",
  "paretoAnalysis": {
    "totalTickets": 10000,
    "issueCategories": [
      {
        "category": "Password reset requests",
        "count": 4200,
        "percentage": 42,
        "cumulativePercentage": 42,
        "rank": 1,
        "impactCategory": "vital"
      },
      {
        "category": "Payment processing errors",
        "count": 2100,
        "percentage": 21,
        "cumulativePercentage": 63,
        "rank": 2,
        "impactCategory": "vital"
      },
      {
        "category": "Account activation issues",
        "count": 1500,
        "percentage": 15,
        "cumulativePercentage": 78,
        "rank": 3,
        "impactCategory": "vital"
      },
      {
        "category": "Feature questions",
        "count": 800,
        "percentage": 8,
        "cumulativePercentage": 86,
        "rank": 4,
        "impactCategory": "useful"
      },
      {
        "category": "Billing inquiries",
        "count": 600,
        "percentage": 6,
        "cumulativePercentage": 92,
        "rank": 5,
        "impactCategory": "useful"
      },
      {
        "category": "Other",
        "count": 800,
        "percentage": 8,
        "cumulativePercentage": 100,
        "rank": 6,
        "impactCategory": "trivial"
      }
    ],
    "vitalFew": [
      "Password reset requests",
      "Payment processing errors",
      "Account activation issues"
    ],
    "impact": "These 3 categories (30% of issue types) account for 78% of all tickets",
    "recommendations": [
      {
        "category": "Password reset requests",
        "solution": "Implement self-service password reset with SMS/email",
        "estimatedReduction": "90% reduction (3,780 tickets saved)"
      },
      {
        "category": "Payment processing errors",
        "solution": "Improve payment gateway error handling and user feedback",
        "estimatedReduction": "50% reduction (1,050 tickets saved)"
      },
      {
        "category": "Account activation issues",
        "solution": "Automate activation email retries, clearer instructions",
        "estimatedReduction": "60% reduction (900 tickets saved)"
      }
    ],
    "projectedImpact": "Addressing top 3 categories could reduce overall ticket volume by 57%"
  }
}
```

#### In Abductive Mode

Prioritize hypothesis testing:

```javascript
{
  "mode": "abductive",
  "observation": "Website conversion rate dropped 25%",
  "hypothesesByImpact": [
    {
      "hypothesis": "Checkout page broken on mobile",
      "potentialImpact": "60% of traffic is mobile",
      "estimatedEffect": "15% conversion drop",
      "priorityRank": 1,
      "testEffort": "low"
    },
    {
      "hypothesis": "Payment gateway intermittent failures",
      "potentialImpact": "All payment attempts",
      "estimatedEffect": "8% conversion drop",
      "priorityRank": 2,
      "testEffort": "low"
    },
    {
      "hypothesis": "Price increase not communicated",
      "potentialImpact": "Price-sensitive customers",
      "estimatedEffect": "2% conversion drop",
      "priorityRank": 3,
      "testEffort": "medium"
    }
  ],
  "paretoStrategy": "Test top 2 hypotheses first - likely to explain 23% of 25% drop"
}
```

### Best Practices

1. **Sort data by frequency or impact** - Arrange from highest to lowest
1. **Calculate cumulative percentages** - Track running total
1. **Visualize with Pareto chart** - Bar chart + line graph shows distribution
1. **Apply iteratively** - After addressing top items, repeat analysis
1. **Consider effort vs. impact** - Sometimes #2 item is easier to fix than #1
1. **Don’t ignore the “trivial many”** - They still matter, just prioritize differently

### Limitations

- Assumes causes are independent (often not true)
- 80/20 split is approximate, may be 70/30 or 90/10
- Historical data may not predict future patterns
- Can lead to neglecting important low-frequency issues
- May miss systemic root causes underlying multiple symptoms

-----

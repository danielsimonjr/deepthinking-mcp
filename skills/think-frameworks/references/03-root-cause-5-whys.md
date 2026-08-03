# Root Cause Analysis (5 Whys)

### Description

An iterative interrogative technique that explores cause-and-effect relationships by repeatedly asking “Why?” until the fundamental root cause is identified. Developed by Sakichi Toyoda for the Toyota Production System.

### Process

1. **State the problem clearly**
1. **Ask “Why did this happen?”**
1. **When you have an answer, ask “Why?” again**
1. **Repeat 5 times (or until root cause is reached)**
1. **Identify the root cause and implement solutions**

### Application Within Reasoning Modes

#### In Abductive Mode

Use 5 Whys to generate deeper hypotheses:

```javascript
{
  "mode": "abductive",
  "problem": "Application crashes during peak hours",
  "fiveWhys": [
    {
      "level": 1,
      "question": "Why does the application crash during peak hours?",
      "answer": "The database connection pool is exhausted"
    },
    {
      "level": 2,
      "question": "Why is the connection pool exhausted?",
      "answer": "Connections are not being released properly"
    },
    {
      "level": 3,
      "question": "Why are connections not being released?",
      "answer": "Exception handling doesn't include connection cleanup"
    },
    {
      "level": 4,
      "question": "Why doesn't exception handling include connection cleanup?",
      "answer": "Connection management is scattered across multiple code paths"
    },
    {
      "level": 5,
      "question": "Why is connection management scattered?",
      "answer": "No standardized database access pattern was enforced",
      "rootCause": true,
      "solution": "Implement repository pattern with try-with-resources"
    }
  ]
}
```

#### In Causal Mode

Use 5 Whys to trace causal chains:

```javascript
{
  "mode": "causal",
  "causalChain": {
    "initialEffect": "Customer churn increased by 15%",
    "whyAnalysis": [
      {
        "level": 1,
        "cause": "Support response time increased to 48 hours",
        "mechanism": "direct"
      },
      {
        "level": 2,
        "cause": "Support team was understaffed",
        "mechanism": "direct"
      },
      {
        "level": 3,
        "cause": "Hiring freeze implemented",
        "mechanism": "direct"
      },
      {
        "level": 4,
        "cause": "Revenue projections missed by 20%",
        "mechanism": "indirect"
      },
      {
        "level": 5,
        "cause": "Market conditions changed unexpectedly",
        "mechanism": "indirect",
        "rootCause": true
      }
    ]
  }
}
```

### Best Practices

1. **Focus on processes, not people** - Avoid blame, focus on system failures
1. **Use evidence** - Each “why” answer should be verifiable
1. **Know when to stop** - Sometimes the root cause is found before 5 iterations
1. **Watch for multiple causes** - Problems may have several contributing factors
1. **Document the chain** - Keep track of the entire reasoning path
1. **Verify the root cause** - Test if addressing it would prevent the problem

### Limitations

- May oversimplify complex problems with multiple root causes
- Susceptible to cognitive biases (stopping too early, confirmation bias)
- Relies on questioner’s knowledge and experience
- Not suitable for complex systems with feedback loops
- Can lead to different conclusions depending on who asks the questions

-----

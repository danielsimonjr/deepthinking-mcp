# Cost-Benefit Analysis Thought — Output Format

Weighing quantified costs against quantified benefits for a single option, with a recommendation.

## JSON Schema

```json
{
  "mode": "costbenefit",
  "option": "<the option being evaluated>",
  "costs": [
    {"item": "<cost item>", "amount": 0.0}
  ],
  "benefits": [
    {"item": "<benefit item>", "amount": 0.0}
  ],
  "npv": 0.0,
  "roi": 0.0,
  "paybackPeriod": "<number or descriptive string, e.g. '~2.1 years'>",
  "recommendation": "<go/no-go call and the totals that support it>"
}
```

## Required Fields

- `mode` — always `"costbenefit"`
- `option` — the single option being evaluated (unlike `decisionmatrix`, this mode evaluates one option in depth rather than comparing several)
- `costs` — itemized costs, each `{item, amount}`
- `benefits` — itemized benefits, each `{item, amount}`
- `recommendation` — the go/no-go call, with the arithmetic that supports it

`npv`, `roi`, and `paybackPeriod` are optional; each accepts a number, a descriptive string, or `null` when not computed or not meaningful for this option.

## Prose Invariants (not schema-enforced)

- **Show totals.** Per the `think-frameworks` Output Quality Rule ("show scoring math"), the `recommendation` (or accompanying prose) must state the sum of `costs[].amount` and the sum of `benefits[].amount` explicitly — a bare go/no-go call without the underlying totals cannot be audited.
- If `paybackPeriod` is derived from totals (e.g., cost total ÷ annual benefit rate), show that division inline rather than asserting the period as a bare fact.
- If `roi` is present, state what period it covers (e.g., "3-year ROI") — an ROI percentage without a stated time horizon is ambiguous and easy to misread as annualized when it isn't.
- `recommendation` should name the option and state whether to proceed, not proceed, or proceed conditionally — a cost-benefit analysis that stops at "here are the numbers" without a call has done half the job, per this category's "end with an action" rule.

## Verification Checklist

Before emitting, verify:
- `mode` is exactly `"costbenefit"`
- `costs` and `benefits` are both non-empty and each entry has a numeric `amount`
- The cost total and benefit total are both stated explicitly somewhere in the output (schema cannot enforce this — it's a prose invariant)
- If `paybackPeriod`/`roi`/`npv` are present and derived, recompute them from `costs`/`benefits` before emitting to confirm they're arithmetically consistent with the itemized totals
- `recommendation` makes an explicit go/no-go/conditional call

## Worked Example

Input: "Evaluate migrating our production database from self-managed PostgreSQL on EC2 to a managed RDS/Aurora offering. Show costs, benefits, ROI, and payback."

Output:

```json
{
  "mode": "costbenefit",
  "option": "Migrate the production database cluster from self-managed PostgreSQL on EC2 to a managed RDS/Aurora offering",
  "costs": [
    {"item": "Migration engineering effort (6 weeks, 3 engineers @ $150/hr blended)", "amount": 108000},
    {"item": "Managed service premium over self-hosted (annual, first year)", "amount": 42000},
    {"item": "Team training and runbook rewrite", "amount": 15000}
  ],
  "benefits": [
    {"item": "Reduced on-call incident hours (est. 120 hrs/yr saved @ $150/hr)", "amount": 18000},
    {"item": "Eliminated self-managed cluster maintenance (2 FTE-months/yr @ $12,500/mo)", "amount": 25000},
    {"item": "Infrastructure savings from managed autoscaling and reserved capacity", "amount": 37000}
  ],
  "npv": null,
  "roi": 45.5,
  "paybackPeriod": "~2.1 years",
  "recommendation": "Total costs are $165,000, against total first-year benefits of $80,000/year. Payback is $165,000 / $80,000 ≈ 2.1 years, and the 3-year ROI is (3×$80,000 − $165,000) / $165,000 ≈ 45.5%. Recommend proceeding."
}
```

The recommendation restates both totals and shows the payback and ROI division explicitly, rather than asserting "~2.1 years" and "45.5%" as bare facts — this is what "show totals" means in practice.

# PESTLE Thought — Output Format

Macro-environment scan across six external factor categories: Political, Economic, Social, Technological, Legal, Environmental.

## JSON Schema

```json
{
  "mode": "pestle",
  "subject": "<optional: what is being scanned>",
  "political": ["<political factor 1>", ...],
  "economic": ["<economic factor 1>", ...],
  "social": ["<social factor 1>", ...],
  "technological": ["<technological factor 1>", ...],
  "legal": ["<legal factor 1>", ...],
  "environmental": ["<environmental factor 1>", ...],
  "keyFactors": ["<optional: cross-lane synthesis factor 1>", ...]
}
```

## Required Fields

- `mode` — always `"pestle"`
- `political` — political factors: regulation, trade policy, political stability, government intervention
- `economic` — economic factors: exchange rates, inflation, cost structures, market growth
- `social` — social factors: demographics, consumer attitudes, cultural trends
- `technological` — technological factors: infrastructure requirements, technical debt, emerging tech
- `legal` — legal factors: laws, compliance obligations, labor classification, IP
- `environmental` — environmental factors: sustainability requirements, climate/geographic constraints, resource availability

All six category arrays are required — a genuinely empty category should contain `"none identified"` rather than being omitted, per the `think-frameworks` Output Quality Rules.

## Optional Fields

- `subject` — names what is being macro-scanned (an expansion decision, a product launch, a market entry). Strongly recommended even though not schema-required.
- `keyFactors` — a flat synthesis list of the most consequential factors, which may span multiple PESTLE categories (e.g., a single regulation can be both Legal and Technological). This is PESTLE's equivalent of SWOT's `recommendation` — the cross-lane takeaway, not a seventh category.

## Prose Invariant (not schema-enforced)

Each of the six lanes should contain at least one entry, or explicitly say `"none identified"` — a PESTLE scan with a silently thin lane looks like an oversight, not a genuine absence of that category's factors. This is a `think-frameworks` category-wide rule (see `skills/think-frameworks/SKILL.md`), not encoded in the JSON Schema, because "non-empty or explicit placeholder" isn't a clean per-property constraint.

## Verification Checklist

Before emitting, verify:
- `mode` is exactly `"pestle"`
- All six category arrays (`political`, `economic`, `social`, `technological`, `legal`, `environmental`) are present and each is non-empty or explicitly says `"none identified"`
- Each factor is external to the subject (PESTLE is a macro-environment scan, not an internal capability assessment — internal factors belong in a `swot`, not here)
- Each item is specific, not a generic platitude ("regulation exists" is weak; "EU gig-worker classification rules may require reclassifying drivers as employees" is specific)
- If `keyFactors` is present, each entry reflects (or synthesizes across) items that also appear in the six category arrays, and the list ends with something actionable per the category's Output Quality Rules

## Worked Example

Input: "Scan the macro environment for expanding our grocery delivery service from the US into the EU market."

Output:

```json
{
  "mode": "pestle",
  "subject": "Expanding our grocery delivery service from the US into the EU market",
  "political": [
    "EU digital services regulation (DSA) imposes new content-moderation and marketplace-transparency obligations not present in the US",
    "Several target countries have strong labor unions with historical influence over gig-economy delivery worker classification"
  ],
  "economic": [
    "Euro-to-dollar exchange rate volatility over the past 18 months complicates unit-economics forecasting",
    "Fuel and last-mile delivery costs are structurally higher in dense European city centers than in US suburban markets"
  ],
  "social": [
    "European consumers show stronger existing loyalty to established local grocery delivery incumbents",
    "Sustainability and packaging-waste concerns are a larger purchase driver among EU shoppers than US shoppers"
  ],
  "technological": [
    "GDPR-compliant data infrastructure must be stood up before any EU customer data is processed",
    "Our current routing algorithm was tuned for US grid-style city layouts and underperforms in older European street networks"
  ],
  "legal": [
    "EU gig-worker classification rules (the Platform Work Directive) may require reclassifying delivery drivers as employees rather than contractors",
    "Country-by-country VAT registration is required before invoicing customers in each EU member state"
  ],
  "environmental": [
    "Several target cities have low-emission zones that restrict combustion-engine delivery vehicles from entering city centers",
    "EU packaging regulations require a higher proportion of recyclable materials in delivery packaging than current US suppliers provide"
  ],
  "keyFactors": [
    "GDPR-compliant infrastructure and country-by-country VAT registration are hard prerequisites before any EU launch",
    "Gig-worker classification risk under the Platform Work Directive could materially change the delivery-driver cost model",
    "Low-emission zone restrictions require an EV or bicycle-courier fleet strategy in city centers, not a straight port of the US vehicle mix"
  ]
}
```

`keyFactors` here draws from the Legal, Technological, and Environmental lanes simultaneously (GDPR spans Legal + Technological; the vehicle fleet spans Environmental + Economic) — this is what distinguishes a genuine synthesis from restating one item per lane.

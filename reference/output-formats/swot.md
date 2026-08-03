# SWOT Thought — Output Format

Strategic position assessment across internal Strengths/Weaknesses and external Opportunities/Threats.

## JSON Schema

```json
{
  "mode": "swot",
  "subject": "<optional: what is being assessed>",
  "strengths": ["<internal positive factor 1>", ...],
  "weaknesses": ["<internal negative factor 1>", ...],
  "opportunities": ["<external positive factor 1>", ...],
  "threats": ["<external negative factor 1>", ...],
  "recommendation": "<optional: synthesized recommendation>"
}
```

## Required Fields

- `mode` — always `"swot"`
- `strengths` — internal, positive factors (capabilities, assets, advantages the subject already has)
- `weaknesses` — internal, negative factors (gaps, liabilities, disadvantages the subject already has)
- `opportunities` — external, positive factors (favorable conditions the subject could exploit)
- `threats` — external, negative factors (unfavorable conditions the subject must guard against)

## Optional Fields

- `subject` — names what is being assessed (a product decision, a company, a strategic position). Strongly recommended even though not schema-required — a SWOT without a stated subject is ambiguous.
- `recommendation` — the synthesized action recommendation that follows from crossing the four quadrants (e.g., a strength that addresses a threat, or a weakness that blocks an opportunity)

## Prose Invariant (not schema-enforced)

A well-formed SWOT must have **at least one item in at least two quadrants** — a SWOT with content in only a single quadrant is an incomplete analysis, not a legitimately lopsided one. This is enforced only by this prose instruction (see `skills/think-frameworks/SKILL.md`), not by the JSON Schema, because "at least two of four" is not expressible as a simple per-property constraint.

## Verification Checklist

Before emitting, verify:
- `mode` is exactly `"swot"`
- At least two of the four quadrants (`strengths`, `weaknesses`, `opportunities`, `threats`) are non-empty
- Internal/external classification is correct: `strengths`/`weaknesses` describe the subject itself; `opportunities`/`threats` describe the environment around the subject
- Each item is specific and falsifiable, not a generic platitude ("good team" is weak; "engineering team has shipped 3 prior metered-billing integrations" is strong)
- If `recommendation` is present, it references specific quadrant items rather than restating the subject

## Worked Example

Input: "Assess our strategic position on launching a metered usage-based pricing tier for our B2B SaaS analytics product."

Output:

```json
{
  "mode": "swot",
  "subject": "Launching a metered usage-based pricing tier for our B2B SaaS analytics product",
  "strengths": [
    "Existing usage-metering pipeline already instruments every API call, so billing hooks require no new telemetry",
    "Current customer base includes several accounts asking for pay-as-you-go pricing in the last two quarters",
    "Engineering team has prior experience shipping Stripe metered-billing integrations from a previous product"
  ],
  "weaknesses": [
    "No self-serve billing portal exists yet — all plan changes currently require a manual sales-ops ticket",
    "Finance has not validated revenue-recognition treatment for usage-based contracts under ASC 606"
  ],
  "opportunities": [
    "Two of our top three competitors still only offer flat-rate annual contracts, leaving usage-based pricing as a differentiator",
    "Usage-based pricing could unlock smaller accounts currently priced out by the $2,000/month minimum flat tier",
    "Expansion revenue naturally grows with customer usage without a separate upsell motion"
  ],
  "threats": [
    "Usage-based billing introduces revenue unpredictability that could concern the board ahead of the next fundraising round",
    "A poorly designed metering unit (e.g., API calls vs. rows processed) could incentivize customers to architect around our pricing"
  ],
  "recommendation": "Proceed with a limited beta of the metered tier for 5-10 design-partner accounts, gated on finance sign-off on ASC 606 treatment, before building the self-serve billing portal."
}
```

The recommendation crosses a strength (existing metering pipeline) against a weakness (no billing portal yet) to propose a scoped beta rather than a full launch — this is what distinguishes a SWOT recommendation from a simple listing exercise.

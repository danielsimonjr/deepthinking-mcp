# Engineering Reasoning Mode

**Version**: 7.3.0 | **Handler**: v8.4.0 (Specialized)
**Tool**: `deepthinking_engineering`
**Status**: Stable (Fully Implemented)
**Source**: `src/types/modes/engineering.ts`

## Dependencies

| Dependency | Type | Imports |
|------------|------|---------|
| `../core.js` | Internal | `BaseThought`, `ThinkingMode` |

## Exports

- **Types**: `RequirementPriority`, `RequirementSource`, `RequirementStatus`, `SeverityRating`, `OccurrenceRating`, `DetectionRating`, `DecisionStatus`, `EngineeringAnalysisType`
- **Interfaces**: `Requirement`, `RequirementsTraceability`, `TradeAlternative`, `TradeCriterion`, `TradeScore`, `TradeStudy`, `FailureMode`, `FailureModeAnalysis`, `DesignDecision`, `DecisionAlternative`, `DesignDecisionLog`, `EngineeringThought`
- **Functions**: `isEngineeringThought`

---

## Overview

Engineering mode provides **structured design analysis** using four key engineering patterns:

1. **Requirements Traceability** - Track requirements from source to verification
2. **Trade Studies** - Weighted decision matrices for alternative selection
3. **Failure Mode Analysis (FMEA)** - Risk assessment and mitigation
4. **Design Decision Records (ADR)** - Document decisions with rationale

This mode captures systematic engineering practices for rigorous design and analysis.

## Analysis Types

| Type | Description |
|------|-------------|
| `requirements` | Requirements traceability analysis |
| `trade-study` | Trade study for comparing alternatives |
| `fmea` | Failure Mode and Effects Analysis |
| `design-decision` | Design decision records |
| `comprehensive` | Multiple analysis types combined |

## When to Use Engineering Mode

Use engineering mode when you need to:

- **Track requirements** - Ensure all requirements are addressed
- **Compare alternatives** - Systematic decision-making
- **Analyze failure modes** - Risk identification and mitigation
- **Document decisions** - Capture rationale for design choices

### Problem Types Well-Suited for Engineering Mode

- **System design** - Architecting complex systems
- **Product development** - Requirements to implementation
- **Risk assessment** - Safety-critical systems
- **Technology selection** - Choosing between alternatives
- **Process improvement** - Engineering process optimization

## Core Concepts

### Requirements Traceability

Track requirements using MoSCoW prioritization:

```typescript
type RequirementPriority = 'must' | 'should' | 'could' | 'wont';

interface Requirement {
  id: string;                    // e.g., "REQ-001"
  title: string;
  description: string;
  source: RequirementSource;     // stakeholder, regulatory, etc.
  priority: RequirementPriority;
  status: RequirementStatus;     // draft, approved, verified
  rationale?: string;
  verificationMethod?: 'inspection' | 'analysis' | 'demonstration' | 'test';
  verificationCriteria?: string[];
  tracesTo?: string[];           // Parent requirements
  satisfiedBy?: string[];        // Design elements
  relatedTo?: string[];
}
```

### Trade Studies

Weighted decision matrices:

```typescript
interface TradeStudy {
  title: string;
  objective: string;
  alternatives: TradeAlternative[];
  criteria: TradeCriterion[];    // With weights summing to 1
  scores: TradeScore[];          // Score each alternative on each criterion
  recommendation: string;        // Recommended alternative ID
  justification: string;
  sensitivityNotes?: string;
}
```

### Failure Mode Analysis (FMEA)

Risk Priority Number (RPN) = Severity × Occurrence × Detection:

```typescript
interface FailureMode {
  id: string;
  component: string;
  function?: string;
  failureMode: string;
  cause: string;
  effect: string;
  severity: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
  occurrence: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
  detection: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
  rpn: number;                   // S × O × D
  mitigation?: string;
  mitigationStatus?: 'open' | 'in-progress' | 'completed' | 'verified';
}
```

### Design Decision Records

ADR-style decision documentation:

```typescript
interface DesignDecision {
  id: string;                    // e.g., "ADR-001"
  title: string;
  date?: string;
  status: DecisionStatus;        // proposed, accepted, rejected, etc.
  context: string;               // Problem statement
  decision: string;              // What was decided
  alternatives: DecisionAlternative[];
  rationale: string;             // Why this decision
  consequences: string[];        // Results of the decision
  relatedDecisions?: string[];
}
```

## Usage Example

```typescript
// Requirements analysis
const requirements = await deepthinking_analytical({
  mode: 'engineering',
  thought: 'Define system requirements for the authentication module',
  thoughtNumber: 1,
  totalThoughts: 5,
  nextThoughtNeeded: true,

  analysisType: 'requirements',
  designChallenge: 'Secure user authentication system',
  requirements: {
    requirements: [
      {
        id: 'REQ-001',
        title: 'Multi-factor authentication',
        description: 'System shall support MFA with at least 2 factors',
        source: 'regulatory',
        priority: 'must',
        status: 'approved',
        verificationMethod: 'test',
        verificationCriteria: ['TOTP supported', 'SMS fallback available']
      },
      {
        id: 'REQ-002',
        title: 'Session timeout',
        description: 'Sessions shall expire after 30 minutes of inactivity',
        source: 'stakeholder',
        priority: 'should',
        status: 'approved',
        verificationMethod: 'test'
      }
    ],
    coverage: {
      total: 10,
      verified: 6,
      tracedToSource: 9,
      allocatedToDesign: 8
    }
  }
});

// Trade study
const tradeStudy = await deepthinking_analytical({
  mode: 'engineering',
  thought: 'Compare authentication providers',
  thoughtNumber: 2,
  totalThoughts: 5,
  nextThoughtNeeded: true,

  analysisType: 'trade-study',
  designChallenge: 'Select authentication provider',
  tradeStudy: {
    title: 'Authentication Provider Selection',
    objective: 'Choose the best authentication provider for our needs',
    alternatives: [
      { id: 'auth0', name: 'Auth0', description: 'Managed identity platform', pros: ['Easy integration', 'Rich features'], cons: ['Cost at scale'] },
      { id: 'keycloak', name: 'Keycloak', description: 'Open source IAM', pros: ['Free', 'Self-hosted'], cons: ['Maintenance burden'] },
      { id: 'custom', name: 'Custom', description: 'Build in-house', pros: ['Full control'], cons: ['Development time', 'Security risk'] }
    ],
    criteria: [
      { id: 'security', name: 'Security', weight: 0.35, description: 'Security posture' },
      { id: 'cost', name: 'Cost', weight: 0.25, description: 'Total cost of ownership' },
      { id: 'integration', name: 'Integration', weight: 0.25, description: 'Ease of integration' },
      { id: 'support', name: 'Support', weight: 0.15, description: 'Vendor support' }
    ],
    scores: [
      { alternativeId: 'auth0', criteriaId: 'security', score: 9, rationale: 'SOC2, extensive security features' },
      { alternativeId: 'auth0', criteriaId: 'cost', score: 6, rationale: 'Monthly fees at scale' },
      { alternativeId: 'keycloak', criteriaId: 'security', score: 8, rationale: 'Good but self-managed' },
      { alternativeId: 'keycloak', criteriaId: 'cost', score: 9, rationale: 'Free, hosting costs only' }
      // ... more scores
    ],
    recommendation: 'auth0',
    justification: 'Best balance of security and integration ease for our team size'
  }
});

// FMEA
const fmea = await deepthinking_analytical({
  mode: 'engineering',
  thought: 'Analyze failure modes for authentication system',
  thoughtNumber: 3,
  totalThoughts: 5,
  nextThoughtNeeded: true,

  analysisType: 'fmea',
  designChallenge: 'Authentication system reliability',
  fmea: {
    title: 'Authentication System FMEA',
    system: 'User Authentication Module',
    failureModes: [
      {
        id: 'FM-001',
        component: 'MFA Service',
        function: 'Generate and validate TOTP codes',
        failureMode: 'TOTP validation fails',
        cause: 'Clock drift between server and device',
        effect: 'User cannot authenticate',
        systemEffect: 'User locked out, support burden',
        severity: 6,
        occurrence: 4,
        detection: 7,
        rpn: 168,
        currentControls: 'Time window tolerance',
        mitigation: 'Increase tolerance window, add clock sync',
        mitigationStatus: 'open'
      },
      {
        id: 'FM-002',
        component: 'Session Store',
        failureMode: 'Session data lost',
        cause: 'Redis failure',
        effect: 'Users logged out unexpectedly',
        severity: 5,
        occurrence: 2,
        detection: 3,
        rpn: 30,
        currentControls: 'Redis cluster with replication'
      }
    ],
    rpnThreshold: 100,
    summary: {
      totalModes: 15,
      criticalModes: 3,
      averageRpn: 85,
      maxRpn: 168
    }
  }
});

// Design decision
const decision = await deepthinking_analytical({
  mode: 'engineering',
  thought: 'Document the authentication architecture decision',
  thoughtNumber: 4,
  totalThoughts: 5,
  nextThoughtNeeded: false,

  analysisType: 'design-decision',
  designChallenge: 'Authentication architecture',
  designDecisions: {
    decisions: [{
      id: 'ADR-001',
      title: 'Use Auth0 for Authentication',
      date: '2024-01-15',
      status: 'accepted',
      context: 'We need a secure, scalable authentication solution that integrates with our stack',
      decision: 'Use Auth0 as our identity provider with custom Universal Login',
      alternatives: [
        { option: 'Keycloak', description: 'Self-hosted OSS', pros: ['Free', 'Control'], cons: ['Maintenance', 'DevOps burden'] },
        { option: 'Custom', description: 'Build in-house', pros: ['Full control'], cons: ['Time', 'Security risk'] }
      ],
      rationale: 'Auth0 provides enterprise security with minimal DevOps overhead',
      consequences: ['Monthly SaaS cost', 'Vendor dependency', 'Fast time to market'],
      relatedDecisions: ['ADR-002', 'ADR-003']
    }],
    projectName: 'Authentication System'
  },
  assessment: {
    confidence: 0.85,
    keyRisks: ['Vendor lock-in', 'Cost escalation'],
    nextSteps: ['Implement POC', 'Review pricing tiers'],
    openIssues: ['MFA fallback strategy']
  }
});
```

## Best Practices

### Requirements Traceability

✅ **Do:**
- Use unique IDs for all requirements
- Trace to source and design elements
- Define clear verification criteria
- Use MoSCoW prioritization

❌ **Don't:**
- Leave requirements unverified
- Skip traceability links
- Use vague acceptance criteria

### Trade Studies

✅ **Do:**
- Define clear criteria with weights
- Score objectively with rationale
- Consider sensitivity to weight changes
- Document assumptions

❌ **Don't:**
- Use arbitrary scores
- Ignore important criteria
- Skip alternatives analysis

### FMEA

✅ **Do:**
- Be thorough in identifying failure modes
- Use consistent rating scales
- Focus on high-RPN items
- Track mitigation status

❌ **Don't:**
- Underestimate severity
- Skip detection analysis
- Leave high-RPN items unaddressed

### Design Decisions

✅ **Do:**
- Document context clearly
- List all alternatives considered
- Explain rationale fully
- Track consequences

❌ **Don't:**
- Skip context documentation
- Ignore alternatives
- Leave rationale vague

## EngineeringThought Interface

```typescript
interface EngineeringThought extends BaseThought {
  mode: ThinkingMode.ENGINEERING;
  analysisType: EngineeringAnalysisType;
  designChallenge: string;
  requirements?: RequirementsTraceability;
  tradeStudy?: TradeStudy;
  fmea?: FailureModeAnalysis;
  designDecisions?: DesignDecisionLog;
  assessment?: {
    confidence: number;
    keyRisks: string[];
    nextSteps: string[];
    openIssues: string[];
  };
}
```

## Integration with Other Modes

Engineering mode integrates with:

- **Shannon Mode** - Systematic problem-solving methodology
- **Physics Mode** - Physical engineering analysis
- **Optimization Mode** - Design optimization
- **Systems Thinking** - System-level analysis

## Related Modes

- [Shannon Mode](./SHANNON.md) - Problem-solving methodology
- [Physics Mode](./PHYSICS.md) - Physical analysis
- [Optimization Mode](./OPTIMIZATION.md) - Optimization
- [Systems Thinking Mode](./SYSTEMSTHINKING.md) - System analysis

## Limitations

- **Process-focused** - Assumes engineering process familiarity
- **Documentation heavy** - Generates significant artifacts
- **Manual analysis** - No automated verification

## See Also

- [Architecture Overview](../architecture/DEPENDENCY_GRAPH.md) - System architecture
- [Meta-Reasoning Mode](./METAREASONING.md) - Strategic oversight

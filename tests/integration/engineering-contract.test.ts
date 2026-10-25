/**
 * Engineering mode: the contract the handler reads
 *
 * EngineeringHandler reads analysisType, designChallenge, requirements,
 * tradeStudy (alternatives, criteria, scores, recommendation), fmea,
 * designDecisions and assessment. The Zod schema declared none of them, so Zod
 * stripped each one before the handler ran: a client that sent designChallenge
 * was told the thought "must specify a design challenge", a trade study could
 * never name a valid recommendation, and an unknown analysisType never reached
 * the handler to be answered.
 *
 * Every assertion here goes through the real server over an in-memory
 * transport and reads the answer a client reads. A handler-level test cannot see
 * a field that Zod strips before the handler.
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Client, InMemoryTransport } from "@modelcontextprotocol/client";
import { server } from "../../src/index.js";

let client: Client;

beforeAll(async () => {
  const [clientTransport, serverTransport] =
    InMemoryTransport.createLinkedPair();
  client = new Client(
    { name: "engineering-contract", version: "1.0.0" },
    { capabilities: {} },
  );
  await Promise.all([
    client.connect(clientTransport),
    server.connect(serverTransport),
  ]);
});

afterAll(async () => {
  await client.close();
});

interface Issue {
  severity: string;
  description: string;
  category: string;
}

/** Call deepthinking_engineering and return the parsed answer, failing on a tool error. */
async function add(args: Record<string, unknown>): Promise<any> {
  const result: any = await client.callTool({
    name: "deepthinking_engineering",
    arguments: {
      mode: "engineering",
      thought: "pick a bearing",
      thoughtNumber: 1,
      totalThoughts: 3,
      nextThoughtNeeded: true,
      ...args,
    },
  });
  expect(
    result.isError,
    `tool call errored: ${result.content?.[0]?.text}`,
  ).toBeFalsy();
  return JSON.parse(result.content[0].text);
}

const issuesOf = (answer: any): Issue[] => answer.validation.issues;
const textsOf = (answer: any): string[] =>
  issuesOf(answer).map((i) => i.description);

/** Export a session in one format through the session tool and return the text. */
async function exportAs(sessionId: string, format: string): Promise<string> {
  const result: any = await client.callTool({
    name: "deepthinking_session",
    arguments: { action: "export", sessionId, exportFormat: format },
  });
  expect(
    result.isError,
    `export ${format} errored: ${result.content?.[0]?.text}`,
  ).toBeFalsy();
  return result.content[0].text;
}

const TRADE_STUDY = {
  title: "Bearing choice",
  objective: "Choose the bearing for the shaft",
  alternatives: [
    { id: "a", name: "Ball", description: "Sealed ball bearing" },
    { id: "b", name: "Roller", description: "Cylindrical roller bearing" },
  ],
  criteria: [
    { id: "cost", name: "Cost", weight: 0.5 },
    { id: "life", name: "Life", weight: 0.5 },
  ],
  scores: [
    { alternativeId: "a", criteriaId: "cost", score: 8, rationale: "cheap" },
    { alternativeId: "a", criteriaId: "life", score: 5, rationale: "ok" },
    { alternativeId: "b", criteriaId: "cost", score: 4, rationale: "dear" },
    { alternativeId: "b", criteriaId: "life", score: 9, rationale: "long" },
  ],
  recommendation: "a",
  justification: "Lower cost",
};

describe("fields the handler reads now reach it", () => {
  it("designChallenge is accepted: no 'must specify a design challenge' issue", async () => {
    const answer = await add({ designChallenge: "choose a bearing" });
    expect(textsOf(answer)).not.toContain(
      "Engineering thought must specify a design challenge",
    );
  });

  it("control: without designChallenge the issue is reported", async () => {
    const answer = await add({});
    expect(textsOf(answer)).toContain(
      "Engineering thought must specify a design challenge",
    );
  });

  it("a complete trade study with object criteria names a valid recommendation", async () => {
    const answer = await add({
      analysisType: "trade-study",
      designChallenge: "choose a bearing",
      tradeStudy: TRADE_STUDY,
    });
    const texts = textsOf(answer).join("\n");
    expect(texts).not.toMatch(/recommendation/i);
    expect(texts).not.toMatch(/weights sum/i);
    expect(texts).not.toMatch(/Missing score/);
  });

  it("requirements, fmea, designDecisions and assessment are accepted", async () => {
    const answer = await add({
      analysisType: "comprehensive",
      designChallenge: "choose a bearing",
      requirements: {
        requirements: [
          {
            id: "REQ-1",
            title: "Life",
            description: "Run 20,000 hours",
            source: "stakeholder",
            priority: "must",
            status: "approved",
            verificationMethod: "test",
          },
        ],
      },
      fmea: {
        title: "Shaft FMEA",
        system: "shaft",
        rpnThreshold: 100,
        failureModes: [
          {
            id: "FM-1",
            component: "bearing",
            failureMode: "seizure",
            cause: "no lubricant",
            effect: "stop",
            severity: 9,
            occurrence: 3,
            detection: 4,
            mitigation: "grease port",
          },
        ],
      },
      designDecisions: {
        projectName: "shaft",
        decisions: [
          {
            id: "ADR-1",
            title: "Ball bearing",
            status: "accepted",
            context: "Low load",
            decision: "Use a ball bearing",
            alternatives: [
              { option: "roller", pros: ["load"], cons: ["cost"] },
            ],
            rationale: "Cost",
            consequences: ["Limited load"],
          },
        ],
      },
      assessment: {
        confidence: 0.8,
        keyRisks: ["wear"],
        nextSteps: ["prototype"],
        openIssues: [],
      },
    });
    const texts = textsOf(answer).join("\n");
    // The comprehensive-mode warning appears only when no analysis section reached the validator.
    expect(texts).not.toMatch(/at least one analysis section/);
    // The RPN of FM-1 is 9 x 3 x 4 = 108, computed by the handler: no RPN issue.
    expect(texts).not.toMatch(/incorrect RPN/);
  });
});

describe("tradeStudy.criteria takes a string or an object", () => {
  it("an object criterion is accepted", async () => {
    const answer = await add({
      designChallenge: "choose a bearing",
      tradeStudy: { criteria: [{ id: "cost", weight: 0.4 }] },
    });
    expect(textsOf(answer).join("\n")).not.toMatch(/has no weight/);
  });

  it("a string criterion is accepted and a warning says it has no weight", async () => {
    const answer = await add({
      analysisType: "trade-study",
      designChallenge: "choose a bearing",
      tradeStudy: { criteria: ["cost", "life"] },
    });
    const warned = issuesOf(answer).filter((i) =>
      i.description.startsWith("tradeStudy.criteria:"),
    );
    expect(warned).toHaveLength(1);
    expect(warned[0].description).toBe(
      "tradeStudy.criteria: 2 of 2 items are strings and have no weight; weight 0 is used for them. Send objects with id and weight.",
    );
    expect(warned[0].severity).toBe("warning");
  });

  it("a string criterion keeps today's result: no weight-sum message, no 'undefined' noise", async () => {
    const answer = await add({
      analysisType: "trade-study",
      designChallenge: "choose a bearing",
      tradeStudy: {
        alternatives: TRADE_STUDY.alternatives,
        criteria: ["cost", "life"],
        recommendation: "a",
      },
    });
    const texts = textsOf(answer).join("\n");
    // Master sums c.weight over strings, gets NaN, and its weight check never fires.
    expect(texts).not.toMatch(/weights sum/i);
    expect(texts).not.toMatch(/undefined/);
  });

  it("the warning counts only the strings of a mixed list", async () => {
    const answer = await add({
      designChallenge: "choose a bearing",
      tradeStudy: { criteria: ["cost", { id: "life", weight: 0.5 }] },
    });
    expect(textsOf(answer)).toContain(
      "tradeStudy.criteria: 1 of 2 items are strings and have no weight; weight 0 is used for them. Send objects with id and weight.",
    );
  });
});

describe("analysisType: an unknown value keeps the default and is reported", () => {
  const WARNING =
    'Unknown analysisType "bogus"; using the default "comprehensive". Recognised values: requirements, trade-study, fmea, design-decision, comprehensive.';

  it("warns, and the thought is handled as comprehensive", async () => {
    const answer = await add({
      analysisType: "bogus",
      designChallenge: "choose a bearing",
      thought: "unknown type, first",
    });
    const warned = issuesOf(answer).filter((i) => i.description === WARNING);
    expect(warned).toHaveLength(1);
    expect(warned[0]).toMatchObject({
      severity: "warning",
      category: "structural",
    });
    // Second signal for the default: the comprehensive-only check ran.
    expect(textsOf(answer)).toContain(
      "Comprehensive analysis should include at least one analysis section",
    );
  });

  it("a recognised value gives no such warning", async () => {
    const answer = await add({
      analysisType: "fmea",
      designChallenge: "choose a bearing",
    });
    expect(textsOf(answer).join("\n")).not.toMatch(/Unknown analysisType/);
  });

  it("an absent value gives no such warning", async () => {
    const answer = await add({ designChallenge: "choose a bearing" });
    expect(textsOf(answer).join("\n")).not.toMatch(/Unknown analysisType/);
  });

  it("the validation cache does not hide the warning: unknown, then valid, then unknown", async () => {
    const same = {
      designChallenge: "choose a bearing",
      thought: "cache order one",
    };
    const first = await add({ ...same, analysisType: "bogus" });
    const second = await add({ ...same, analysisType: "comprehensive" });
    const third = await add({ ...same, analysisType: "bogus" });
    expect(textsOf(first)).toContain(WARNING);
    expect(textsOf(second)).not.toContain(WARNING);
    expect(textsOf(third)).toContain(WARNING);
  });

  it("the validation cache does not leak the warning: valid, then unknown, then valid", async () => {
    const same = {
      designChallenge: "choose a bearing",
      thought: "cache order two",
    };
    const first = await add({ ...same, analysisType: "comprehensive" });
    const second = await add({ ...same, analysisType: "bogus" });
    const third = await add({ ...same, analysisType: "comprehensive" });
    expect(textsOf(first)).not.toContain(WARNING);
    expect(textsOf(second)).toContain(WARNING);
    expect(textsOf(third)).not.toContain(WARNING);
  });
});

describe("fields that nothing read are no longer advertised and are still accepted", () => {
  const REMOVED_TOP = ["requirementId", "fmeaEntry"];
  const REMOVED_TRADE_STUDY = ["options", "weights"];

  it("tools/list no longer lists them", async () => {
    const { tools } = await client.listTools();
    const tool: any = tools.find((t) => t.name === "deepthinking_engineering");
    for (const name of REMOVED_TOP) {
      expect(tool.inputSchema.properties).not.toHaveProperty(name);
    }
    for (const name of REMOVED_TRADE_STUDY) {
      expect(
        tool.inputSchema.properties.tradeStudy.properties,
      ).not.toHaveProperty(name);
    }
  });

  it("a call that still sends them succeeds, and the fields change nothing", async () => {
    // `tradeStudy: {}` is the same request with the removed keys stripped by Zod.
    const without = await add({
      designChallenge: "choose a bearing",
      thought: "removed fields",
      tradeStudy: {},
    });
    const withRemoved = await add({
      designChallenge: "choose a bearing",
      thought: "removed fields",
      requirementId: "REQ-9",
      fmeaEntry: { failureMode: "seizure", severity: 9 },
      tradeStudy: { options: ["a", "b"], weights: { a: 0.5 } },
    });
    expect(issuesOf(withRemoved)).toEqual(issuesOf(without));
  });
});

describe("what the contract accepts also exports", () => {
  // The declared fields are optional, so a client can send a sparse entry. The
  // handler fills what the thought type requires; an exporter that reads a
  // missing field would turn an accepted call into an export error.
  const FORMATS = [
    "markdown",
    "latex",
    "json",
    "html",
    "jupyter",
    "mermaid",
    "dot",
    "ascii",
  ];

  const SPARSE: Record<string, Record<string, unknown>> = {
    "alternative with only an id": {
      analysisType: "trade-study",
      tradeStudy: {
        alternatives: [{ id: "a" }, {}],
        criteria: [{ id: "x" }, {}],
        scores: [{ alternativeId: "a" }, {}],
      },
    },
    "failure mode with no fields": {
      analysisType: "fmea",
      fmea: { failureModes: [{}, { severity: 9 }] },
    },
    "requirement and decision with no fields": {
      analysisType: "comprehensive",
      requirements: { requirements: [{}] },
      designDecisions: { decisions: [{ alternatives: [{}] }] },
    },
    "string criteria": {
      analysisType: "trade-study",
      tradeStudy: {
        alternatives: [{ id: "a", name: "A", description: "d" }],
        criteria: ["cost", "mass"],
        scores: [{ alternativeId: "a", criteriaId: "cost", score: 2 }],
        recommendation: "a",
      },
    },
  };

  for (const [label, fields] of Object.entries(SPARSE)) {
    it(`${label}: every format exports`, async () => {
      const answer = await add({ thought: label, ...fields });
      for (const format of FORMATS) {
        await exportAs(answer.sessionId, format);
      }
    });
  }

  it("a sparse failure mode prints no 'undefined' in the formats that name it", async () => {
    const answer = await add({
      thought: "sparse fmea text",
      analysisType: "fmea",
      fmea: { failureModes: [{}] },
    });
    for (const format of ["markdown", "html", "mermaid", "dot", "ascii"]) {
      expect(await exportAs(answer.sessionId, format)).not.toMatch(
        /undefined|NaN/,
      );
    }
  });
});

describe("fmea: critical modes are counted at or above the threshold", () => {
  // Validator, exporters and the stored summary must agree on one rule. 5 x 5 x 4
  // is exactly the default threshold of 100.
  const AT_THRESHOLD = {
    analysisType: "fmea",
    fmea: {
      failureModes: [
        {
          id: "f1",
          component: "seal",
          failureMode: "leak",
          cause: "wear",
          effect: "loss of oil",
          severity: 5,
          occurrence: 5,
          detection: 4,
          mitigation: "replace on schedule",
        },
      ],
    },
  };

  it("a mode exactly at the threshold gives no summary-mismatch warning", async () => {
    const answer = await add({ thought: "at threshold", ...AT_THRESHOLD });
    expect(textsOf(answer).filter((t) => /does not match/.test(t))).toEqual([]);
  });

  it("the stored summary counts that mode as critical", async () => {
    const answer = await add({ thought: "at threshold json", ...AT_THRESHOLD });
    const exported: any = JSON.parse(await exportAs(answer.sessionId, "json"));
    const fmea = exported.thoughts[0].fmea;
    expect(fmea.summary.criticalModes).toBe(1);
    expect(fmea.failureModes[0].rpn).toBe(100);
  });

  it("a mode below the threshold is not critical", async () => {
    const answer = await add({
      thought: "below threshold",
      analysisType: "fmea",
      fmea: {
        failureModes: [{ id: "f1", severity: 5, occurrence: 5, detection: 3 }],
      },
    });
    const exported: any = JSON.parse(await exportAs(answer.sessionId, "json"));
    expect(exported.thoughts[0].fmea.summary.criticalModes).toBe(0);
  });
});

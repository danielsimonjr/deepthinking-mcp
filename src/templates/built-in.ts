/**
 * Built-in Templates (v3.4.0)
 * Phase 4 Task 9.3: 6+ built-in session templates
 */

import type { SessionTemplate } from './types.js';
import { ThinkingMode } from '../types/index.js';

/**
 * Built-in session templates
 */
export const BUILT_IN_TEMPLATES: SessionTemplate[] = [
  // 1. Problem Solving Template
  {
    id: 'problem-solving-sequential',
    name: 'Sequential Problem Solving',
    description: 'A step-by-step approach to solving complex problems using sequential reasoning',
    category: 'problem-solving',
    mode: ThinkingMode.SEQUENTIAL,
    difficulty: 'beginner',
    estimatedTime: '15-30 minutes',
    tags: ['problem-solving', 'sequential', 'beginner-friendly'],
    builtIn: true,
    createdAt: new Date('2025-01-01'),
    structure: {
      setup: {
        number: 1,
        title: 'Problem Definition',
        description: 'Clearly define the problem you are trying to solve',
        prompts: [
          'What is the core problem?',
          'What are the constraints?',
          'What is the desired outcome?',
        ],
        estimatedThoughts: 2,
      },
      steps: [
        {
          number: 2,
          title: 'Information Gathering',
          description: 'Collect all relevant information and context',
          prompts: [
            'What information do I have?',
            'What information do I need?',
            'What assumptions am I making?',
          ],
          estimatedThoughts: 3,
        },
        {
          number: 3,
          title: 'Solution Exploration',
          description: 'Generate potential solutions',
          prompts: [
            'What are possible approaches?',
            'What are the pros and cons of each?',
            'Which approach seems most promising?',
          ],
          estimatedThoughts: 4,
        },
        {
          number: 4,
          title: 'Solution Implementation',
          description: 'Work through the chosen solution',
          prompts: [
            'How do I implement this solution?',
            'What are the steps?',
            'Are there any issues?',
          ],
          estimatedThoughts: 5,
        },
      ],
      conclusion: {
        number: 5,
        title: 'Verification and Reflection',
        description: 'Verify the solution and reflect on the process',
        prompts: [
          'Does the solution work?',
          'What did I learn?',
          'Could this be improved?',
        ],
        estimatedThoughts: 2,
      },
    },
    useCases: [
      'Debugging code',
      'Solving mathematical problems',
      'Planning projects',
      'Troubleshooting issues',
    ],
  },

  // 2. Scientific Research Template
  {
    id: 'research-abductive',
    name: 'Scientific Research Investigation',
    description: 'Systematic approach to research using abductive reasoning to form hypotheses',
    category: 'research',
    mode: ThinkingMode.ABDUCTIVE,
    difficulty: 'intermediate',
    estimatedTime: '30-60 minutes',
    tags: ['research', 'hypothesis', 'scientific-method'],
    builtIn: true,
    createdAt: new Date('2025-01-01'),
    structure: {
      setup: {
        number: 1,
        title: 'Research Question',
        description: 'Define what you are investigating',
        prompts: [
          'What is the research question?',
          'Why is this important?',
          'What is already known?',
        ],
        estimatedThoughts: 3,
      },
      steps: [
        {
          number: 2,
          title: 'Observation and Data Collection',
          description: 'Gather relevant observations and data',
          prompts: [
            'What observations have been made?',
            'What patterns emerge?',
            'What is surprising or unexpected?',
          ],
          estimatedThoughts: 4,
        },
        {
          number: 3,
          title: 'Hypothesis Formation',
          description: 'Generate explanatory hypotheses',
          mode: ThinkingMode.ABDUCTIVE,
          prompts: [
            'What could explain these observations?',
            'Which explanation is most plausible?',
            'What would we expect if this hypothesis is true?',
          ],
          estimatedThoughts: 4,
        },
        {
          number: 4,
          title: 'Hypothesis Testing',
          description: 'Design tests and evaluate evidence',
          mode: ThinkingMode.BAYESIAN,
          prompts: [
            'How can we test this hypothesis?',
            'What evidence supports or contradicts it?',
            'How confident should we be?',
          ],
          estimatedThoughts: 5,
        },
      ],
      conclusion: {
        number: 5,
        title: 'Conclusions and Future Work',
        description: 'Draw conclusions and identify next steps',
        prompts: [
          'What can we conclude?',
          'What questions remain?',
          'What should be investigated next?',
        ],
        estimatedThoughts: 3,
      },
    },
    useCases: [
      'Scientific investigations',
      'Root cause analysis',
      'Mystery solving',
      'Research planning',
    ],
  },

  // 3. Design Thinking Template
  {
    id: 'design-creative',
    name: 'Creative Design Process',
    description: 'User-centered design approach combining empathy, ideation, and prototyping',
    category: 'design',
    mode: ThinkingMode.ANALOGICAL,
    difficulty: 'intermediate',
    estimatedTime: '45-90 minutes',
    tags: ['design', 'creativity', 'user-centered'],
    builtIn: true,
    createdAt: new Date('2025-01-01'),
    structure: {
      setup: {
        number: 1,
        title: 'Empathize',
        description: 'Understand user needs and context',
        prompts: [
          'Who are the users?',
          'What are their needs and pain points?',
          'What is the context of use?',
        ],
        estimatedThoughts: 3,
      },
      steps: [
        {
          number: 2,
          title: 'Define',
          description: 'Frame the design problem',
          prompts: [
            'What is the core problem to solve?',
            'What are the success criteria?',
            'What constraints exist?',
          ],
          estimatedThoughts: 2,
        },
        {
          number: 3,
          title: 'Ideate',
          description: 'Generate diverse design ideas',
          mode: ThinkingMode.ANALOGICAL,
          prompts: [
            'What are different ways to solve this?',
            'What analogies can inspire solutions?',
            'How do others solve similar problems?',
          ],
          estimatedThoughts: 5,
        },
        {
          number: 4,
          title: 'Prototype',
          description: 'Create concrete representations',
          prompts: [
            'What are the key features to prototype?',
            'How can we quickly test ideas?',
            'What will we learn from this prototype?',
          ],
          estimatedThoughts: 4,
        },
      ],
      conclusion: {
        number: 5,
        title: 'Test and Iterate',
        description: 'Evaluate and refine the design',
        prompts: [
          'How does it perform in testing?',
          'What feedback did we receive?',
          'What improvements are needed?',
        ],
        estimatedThoughts: 3,
      },
    },
    useCases: [
      'Product design',
      'UX/UI design',
      'Service design',
      'Innovation projects',
    ],
  },

  // 4. Mathematical Proof Template
  {
    id: 'proof-mathematics',
    name: 'Mathematical Proof Construction',
    description: 'Rigorous approach to constructing mathematical proofs',
    category: 'analysis',
    mode: ThinkingMode.MATHEMATICS,
    difficulty: 'advanced',
    estimatedTime: '30-90 minutes',
    tags: ['mathematics', 'proof', 'formal'],
    builtIn: true,
    createdAt: new Date('2025-01-01'),
    structure: {
      setup: {
        number: 1,
        title: 'Theorem Statement',
        description: 'Clearly state what needs to be proven',
        prompts: [
          'What is the theorem?',
          'What are the hypotheses?',
          'What needs to be shown?',
        ],
        estimatedThoughts: 2,
      },
      steps: [
        {
          number: 2,
          title: 'Proof Strategy',
          description: 'Choose an appropriate proof technique',
          prompts: [
            'Direct proof, contradiction, or induction?',
            'What are the key insights?',
            'What lemmas might help?',
          ],
          estimatedThoughts: 3,
        },
        {
          number: 3,
          title: 'Proof Construction',
          description: 'Build the proof step by step',
          mode: ThinkingMode.MATHEMATICS,
          prompts: [
            'What is the first step?',
            'How do we proceed logically?',
            'Are all steps justified?',
          ],
          estimatedThoughts: 6,
        },
        {
          number: 4,
          title: 'Verification',
          description: 'Check the proof for correctness',
          prompts: [
            'Are all steps valid?',
            'Have we used all hypotheses?',
            'Are there any gaps?',
          ],
          estimatedThoughts: 3,
        },
      ],
      conclusion: {
        number: 5,
        title: 'Formalization',
        description: 'Write the formal proof',
        prompts: [
          'How can this be written formally?',
          'What notation is clearest?',
          'What generalizations exist?',
        ],
        estimatedThoughts: 2,
      },
    },
    useCases: [
      'Mathematical proofs',
      'Theorem verification',
      'Formal reasoning',
      'Logic problems',
    ],
  },

  // 5. Strategic Decision Making Template
  {
    id: 'decision-bayesian',
    name: 'Evidence-Based Decision Making',
    description: 'Systematic decision making using Bayesian reasoning and probability',
    category: 'decision-making',
    mode: ThinkingMode.BAYESIAN,
    difficulty: 'advanced',
    estimatedTime: '30-60 minutes',
    tags: ['decision-making', 'probability', 'strategic'],
    builtIn: true,
    createdAt: new Date('2025-01-01'),
    structure: {
      setup: {
        number: 1,
        title: 'Decision Context',
        description: 'Define the decision to be made',
        prompts: [
          'What decision needs to be made?',
          'What are the options?',
          'What are the stakes?',
        ],
        estimatedThoughts: 2,
      },
      steps: [
        {
          number: 2,
          title: 'Prior Assessment',
          description: 'Establish initial beliefs and probabilities',
          mode: ThinkingMode.BAYESIAN,
          prompts: [
            'What is my prior belief for each option?',
            'What past experience is relevant?',
            'What base rates apply?',
          ],
          estimatedThoughts: 3,
        },
        {
          number: 3,
          title: 'Evidence Collection',
          description: 'Gather and evaluate relevant evidence',
          prompts: [
            'What evidence is available?',
            'How reliable is each piece of evidence?',
            'What evidence is missing?',
          ],
          estimatedThoughts: 4,
        },
        {
          number: 4,
          title: 'Posterior Analysis',
          description: 'Update beliefs based on evidence',
          mode: ThinkingMode.BAYESIAN,
          prompts: [
            'How does evidence change my beliefs?',
            'What are the updated probabilities?',
            'Which option is most supported?',
          ],
          estimatedThoughts: 4,
        },
      ],
      conclusion: {
        number: 5,
        title: 'Decision and Contingencies',
        description: 'Make the decision and plan for uncertainties',
        prompts: [
          'What is the best decision?',
          'What could go wrong?',
          'What is the contingency plan?',
        ],
        estimatedThoughts: 3,
      },
    },
    useCases: [
      'Business decisions',
      'Risk assessment',
      'Strategic planning',
      'Policy analysis',
    ],
  },

  // 6. Learning and Understanding Template
  {
    id: 'learning-firstprinciple',
    name: 'First Principles Learning',
    description: 'Deep understanding through first principles thinking',
    category: 'learning',
    mode: ThinkingMode.FIRSTPRINCIPLES,
    difficulty: 'intermediate',
    estimatedTime: '20-40 minutes',
    tags: ['learning', 'first-principles', 'understanding'],
    builtIn: true,
    createdAt: new Date('2025-01-01'),
    structure: {
      setup: {
        number: 1,
        title: 'Topic Identification',
        description: 'Identify what you want to understand',
        prompts: [
          'What topic am I studying?',
          'Why is this important to understand?',
          'What do I already know?',
        ],
        estimatedThoughts: 2,
      },
      steps: [
        {
          number: 2,
          title: 'Break Down to Fundamentals',
          description: 'Identify the core principles',
          mode: ThinkingMode.FIRSTPRINCIPLES,
          prompts: [
            'What are the most basic truths?',
            'What assumptions can be challenged?',
            'What is absolutely fundamental?',
          ],
          estimatedThoughts: 4,
        },
        {
          number: 3,
          title: 'Build Up Understanding',
          description: 'Reconstruct knowledge from fundamentals',
          mode: ThinkingMode.RECURSIVE,
          prompts: [
            'How do these principles combine?',
            'What follows logically?',
            'How does this lead to the concept?',
          ],
          estimatedThoughts: 5,
        },
        {
          number: 4,
          title: 'Test Understanding',
          description: 'Verify comprehension through application',
          prompts: [
            'Can I explain this simply?',
            'Can I apply this to examples?',
            'What predictions can I make?',
          ],
          estimatedThoughts: 3,
        },
      ],
      conclusion: {
        number: 5,
        title: 'Integration',
        description: 'Connect to broader knowledge',
        prompts: [
          'How does this relate to other concepts?',
          'What implications does this have?',
          'What questions remain?',
        ],
        estimatedThoughts: 2,
      },
    },
    useCases: [
      'Learning new concepts',
      'Understanding complex systems',
      'Self-education',
      'Knowledge building',
    ],
  },

  // 7. Root Cause Analysis Template
  {
    id: 'analysis-causal',
    name: 'Root Cause Analysis',
    description: 'Systematic investigation of causal relationships to find root causes',
    category: 'analysis',
    mode: ThinkingMode.CAUSAL,
    difficulty: 'intermediate',
    estimatedTime: '30-45 minutes',
    tags: ['analysis', 'causal', 'problem-solving'],
    builtIn: true,
    createdAt: new Date('2025-01-01'),
    structure: {
      setup: {
        number: 1,
        title: 'Problem Statement',
        description: 'Define the problem or incident to analyze',
        prompts: [
          'What problem occurred?',
          'When and where did it happen?',
          'What was the impact?',
        ],
        estimatedThoughts: 2,
      },
      steps: [
        {
          number: 2,
          title: 'Causal Chain Investigation',
          description: 'Trace the chain of causes',
          mode: ThinkingMode.CAUSAL,
          prompts: [
            'What directly caused this?',
            'What caused that cause?',
            'Continue asking "why" until root cause',
          ],
          estimatedThoughts: 5,
        },
        {
          number: 3,
          title: 'Contributing Factors',
          description: 'Identify all contributing factors',
          mode: ThinkingMode.CAUSAL,
          prompts: [
            'What other factors contributed?',
            'What conditions allowed this?',
            'What safeguards failed?',
          ],
          estimatedThoughts: 4,
        },
        {
          number: 4,
          title: 'Solution Development',
          description: 'Develop solutions targeting root causes',
          prompts: [
            'How can we address the root cause?',
            'What prevents recurrence?',
            'What are the trade-offs?',
          ],
          estimatedThoughts: 4,
        },
      ],
      conclusion: {
        number: 5,
        title: 'Action Plan',
        description: 'Create concrete action plan',
        prompts: [
          'What specific actions are needed?',
          'Who is responsible?',
          'How will we verify success?',
        ],
        estimatedThoughts: 2,
      },
    },
    useCases: [
      'Incident investigation',
      'Quality improvement',
      'Process optimization',
      'Failure analysis',
    ],
  },
];

/**
 * Get template by ID
 */
export function getTemplateById(id: string): SessionTemplate | undefined {
  return BUILT_IN_TEMPLATES.find(t => t.id === id);
}

/**
 * Get all template IDs
 */
export function getTemplateIds(): string[] {
  return BUILT_IN_TEMPLATES.map(t => t.id);
}

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: string): SessionTemplate[] {
  return BUILT_IN_TEMPLATES.filter(t => t.category === category);
}

/**
 * Get templates by mode
 */
export function getTemplatesByMode(mode: ThinkingMode): SessionTemplate[] {
  return BUILT_IN_TEMPLATES.filter(t => t.mode === mode);
}

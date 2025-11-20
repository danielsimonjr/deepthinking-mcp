/**
 * Multi-Agent Collaboration Infrastructure (v3.4.0)
 * Phase 4C Task 5.1: Support for multiple reasoning agents working together
 */

import type { ThinkingSession, Thought } from '../types/index.js';
import type { ThinkingMode } from '../modes/index.js';

/**
 * Agent role in collaborative reasoning
 */
export type AgentRole =
  | 'coordinator' // Orchestrates overall problem-solving
  | 'specialist' // Expert in specific reasoning mode
  | 'critic' // Evaluates and challenges assumptions
  | 'synthesizer' // Integrates insights from multiple agents
  | 'researcher' // Explores and gathers information
  | 'validator'; // Verifies correctness and consistency

/**
 * Agent status in collaboration
 */
export type AgentStatus = 'idle' | 'active' | 'waiting' | 'completed' | 'blocked';

/**
 * Message type between agents
 */
export type MessageType =
  | 'proposal' // Propose idea or approach
  | 'query' // Ask question to other agent
  | 'response' // Respond to query
  | 'challenge' // Challenge assumption or conclusion
  | 'agreement' // Agree with proposal
  | 'disagreement' // Disagree with proposal
  | 'synthesis' // Combine multiple perspectives
  | 'request_review' // Request peer review
  | 'provide_feedback'; // Provide feedback on work

/**
 * Collaborative agent definition
 */
export interface CollaborativeAgent {
  id: string;
  name: string;
  role: AgentRole;
  mode: ThinkingMode;
  status: AgentStatus;
  expertise: string[]; // Areas of expertise
  currentTask?: string;
  thoughtsContributed: number;
  messagesExchanged: number;
  created: Date;
  lastActive: Date;
}

/**
 * Message between agents
 */
export interface AgentMessage {
  id: string;
  from: string; // Agent ID
  to: string | string[]; // Agent ID(s) or 'all'
  type: MessageType;
  content: string;
  replyTo?: string; // Message ID being replied to
  thoughtRef?: string; // Reference to thought being discussed
  priority: 'low' | 'normal' | 'high' | 'urgent';
  timestamp: Date;
  read: boolean;
  resolved?: boolean; // For queries/challenges
}

/**
 * Shared workspace for collaboration
 */
export interface CollaborativeWorkspace {
  id: string;
  name: string;
  problem: string;
  agents: Map<string, CollaborativeAgent>;
  messages: AgentMessage[];
  sharedThoughts: Thought[]; // Thoughts visible to all agents
  agentSessions: Map<string, string>; // Agent ID -> Session ID
  coordinationRules: CoordinationRule[];
  created: Date;
  lastModified: Date;
  isActive: boolean;
}

/**
 * Coordination rule for agent behavior
 */
export interface CoordinationRule {
  id: string;
  name: string;
  condition: string; // When this rule applies
  action: string; // What should happen
  priority: number;
  enabled: boolean;
}

/**
 * Agent assignment for task decomposition
 */
export interface AgentAssignment {
  agentId: string;
  task: string;
  subtasks: string[];
  dependencies: string[]; // Other agent IDs this depends on
  expectedMode: ThinkingMode;
  deadline?: Date;
  status: 'assigned' | 'in_progress' | 'completed' | 'blocked';
}

/**
 * Multi-agent collaboration manager
 */
export class MultiAgentCollaboration {
  private workspaces: Map<string, CollaborativeWorkspace>;
  private messageQueue: Map<string, AgentMessage[]>; // Agent ID -> queued messages

  constructor() {
    this.workspaces = new Map();
    this.messageQueue = new Map();
  }

  /**
   * Create new collaborative workspace
   */
  createWorkspace(name: string, problem: string): string {
    const workspaceId = `workspace_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const workspace: CollaborativeWorkspace = {
      id: workspaceId,
      name,
      problem,
      agents: new Map(),
      messages: [],
      sharedThoughts: [],
      agentSessions: new Map(),
      coordinationRules: this.getDefaultRules(),
      created: new Date(),
      lastModified: new Date(),
      isActive: true,
    };

    this.workspaces.set(workspaceId, workspace);
    return workspaceId;
  }

  /**
   * Add agent to workspace
   */
  addAgent(
    workspaceId: string,
    name: string,
    role: AgentRole,
    mode: ThinkingMode,
    expertise: string[] = []
  ): string {
    const workspace = this.workspaces.get(workspaceId);
    if (!workspace) {
      throw new Error(`Workspace ${workspaceId} not found`);
    }

    const agentId = `agent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const agent: CollaborativeAgent = {
      id: agentId,
      name,
      role,
      mode,
      status: 'idle',
      expertise,
      thoughtsContributed: 0,
      messagesExchanged: 0,
      created: new Date(),
      lastActive: new Date(),
    };

    workspace.agents.set(agentId, agent);
    this.messageQueue.set(agentId, []);
    workspace.lastModified = new Date();

    // Announce new agent to others
    this.broadcastMessage(workspaceId, {
      id: this.generateMessageId(),
      from: 'system',
      to: 'all',
      type: 'proposal',
      content: `${name} (${role}) has joined the collaboration`,
      priority: 'normal',
      timestamp: new Date(),
      read: false,
    });

    return agentId;
  }

  /**
   * Remove agent from workspace
   */
  removeAgent(workspaceId: string, agentId: string): void {
    const workspace = this.workspaces.get(workspaceId);
    if (!workspace) {
      throw new Error(`Workspace ${workspaceId} not found`);
    }

    const agent = workspace.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} not found in workspace`);
    }

    // Announce departure
    this.broadcastMessage(workspaceId, {
      id: this.generateMessageId(),
      from: 'system',
      to: 'all',
      type: 'proposal',
      content: `${agent.name} has left the collaboration`,
      priority: 'normal',
      timestamp: new Date(),
      read: false,
    });

    workspace.agents.delete(agentId);
    this.messageQueue.delete(agentId);
    workspace.lastModified = new Date();
  }

  /**
   * Send message from one agent to another(s)
   */
  sendMessage(
    workspaceId: string,
    from: string,
    to: string | string[],
    type: MessageType,
    content: string,
    options: {
      replyTo?: string;
      thoughtRef?: string;
      priority?: 'low' | 'normal' | 'high' | 'urgent';
    } = {}
  ): string {
    const workspace = this.workspaces.get(workspaceId);
    if (!workspace) {
      throw new Error(`Workspace ${workspaceId} not found`);
    }

    const fromAgent = workspace.agents.get(from);
    if (!fromAgent) {
      throw new Error(`Agent ${from} not found`);
    }

    const message: AgentMessage = {
      id: this.generateMessageId(),
      from,
      to,
      type,
      content,
      replyTo: options.replyTo,
      thoughtRef: options.thoughtRef,
      priority: options.priority || 'normal',
      timestamp: new Date(),
      read: false,
    };

    workspace.messages.push(message);
    fromAgent.messagesExchanged++;
    fromAgent.lastActive = new Date();

    // Queue message for recipients
    const recipients = to === 'all' ? Array.from(workspace.agents.keys()) : Array.isArray(to) ? to : [to];

    for (const recipientId of recipients) {
      if (recipientId !== from && workspace.agents.has(recipientId)) {
        const queue = this.messageQueue.get(recipientId);
        if (queue) {
          queue.push(message);
        }
      }
    }

    workspace.lastModified = new Date();
    return message.id;
  }

  /**
   * Get messages for specific agent
   */
  getMessages(
    workspaceId: string,
    agentId: string,
    options: {
      unreadOnly?: boolean;
      type?: MessageType;
      from?: string;
      limit?: number;
    } = {}
  ): AgentMessage[] {
    const workspace = this.workspaces.get(workspaceId);
    if (!workspace) {
      throw new Error(`Workspace ${workspaceId} not found`);
    }

    let messages = workspace.messages.filter(msg => {
      const isRecipient = msg.to === 'all' || msg.to === agentId || (Array.isArray(msg.to) && msg.to.includes(agentId));
      return isRecipient;
    });

    if (options.unreadOnly) {
      messages = messages.filter(msg => !msg.read);
    }

    if (options.type) {
      messages = messages.filter(msg => msg.type === options.type);
    }

    if (options.from) {
      messages = messages.filter(msg => msg.from === options.from);
    }

    // Sort by timestamp descending
    messages.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    if (options.limit) {
      messages = messages.slice(0, options.limit);
    }

    return messages;
  }

  /**
   * Mark message as read
   */
  markMessageRead(workspaceId: string, messageId: string): void {
    const workspace = this.workspaces.get(workspaceId);
    if (!workspace) {
      throw new Error(`Workspace ${workspaceId} not found`);
    }

    const message = workspace.messages.find(msg => msg.id === messageId);
    if (message) {
      message.read = true;
      workspace.lastModified = new Date();
    }
  }

  /**
   * Broadcast message to all agents
   */
  private broadcastMessage(workspaceId: string, message: AgentMessage): void {
    const workspace = this.workspaces.get(workspaceId);
    if (!workspace) return;

    workspace.messages.push(message);

    for (const agentId of workspace.agents.keys()) {
      if (agentId !== message.from) {
        const queue = this.messageQueue.get(agentId);
        if (queue) {
          queue.push(message);
        }
      }
    }
  }

  /**
   * Update agent status
   */
  updateAgentStatus(workspaceId: string, agentId: string, status: AgentStatus, currentTask?: string): void {
    const workspace = this.workspaces.get(workspaceId);
    if (!workspace) {
      throw new Error(`Workspace ${workspaceId} not found`);
    }

    const agent = workspace.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }

    agent.status = status;
    if (currentTask !== undefined) {
      agent.currentTask = currentTask;
    }
    agent.lastActive = new Date();
    workspace.lastModified = new Date();
  }

  /**
   * Share thought with workspace
   */
  shareThought(workspaceId: string, agentId: string, thought: Thought): void {
    const workspace = this.workspaces.get(workspaceId);
    if (!workspace) {
      throw new Error(`Workspace ${workspaceId} not found`);
    }

    const agent = workspace.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }

    workspace.sharedThoughts.push(thought);
    agent.thoughtsContributed++;
    agent.lastActive = new Date();
    workspace.lastModified = new Date();

    // Notify other agents
    this.broadcastMessage(workspaceId, {
      id: this.generateMessageId(),
      from: agentId,
      to: 'all',
      type: 'proposal',
      content: `Shared new thought: ${thought.content.substring(0, 100)}...`,
      thoughtRef: thought.id,
      priority: 'normal',
      timestamp: new Date(),
      read: false,
    });
  }

  /**
   * Decompose problem into agent assignments
   */
  decomposeProblem(
    workspaceId: string,
    coordinatorId: string,
    subtasks: { task: string; preferredMode: ThinkingMode; dependencies?: string[] }[]
  ): AgentAssignment[] {
    const workspace = this.workspaces.get(workspaceId);
    if (!workspace) {
      throw new Error(`Workspace ${workspaceId} not found`);
    }

    const coordinator = workspace.agents.get(coordinatorId);
    if (!coordinator || coordinator.role !== 'coordinator') {
      throw new Error(`Agent ${coordinatorId} is not a coordinator`);
    }

    const assignments: AgentAssignment[] = [];

    for (const subtask of subtasks) {
      // Find best agent for this subtask based on mode and expertise
      const bestAgent = this.findBestAgent(workspace, subtask.preferredMode);

      if (bestAgent) {
        const assignment: AgentAssignment = {
          agentId: bestAgent.id,
          task: subtask.task,
          subtasks: [],
          dependencies: subtask.dependencies || [],
          expectedMode: subtask.preferredMode,
          status: 'assigned',
        };

        assignments.push(assignment);

        // Notify agent
        this.sendMessage(workspaceId, coordinatorId, bestAgent.id, 'proposal', `Assigned task: ${subtask.task}`, {
          priority: 'high',
        });
      }
    }

    return assignments;
  }

  /**
   * Find best agent for a task
   */
  private findBestAgent(workspace: CollaborativeWorkspace, preferredMode: ThinkingMode): CollaborativeAgent | null {
    let bestAgent: CollaborativeAgent | null = null;
    let bestScore = -1;

    for (const agent of workspace.agents.values()) {
      if (agent.role === 'coordinator') continue; // Skip coordinators
      if (agent.status === 'blocked') continue;

      let score = 0;

      // Mode match
      if (agent.mode === preferredMode) {
        score += 10;
      }

      // Availability
      if (agent.status === 'idle') {
        score += 5;
      } else if (agent.status === 'waiting') {
        score += 2;
      }

      // Experience (inverse of current load)
      if (!agent.currentTask) {
        score += 3;
      }

      if (score > bestScore) {
        bestScore = score;
        bestAgent = agent;
      }
    }

    return bestAgent;
  }

  /**
   * Get workspace statistics
   */
  getWorkspaceStats(workspaceId: string): {
    totalAgents: number;
    activeAgents: number;
    totalMessages: number;
    unreadMessages: number;
    totalThoughts: number;
    collaboration Duration: number; // in milliseconds
    agentDistribution: Map<AgentRole, number>;
    modeDistribution: Map<ThinkingMode, number>;
  } {
    const workspace = this.workspaces.get(workspaceId);
    if (!workspace) {
      throw new Error(`Workspace ${workspaceId} not found`);
    }

    const agentDistribution = new Map<AgentRole, number>();
    const modeDistribution = new Map<ThinkingMode, number>();
    let activeAgents = 0;

    for (const agent of workspace.agents.values()) {
      // Role distribution
      agentDistribution.set(agent.role, (agentDistribution.get(agent.role) || 0) + 1);

      // Mode distribution
      modeDistribution.set(agent.mode, (modeDistribution.get(agent.mode) || 0) + 1);

      // Active count
      if (agent.status === 'active') {
        activeAgents++;
      }
    }

    const unreadMessages = workspace.messages.filter(msg => !msg.read).length;
    const collaborationDuration = new Date().getTime() - workspace.created.getTime();

    return {
      totalAgents: workspace.agents.size,
      activeAgents,
      totalMessages: workspace.messages.length,
      unreadMessages,
      totalThoughts: workspace.sharedThoughts.length,
      collaborationDuration,
      agentDistribution,
      modeDistribution,
    };
  }

  /**
   * Get default coordination rules
   */
  private getDefaultRules(): CoordinationRule[] {
    return [
      {
        id: 'rule_1',
        name: 'Coordinator oversight',
        condition: 'Any agent proposes significant change',
        action: 'Notify coordinator for approval',
        priority: 1,
        enabled: true,
      },
      {
        id: 'rule_2',
        name: 'Critic review',
        condition: 'Any agent completes analysis',
        action: 'Request critic review',
        priority: 2,
        enabled: true,
      },
      {
        id: 'rule_3',
        name: 'Synthesizer integration',
        condition: 'Multiple agents complete parallel work',
        action: 'Synthesizer combines results',
        priority: 3,
        enabled: true,
      },
      {
        id: 'rule_4',
        name: 'Validator check',
        condition: 'Any mathematical or logical conclusion',
        action: 'Validator verifies correctness',
        priority: 4,
        enabled: true,
      },
      {
        id: 'rule_5',
        name: 'Conflict escalation',
        condition: 'Agents disagree on approach',
        action: 'Escalate to coordinator for resolution',
        priority: 1,
        enabled: true,
      },
    ];
  }

  /**
   * Generate unique message ID
   */
  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Export workspace for analysis
   */
  exportWorkspace(workspaceId: string): string {
    const workspace = this.workspaces.get(workspaceId);
    if (!workspace) {
      throw new Error(`Workspace ${workspaceId} not found`);
    }

    const stats = this.getWorkspaceStats(workspaceId);

    const report: string[] = [];
    report.push(`# Collaborative Workspace: ${workspace.name}`);
    report.push('');
    report.push(`**Problem:** ${workspace.problem}`);
    report.push(`**Created:** ${workspace.created.toISOString()}`);
    report.push(`**Duration:** ${(stats.collaborationDuration / 1000 / 60).toFixed(2)} minutes`);
    report.push('');

    report.push('## Agents');
    for (const agent of workspace.agents.values()) {
      report.push(`- **${agent.name}** (${agent.role}) - ${agent.mode} mode`);
      report.push(`  - Status: ${agent.status}`);
      report.push(`  - Contributions: ${agent.thoughtsContributed} thoughts, ${agent.messagesExchanged} messages`);
      if (agent.expertise.length > 0) {
        report.push(`  - Expertise: ${agent.expertise.join(', ')}`);
      }
    }
    report.push('');

    report.push('## Statistics');
    report.push(`- Total Agents: ${stats.totalAgents}`);
    report.push(`- Active Agents: ${stats.activeAgents}`);
    report.push(`- Total Messages: ${stats.totalMessages}`);
    report.push(`- Unread Messages: ${stats.unreadMessages}`);
    report.push(`- Shared Thoughts: ${stats.totalThoughts}`);
    report.push('');

    report.push('## Message Thread');
    const recentMessages = workspace.messages.slice(-20); // Last 20 messages
    for (const msg of recentMessages) {
      const fromAgent = workspace.agents.get(msg.from);
      const fromName = fromAgent ? fromAgent.name : msg.from;
      const toStr = msg.to === 'all' ? 'all' : Array.isArray(msg.to) ? msg.to.join(', ') : msg.to;
      report.push(`- [${msg.type}] **${fromName}** → ${toStr}: ${msg.content}`);
    }

    return report.join('\n');
  }

  /**
   * Close workspace
   */
  closeWorkspace(workspaceId: string): void {
    const workspace = this.workspaces.get(workspaceId);
    if (!workspace) {
      throw new Error(`Workspace ${workspaceId} not found`);
    }

    workspace.isActive = false;
    workspace.lastModified = new Date();

    // Notify all agents
    this.broadcastMessage(workspaceId, {
      id: this.generateMessageId(),
      from: 'system',
      to: 'all',
      type: 'proposal',
      content: 'Workspace has been closed',
      priority: 'urgent',
      timestamp: new Date(),
      read: false,
    });
  }
}

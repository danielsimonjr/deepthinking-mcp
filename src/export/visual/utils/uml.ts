/**
 * UML/PlantUML Export Utilities (v7.1.0)
 * Shared utilities for UML diagram export (PlantUML syntax)
 */

/**
 * Sanitize identifier for PlantUML
 */
export function sanitizeUmlId(id: string): string {
  // Replace non-alphanumeric with underscores
  let sanitized = id.replace(/[^a-zA-Z0-9_]/g, '_');
  // Ensure it starts with a letter
  if (!/^[a-zA-Z]/.test(sanitized)) {
    sanitized = 'id_' + sanitized;
  }
  return sanitized || 'unnamed';
}

/**
 * Escape string for PlantUML
 */
export function escapeUml(str: string): string {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\"')
    .replace(/\n/g, '\\n')
    .replace(/<(?![\/#])/g, '&lt;')
    .replace(/(?<![\/#])>/g, '&gt;');
}

/**
 * UML node types
 */
export type UmlNodeShape =
  | 'class'
  | 'interface'
  | 'abstract'
  | 'entity'
  | 'usecase'
  | 'actor'
  | 'component'
  | 'node'
  | 'database'
  | 'rectangle'
  | 'package'
  | 'folder'
  | 'cloud'
  | 'state'
  | 'activity';

/**
 * UML node definition
 */
export interface UmlNode {
  id: string;
  label: string;
  shape?: UmlNodeShape;
  stereotype?: string;
  color?: string;
  attributes?: string[];
  methods?: string[];
}

/**
 * UML edge types
 */
export type UmlEdgeType =
  | 'association'
  | 'dependency'
  | 'inheritance'
  | 'implementation'
  | 'composition'
  | 'aggregation'
  | 'arrow'
  | 'dashed';

/**
 * UML edge definition
 */
export interface UmlEdge {
  source: string;
  target: string;
  type?: UmlEdgeType;
  label?: string;
  sourceLabel?: string;
  targetLabel?: string;
}

/**
 * UML diagram options
 */
export interface UmlOptions {
  diagramType?: 'class' | 'component' | 'usecase' | 'activity' | 'state' | 'sequence' | 'object';
  title?: string;
  theme?: 'default' | 'sketchy' | 'blueprint' | 'plain';
  direction?: 'left to right' | 'top to bottom';
  scale?: number;
  includeLabels?: boolean;
  includeMetrics?: boolean;
}

/**
 * Get PlantUML arrow syntax for edge type
 */
function getArrowSyntax(type?: UmlEdgeType): string {
  switch (type) {
    case 'dependency': return '..>';
    case 'inheritance': return '--|>';
    case 'implementation': return '..|>';
    case 'composition': return '*--';
    case 'aggregation': return 'o--';
    case 'dashed': return '..';
    case 'arrow': return '-->';
    case 'association':
    default: return '--';
  }
}

/**
 * Generate PlantUML header
 */
export function generateUmlHeader(options: UmlOptions = {}): string {
  const lines: string[] = ['@startuml'];

  if (options.title) {
    lines.push(`title ${escapeUml(options.title)}`);
  }

  if (options.theme && options.theme !== 'default') {
    lines.push(`!theme ${options.theme}`);
  }

  if (options.direction) {
    lines.push(options.direction === 'left to right' ? 'left to right direction' : 'top to bottom direction');
  }

  if (options.scale) {
    lines.push(`scale ${options.scale}`);
  }

  lines.push('');
  return lines.join('\n');
}

/**
 * Generate PlantUML footer
 */
export function generateUmlFooter(): string {
  return '@enduml\n';
}

/**
 * Generate PlantUML node definition
 */
export function renderUmlNode(node: UmlNode): string {
  const lines: string[] = [];
  const id = sanitizeUmlId(node.id);
  const label = node.label || node.id;
  const shape = node.shape || 'rectangle';

  switch (shape) {
    case 'class':
    case 'interface':
    case 'abstract':
      lines.push(`${shape} "${escapeUml(label)}" as ${id} {`);
      if (node.attributes && node.attributes.length > 0) {
        for (const attr of node.attributes) {
          lines.push(`  ${escapeUml(attr)}`);
        }
      }
      if (node.methods && node.methods.length > 0) {
        lines.push('  --');
        for (const method of node.methods) {
          lines.push(`  ${escapeUml(method)}`);
        }
      }
      lines.push('}');
      break;

    case 'usecase':
      lines.push(`usecase "${escapeUml(label)}" as ${id}`);
      break;

    case 'actor':
      lines.push(`actor "${escapeUml(label)}" as ${id}`);
      break;

    case 'component':
      lines.push(`component "${escapeUml(label)}" as ${id}`);
      break;

    case 'node':
      lines.push(`node "${escapeUml(label)}" as ${id}`);
      break;

    case 'database':
      lines.push(`database "${escapeUml(label)}" as ${id}`);
      break;

    case 'package':
      lines.push(`package "${escapeUml(label)}" as ${id} {`);
      lines.push('}');
      break;

    case 'folder':
      lines.push(`folder "${escapeUml(label)}" as ${id}`);
      break;

    case 'cloud':
      lines.push(`cloud "${escapeUml(label)}" as ${id}`);
      break;

    case 'state':
      lines.push(`state "${escapeUml(label)}" as ${id}`);
      break;

    case 'activity':
      lines.push(`:${escapeUml(label)};`);
      break;

    case 'entity':
      lines.push(`entity "${escapeUml(label)}" as ${id}`);
      break;

    case 'rectangle':
    default:
      if (node.stereotype) {
        lines.push(`rectangle "${escapeUml(label)}" <<${escapeUml(node.stereotype)}>> as ${id}`);
      } else {
        lines.push(`rectangle "${escapeUml(label)}" as ${id}`);
      }
  }

  // Add color if specified
  if (node.color) {
    const lastLine = lines.pop();
    if (lastLine) {
      lines.push(lastLine.replace(/}$/, '') + ` #${node.color}`);
      if (lastLine.endsWith('}')) {
        lines.push('}');
      }
    }
  }

  return lines.join('\n');
}

/**
 * Generate PlantUML edge
 */
export function renderUmlEdge(edge: UmlEdge): string {
  const sourceId = sanitizeUmlId(edge.source);
  const targetId = sanitizeUmlId(edge.target);
  const arrow = getArrowSyntax(edge.type);

  let line = `${sourceId} ${arrow} ${targetId}`;

  if (edge.label) {
    line += ` : ${escapeUml(edge.label)}`;
  }

  return line;
}

/**
 * Generate a complete PlantUML diagram
 */
export function generateUmlDiagram(
  nodes: UmlNode[],
  edges: UmlEdge[],
  options: UmlOptions = {}
): string {
  const lines: string[] = [];

  lines.push(generateUmlHeader(options));

  // Render nodes
  if (nodes.length > 0) {
    lines.push("' Nodes");
    for (const node of nodes) {
      lines.push(renderUmlNode(node));
    }
    lines.push('');
  }

  // Render edges
  if (edges.length > 0) {
    lines.push("' Relationships");
    for (const edge of edges) {
      lines.push(renderUmlEdge(edge));
    }
    lines.push('');
  }

  lines.push(generateUmlFooter());

  return lines.join('\n');
}

/**
 * Generate PlantUML class diagram
 */
export function generateClassDiagram(
  classes: Array<{ name: string; attributes?: string[]; methods?: string[]; stereotype?: string }>,
  relationships: Array<{ source: string; target: string; type?: UmlEdgeType; label?: string }>,
  options: UmlOptions = {}
): string {
  const nodes: UmlNode[] = classes.map(c => ({
    id: sanitizeUmlId(c.name),
    label: c.name,
    shape: 'class',
    stereotype: c.stereotype,
    attributes: c.attributes,
    methods: c.methods,
  }));

  const edges: UmlEdge[] = relationships.map(r => ({
    source: r.source,
    target: r.target,
    type: r.type || 'association',
    label: r.label,
  }));

  return generateUmlDiagram(nodes, edges, { ...options, diagramType: 'class' });
}

/**
 * Generate PlantUML component diagram
 */
export function generateComponentDiagram(
  components: Array<{ name: string; stereotype?: string }>,
  dependencies: Array<{ source: string; target: string; label?: string }>,
  options: UmlOptions = {}
): string {
  const nodes: UmlNode[] = components.map(c => ({
    id: sanitizeUmlId(c.name),
    label: c.name,
    shape: 'component',
    stereotype: c.stereotype,
  }));

  const edges: UmlEdge[] = dependencies.map(d => ({
    source: d.source,
    target: d.target,
    type: 'dependency',
    label: d.label,
  }));

  return generateUmlDiagram(nodes, edges, { ...options, diagramType: 'component' });
}

/**
 * Generate PlantUML activity diagram for linear flow
 */
export function generateActivityDiagram(
  activities: string[],
  currentActivity?: string,
  options: UmlOptions = {}
): string {
  const lines: string[] = [];

  lines.push(generateUmlHeader({ ...options, diagramType: 'activity' }));

  lines.push('start');

  for (const activity of activities) {
    const isCurrent = activity === currentActivity;
    if (isCurrent) {
      lines.push(`#lightblue:${escapeUml(activity)};`);
    } else {
      lines.push(`:${escapeUml(activity)};`);
    }
  }

  lines.push('stop');
  lines.push('');

  lines.push(generateUmlFooter());

  return lines.join('\n');
}

/**
 * Generate PlantUML state diagram
 */
export function generateStateDiagram(
  states: string[],
  transitions: Array<{ from: string; to: string; event?: string }>,
  currentState?: string,
  options: UmlOptions = {}
): string {
  const lines: string[] = [];

  lines.push(generateUmlHeader({ ...options, diagramType: 'state' }));

  // Define states
  for (const state of states) {
    const id = sanitizeUmlId(state);
    const isCurrent = state === currentState;
    if (isCurrent) {
      lines.push(`state "${escapeUml(state)}" as ${id} #lightblue`);
    } else {
      lines.push(`state "${escapeUml(state)}" as ${id}`);
    }
  }
  lines.push('');

  // Initial state
  if (states.length > 0) {
    lines.push(`[*] --> ${sanitizeUmlId(states[0])}`);
  }

  // Transitions
  for (const t of transitions) {
    const label = t.event ? ` : ${escapeUml(t.event)}` : '';
    lines.push(`${sanitizeUmlId(t.from)} --> ${sanitizeUmlId(t.to)}${label}`);
  }

  lines.push('');
  lines.push(generateUmlFooter());

  return lines.join('\n');
}

/**
 * Generate PlantUML use case diagram
 */
export function generateUseCaseDiagram(
  actors: string[],
  useCases: string[],
  associations: Array<{ actor: string; useCase: string }>,
  options: UmlOptions = {}
): string {
  const lines: string[] = [];

  lines.push(generateUmlHeader({ ...options, diagramType: 'usecase' }));

  // Define actors
  for (const actor of actors) {
    lines.push(`actor "${escapeUml(actor)}" as ${sanitizeUmlId(actor)}`);
  }
  lines.push('');

  // Define use cases
  for (const uc of useCases) {
    lines.push(`usecase "${escapeUml(uc)}" as ${sanitizeUmlId(uc)}`);
  }
  lines.push('');

  // Associations
  for (const assoc of associations) {
    lines.push(`${sanitizeUmlId(assoc.actor)} --> ${sanitizeUmlId(assoc.useCase)}`);
  }

  lines.push('');
  lines.push(generateUmlFooter());

  return lines.join('\n');
}

/**
 * UML/PlantUML Export Utilities (v8.5.0)
 * Shared utilities for UML diagram export (PlantUML syntax)
 * Phase 13 Sprint 3: Added UMLBuilder fluent API
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

// =============================================================================
// UMLBuilder Fluent API (Phase 13 Sprint 3)
// =============================================================================

/**
 * UML relation type for builder
 */
export type UMLRelationType =
  | 'association'
  | 'dependency'
  | 'inheritance'
  | 'implementation'
  | 'composition'
  | 'aggregation'
  | 'uses'
  | 'includes'
  | 'extends';

/**
 * UML class definition for builder
 */
export interface UMLClassDef {
  name: string;
  members?: string[];
  methods?: string[];
  stereotype?: string;
  abstract?: boolean;
}

/**
 * UML interface definition for builder
 */
export interface UMLInterfaceDef {
  name: string;
  methods?: string[];
  stereotype?: string;
}

/**
 * UML relation definition for builder
 */
export interface UMLRelationDef {
  from: string;
  to: string;
  type: UMLRelationType;
  label?: string;
  sourceLabel?: string;
  targetLabel?: string;
}

/**
 * UML note definition for builder
 */
export interface UMLNoteDef {
  text: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  attachTo?: string;
}

/**
 * UMLBuilder options
 */
export interface UMLBuilderOptions {
  diagramType?: 'class' | 'component' | 'usecase' | 'activity' | 'state' | 'sequence' | 'object';
  title?: string;
  theme?: 'default' | 'sketchy' | 'blueprint' | 'plain' | 'cerulean' | 'reddress';
  direction?: 'left to right' | 'top to bottom';
  scale?: number;
  skinparam?: Record<string, string>;
}

/**
 * Get PlantUML arrow for relation type
 */
function getRelationArrow(type: UMLRelationType): string {
  switch (type) {
    case 'dependency':
      return '..>';
    case 'inheritance':
      return '--|>';
    case 'implementation':
      return '..|>';
    case 'composition':
      return '*--';
    case 'aggregation':
      return 'o--';
    case 'uses':
      return '..>';
    case 'includes':
      return '..>';
    case 'extends':
      return '<|--';
    case 'association':
    default:
      return '--';
  }
}

/**
 * UMLBuilder - Fluent API for building PlantUML diagrams
 *
 * @example
 * ```typescript
 * const uml = new UMLBuilder()
 *   .setTitle('Class Diagram')
 *   .setDirection('top to bottom')
 *   .addClass({ name: 'Animal', members: ['+name: string'], methods: ['+speak(): void'] })
 *   .addClass({ name: 'Dog', methods: ['+bark(): void'] })
 *   .addRelation({ from: 'Dog', to: 'Animal', type: 'inheritance' })
 *   .render();
 * ```
 */
export class UMLBuilder {
  private classes: UMLClassDef[] = [];
  private interfaces: UMLInterfaceDef[] = [];
  private relations: UMLRelationDef[] = [];
  private notes: UMLNoteDef[] = [];
  private packages: { name: string; content: string[] }[] = [];
  private currentPackage: { name: string; content: string[] } | null = null;
  private rawLines: string[] = [];
  private options: UMLBuilderOptions = {};

  /**
   * Set or merge builder options
   * @param options - Options to set/merge
   * @returns this for chaining
   */
  setOptions(options: UMLBuilderOptions): this {
    this.options = { ...this.options, ...options };
    return this;
  }

  /**
   * Set the diagram title
   * @param title - The diagram title
   * @returns this for chaining
   */
  setTitle(title: string): this {
    this.options.title = title;
    return this;
  }

  /**
   * Set the theme
   * @param theme - The PlantUML theme name
   * @returns this for chaining
   */
  setTheme(theme: UMLBuilderOptions['theme']): this {
    this.options.theme = theme;
    return this;
  }

  /**
   * Set the layout direction
   * @param direction - The layout direction
   * @returns this for chaining
   */
  setDirection(direction: 'left to right' | 'top to bottom'): this {
    this.options.direction = direction;
    return this;
  }

  /**
   * Set the diagram scale
   * @param scale - The scale factor
   * @returns this for chaining
   */
  setScale(scale: number): this {
    this.options.scale = scale;
    return this;
  }

  /**
   * Add a skinparam setting
   * @param param - The skinparam name
   * @param value - The skinparam value
   * @returns this for chaining
   */
  addSkinparam(param: string, value: string): this {
    if (!this.options.skinparam) {
      this.options.skinparam = {};
    }
    this.options.skinparam[param] = value;
    return this;
  }

  /**
   * Add a class to the diagram
   * @param classDef - The class definition
   * @returns this for chaining
   */
  addClass(classDef: UMLClassDef): this {
    this.classes.push(classDef);
    return this;
  }

  /**
   * Add multiple classes to the diagram
   * @param classes - Array of class definitions
   * @returns this for chaining
   */
  addClasses(classes: UMLClassDef[]): this {
    this.classes.push(...classes);
    return this;
  }

  /**
   * Add an interface to the diagram
   * @param interfaceDef - The interface definition
   * @returns this for chaining
   */
  addInterface(interfaceDef: UMLInterfaceDef): this {
    this.interfaces.push(interfaceDef);
    return this;
  }

  /**
   * Add multiple interfaces to the diagram
   * @param interfaces - Array of interface definitions
   * @returns this for chaining
   */
  addInterfaces(interfaces: UMLInterfaceDef[]): this {
    this.interfaces.push(...interfaces);
    return this;
  }

  /**
   * Add a relation between classes/interfaces
   * @param relation - The relation definition
   * @returns this for chaining
   */
  addRelation(relation: UMLRelationDef): this {
    this.relations.push(relation);
    return this;
  }

  /**
   * Add multiple relations
   * @param relations - Array of relation definitions
   * @returns this for chaining
   */
  addRelations(relations: UMLRelationDef[]): this {
    this.relations.push(...relations);
    return this;
  }

  /**
   * Add a note to the diagram
   * @param note - The note definition
   * @returns this for chaining
   */
  addNote(note: UMLNoteDef): this {
    this.notes.push(note);
    return this;
  }

  /**
   * Begin a package block
   * @param name - The package name
   * @returns this for chaining
   */
  beginPackage(name: string): this {
    if (this.currentPackage) {
      // Close current package if one is open
      this.packages.push(this.currentPackage);
    }
    this.currentPackage = { name, content: [] };
    return this;
  }

  /**
   * End the current package block
   * @returns this for chaining
   */
  endPackage(): this {
    if (this.currentPackage) {
      this.packages.push(this.currentPackage);
      this.currentPackage = null;
    }
    return this;
  }

  /**
   * Add raw PlantUML line(s)
   * @param line - The raw line(s) to add
   * @returns this for chaining
   */
  addRaw(line: string | string[]): this {
    if (Array.isArray(line)) {
      this.rawLines.push(...line);
    } else {
      this.rawLines.push(line);
    }
    return this;
  }

  /**
   * Reset the builder to initial state
   * @returns this for chaining
   */
  reset(): this {
    this.classes = [];
    this.interfaces = [];
    this.relations = [];
    this.notes = [];
    this.packages = [];
    this.currentPackage = null;
    this.rawLines = [];
    this.options = {};
    return this;
  }

  /**
   * Render the diagram to PlantUML string
   * @returns The complete PlantUML diagram
   */
  render(): string {
    // Close any open package
    if (this.currentPackage) {
      this.packages.push(this.currentPackage);
      this.currentPackage = null;
    }

    const lines: string[] = [];

    // Header
    lines.push('@startuml');

    // Title
    if (this.options.title) {
      lines.push(`title ${escapeUml(this.options.title)}`);
    }

    // Theme
    if (this.options.theme && this.options.theme !== 'default') {
      lines.push(`!theme ${this.options.theme}`);
    }

    // Direction
    if (this.options.direction) {
      lines.push(
        this.options.direction === 'left to right'
          ? 'left to right direction'
          : 'top to bottom direction'
      );
    }

    // Scale
    if (this.options.scale) {
      lines.push(`scale ${this.options.scale}`);
    }

    // Skinparams
    if (this.options.skinparam) {
      for (const [param, value] of Object.entries(this.options.skinparam)) {
        lines.push(`skinparam ${param} ${value}`);
      }
    }

    lines.push('');

    // Packages
    for (const pkg of this.packages) {
      lines.push(`package "${escapeUml(pkg.name)}" {`);
      for (const content of pkg.content) {
        lines.push(`  ${content}`);
      }
      lines.push('}');
      lines.push('');
    }

    // Classes
    if (this.classes.length > 0) {
      for (const cls of this.classes) {
        const keyword = cls.abstract ? 'abstract class' : 'class';
        const stereotype = cls.stereotype ? ` <<${escapeUml(cls.stereotype)}>>` : '';
        const safeId = sanitizeUmlId(cls.name);

        lines.push(`${keyword} "${escapeUml(cls.name)}"${stereotype} as ${safeId} {`);

        // Members (attributes)
        if (cls.members && cls.members.length > 0) {
          for (const member of cls.members) {
            lines.push(`  ${escapeUml(member)}`);
          }
        }

        // Divider between members and methods if both exist
        if (cls.members && cls.members.length > 0 && cls.methods && cls.methods.length > 0) {
          lines.push('  --');
        }

        // Methods
        if (cls.methods && cls.methods.length > 0) {
          for (const method of cls.methods) {
            lines.push(`  ${escapeUml(method)}`);
          }
        }

        lines.push('}');
      }
      lines.push('');
    }

    // Interfaces
    if (this.interfaces.length > 0) {
      for (const iface of this.interfaces) {
        const stereotype = iface.stereotype ? ` <<${escapeUml(iface.stereotype)}>>` : '';
        const safeId = sanitizeUmlId(iface.name);

        lines.push(`interface "${escapeUml(iface.name)}"${stereotype} as ${safeId} {`);

        if (iface.methods && iface.methods.length > 0) {
          for (const method of iface.methods) {
            lines.push(`  ${escapeUml(method)}`);
          }
        }

        lines.push('}');
      }
      lines.push('');
    }

    // Relations
    if (this.relations.length > 0) {
      for (const rel of this.relations) {
        const fromId = sanitizeUmlId(rel.from);
        const toId = sanitizeUmlId(rel.to);
        const arrow = getRelationArrow(rel.type);
        let line = `${fromId} ${arrow} ${toId}`;

        if (rel.label) {
          line += ` : ${escapeUml(rel.label)}`;
        }

        lines.push(line);
      }
      lines.push('');
    }

    // Notes
    if (this.notes.length > 0) {
      for (const note of this.notes) {
        const position = note.position || 'right';
        if (note.attachTo) {
          const attachId = sanitizeUmlId(note.attachTo);
          lines.push(`note ${position} of ${attachId}: ${escapeUml(note.text)}`);
        } else {
          lines.push(`note "${escapeUml(note.text)}" as N${this.notes.indexOf(note)}`);
        }
      }
      lines.push('');
    }

    // Raw lines
    if (this.rawLines.length > 0) {
      for (const raw of this.rawLines) {
        lines.push(raw);
      }
      lines.push('');
    }

    // Footer
    lines.push('@enduml');

    return lines.join('\n');
  }
}

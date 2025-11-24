/**
 * Interactive Mermaid Features (v3.3.0)
 * Phase 4B Task 3.2: Animations, event handlers, dynamic updates
 */
// @ts-nocheck - Requires type refactoring

import type { MermaidGenerator } from './mermaid.js';

/**
 * Animation types supported
 */
export type AnimationType =
  | 'fadeIn'
  | 'slideIn'
  | 'zoomIn'
  | 'bounceIn'
  | 'pulse'
  | 'highlight'
  | 'pathAnimation'
  | 'sequentialReveal';

/**
 * Animation configuration
 */
export interface AnimationConfig {
  type: AnimationType;
  duration?: number; // milliseconds
  delay?: number; // milliseconds
  easing?: 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out';
  repeat?: number | 'infinite';
  direction?: 'normal' | 'reverse' | 'alternate';
}

/**
 * Event handler configuration
 */
export interface EventHandler {
  event: 'click' | 'hover' | 'dblclick' | 'contextmenu';
  elementId: string;
  callback: string | ((event: Event) => void);
  preventDefault?: boolean;
}

/**
 * Interactive features manager for Mermaid diagrams
 */
export class InteractiveMermaid {
  private generator: MermaidGenerator;
  private animations: Map<string, AnimationConfig>;
  private eventHandlers: Map<string, EventHandler[]>;
  private dynamicUpdates: boolean;

  constructor(generator: MermaidGenerator) {
    this.generator = generator;
    this.animations = new Map();
    this.eventHandlers = new Map();
    this.dynamicUpdates = false;
  }

  /**
   * Add animation to an element
   */
  addAnimation(elementId: string, config: AnimationConfig): void {
    this.animations.set(elementId, config);
  }

  /**
   * Add event handler to an element
   */
  addEventListener(elementId: string, handler: EventHandler): void {
    if (!this.eventHandlers.has(elementId)) {
      this.eventHandlers.set(elementId, []);
    }
    this.eventHandlers.get(elementId)!.push(handler);
  }

  /**
   * Enable dynamic updates (live diagram modifications)
   */
  enableDynamicUpdates(): void {
    this.dynamicUpdates = true;
  }

  /**
   * Generate CSS animations
   */
  generateAnimationCSS(): string {
    const css: string[] = [];

    css.push('<style>');
    css.push('@keyframes fadeIn {');
    css.push('  from { opacity: 0; }');
    css.push('  to { opacity: 1; }');
    css.push('}');
    css.push('');

    css.push('@keyframes slideIn {');
    css.push('  from { transform: translateX(-100px); opacity: 0; }');
    css.push('  to { transform: translateX(0); opacity: 1; }');
    css.push('}');
    css.push('');

    css.push('@keyframes zoomIn {');
    css.push('  from { transform: scale(0); opacity: 0; }');
    css.push('  to { transform: scale(1); opacity: 1; }');
    css.push('}');
    css.push('');

    css.push('@keyframes bounceIn {');
    css.push('  0% { transform: scale(0); opacity: 0; }');
    css.push('  50% { transform: scale(1.1); }');
    css.push('  100% { transform: scale(1); opacity: 1; }');
    css.push('}');
    css.push('');

    css.push('@keyframes pulse {');
    css.push('  0%, 100% { transform: scale(1); }');
    css.push('  50% { transform: scale(1.05); }');
    css.push('}');
    css.push('');

    css.push('@keyframes highlight {');
    css.push('  0%, 100% { filter: brightness(1); }');
    css.push('  50% { filter: brightness(1.3); }');
    css.push('}');
    css.push('');

    css.push('@keyframes pathAnimation {');
    css.push('  from { stroke-dashoffset: 1000; }');
    css.push('  to { stroke-dashoffset: 0; }');
    css.push('}');
    css.push('');

    // Apply animations to elements
    for (const [elementId, config] of this.animations) {
      css.push(`#${elementId} {`);
      css.push(`  animation-name: ${config.type};`);
      css.push(`  animation-duration: ${config.duration || 1000}ms;`);
      css.push(`  animation-delay: ${config.delay || 0}ms;`);
      css.push(`  animation-timing-function: ${config.easing || 'ease'};`);

      if (config.repeat) {
        css.push(`  animation-iteration-count: ${config.repeat};`);
      }

      if (config.direction) {
        css.push(`  animation-direction: ${config.direction};`);
      }

      css.push('}');
      css.push('');
    }

    // Hover effects
    css.push('.node:hover {');
    css.push('  filter: brightness(1.1);');
    css.push('  cursor: pointer;');
    css.push('  transition: filter 0.2s ease;');
    css.push('}');
    css.push('');

    css.push('.edge:hover {');
    css.push('  stroke-width: 3px;');
    css.push('  transition: stroke-width 0.2s ease;');
    css.push('}');
    css.push('');

    // Path animations
    css.push('.animated-path {');
    css.push('  stroke-dasharray: 1000;');
    css.push('  animation: pathAnimation 2s ease-in-out;');
    css.push('}');
    css.push('');

    css.push('</style>');

    return css.join('\n');
  }

  /**
   * Generate JavaScript for event handlers
   */
  generateEventHandlersJS(): string {
    const js: string[] = [];

    js.push('<script>');
    js.push('document.addEventListener("DOMContentLoaded", function() {');
    js.push('  const svg = document.querySelector(".mermaid svg");');
    js.push('  if (!svg) return;');
    js.push('');

    // Generate event listeners for each element
    for (const [elementId, handlers] of this.eventHandlers) {
      js.push(`  // Event handlers for ${elementId}`);
      js.push(`  const element_${elementId} = svg.querySelector("#${elementId}");`);
      js.push(`  if (element_${elementId}) {`);

      for (const handler of handlers) {
        const callbackName = typeof handler.callback === 'string'
          ? handler.callback
          : `callback_${elementId}_${handler.event}`;

        js.push(`    element_${elementId}.addEventListener("${handler.event}", function(event) {`);

        if (handler.preventDefault) {
          js.push(`      event.preventDefault();`);
        }

        if (typeof handler.callback === 'string') {
          js.push(`      ${handler.callback};`);
        } else {
          js.push(`      console.log("${handler.event} on ${elementId}");`);
        }

        js.push(`    });`);
      }

      js.push(`  }`);
      js.push('');
    }

    // Dynamic update support
    if (this.dynamicUpdates) {
      js.push(this.generateDynamicUpdateJS());
    }

    js.push('});');
    js.push('</script>');

    return js.join('\n');
  }

  /**
   * Generate JavaScript for dynamic updates
   */
  private generateDynamicUpdateJS(): string {
    return `
  // Dynamic update functions
  window.mermaidUpdate = {
    addNode: function(nodeId, label, parentId) {
      console.log('Adding node:', nodeId, 'to', parentId);
      // Trigger diagram re-render
      mermaid.contentLoaded();
    },

    removeNode: function(nodeId) {
      const element = svg.querySelector("#" + nodeId);
      if (element) {
        element.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => element.remove(), 300);
      }
    },

    highlightNode: function(nodeId, duration = 2000) {
      const element = svg.querySelector("#" + nodeId);
      if (element) {
        element.style.animation = \`highlight \${duration}ms ease\`;
        setTimeout(() => {
          element.style.animation = '';
        }, duration);
      }
    },

    highlightPath: function(fromId, toId) {
      const path = svg.querySelector(\`[id*="\${fromId}"][id*="\${toId}"]\`);
      if (path) {
        path.classList.add('animated-path');
        setTimeout(() => path.classList.remove('animated-path'), 2000);
      }
    }
  };`;
  }

  /**
   * Generate complete interactive HTML with all features
   */
  generateInteractiveHTML(mermaidCode: string, title: string = 'Interactive Diagram'): string {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <script type="module">
    import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';
    mermaid.initialize({
      startOnLoad: true,
      theme: 'default',
      securityLevel: 'loose',
      flowchart: { useMaxWidth: false, htmlLabels: true },
    });
  </script>

  ${this.generateAnimationCSS()}

  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      margin: 0;
      padding: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
    }

    .container {
      max-width: 1400px;
      margin: 0 auto;
      background: white;
      border-radius: 15px;
      padding: 30px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }

    h1 {
      color: #333;
      margin-top: 0;
      font-size: 2.5em;
      border-bottom: 3px solid #667eea;
      padding-bottom: 10px;
    }

    .controls {
      margin: 20px 0;
      padding: 15px;
      background: #f8f9fa;
      border-radius: 8px;
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }

    button {
      padding: 10px 20px;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.3s ease;
    }

    button:hover {
      background: #5568d3;
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(102,126,234,0.4);
    }

    button:active {
      transform: translateY(0);
    }

    .mermaid-container {
      background: white;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      padding: 20px;
      overflow: auto;
      min-height: 400px;
      position: relative;
    }

    .mermaid {
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .tooltip {
      position: absolute;
      background: rgba(0,0,0,0.8);
      color: white;
      padding: 8px 12px;
      border-radius: 4px;
      font-size: 14px;
      pointer-events: none;
      z-index: 1000;
      display: none;
    }

    .zoom-indicator {
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: rgba(0,0,0,0.7);
      color: white;
      padding: 10px 15px;
      border-radius: 5px;
      font-size: 14px;
      display: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>${title}</h1>

    <div class="controls">
      <button onclick="resetZoom()">Reset View</button>
      <button onclick="zoomIn()">Zoom In (+)</button>
      <button onclick="zoomOut()">Zoom Out (-)</button>
      <button onclick="fitToScreen()">Fit to Screen</button>
      <button onclick="downloadSVG()">Download SVG</button>
      <button onclick="toggleAnimations()">Toggle Animations</button>
    </div>

    <div class="mermaid-container">
      <div class="mermaid">
${mermaidCode}
      </div>
      <div class="tooltip" id="tooltip"></div>
      <div class="zoom-indicator" id="zoomLevel">Zoom: 100%</div>
    </div>
  </div>

  ${this.generateEventHandlersJS()}

  <script>
    let scale = 1;
    let translateX = 0;
    let translateY = 0;
    let animationsEnabled = true;

    const svg = document.querySelector('.mermaid svg');
    const tooltip = document.getElementById('tooltip');
    const zoomIndicator = document.getElementById('zoomLevel');

    // Zoom functions
    function zoomIn() {
      scale *= 1.2;
      updateTransform();
      showZoomIndicator();
    }

    function zoomOut() {
      scale /= 1.2;
      updateTransform();
      showZoomIndicator();
    }

    function resetZoom() {
      scale = 1;
      translateX = 0;
      translateY = 0;
      updateTransform();
      showZoomIndicator();
    }

    function fitToScreen() {
      if (!svg) return;
      const container = document.querySelector('.mermaid-container');
      const bbox = svg.getBBox();
      const scaleX = container.clientWidth / bbox.width;
      const scaleY = container.clientHeight / bbox.height;
      scale = Math.min(scaleX, scaleY) * 0.9;
      translateX = (container.clientWidth - bbox.width * scale) / 2;
      translateY = (container.clientHeight - bbox.height * scale) / 2;
      updateTransform();
      showZoomIndicator();
    }

    function updateTransform() {
      if (svg) {
        svg.style.transform = \`translate(\${translateX}px, \${translateY}px) scale(\${scale})\`;
        svg.style.transition = 'transform 0.3s ease';
      }
    }

    function showZoomIndicator() {
      zoomIndicator.textContent = \`Zoom: \${Math.round(scale * 100)}%\`;
      zoomIndicator.style.display = 'block';
      setTimeout(() => {
        zoomIndicator.style.display = 'none';
      }, 1500);
    }

    function downloadSVG() {
      if (!svg) return;
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svg);
      const blob = new Blob([svgString], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = '${title.replace(/[^a-zA-Z0-9]/g, '_')}.svg';
      link.click();
      URL.revokeObjectURL(url);
    }

    function toggleAnimations() {
      animationsEnabled = !animationsEnabled;
      document.querySelectorAll('.mermaid *').forEach(el => {
        el.style.animationPlayState = animationsEnabled ? 'running' : 'paused';
      });
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.key === '+' || e.key === '=') zoomIn();
      if (e.key === '-') zoomOut();
      if (e.key === '0') resetZoom();
      if (e.key === 'f') fitToScreen();
    });

    // Mouse wheel zoom
    if (svg) {
      svg.addEventListener('wheel', (e) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        scale *= delta;
        scale = Math.max(0.1, Math.min(scale, 10));
        updateTransform();
        showZoomIndicator();
      });

      // Pan with mouse drag
      let isDragging = false;
      let startX, startY;

      svg.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.clientX - translateX;
        startY = e.clientY - translateY;
        svg.style.cursor = 'grabbing';
      });

      document.addEventListener('mousemove', (e) => {
        if (isDragging) {
          translateX = e.clientX - startX;
          translateY = e.clientY - startY;
          updateTransform();
        }
      });

      document.addEventListener('mouseup', () => {
        isDragging = false;
        if (svg) svg.style.cursor = 'grab';
      });

      // Tooltips
      svg.addEventListener('mouseover', (e) => {
        const target = e.target.closest('[data-tooltip]');
        if (target) {
          tooltip.textContent = target.getAttribute('data-tooltip');
          tooltip.style.display = 'block';
        }
      });

      svg.addEventListener('mousemove', (e) => {
        if (tooltip.style.display === 'block') {
          tooltip.style.left = e.clientX + 10 + 'px';
          tooltip.style.top = e.clientY + 10 + 'px';
        }
      });

      svg.addEventListener('mouseout', () => {
        tooltip.style.display = 'none';
      });
    }

    // Initialize
    setTimeout(fitToScreen, 500);
  </script>
</body>
</html>`;

    return html;
  }

  /**
   * Create sequential reveal animation for diagrams
   */
  createSequentialReveal(elementIds: string[], delayBetween: number = 200): void {
    elementIds.forEach((id, index) => {
      this.addAnimation(id, {
        type: 'fadeIn',
        duration: 600,
        delay: index * delayBetween,
        easing: 'ease-out',
      });
    });
  }

  /**
   * Create path animation (for showing flows)
   */
  createPathAnimation(pathIds: string[]): void {
    pathIds.forEach(id => {
      this.addAnimation(id, {
        type: 'pathAnimation',
        duration: 2000,
        easing: 'ease-in-out',
      });
    });
  }

  /**
   * Create pulsing animation (for highlighting important nodes)
   */
  createPulseAnimation(elementIds: string[], infinite: boolean = true): void {
    elementIds.forEach(id => {
      this.addAnimation(id, {
        type: 'pulse',
        duration: 1500,
        repeat: infinite ? 'infinite' : 1,
        easing: 'ease-in-out',
      });
    });
  }
}

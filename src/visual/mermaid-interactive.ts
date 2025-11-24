/**
 * Interactive Mermaid Features (v3.4.0)
 * Phase 4B Task 3.2: Add interactive Mermaid features (zoom, click handlers, animations)
 *
 * Provides HTML wrapper with interactive controls for Mermaid diagrams
 */

/**
 * Interactive feature set
 */
export interface InteractiveFeatures {
  zoom?: boolean;
  pan?: boolean;
  clickHandlers?: boolean;
  animations?: boolean;
  tooltip?: boolean;
  export?: boolean;
  fullscreen?: boolean;
}

/**
 * Click handler
 */
export interface ClickHandler {
  nodeId: string;
  action: 'alert' | 'redirect' | 'callback' | 'modal';
  value: string; // Alert message, URL, callback name, or modal content
}

/**
 * Animation config
 */
export interface AnimationConfig {
  enabled: boolean;
  duration?: number; // milliseconds
  easing?: 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out';
  highlightPath?: boolean;
}

/**
 * Tooltip config
 */
export interface TooltipConfig {
  enabled: boolean;
  nodeData?: Map<string, string>; // nodeId -> tooltip content
  position?: 'top' | 'bottom' | 'left' | 'right';
}

/**
 * Interactive Mermaid wrapper
 */
export class InteractiveMermaidWrapper {
  /**
   * Generate HTML page with interactive Mermaid diagram
   */
  generateInteractivePage(
    mermaidCode: string,
    title: string,
    features: InteractiveFeatures,
    clickHandlers?: ClickHandler[],
    animationConfig?: AnimationConfig,
    tooltipConfig?: TooltipConfig
  ): string {
    const html: string[] = [];

    html.push('<!DOCTYPE html>');
    html.push('<html lang="en">');
    html.push('<head>');
    html.push('  <meta charset="UTF-8">');
    html.push('  <meta name="viewport" content="width=device-width, initial-scale=1.0">');
    html.push(`  <title>${title}</title>`);
    html.push('');

    // Mermaid library
    html.push('  <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>');

    // Pan-zoom library (if enabled)
    if (features.zoom || features.pan) {
      html.push('  <script src="https://cdn.jsdelivr.net/npm/svg-pan-zoom@3.6.1/dist/svg-pan-zoom.min.js"></script>');
    }

    html.push('');
    html.push('  <style>');
    html.push(this.generateCSS(features));
    html.push('  </style>');
    html.push('</head>');
    html.push('<body>');
    html.push('');

    // Controls
    if (features.zoom || features.export || features.fullscreen) {
      html.push('  <div class="controls">');
      if (features.zoom) {
        html.push('    <button id="zoomIn" title="Zoom In">🔍+</button>');
        html.push('    <button id="zoomOut" title="Zoom Out">🔍-</button>');
        html.push('    <button id="resetZoom" title="Reset Zoom">↺</button>');
      }
      if (features.export) {
        html.push('    <button id="exportSVG" title="Export SVG">💾 SVG</button>');
        html.push('    <button id="exportPNG" title="Export PNG">💾 PNG</button>');
      }
      if (features.fullscreen) {
        html.push('    <button id="fullscreen" title="Fullscreen">⛶</button>');
      }
      html.push('  </div>');
      html.push('');
    }

    // Diagram container
    html.push('  <div id="diagram-container">');
    html.push('    <div class="mermaid">');
    html.push(this.indent(mermaidCode, 6));
    html.push('    </div>');
    html.push('  </div>');
    html.push('');

    // Tooltip container (if enabled)
    if (tooltipConfig?.enabled) {
      html.push('  <div id="tooltip" class="tooltip"></div>');
      html.push('');
    }

    // Scripts
    html.push('  <script>');
    html.push(this.generateJavaScript(features, clickHandlers, animationConfig, tooltipConfig));
    html.push('  </script>');
    html.push('');

    html.push('</body>');
    html.push('</html>');

    return html.join('\n');
  }

  /**
   * Generate CSS
   */
  private generateCSS(features: InteractiveFeatures): string {
    const css: string[] = [];

    css.push('    body {');
    css.push('      margin: 0;');
    css.push('      padding: 20px;');
    css.push('      font-family: Arial, sans-serif;');
    css.push('      background: #f5f5f5;');
    css.push('    }');
    css.push('');

    css.push('    #diagram-container {');
    css.push('      background: white;');
    css.push('      border-radius: 8px;');
    css.push('      box-shadow: 0 2px 8px rgba(0,0,0,0.1);');
    css.push('      padding: 20px;');
    css.push('      overflow: auto;');
    if (features.pan) {
      css.push('      cursor: grab;');
    }
    css.push('    }');
    css.push('');

    if (features.pan) {
      css.push('    #diagram-container:active {');
      css.push('      cursor: grabbing;');
      css.push('    }');
      css.push('');
    }

    css.push('    .mermaid {');
    css.push('      display: flex;');
    css.push('      justify-content: center;');
    if (features.animations) {
      css.push('      animation: fadeIn 0.5s ease-in;');
    }
    css.push('    }');
    css.push('');

    if (features.animations) {
      css.push('    @keyframes fadeIn {');
      css.push('      from { opacity: 0; transform: translateY(20px); }');
      css.push('      to { opacity: 1; transform: translateY(0); }');
      css.push('    }');
      css.push('');
    }

    if (features.zoom || features.export || features.fullscreen) {
      css.push('    .controls {');
      css.push('      position: fixed;');
      css.push('      top: 20px;');
      css.push('      right: 20px;');
      css.push('      background: white;');
      css.push('      border-radius: 8px;');
      css.push('      box-shadow: 0 2px 8px rgba(0,0,0,0.2);');
      css.push('      padding: 10px;');
      css.push('      display: flex;');
      css.push('      gap: 10px;');
      css.push('      z-index: 1000;');
      css.push('    }');
      css.push('');

      css.push('    .controls button {');
      css.push('      padding: 8px 12px;');
      css.push('      border: none;');
      css.push('      background: #007bff;');
      css.push('      color: white;');
      css.push('      border-radius: 4px;');
      css.push('      cursor: pointer;');
      css.push('      font-size: 14px;');
      css.push('      transition: background 0.2s;');
      css.push('    }');
      css.push('');

      css.push('    .controls button:hover {');
      css.push('      background: #0056b3;');
      css.push('    }');
      css.push('');
    }

    if (features.tooltip) {
      css.push('    .tooltip {');
      css.push('      position: fixed;');
      css.push('      background: rgba(0, 0, 0, 0.8);');
      css.push('      color: white;');
      css.push('      padding: 8px 12px;');
      css.push('      border-radius: 4px;');
      css.push('      font-size: 14px;');
      css.push('      pointer-events: none;');
      css.push('      opacity: 0;');
      css.push('      transition: opacity 0.2s;');
      css.push('      z-index: 10000;');
      css.push('    }');
      css.push('');

      css.push('    .tooltip.show {');
      css.push('      opacity: 1;');
      css.push('    }');
      css.push('');
    }

    if (features.clickHandlers) {
      css.push('    .clickable-node {');
      css.push('      cursor: pointer;');
      css.push('    }');
      css.push('');

      css.push('    .clickable-node:hover {');
      css.push('      opacity: 0.8;');
      css.push('    }');
      css.push('');
    }

    if (features.fullscreen) {
      css.push('    #diagram-container.fullscreen {');
      css.push('      position: fixed;');
      css.push('      top: 0;');
      css.push('      left: 0;');
      css.push('      width: 100vw;');
      css.push('      height: 100vh;');
      css.push('      z-index: 999;');
      css.push('      border-radius: 0;');
      css.push('    }');
    }

    return css.join('\n');
  }

  /**
   * Generate JavaScript
   */
  private generateJavaScript(
    features: InteractiveFeatures,
    clickHandlers?: ClickHandler[],
    _animationConfig?: AnimationConfig,
    tooltipConfig?: TooltipConfig
  ): string {
    const js: string[] = [];

    // Initialize Mermaid
    js.push('    // Initialize Mermaid');
    js.push('    mermaid.initialize({');
    js.push('      startOnLoad: true,');
    js.push('      theme: "default",');
    js.push('      securityLevel: "loose"');
    js.push('    });');
    js.push('');

    js.push('    // Wait for diagram to render');
    js.push('    document.addEventListener("DOMContentLoaded", function() {');
    js.push('      setTimeout(function() {');
    js.push('        const svg = document.querySelector("#diagram-container svg");');
    js.push('        if (!svg) return;');
    js.push('');

    // Pan and zoom
    if (features.zoom || features.pan) {
      js.push('        // Initialize pan-zoom');
      js.push('        const panZoom = svgPanZoom(svg, {');
      js.push('          zoomEnabled: true,');
      js.push('          controlIconsEnabled: false,');
      js.push('          fit: true,');
      js.push('          center: true,');
      js.push('          minZoom: 0.1,');
      js.push('          maxZoom: 10');
      js.push('        });');
      js.push('');

      if (features.zoom) {
        js.push('        // Zoom controls');
        js.push('        document.getElementById("zoomIn")?.addEventListener("click", () => panZoom.zoomIn());');
        js.push('        document.getElementById("zoomOut")?.addEventListener("click", () => panZoom.zoomOut());');
        js.push('        document.getElementById("resetZoom")?.addEventListener("click", () => {');
        js.push('          panZoom.resetZoom();');
        js.push('          panZoom.center();');
        js.push('        });');
        js.push('');
      }
    }

    // Click handlers
    if (features.clickHandlers && clickHandlers && clickHandlers.length > 0) {
      js.push('        // Click handlers');
      for (const handler of clickHandlers) {
        const escapedValue = handler.value.replace(/'/g, "\\'");
        js.push(`        svg.getElementById("${handler.nodeId}")?.addEventListener("click", function() {`);

        switch (handler.action) {
          case 'alert':
            js.push(`          alert('${escapedValue}');`);
            break;
          case 'redirect':
            js.push(`          window.location.href = '${escapedValue}';`);
            break;
          case 'callback':
            js.push(`          if (typeof ${handler.value} === 'function') ${handler.value}();`);
            break;
          case 'modal':
            js.push(`          alert('${escapedValue}'); // Replace with modal implementation`);
            break;
        }

        js.push('        });');
      }
      js.push('');
    }

    // Tooltips
    if (tooltipConfig?.enabled && tooltipConfig.nodeData) {
      js.push('        // Tooltips');
      js.push('        const tooltip = document.getElementById("tooltip");');
      js.push('');

      for (const [nodeId, content] of tooltipConfig.nodeData) {
        const escapedContent = content.replace(/'/g, "\\'");
        js.push(`        const node${nodeId} = svg.getElementById("${nodeId}");`);
        js.push(`        if (node${nodeId}) {`);
        js.push(`          node${nodeId}.addEventListener("mouseenter", function(e) {`);
        js.push(`            tooltip.textContent = '${escapedContent}';`);
        js.push('            tooltip.classList.add("show");');
        js.push('            tooltip.style.left = e.pageX + 10 + "px";');
        js.push('            tooltip.style.top = e.pageY + 10 + "px";');
        js.push('          });');
        js.push(`          node${nodeId}.addEventListener("mouseleave", function() {`);
        js.push('            tooltip.classList.remove("show");');
        js.push('          });');
        js.push('        }');
      }
      js.push('');
    }

    // Export functionality
    if (features.export) {
      js.push('        // Export SVG');
      js.push('        document.getElementById("exportSVG")?.addEventListener("click", function() {');
      js.push('          const svgData = new XMLSerializer().serializeToString(svg);');
      js.push('          const blob = new Blob([svgData], { type: "image/svg+xml" });');
      js.push('          const url = URL.createObjectURL(blob);');
      js.push('          const a = document.createElement("a");');
      js.push('          a.href = url;');
      js.push('          a.download = "diagram.svg";');
      js.push('          a.click();');
      js.push('        });');
      js.push('');

      js.push('        // Export PNG');
      js.push('        document.getElementById("exportPNG")?.addEventListener("click", function() {');
      js.push('          const canvas = document.createElement("canvas");');
      js.push('          const ctx = canvas.getContext("2d");');
      js.push('          const svgData = new XMLSerializer().serializeToString(svg);');
      js.push('          const img = new Image();');
      js.push('          img.onload = function() {');
      js.push('            canvas.width = img.width;');
      js.push('            canvas.height = img.height;');
      js.push('            ctx.drawImage(img, 0, 0);');
      js.push('            canvas.toBlob(function(blob) {');
      js.push('              const url = URL.createObjectURL(blob);');
      js.push('              const a = document.createElement("a");');
      js.push('              a.href = url;');
      js.push('              a.download = "diagram.png";');
      js.push('              a.click();');
      js.push('            });');
      js.push('          };');
      js.push('          img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));');
      js.push('        });');
      js.push('');
    }

    // Fullscreen
    if (features.fullscreen) {
      js.push('        // Fullscreen toggle');
      js.push('        document.getElementById("fullscreen")?.addEventListener("click", function() {');
      js.push('          const container = document.getElementById("diagram-container");');
      js.push('          container.classList.toggle("fullscreen");');
      js.push('        });');
      js.push('');
    }

    js.push('      }, 500);');
    js.push('    });');

    return js.join('\n');
  }

  /**
   * Indent text
   */
  private indent(text: string, spaces: number): string {
    const prefix = ' '.repeat(spaces);
    return text.split('\n').map(line => prefix + line).join('\n');
  }

  /**
   * Generate interactive viewer for multiple diagrams
   */
  generateMultiDiagramViewer(
    diagrams: Array<{ title: string; code: string }>,
    _features: InteractiveFeatures
  ): string {
    const html: string[] = [];

    html.push('<!DOCTYPE html>');
    html.push('<html lang="en">');
    html.push('<head>');
    html.push('  <meta charset="UTF-8">');
    html.push('  <meta name="viewport" content="width=device-width, initial-scale=1.0">');
    html.push('  <title>Mermaid Diagram Viewer</title>');
    html.push('  <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>');
    html.push('  <style>');
    html.push('    body { font-family: Arial; margin: 0; padding: 20px; background: #f5f5f5; }');
    html.push('    .tabs { display: flex; gap: 10px; margin-bottom: 20px; }');
    html.push('    .tab { padding: 10px 20px; background: white; border-radius: 4px; cursor: pointer; }');
    html.push('    .tab.active { background: #007bff; color: white; }');
    html.push('    .diagram-panel { display: none; background: white; padding: 20px; border-radius: 8px; }');
    html.push('    .diagram-panel.active { display: block; }');
    html.push('  </style>');
    html.push('</head>');
    html.push('<body>');
    html.push('  <div class="tabs">');

    for (let i = 0; i < diagrams.length; i++) {
      const activeClass = i === 0 ? ' class="active"' : '';
      html.push(`    <div${activeClass} onclick="showDiagram(${i})">${diagrams[i].title}</div>`);
    }

    html.push('  </div>');

    for (let i = 0; i < diagrams.length; i++) {
      const activeClass = i === 0 ? ' active' : '';
      html.push(`  <div class="diagram-panel${activeClass}" id="panel${i}">`);
      html.push('    <div class="mermaid">');
      html.push(this.indent(diagrams[i].code, 6));
      html.push('    </div>');
      html.push('  </div>');
    }

    html.push('  <script>');
    html.push('    mermaid.initialize({ startOnLoad: true });');
    html.push('    function showDiagram(index) {');
    html.push('      document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));');
    html.push('      document.querySelectorAll(".diagram-panel").forEach(p => p.classList.remove("active"));');
    html.push('      document.querySelectorAll(".tab")[index].classList.add("active");');
    html.push('      document.getElementById("panel" + index).classList.add("active");');
    html.push('    }');
    html.push('  </script>');
    html.push('</body>');
    html.push('</html>');

    return html.join('\n');
  }
}

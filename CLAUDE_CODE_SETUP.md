# Setting Up DeepThinking MCP with Claude Code

## Quick Setup

1. **Add to your Claude Desktop configuration**

   Edit your config file:
   - **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
   - **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Linux**: `~/.config/Claude/claude_desktop_config.json`

2. **Add the DeepThinking MCP server**:

```json
{
  "mcpServers": {
    "deepthinking": {
      "command": "node",
      "args": ["C:/mcp-servers/deepthinking-mcp/dist/index.js"]
    }
  }
}
```

3. **Restart Claude Desktop** or Claude Code

4. **Verify it's working**:
   - The `deepthinking` tool should appear in the available tools
   - Try: "Use the deepthinking tool to help me solve this problem..."

## Configuration for Development

If you're actively developing, use the built version:

```json
{
  "mcpServers": {
    "deepthinking": {
      "command": "node",
      "args": ["C:/mcp-servers/deepthinking-mcp/dist/index.js"],
      "env": {
        "NODE_ENV": "development",
        "DEBUG": "true"
      }
    }
  }
}
```

## Example Usage with Claude Code

### Sequential Thinking Mode
```
Use deepthinking in sequential mode to help me refine my approach to building a web scraper.
```

### Shannon Systematic Mode
```
Use deepthinking in shannon mode to systematically solve this algorithm optimization problem.
```

### Mathematics Mode
```
Use deepthinking in mathematics mode to prove the convergence of this series.
```

### Physics Mode
```
Use deepthinking in physics mode to derive the stress-energy tensor for this field configuration.
```

### Hybrid Mode (Default)
```
Use deepthinking to help me think through this complex problem.
(The tool will automatically select the best approach)
```

## Testing the Integration

Try this simple test:

```
Claude, please use the deepthinking tool to help me think through the following problem step by step:

Problem: Design a caching strategy for a distributed system.

Use sequential mode and help me iterate on my approach.
```

## Troubleshooting

### Tool not appearing
1. Check the config file syntax (valid JSON)
2. Verify the path to `dist/index.js` is correct
3. Restart Claude Desktop/Code
4. Check logs in Claude Desktop

### Build issues
```bash
cd C:/mcp-servers/deepthinking-mcp
npm run build
```

### Run tests
```bash
cd C:/mcp-servers/deepthinking-mcp
npm test
```

## Advanced Features

### Session Management
The tool automatically manages sessions. You can:
- Continue thoughts in the same session
- Switch modes mid-session
- Export sessions to various formats
- Generate summaries

### Actions Available
- `add_thought` (default): Add a new thought
- `summarize`: Get session summary
- `export`: Export session (JSON, Markdown, LaTeX)
- `switch_mode`: Change thinking mode
- `get_session`: Get session metadata

## Next Steps

Once integrated with Claude Code:
1. Try different thinking modes for different problems
2. Use sequential mode for iterative refinement
3. Use mathematics mode for proofs and formal reasoning
4. Use physics mode for tensor mathematics
5. Let hybrid mode intelligently combine approaches

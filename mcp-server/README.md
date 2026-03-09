# Attune MCP Server

Use Attune code quality analysis directly from Claude Code, Cursor, and other AI tools that support the Model Context Protocol (MCP).

## What is MCP?

The [Model Context Protocol](https://modelcontextprotocol.io/) (MCP) is an open protocol that enables AI tools to connect to external services. Attune's MCP server lets AI assistants run code quality analysis as part of their conversations.

## Installation

### Global Installation

```bash
npm install -g @attune/mcp-server
# Or
npx @attune/mcp-server
```

### From Source

```bash
cd mcp-server
npm install
npm run build
npm start
```

## Configuration

### Claude Code

Add to your Claude Code settings (usually `~/.claude/settings.json`):

```json
{
  "mcpServers": {
    "attune": {
      "command": "npx",
      "args": ["@attune/mcp-server"]
    }
  }
}
```

Or use environment variables:

```json
{
  "mcpServers": {
    "attune": {
      "command": "npx",
      "args": ["-y", "@attune/mcp-server"]
    }
  }
}
```

### Cursor

Add to Cursor settings:

```json
{
  "mcpServers": {
    "attune": {
      "command": "npx",
      "args": ["@attune/mcp-server"]
    }
  }
}
```

### Other MCP Clients

Any MCP-compatible client can connect using:

```bash
npx @attune/mcp-server
```

The server communicates via stdio.

## Usage

Once configured, you can ask your AI assistant to run Attune:

```
Run Attune on my project
```

```
Check for security issues only
```

```
Do a quick check for critical issues
```

## Available Tools

| Tool | Description |
|------|-------------|
| `attune_analyze` | Full code quality analysis |
| `attune_quick_check` | Fast check for critical/high issues |
| `attune_security_scan` | Security-focused scan |

### Parameters

- `path`: Project path (default: current directory)
- `flags`: Additional Attune flags

## Example Conversations

**User**: "Run Attune on my codebase"

**AI**: (uses `attune_analyze` tool)

```
📊 Attune Results

Found 5 issues:
- 🔴 Critical: 1
- 🟠 High: 2
- 🔵 Medium: 2
- 🟢 Low: 0

### Top Issues

1. 🔴 **COMM_SECRET_HARDCODED**: Hardcoded API key found
   File: `src/config.ts`

2. 🟠 **OWASP_A03_INJECTION**: SQL injection risk
   File: `src/db/user.ts`
```

**User**: "Check for security issues"

**AI**: (uses `attune_security_scan` tool)

```
🔒 Security Scan Results

Found 3 security issues...
```

## Requirements

- Node.js 18+
- Attune CLI installed (`npm install -g attune`)

## License

MIT

# Attune VS Code Extension

Code quality analysis for AI-generated code directly in VS Code.

## Features

- **Project Analysis**: Scan your entire project with one command
- **File Analysis**: Right-click any file to analyze it specifically
- **Problems Integration**: Findings appear in VS Code Problems panel
- **Status Bar**: Shows issue count after analysis
- **Configurable**: Use lite mode for faster analysis

## Installation

### From VS Code Marketplace

1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X / Cmd+Shift+X)
3. Search for "Attune"
4. Click Install

### From VSIX

```bash
cd vscode-extension
npm install
npm run package
# Install the generated .vsix file via VS Code "Install from VSIX"
```

## Usage

### Analyze Entire Project

1. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
2. Type "Attune: Analyze Project"
3. Press Enter

Or use the command palette icon in the status bar.

### Analyze Current File

Right-click on any file and select "Attune: Analyze Current File"

### Analyze Folder

Right-click on any folder in the explorer and select "Attune: Analyze Folder"

## Configuration

Go to `Settings > Extensions > Setting | Description | Attune`:

| Default |
|---------|-------------|---------|
| `attune.runOnSave` | Run analysis on file save | `false` |
| `attune.runOnOpen` | Run analysis on workspace open | `false` |
| `attune.liteMode` | Use lite mode for faster analysis | `true` |

## Keyboard Shortcuts

Add to your `keybindings.json`:

```json
[
  {
    "key": "ctrl+shift+a",
    "command": "attune.analyze",
    "when": "workspaceFolderExists"
  }
]
```

## Requirements

- Node.js 18+
- VS Code 1.80+
- Attune CLI installed (`npm install -g attune`)

## License

MIT

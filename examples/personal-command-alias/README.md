# Personal `/think` Alias (Optional)

This directory contains a minimal Claude Code slash command that aliases `/think` to the plugin's namespaced `/deepthinking-plugin:think`. Copy it to your personal commands directory if you want the shorter `/think` invocation.

## Why You'd Want This

By default, plugin commands are namespaced:

    /deepthinking-plugin:think sequential "Break down the steps..."

The namespace prevents collisions between plugins but is verbose. If you know you'll never have two plugins named `think`, a personal alias at `~/.claude/commands/think.md` lets you type:

    /think sequential "Break down the steps..."

The alias delegates to the plugin skill via Claude Code's Skill tool. No functional difference — just fewer keystrokes.

## Install

### Windows (PowerShell)

    Copy-Item "think.md" "$env:USERPROFILE\.claude\commands\think.md"

### macOS / Linux

    mkdir -p ~/.claude/commands
    cp think.md ~/.claude/commands/think.md

### Verify

Restart Claude Code and run:

    /help

You should see `/think` listed alongside `/deepthinking-plugin:think`. Both will produce identical output; the personal alias simply routes to the plugin skill.

## Uninstall

Delete the file at `~/.claude/commands/think.md`. The plugin continues to work via the namespaced `/deepthinking-plugin:think` form.

## Notes

- The alias file is a personal convenience, not part of the plugin itself.
- Personal commands live in `~/.claude/commands/`; plugin commands live inside the plugin directory. Both mechanisms are supported by Claude Code and operate independently.
- If another plugin in your setup also defines `/think` (as either a command or a personal alias), the behavior of the bare `/think` becomes ambiguous. In that case, use the namespaced form.

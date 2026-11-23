# herdr-jkr

Layouts, theme and mods for the [Herdr](https://herdr.dev) desktop app: a black, lime-accented, sci-fi look for running many coding agents at once.

## Layouts

- **`jkr-deck`**: spaces on the left; an **Agent Deck** across the top of the work area, showing every agent as a card in a grid (unit number, space, task, status, time in that state) over a faint technical grid; tabs and panes below; Files and Changes on the right. Square corners everywhere, accent corner brackets on panels and panes, and a monospace font for the whole interface.
- **`jkr-main`**: the classic arrangement: spaces and the agents list on the left, tabs and panes in the middle, Files and Changes on the right.

Both use the **`jkr`** theme (pure black, `#d5ff40` accent).

## Install

Requires the Herdr app (built against 0.1.16).

```sh
git clone https://github.com/Jahiker/herdr-jkr.git
cd herdr-jkr
./install.sh
```

Then switch layouts with `ctrl-shift-l`, or:

```sh
herdr-app do layout.switch '{"name":"jkr-deck"}'
```

The installer copies into `~/.config/herdr-app` (or `$HERDR_APP_HOME`) and replaces files with the same names. If a layout ever breaks the window, `ctrl-alt-shift-escape` always returns to Herdr's default layout.

## Fonts

- The `jkr-deck` interface uses **Cascadia Code NF** (`ui_font` in `layouts/jkr-deck.json`). Install it from [Cascadia Code](https://github.com/microsoft/cascadia-code) or change that value to any font you have.
- The JKR logo uses **Basement Grotesque**, which is not included here. Get it from [basement.studio](https://github.com/basementstudio/basement-grotesque) and put the `.otf` in `~/.config/herdr-app/mods/jkr-chrome/fonts/`; without it the logo falls back to the default font.

## Mods

| Mod | What it is |
|---|---|
| `jkr-deck` | The Agent Deck grid (new). |
| `jkr-spaces` | Spaces sidebar with groups (right-click a space → Move to group). |
| `jkr-group` | The group picker popup. Default groups: Work, Clients, Personal. |
| `jkr-agents` | The agents list used by `jkr-main`. |
| `jkr-chrome`, `jkr-tabs`, `jkr-menu` | Brand bar and sidebar footer, tab bar, menus. |
| `jkr-pane`, `jkr-files`, `jkr-changes`, `jkr-workspace-status` | Square-cornered copies of Herdr's own mods, used by `jkr-deck`. |
| `jkr-new-menu` | Square-cornered copy of Herdr's new menu, plus entries that open the folder you are working in (the focused terminal's current folder): **Neovim** and **Lazygit** in a new tab, **VS Code** and **Cursor** in their own window (disabled in remote spaces). Each needs its command on your PATH: `nvim`, `lazygit`, `code`, `cursor`. |

The shared `jkr-*` mods draw square corners only while `jkr-deck` is shown, so `jkr-main` keeps its rounded look.

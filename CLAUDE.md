# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start Vite dev server with HMR
- `npm run build` — type-check (`tsc -b`) then build production bundle via Vite
- `npm run lint` — run Oxlint
- `npm run preview` — preview the production build locally

There is no test runner configured yet.

## What this app does

A full-screen "now & next" display: the user loads a schedule file (CSV/JSON/YAML, see `examples/`) listing daily time-of-day slots (`name`, `start`, `end`, optional `color`). The app shows the currently active slot's name as a big centered caption with the time range below, and a colored background fill grows left-to-right across the full width as the slot elapses (0% at `start`, 100% at `end`). Slots repeat daily (time-of-day only, no dates); a slot whose `end` is earlier than `start` spans midnight.

## Architecture

- `src/lib/parsers.ts` — reads raw file text + filename, detects format by extension, parses (Papa Parse for CSV, `js-yaml` for YAML, `JSON.parse` for JSON), and normalizes into `Slot[]`. Throws `ScheduleParseError` with a user-facing message on any validation failure.
- `src/lib/schedule.ts` — `getCurrentSlotInfo(slots, now)` finds the active slot for a given time and computes its fill percent (handling the midnight-wrap case), plus the next upcoming slot for the idle state.
- `src/lib/color.ts` — deterministic per-activity fill color (hash of the name) when no `color` is given, and `contrastTextColor()` which renders a probe element to resolve any CSS color to RGB and pick black/white for readability.
- `src/hooks/useSchedule.ts` — owns loaded `Slot[]`/filename/parse error; persists the raw file text to `localStorage` (key `adhd-now-focus:schedule`) so a reload keeps the schedule; lazy-initializes state by reading `localStorage` synchronously in `useState`'s initializer (not an effect) to avoid an extra render.
- `src/hooks/useNow.ts` — ticks a `Date` every second to drive the display.
- `src/hooks/useFullscreen.ts` — wraps the Fullscreen API; tracks state via the `fullscreenchange` event (not just the requesting call, since fullscreen can also be exited by the browser/OS, e.g. Esc key).
- `src/hooks/useWakeLock.ts` — requests a Screen Wake Lock while `active` (wired to fullscreen state in `App.tsx`) so the display doesn't sleep. The wake lock is auto-released by the browser whenever the tab goes hidden, so it re-acquires on `visibilitychange` rather than assuming one request lasts for the whole session. No-ops silently if the API is unsupported or the request is denied.
- `src/components/Stage.tsx` — the main display. The caption (title + time range) is rendered **twice**, stacked absolutely on top of each other: one full layer in the base text color, and a second layer clipped with `clip-path: inset()` to the fill's current width, colored via `contrastTextColor(fillColor)`. This is what keeps the caption legible across the fill boundary — deliberately not using `mix-blend-mode`, which is not guaranteed to stay reliably readable against arbitrary background colors. See `App.css` (`.stage__caption-layer--fill`) if touching this.
- `src/components/DropZone.tsx` / `src/components/CornerMenu.tsx` — file loading UI (drag-and-drop + file picker) for the empty/error state and for replacing an already-loaded schedule, respectively.
- `src/App.tsx` — wires the hooks together and owns the app-level drag-and-drop overlay so a file can be dropped to replace the schedule at any time, not just on first load. Also wires `useWakeLock(isFullscreen)` so the screen only stays awake while in fullscreen.

## Notes

- Oxlint's `react(set-state-in-effect)` rule flags `setState` calls inside `useEffect`; prefer deriving/lazy-initializing state instead (see `useSchedule.ts`'s pattern) rather than suppressing the rule.
- `js-yaml`'s ESM build has no default export — import named bindings (`import { load } from 'js-yaml'`), not `import yaml from 'js-yaml'`.

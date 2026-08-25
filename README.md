# adhd-now-focus

A full-screen "now & next" display for your day. Drop in a schedule file (CSV, JSON, or YAML) and it shows the current activity as a big centered caption, with the background filling left-to-right as the slot progresses — inspired by iOS StandBy's timer view.

## Usage

```bash
npm install
npm run dev
```

Open the app and drop a schedule file onto it (or click "Choose file"). See `examples/schedule.example.{csv,json,yaml}` for the format. The loaded schedule is remembered in `localStorage`, so reloading the page keeps it. Drop a new file at any time to replace it, or use the small controls in the bottom-right corner.

### Schedule file format

Each entry needs a `name`, `start`, and `end` (24-hour `HH:MM`), plus an optional `color` (any CSS color). Times are time-of-day and repeat daily; a slot whose `end` is earlier than its `start` (e.g. `23:00` → `07:00`) is treated as spanning midnight.

```yaml
- name: Work
  start: "13:00"
  end: "17:00"
  color: "#5E81AC"
```

Slots without a `color` get a deterministic color derived from their name.

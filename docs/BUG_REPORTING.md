# Bug reporting

The bug-report button in the bottom-right corner opens a real form (it used to be a
placeholder). Reports are sent as a JSON `POST` to a configurable endpoint.

## Configure the endpoint

1. Open **Settings** (top-left gear).
2. Under **Bug Reporting**, enter the URL that should receive reports.
3. The value is stored in `localStorage` under `bugReportEndpoint_v1`.

If the field is empty, the form explains that reporting is disabled and the send
button stays disabled.

## What a report contains

| Field | Content |
|---|---|
| `description` | what the user typed (required) |
| `steps` | optional reproduction steps |
| `appVersion` | build version |
| `createdAt` | ISO timestamp |
| `userAgent` | browser/Electron user agent |
| `logs` | last 200 logger entries (warn/error included), unless the user unticks the box |
| `screenshots` | data URLs of the files the user attached (`accept="image/*"`) |
| `gameFiles` | raw saved `localStorage` values (profiles, stats, theme, borders) |

## Verify delivery locally

```bash
cd CodeWashGame
npm run bug:receive          # http://localhost:8787/report
```

Then set the endpoint to `http://localhost:8787/report`, submit a report, and check
`CodeWashGame/bug-reports/<timestamp>.json`.

```bash
ls bug-reports
cat bug-reports/*.json | head -40
```

The receiver validates JSON and returns `{ "ok": true, "file": ... }`; the form shows
a success message only when the endpoint returns a 2xx response.

## Tests

- `src/lib/bugReport.test.js` — payload, game files, transport success/failure.
- `src/lib/logBuffer.test.js` — log ring buffer.
- `src/hooks/useBugReportSettings.test.jsx` — endpoint persistence.
- `src/components/modals/BugReportModal.test.jsx` — form, screenshots, success/error.

## Privacy

Logs and game files are included only when the user leaves “Include recent logs and
saved game files” checked. Screenshots are opt-in via the file picker.
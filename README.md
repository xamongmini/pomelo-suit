# Pomelo Suite

Open-source web UI components for Pomelo Suite.

The public workspace currently starts with SpanGrid. Additional components will
be added here as they are prepared, documented, and ready for release.

## Package

| Package | Install | Purpose |
|---|---|---|
| `@pomelo-suite/spangrid` | `npm install @pomelo-suite/spangrid` | Advanced data grid with span support |

## Workspace

This repository uses npm workspaces and points only at `packages/spangrid`.
The package includes its own README, license, package manifest, source, docs,
and focused tests. Browser examples live under `examples/spangrid`.

```bash
npm run check
npm run pack:dry-run
```

## Examples

Open `examples/spangrid/index.html` or `examples/spangrid/showcase.html` in a
browser. They are static HTML files and do not require a local server.

## License

MIT

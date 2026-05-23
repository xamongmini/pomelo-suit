# Pomelo Suite Package Restructure Design

## Context

Pomelo Suite is an open-source package family that will later be used by Xamong, but it must stand on its own as a separate npm organization. The current repository root already describes the intended public scope as `@pomelo-suite/*`, while `drafts/libs` contains source material that is not currently tracked as production package code.

The current draft libraries are:

- `blender`: canvas-based input, color picker, and timeline widgets.
- `spangrid`: UMD canvas data grid with span, fixed rows/columns, HTML cell overlay, docs, and a Node regression test.
- `tumblr`: dependency-free CommonJS runtime containing work queue, scheduler, calculator/script kernel, agent workflow, and runtime core.
- `diagram`: browser diagram editor with canvas drawing, containers, linking, save/load/export, and a broken local `XCON.js` reference.

## Package Scope

Create an npm workspace under `packages/*` with these public packages:

| Package | Source | Status | Purpose |
|---|---|---|---|
| `@pomelo-suite/input` | `drafts/libs/blender/js/blender-text-input-pro.js` | stable | Canvas extended input control. |
| `@pomelo-suite/color-picker` | `drafts/libs/blender/js/blender-color-pricker.js` | stable | Canvas HSV color picker. |
| `@pomelo-suite/spangrid` | `drafts/libs/spangrid/span-grid.js` | stable | Advanced span grid/data grid. |
| `@pomelo-suite/timeline` | `drafts/libs/blender/js/blender-timeline-editor.js` | stable | Canvas timeline editor/control. |
| `@pomelo-suite/scheduler` | `drafts/libs/tumblr/src/scheduler/*` | stable | Node scheduler primitives. |
| `@pomelo-suite/workqueue` | `drafts/libs/tumblr/src/work/*` | stable | Node work queue and worker thread helpers. |
| `@pomelo-suite/calculator` | `drafts/libs/tumblr/src/core/script/*`, `src/core/formula/*` | stable | Expression and legacy script calculator. |
| `@pomelo-suite/diagram` | `drafts/libs/diagram/*` | experimental | Browser diagram editor. |
| `@pomelo-suite/runtime` | selected `drafts/libs/tumblr/src/core`, `src/agent`, `src/common` | experimental | Full runtime and agent workflow layer. |

Do not publish a `tumblr` package name. The public name is `runtime` to avoid coupling the package brand to the legacy internal name.

## Architecture

Use a Node/npm workspace monorepo:

```text
packages/
  input/
  color-picker/
  spangrid/
  timeline/
  scheduler/
  workqueue/
  calculator/
  diagram/
  runtime/
```

Each package owns its own `package.json`, `README.md`, source files, and tests. The root `package.json` becomes a private workspace orchestrator with commands for syntax checks and package tests.

Initial package source remains CommonJS/UMD where the drafts already use that format. Avoid introducing a build system in the first restructure. Browser packages keep direct `<script>` use available and expose `require(...)` for Node-based tests when the draft file can be wrapped without changing browser behavior.

## Dependency Boundaries

The first pass minimizes cross-package coupling:

- `@pomelo-suite/spangrid` is self-contained.
- `@pomelo-suite/input`, `@pomelo-suite/color-picker`, and `@pomelo-suite/timeline` are self-contained browser packages.
- `@pomelo-suite/calculator` includes `DataTypeCheck`, `ExQueue`, `ExStack`, `Calculator`, token classes, and `evaluateExpression`.
- `@pomelo-suite/scheduler` is self-contained except for Node built-ins.
- `@pomelo-suite/workqueue` includes core work queue classes and worker-thread helpers. CPU task helpers stay internal to the package for the first release so existing worker-thread behavior remains testable.
- `@pomelo-suite/runtime` copies the current runtime files intact for the first release to preserve behavior. Cross-package dependency extraction is a future cleanup.
- `@pomelo-suite/diagram` does not depend on a missing `XCON.js`. Replace the broken error call with a local safe logger.

## Known Issues To Address During Restructure

- `spangrid` code reports version `1.2.1`, while README/API/tests still mention `1.2.0`.
- `spangrid` test mock is missing `fillRect`, so the current regression test fails before later mismatches are visible.
- `spangrid` test expectations conflict with current behavior for `reserveScrollbarInViewport`, default locale, and demo-grid merge state.
- `diagram-editor-v1.5.html` references `../libs/XCON.js`, which does not exist in the repository.
- `diagram-core.js` calls `XCON.error(error)` in a load error path.
- `blender-color-pricker.js` has a typo in the file name. The public package exposes the correctly spelled package name and copies the source to `src/blender-color-picker.js`.
- `blender-text-input-pro.js` evaluates math expressions with `new Function(...)`. The package README must document that math mode is for trusted input only unless a safer expression parser is introduced.
- `tumblr/package.json` is private and `UNLICENSED`; package extraction must use the root MIT license for Pomelo Suite packages unless a later legal review changes it.

## Testing Strategy

Before moving code, preserve behavior with package-level smoke tests:

- Browser canvas packages: Node syntax checks plus minimal exported-class tests using mocked canvas/DOM objects.
- `spangrid`: repair the existing regression test so it reflects current intended behavior, then run it as the package test.
- `workqueue`, `scheduler`, `calculator`, and `runtime`: split or copy the relevant existing `tumblr/tests` coverage into package-local tests.
- Root `npm test` runs every package test.

Every behavior change or bug fix during implementation must follow test-first workflow. Pure packaging moves can use smoke tests that fail before files are copied into their package locations.

## Documentation Strategy

Update the root README to list all stable and experimental packages separately. Each package README includes:

- Installation command.
- One minimal usage example.
- Runtime environment: browser, Node, or both.
- Stability status.
- Important safety notes.
- License.

For package names requested by the user, keep the exact install commands:

```bash
npm install @pomelo-suite/input
npm install @pomelo-suite/color-picker
npm install @pomelo-suite/spangrid
npm install @pomelo-suite/timeline
npm install @pomelo-suite/scheduler
npm install @pomelo-suite/workqueue
npm install @pomelo-suite/calculator
```

Also document:

```bash
npm install @pomelo-suite/diagram
npm install @pomelo-suite/runtime
```

with an experimental warning.

## Non-Goals

- Do not convert the full codebase to TypeScript in this restructure.
- Do not introduce bundlers until package boundaries and tests are stable.
- Do not publish to npm from this task.
- Do not make Xamong-specific runtime assumptions inside the open-source package APIs.
- Do not keep `tumblr` as a public package brand.

## Success Criteria

- Root repository is a valid npm workspace.
- Stable packages and experimental packages have package manifests and READMEs.
- Package tests run from the root.
- Existing draft source remains available as ignored source material, but production package code lives under `packages/*`.
- README reflects the final package set and install commands.
- Known broken references and mismatched tests are either fixed or explicitly documented in the implementation report.

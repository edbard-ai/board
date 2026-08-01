# Board Module (`lib/board`)

This module exports the canvas `Board` class, animation renderer, geometric utilities, type definitions, and pre-built visualization examples.

For complete API documentation and usage guide, refer to the root [README.md](../../README.md).

## Re-exported Modules (`index.ts`)

- [`board.ts`](./board.ts) - `Board` class implementation
- [`types.ts`](./types.ts) - TypeScript interfaces, drawing options, and `DrawItem` discriminated unions
- [`shapes.ts`](./shapes.ts) - Spline, polynomial, polygon, and arrowhead geometric generators
- [`animation/`](./animation) - Queue runners, renderers, and canvas slide transition logic
- [`examples/`](./examples) - Preset visualizer examples (e.g. `runBinarySearchExample`)

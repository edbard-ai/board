# HTML5 / DOM SVG Board Library (`edbard-board`)

A high-performance interactive 2D whiteboard, rendering engine, and animation library for building presentation slides, math diagrams, code snippets, structured tables, and animated visualizer sequences.

---

## Table of Contents

- [Overview](#overview)
- [Module Exports](#module-exports)
- [Quick Start](#quick-start)
- [Core Architecture & Concepts](#core-architecture--concepts)
  - [DOM-Based SVG & CSS Pipeline](#dom-based-svg--css-pipeline)
  - [Semantic & Responsive Percentage Coordinates](#semantic--responsive-percentage-coordinates)
  - [Trigger & Animation Queue](#trigger--animation-queue)
- [Declarative JSON Script API (`processScript`)](#declarative-json-script-api-processscript)
- [Board Class API](#board-class-api)
  - [Constructor & Options](#constructor--options)
  - [State & Canvas Methods](#state--canvas-methods)
  - [Trigger & Queue Control](#trigger--queue-control)
  - [Drawing Primitives & Shapes](#drawing-primitives--shapes)
  - [Text, Paragraphs & Math (KaTeX)](#text-paragraphs--math-katex)
  - [Advanced Visual Components & Box Layout](#advanced-visual-components--box-layout)
- [Shapes & Math Utilities](#shapes--math-utilities)
- [Type Definitions](#type-definitions)
- [Example Usage](#example-usage)

---

## Overview

The `edbard-board` library provides a feature-rich, high-performance rendering engine that supports both programmatic imperative drawing and JSON-based script playback (`processScript`). It supports smooth keyframe transitions, multi-point spline curves, semantic responsive layouts, formatted dark-mode code blocks, KaTeX math formula rendering, and slide transitions.

- Entry file: [`lib/board/index.ts`](file:///home/adhil/projects/study-companion/board/lib/board/index.ts)  
- Main class file: [`lib/board/board.ts`](file:///home/adhil/projects/study-companion/board/lib/board/board.ts)

---

## Module Exports

Import directly from `lib/board`:

```typescript
import { Board, runBinarySearchExample } from '@/lib/board';
import type { BoardOptions, SemanticPoint, DrawItem, BoardScriptCommand } from '@/lib/board';
```

---

## Quick Start

### 1. Imperative Animation Queue

```typescript
import { Board } from '@/lib/board';

const board = new Board('canvas-container-id', 800, 600, {
    background: '#0d1117',
    speed: 15,
    fontFamily: '"Playpen Sans", sans-serif'
});

board.beginTrigger();

board.writeText({
    text: 'Whiteboard Presentation',
    x: 'center',
    y: 50,
    fontSize: 28,
    color: '#4dd0e1',
    underline: true
});

board.drawRect({
    x: 'center',
    y: 120,
    width: '60%',
    height: 100,
    color: '#ffffff',
    fillColor: '#161b22',
    radius: 12
});

board.completeTrigger();
```

### 2. Declarative JSON Script Execution

```typescript
board.processScript([
    { action: "slideOutLeft", duration: 500 },
    { action: "text", text: "Interactive STEM Lesson", x: "center", y: "10%", fontSize: 32, color: "#4dd0e1" },
    { action: "math", formula: "E = mc^2", x: "center", y: "30%", fontSize: 36, color: "#f43f5e" },
    { action: "wait", duration: 1000 }
]);
```

---

## Core Architecture & Concepts

### DOM-Based SVG & CSS Pipeline
The rendering pipeline converts whiteboard items into crisp HTML5 SVG elements and styled CSS nodes. This allows sub-pixel precision, crisp text rendering on Retina/High-DPI screens, and native text selection.

### Semantic & Responsive Percentage Coordinates
Coordinates and dimensions can be provided as numbers (pixels) or string values for responsive scaling across different container sizes:
- **X Coordinates (`XCoord`)**: `number | 'center' | 'left' | 'right' | "${number}%"`
- **Y Coordinates (`YCoord`)**: `number | 'center' | 'top' | 'bottom' | "${number}%"`
- **Dimensions (`SizeCoord`)**: `number | "${number}%"`

For example, `x: "50%"`, `y: "20%"`, `width: "80%"` scale responsively regardless of aspect ratio.

### Trigger & Animation Queue
1. **Immediate Mode**: Calling draw methods outside a trigger block renders items immediately.
2. **Recorded Queue Mode**: `board.beginTrigger()` records all subsequent draw actions, movements (`move()`), pauses (`wait()`), color updates (`changeColor()`), and slide transitions (`slideOutLeft()`). `board.completeTrigger()` then initiates continuous step-by-step queue playback.

---

## Declarative JSON Script API (`processScript`)

The `processScript(commands: BoardScriptCommand[])` method compiles and animates an array of JSON command objects.

### Available JSON Action Commands

| Action Command | Description & Key Parameters |
| :--- | :--- |
| `text` | Single line text. `{ action: "text", text, x, y, fontSize, color, textAlign, fontWeight, fontStyle, textDecoration, underline }` |
| `paragraph` | Auto-wrapping multi-line text. `{ action: "paragraph", text, x, y, width, lineHeight, fontSize, color }` |
| `line` | Line segment. `{ action: "line", x1, y1, x2, y2, color, lineDash }` |
| `rect` | Outlined/filled rounded rectangle. `{ action: "rect", x, y, width, height, color, fillColor, radius }` |
| `fillRect` | Filled rounded rectangle. `{ action: "fillRect", x, y, width, height, fillColor, radius }` |
| `circle` | Circle or circular arc. `{ action: "circle", cx, cy, radius, color, fillColor }` |
| `ellipse` | Rotated ellipse. `{ action: "ellipse", cx, cy, radiusX, radiusY, rotation, color, fillColor }` |
| `arrow` | Directed arrow line. `{ action: "arrow", x1, y1, x2, y2, color, headSize }` |
| `image` | Image element. `{ action: "image", src, x, y, width, height, opacity }` |
| `codeBlock` | Syntax highlighted code block. `{ action: "codeBlock", code, language, x, y, width, height, fontSize }` |
| `table` | Data table with styled headers. `{ action: "table", data, x, y, cellWidth, cellHeight, headerBgColor, textColor }` |
| `math` | KaTeX formatted math formula. `{ action: "math", formula, x, y, fontSize, color, displayMode }` |
| `polygon` | Multi-vertex closed polygon. `{ action: "polygon", points, color, fillColor }` |
| `diamond` | Diamond shape. `{ action: "diamond", cx, cy, width, height, color, fillColor }` |
| `gridAxes` | Coordinate background grid. `{ action: "gridAxes", x, y, width, height, step, color }` |
| `gradientRect` | Linear gradient rectangle. `{ action: "gradientRect", x, y, width, height, colors, direction }` |
| `pointer` | Indicator pointer dot. `{ action: "pointer", x, y, color, size }` |
| `highlight` | Semi-transparent highlight box. `{ action: "highlight", x, y, width, height, color }` |
| `box` | Flex layout container box. `{ action: "box", x, y, width, height, padding, gap, direction, items }` |
| `wait` | Pause queue execution. `{ action: "wait", duration: 1000 }` |
| `clear` | Instant clear. `{ action: "clear" }` |
| `slideOutLeft` | Slide out previous content and clear. `{ action: "slideOutLeft", duration: 500 }` |

---

## Board Class API

### Constructor & Options

```typescript
new Board(id: string, width: number, height: number, options?: BoardOptions)
```

Options:
- `speed` (default `15`): Animation execution speed multiplier.
- `background`: CSS background color string.
- `hiDpi` (default `true`): Enable High-DPI screen pixel ratio scaling.
- `fontFamily` (default `"Playpen Sans", sans-serif`): Default text font family.
- `fitMode` (`'contain' | 'cover' | 'fill'`): Responsive container fitting mode.
- `responsive` (default `true`): Automatically observe and adjust to container resize events.

### Trigger & Queue Control

- `beginTrigger()`: Resets queue and starts recording mode.
- `completeTrigger()`: Finishes recording and starts step-by-step playback.
- `wait(durationMs: number)`: Inserts a delay into the animation sequence.
- `delete(id: string, durationMs?: number)`: Animates removal of an element by ID.
- `move(id: string, dx: number, dy: number, durationMs?: number)`: Animates relative movement.
- `moveTo(id: string, x: XCoord, y: YCoord, durationMs?: number)`: Animates movement to absolute target position.
- `changeColor(id: string, color: string, durationMs?: number)`: Animates color transition.
- `slideOutLeft(durationMs?: number)`: Animates a left slide-out transition and clears board content.

### Drawing Primitives & Shapes

- `drawLine(options: DrawLineOptions): string`
- `drawRect(options: DrawRectOptions): string`
- `fillRect(options: FillRectOptions): string`
- `drawCircle(options: DrawCircleOptions): string`
- `drawEllipse(options: DrawEllipseOptions): string`
- `drawArrow(options: DrawArrowOptions): string`
- `drawPolygon(options: DrawPolygonOptions): string`
- `fillPolygon(options: FillPolygonOptions): string`
- `drawRegularPolygon(options: DrawRegularPolygonOptions): string`
- `drawDiamond(options: DrawDiamondOptions): string`
- `drawPolynomial(options: DrawPolynomialOptions): string`

### Text, Paragraphs & Math (KaTeX)

- `writeText(options: WriteTextOptions): string`  
  Supports `textDecoration` (e.g. `'underline'`) and `underline: true`.
- `writeParagraph(options: WriteParagraphOptions): string`  
  Renders auto-wrapping paragraph text bounded by a specified width.
- `writeMath(options: WriteMathOptions): string`  
  Renders LaTeX mathematical equations formatted with KaTeX (`formula: "\\int_0^\\infty e^{-x^2} dx"`).

### Advanced Visual Components & Box Layout

- `drawCodeBlock(options: DrawCodeBlockOptions): string`  
  Renders code blocks with background paneling and monospace typography.
- `drawTable(options: DrawTableOptions): string`  
  Renders grid tables with custom header and row styling.
- `drawBox(options: DrawBoxOptions): string`  
  Flex container box that stacks nested items horizontally or vertically with custom padding and gap alignment.

---

## Type Definitions

Located in [`lib/board/types.ts`](file:///home/adhil/projects/study-companion/board/lib/board/types.ts).

---

## Example Usage

```typescript
import { Board } from '@/lib/board';

const board = new Board('board-root', 1920, 1080);

board.processScript([
    { action: "slideOutLeft", duration: 400 },
    { action: "text", text: "Pythagorean Theorem", x: "center", y: "15%", fontSize: 32, color: "#4dd0e1", underline: true },
    { action: "math", formula: "a^2 + b^2 = c^2", x: "center", y: "35%", fontSize: 40, color: "#ffffff" },
    { action: "wait", duration: 800 },
    { action: "paragraph", text: "In any right-angled triangle, the area of the square whose side is the hypotenuse is equal to the sum of the areas of the squares on the other two sides.", x: "15%", y: "55%", width: "70%", fontSize: 20, color: "#94a3b8" }
]);
```

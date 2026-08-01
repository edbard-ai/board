# Canvas Board Library

An animated, high-performance HTML5 Canvas whiteboard and presentation engine for rendering shapes, text, code blocks, tables, math functions, and step-by-step algorithmic visualizer animations.

---

## Table of Contents

- [Overview](#overview)
- [Module Exports](#module-exports)
- [Quick Start](#quick-start)
- [Core Concepts](#core-concepts)
  - [High-DPI / Retina Scaling](#high-dpi--retina-scaling)
  - [Semantic Coordinates](#semantic-coordinates)
  - [Trigger & Animation Queue](#trigger--animation-queue)
- [Board Class API](#board-class-api)
  - [Constructor & Initialization](#constructor--initialization)
  - [State & Canvas Methods](#state--canvas-methods)
  - [Trigger & Queue Control](#trigger--queue-control)
  - [Drawing Primitives & Shapes](#drawing-primitives--shapes)
  - [Text & Formatting](#text--formatting)
  - [Advanced Visual Components](#advanced-visual-components)
- [Shapes & Math Utilities](#shapes--math-utilities)
- [Type Definitions](#type-definitions)
- [Example Usage](#example-usage)

---

## Overview

The `Board` library provides a rich API on top of the standard HTML5 2D Canvas context (`CanvasRenderingContext2D`). It allows synchronous direct drawing or recorded, step-by-step animated queues with smooth transitions, Catmull-Rom spline curves, semantic layout alignment, dark-mode tables, syntax-highlighted code blocks, and dynamic element transformations.

Entry file: [`lib/board/index.ts`](file:///home/adhil/projects/study-companion/board/lib/board/index.ts)  
Main class file: [`lib/board/board.ts`](file:///home/adhil/projects/study-companion/board/lib/board/board.ts)

---

## Module Exports

Import everything directly from `lib/board`:

```typescript
import { Board, runBinarySearchExample } from '@/lib/board';
import type { BoardOptions, SemanticPoint, DrawItem } from '@/lib/board';
```

`lib/board/index.ts` re-exports:
- [`lib/board/board.ts`](file:///home/adhil/projects/study-companion/board/lib/board/board.ts) - The `Board` class and type re-exports.
- [`lib/board/types.ts`](file:///home/adhil/projects/study-companion/board/lib/board/types.ts) - Interfaces, options objects, and discriminated union `DrawItem`.
- [`lib/board/shapes.ts`](file:///home/adhil/projects/study-companion/board/lib/board/shapes.ts) - Geometry calculation utilities (splines, polygons, arrows, arcs, polynomials).
- [`lib/board/animation`](file:///home/adhil/projects/study-companion/board/lib/board/animation/index.ts) - Renderers, runners, and transitions.
- [`lib/board/examples`](file:///home/adhil/projects/study-companion/board/lib/board/examples/index.ts) - Pre-built visualization sequences (e.g. binary search).

---

## Quick Start

```typescript
import { Board } from '@/lib/board';

const board = new Board('canvas-container-id', 800, 600, {
    background: '#0d1117',
    speed: 15,
    fontFamily: '"Playpen Sans", sans-serif'
});

board.beginTrigger();

board.writeText({
    text: 'Hello World',
    x: 'center',
    y: 50,
    fontSize: 28,
    color: '#4dd0e1'
});

board.drawRect({
    x: 'center',
    y: 120,
    width: 200,
    height: 100,
    color: '#ffffff',
    fillColor: '#161b22',
    radius: 12
});

board.completeTrigger();
```

---

## Core Concepts

### High-DPI / Retina Scaling
The `Board` automatically detects `window.devicePixelRatio` and scales the canvas internal buffer while maintaining CSS pixel dimensions, ensuring crisp text and sharp lines on modern high-resolution displays.

### Semantic Coordinates
Coordinates can be specified as absolute numbers or semantic horizontal (`XCoord`) and vertical (`YCoord`) string keywords:
- `XCoord`: `number | 'center' | 'left' | 'right'`
- `YCoord`: `number | 'center' | 'top' | 'bottom'`
- `SemanticPoint`: `{ x: XCoord, y: YCoord }`

You can pass `{ x: 'center', y: 'center' }` or `board.center()` anywhere a point or coordinate is expected.

### Trigger & Animation Queue
Drawing methods operate in two modes:
1. **Immediate Mode**: Calling draw methods outside a trigger block renders directly to the canvas context instantly.
2. **Recorded Queue Mode**: Calling `board.beginTrigger()` starts queueing drawing actions, waits (`wait()`), moves (`move()`), color changes (`changeColor()`), and deletes (`delete()`). Calling `board.completeTrigger()` executes the queue as a step-by-step animation.

---

## Board Class API

### Constructor & Initialization

```typescript
new Board(id: string, width: number, height: number, options?: BoardOptions)
```

- `id`: Container HTML element ID.
- `width`: Logical width in CSS pixels.
- `height`: Logical height in CSS pixels.
- `options`: Optional `BoardOptions` configuration object:
  - `speed` (default `15`): Animation queue execution speed multiplier.
  - `background`: CSS background color string for the container.
  - `hiDpi` (default `true`): Enable device pixel ratio scaling.
  - `fontFamily` (default `"Playpen Sans", sans-serif`): Default font family.

### State & Canvas Methods

- `setColor(color: string)`: Sets default stroke/text color (`board.color`).
- `setLineWidth(width: number)`: Sets default stroke width (`board.lineWidth`).
- `setSpeed(speed: number)`: Updates animation playback speed.
- `setOpacity(alpha: number)`: Sets canvas `globalAlpha` (0 to 1).
- `setLineDash(segments: number[])`: Sets dashed line pattern (e.g. `[5, 5]`).
- `save()`: Pushes current state (color, line width, opacity, line dash) onto the state stack and saves standard canvas context.
- `restore()`: Pops state stack and restores standard canvas context.
- `setBackground(color: string)`: Sets container element background color.
- `clear()`: Clears logical canvas area.
- `center()`: Returns `{ x: 'center', y: 'center' }`.

### Trigger & Queue Control

- `beginTrigger()`: Resets item ID counter, clears queue, enables recording mode.
- `completeTrigger()`: Disables recording mode and initiates queue playback.
- `wait(durationMs: number)`: Adds a pause delay into the animation queue.
- `delete(id: string, durationMs?: number)`: Animates removal of an item by ID (aliases: `deleteComponent`, `remove`).
- `move(id: string, dx: number, dy: number, durationMs?: number)`: Animates delta movement of an item.
- `moveTo(id: string, x: XCoord, y: YCoord, durationMs?: number)`: Animates movement of an item to a target position.
- `changeColor(id: string, color: string, durationMs?: number)`: Animates color interpolation of an item.
- `slideOutLeft(durationMs?: number)`: Animates canvas slide-out transition and clears content (aliases: `clearWithSlideLeft`, `slideLeft`).

### Drawing Primitives & Shapes

All drawing methods return a unique item ID (`string`) for tracking, manipulation, and keyframe animations.

- `drawLine(options: DrawLineOptions): string`  
  Draws a line segment between `(x1, y1)` and `(x2, y2)`.

- `drawRect(options: DrawRectOptions): string`  
  Draws a stroke/fill rounded rectangle.

- `fillRect(options: FillRectOptions): string`  
  Draws a filled rounded rectangle.

- `drawGradientRect(options: DrawGradientRectOptions): string`  
  Draws a linear gradient rectangle (`'horizontal' | 'vertical' | 'diagonal'`).

- `drawCircle(options: DrawCircleOptions): string`  
  Draws a circle or circular arc centered at `(cx, cy)`.

- `drawEllipse(options: DrawEllipseOptions): string`  
  Draws a rotated ellipse centered at `(cx, cy)`.

- `drawArc(options: DrawArcOptions): string`  
  Draws a arc given center, radius, start angle, and end angle.

- `drawPolygon(options: DrawPolygonOptions): string`  
  Draws a closed multi-vertex polygon.

- `fillPolygon(options: FillPolygonOptions): string`  
  Fills a closed multi-vertex polygon.

- `drawRegularPolygon(options: DrawRegularPolygonOptions): string`  
  Draws an $N$-sided regular polygon.

- `drawDiamond(options: DrawDiamondOptions): string`  
  Draws a diamond shape given center, width, and height.

- `drawPolynomial(options: DrawPolynomialOptions): string`  
  Plots a polynomial curve given an array of coefficients $[c_0, c_1, c_2, \dots]$ where $y = \sum c_i x^i$.

- `drawArrow(options: DrawArrowOptions): string`  
  Draws a line with an arrowhead pointing at `(x2, y2)`.

- `drawPath(points: Point[], color: string, smooth?: boolean): string`  
  Draws a continuous multi-point path with optional Catmull-Rom spline smoothing.

- `drawImage(options: DrawImageOptions): string`  
  Renders an HTML Image element or image URL source.

### Text & Formatting

- `writeText(options: WriteTextOptions): string` (alias: `drawText`)  
  Writes single-line text with custom font size, weight, baseline, and alignment.

- `writeParagraph(options: WriteParagraphOptions): string`  
  Renders auto-wrapping multi-line paragraph text constrained to a bounding width.

### Advanced Visual Components

- `drawPointer(x: XCoord, y: YCoord, color?: string, size?: number, id?: string): string`  
  Draws an animated indicator pointer dot.

- `highlightRect(x: XCoord, y: YCoord, width: number, height: number, color?: string, id?: string): string`  
  Overlays a semi-transparent rectangle highlighter.

- `drawGridAxes(options: DrawGridAxesOptions): string`  
  Draws a background coordinate grid with prominent center axes.

- `drawCodeBlock(options: DrawCodeBlockOptions): string`  
  Renders a dark syntax-style formatted multi-line code block container.

- `drawTable(options: DrawTableOptions): string` (aliases: `createTable`, `writeTable`)  
  Draws a grid table component complete with styled headers, alternating row colors, and cell text alignment.

---

## Shapes & Math Utilities

Exported from [`lib/board/shapes.ts`](file:///home/adhil/projects/study-companion/board/lib/board/shapes.ts):

- `getCatmullRomPoint(p0, p1, p2, p3, t)`: Interpolates Catmull-Rom curve point at parameter $t$.
- `getSmoothSplinePoints(points, stepsPerSegment)`: Converts discrete points into smooth spline points.
- `getRectPathPoints(posX, posY, width, height, radius)`: Computes rounded rectangle path vertices.
- `getDiamondPolygonPoints(centerPos, width, height)`: Computes diamond vertices.
- `getRegularPolygonPoints(centerPos, sides, radius, rotation)`: Computes regular polygon vertices.
- `getPolynomialPoints(coefficients, rangeX, step, scaleX, scaleY, origin)`: Computes canvas coordinates for polynomial plotting.
- `getArrowHeadLines(x1, y1, x2, y2, headSize)`: Computes arrowhead line coordinates.
- `getArcPoints(...)`: Computes points along a circular arc.
- `getCirclePoints(...)`: Computes points along a circle.
- `getEllipsePoints(...)`: Computes points along an ellipse.

---

## Type Definitions

Located in [`lib/board/types.ts`](file:///home/adhil/projects/study-companion/board/lib/board/types.ts):

```typescript
export interface Point {
    x: number;
    y: number;
}

export type XCoord = number | 'center' | 'left' | 'right';
export type YCoord = number | 'center' | 'top' | 'bottom';

export interface SemanticPoint {
    x: XCoord;
    y: YCoord;
}

export interface BoardOptions {
    width?: number;
    height?: number;
    speed?: number;
    background?: string;
    hiDpi?: boolean;
    fontFamily?: string;
}
```

---

## Example Usage

An algorithm visualizer example in [`lib/board/examples/binarySearch.ts`](file:///home/adhil/projects/study-companion/board/lib/board/examples/binarySearch.ts):

```typescript
import { Board } from '@/lib/board';

export function runBinarySearchExample(board: Board) {
    board.beginTrigger();

    board.writeText({
        text: 'Binary Search Visualizer',
        x: 'center',
        y: 40,
        fontSize: 28,
        color: '#4dd0e1',
        fontWeight: '700',
        textAlign: 'center'
    });

    board.wait(1000);

    const startX = 125;
    const startY = 190;
    board.drawRect({ x: startX, y: startY, width: 600, height: 55, color: '#fff', radius: 6 });

    const elements = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91];
    elements.forEach((el, i) => {
        if (i > 0) {
            board.drawLine({ x1: startX + i * 60, y1: startY, x2: startX + i * 60, y2: startY + 55, color: '#fff' });
        }
        board.writeText({
            text: el.toString(),
            x: startX + i * 60 + 30,
            y: startY + 36,
            fontSize: 20,
            color: '#fff',
            textAlign: 'center'
        });
    });

    const highlightId = board.highlightRect(startX + 4 * 60, startY, 60, 55, 'rgba(255, 138, 128, 0.4)');
    board.wait(1000);
    board.move(highlightId, 60, 0, 600);
    board.changeColor(highlightId, 'rgba(77, 208, 225, 0.4)', 600);

    board.completeTrigger();
}
```

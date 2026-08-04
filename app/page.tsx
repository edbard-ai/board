"use client"
import { Board, BoardScriptCommand, Scene3D, Board3D } from "@/lib/board"
import { useEffect, useState } from "react"

const boardUsagesDocs = `
# 🎨 Board Whiteboard Scripting Reference

The Board engine renders animated vector graphics and whiteboard steps from a structured JSON array of commands.

---

## 📐 Coordinate & Sizing Measurement System

The Board uses a flexible measurement system supporting both relative/responsive values and fixed pixels.

### 1. Position Coordinates (\`XCoord\`, \`YCoord\`)
- **Percentages (\`string\`)**: **[RECOMMENDED]** Percentage relative to logical canvas bounds (e.g., \`"50%"\`, \`"10%"\`, \`"85%"\`). Ensures 100% responsive scaling across all screen sizes.
- **Keywords (\`string\`)**:
  - \`x\`: \`"left"\` (\`0%\`), \`"center"\` (\`50%\`), \`"right"\` (\`100%\`)
  - \`y\`: \`"top"\` (\`0%\`), \`"center"\` (\`50%\`), \`"bottom"\` (\`100%\`)
- **Absolute Pixels (\`number\`)**: Direct pixel values (e.g., \`100\`, \`450\`). *Note: Fixed pixels do not adapt dynamically if aspect ratio changes.*

### 2. Dimension Coordinates (\`SizeCoord\`)
- **Percentages (\`string\`)**: Percentage relative to logical canvas width or height (e.g., \`"80%"\`, \`"35%"\`).
- **Absolute Pixels (\`number\`)**: Fixed pixel size (e.g., \`24\` for font size, \`200\` for width).

---

## 📋 Available Commands & Schemas

### ✏️ Text & Typography
- **\`text\`**: Draw single or multi-line text (newline \`\\n\` supported).
  \`{ "action": "text", "text": "Header", "x": "center", "y": "10%", "fontSize": 32, "color": "#00ffcc", "fontWeight": "bold", "textAlign": "center" }\`
- **\`paragraph\`**: Multiline auto-wrapped text block.
  \`{ "action": "paragraph", "text": "Explanation text...", "x": "10%", "y": "25%", "width": "80%", "fontSize": 20, "lineHeight": 1.6, "color": "#ffffff" }\`
- **\`codeBlock\`**: Syntax-styled code block.
  \`{ "action": "codeBlock", "code": "const x = 10;", "language": "javascript", "x": "15%", "y": "30%", "width": "70%", "fontSize": 16 }\`
- **\`math\`**: Render LaTeX mathematical formula via KaTeX.
  \`{ "action": "math", "formula": "\\\\int_0^\\\\infty e^{-x^2} dx = \\\\frac{\\\\sqrt{\\\\pi}}{2}", "x": "center", "y": "40%", "fontSize": 28, "color": "#f1c40f" }\`

### 📐 Shapes & Vectors
- **\`line\`**: Draw straight or dashed line between two points.
  \`{ "action": "line", "x1": "10%", "y1": "15%", "x2": "90%", "y2": "15%", "color": "#f1c40f", "lineDash": [5, 5] }\`
- **\`arrow\`**: Draw directional arrow.
  \`{ "action": "arrow", "x1": "20%", "y1": "30%", "x2": "80%", "y2": "30%", "color": "#00ffcc", "headSize": 14 }\`
- **\`rect\`**: Outline or filled rectangle with rounded corners.
  \`{ "action": "rect", "x": "20%", "y": "30%", "width": "60%", "height": "40%", "color": "#00ffcc", "fillColor": "#071317", "radius": 12 }\`
- **\`fillRect\`**: Filled solid rectangle.
  \`{ "action": "fillRect", "x": "10%", "y": "20%", "width": "80%", "height": "50%", "fillColor": "#161b22", "radius": 8 }\`
- **\`gradientRect\`**: Gradient rectangle.
  \`{ "action": "gradientRect", "x": "10%", "y": "20%", "width": "80%", "height": "50%", "colors": ["#071317", "#1e293b"], "direction": "vertical" }\`
- **\`circle\`**: Draw circle by center (\`cx\`, \`cy\`) and \`radius\`.
  \`{ "action": "circle", "cx": "50%", "cy": "50%", "radius": "15%", "color": "#00ffcc", "fillColor": "#0f172a" }\`
- **\`ellipse\`**: Draw ellipse with \`radiusX\` & \`radiusY\`.
  \`{ "action": "ellipse", "cx": "50%", "cy": "50%", "radiusX": "20%", "radiusY": "10%", "rotation": 0, "color": "#ffffff" }\`
- **\`diamond\`**: Flowchart diamond shape.
  \`{ "action": "diamond", "cx": "50%", "cy": "50%", "width": "30%", "height": "20%", "color": "#f1c40f" }\`
- **\`polygon\`**: Multi-point custom polygon.
  \`{ "action": "polygon", "points": [{ "x": "50%", "y": "10%" }, { "x": "80%", "y": "60%" }, { "x": "20%", "y": "60%" }], "color": "#00ffcc", "fillColor": "#071317" }\`
- **\`table\`**: Data table grid.
  \`{ "action": "table", "data": [["Header 1", "Header 2"], ["Val 1", "Val 2"]], "x": "15%", "y": "35%", "cellWidth": 120, "cellHeight": 40, "headerBgColor": "#1a2332", "headerTextColor": "#00ffcc" }\`
- **\`box\`**: Container with flex-like auto layout, padding, gap, and auto center alignment for child elements.
  \`{ "action": "box", "x": "center", "y": "50%", "direction": "horizontal", "alignHorizontal": "center", "gap": 16, "padding": 20, "fillColor": "#0f172a", "color": "#6366f1", "title": "Auto-Centered Box", "items": [{ "action": "rect", "width": 80, "height": 80, "fillColor": "#3b82f6" }, { "action": "text", "text": "Signal", "fontSize": 18, "color": "#ffffff" }] }\`

### 💡 Animation & Control
- **\`wait\`**: Pause animation playback. \`{ "action": "wait", "duration": 500 }\` (in milliseconds)
- **\`clear\`**: Clear board canvas. \`{ "action": "clear" }\`
- **\`slideOutLeft\`**: Slide board elements out to the left. \`{ "action": "slideOutLeft", "duration": 400 }\`
- **\`setBackground\`**: Set canvas background color. \`{ "action": "setBackground", "color": "#071317" }\`
- **\`setColor\`**: Set global default stroke color. \`{ "action": "setColor", "color": "#ffffff" }\`
- **\`setLineWidth\`**: Set global stroke width. \`{ "action": "setLineWidth", "width": 2 }\`
- **\`setSpeed\`**: Set drawing animation speed. \`{ "action": "setSpeed", "speed": 35 }\`

---

## 💡 Best Practices for Responsive Layouts

1. **Always use Percentages**: Prefer \`"10%"\`, \`"50%"\`, \`"80%"\` over hardcoded numbers like \`140\`, \`680\`.
2. **Title Alignment**: Use \`"x": "center"\` with \`"textAlign": "center"\` for titles to guarantee centered placement.
3. **Avoid Hardcoded Underlines**: Position lines relative to percentages (e.g., \`x1: "25%"\`, \`x2: "75%"\`).
4. **Spacing & Layout Flow**: Keep top headers around \`y: "5%"\` - \`"15%"\`, primary content in \`y: "20%"\` - \`"75%"\`, and notes below \`"80%"\`.

---

## 📝 Complete Example Script

\`\`\`json
[
  { "action": "setBackground", "color": "#071317" },
  { "action": "text", "text": "Logic Gates (Part 1)", "x": "center", "y": "8%", "fontSize": 32, "fontWeight": "bold", "color": "#f1c40f", "textAlign": "center" },
  { "action": "line", "x1": "30%", "y1": "14%", "x2": "70%", "y2": "14%", "color": "#f1c40f" },
  { "action": "wait", "duration": 400 },
  { "action": "text", "text": "Definition:", "x": "10%", "y": "22%", "fontSize": 22, "fontWeight": "bold", "color": "#00ffcc" },
  { "action": "paragraph", "text": "A physical device performing a logical operation on one or more inputs to produce a single output.", "x": "10%", "y": "28%", "width": "80%", "fontSize": 18, "lineHeight": 1.5, "color": "#ffffff" },
  { "action": "wait", "duration": 500 },
  { "action": "rect", "x": "10%", "y": "45%", "width": "80%", "height": "40%", "color": "#00ffcc", "fillColor": "#0f172a", "radius": 12 }
]
\`\`\`
`.trim();

const PRESET_SCRIPTS = [
  {
    name: "Logic Gates & Truth Table",
    script: JSON.stringify([
      { "action": "setBackground", "color": "#060d12" },
      { "action": "text", "text": "Logic Gates & Digital Circuits", "x": "center", "y": "8%", "fontSize": 32, "fontWeight": "bold", "color": "#4dd0e1", "textAlign": "center" },
      { "action": "line", "x1": "25%", "y1": "14%", "x2": "75%", "y2": "14%", "color": "#4dd0e1" },
      { "action": "wait", "duration": 300 },
      { "action": "paragraph", "text": "A logic gate is a building block of a digital circuit. Most logic gates have two inputs and one output.", "x": "10%", "y": "20%", "width": "80%", "fontSize": 18, "lineHeight": 1.5, "color": "#94a3b8" },
      { "action": "wait", "duration": 300 },
      { "action": "box", "x": "center", "y": "55%", "direction": "horizontal", "gap": 24, "padding": 24, "fillColor": "#0f172a", "color": "#38bdf8", "title": "AND Gate Truth Table", "items": [
        { 
          "action": "table", 
          "data": [["Input A", "Input B", "Output Y"], ["0", "0", "0"], ["0", "1", "0"], ["1", "0", "0"], ["1", "1", "1"]], 
          "cellWidth": 110, 
          "cellHeight": 36, 
          "headerBgColor": "#1e293b", 
          "headerTextColor": "#38bdf8", 
          "rowBgColor": "#0f172a", 
          "textColor": "#e2e8f0" 
        }
      ]}
    ], null, 2)
  },
  {
    name: "Math & Physics Formulas",
    script: JSON.stringify([
      { "action": "setBackground", "color": "#090d16" },
      { "action": "text", "text": "Calculus & Quantum Mechanics", "x": "center", "y": "8%", "fontSize": 32, "fontWeight": "bold", "color": "#fbbf24", "textAlign": "center" },
      { "action": "wait", "duration": 300 },
      { "action": "text", "text": "1. Gaussian Integral:", "x": "10%", "y": "20%", "fontSize": 20, "color": "#38bdf8", "fontWeight": "bold" },
      { "action": "math", "formula": "\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}", "x": "center", "y": "28%", "fontSize": 28, "color": "#fbbf24" },
      { "action": "wait", "duration": 400 },
      { "action": "text", "text": "2. Time-Dependent Schrödinger Equation:", "x": "10%", "y": "42%", "fontSize": 20, "color": "#38bdf8", "fontWeight": "bold" },
      { "action": "math", "formula": "i\\hbar \\frac{\\partial}{\\partial t}\\Psi(\\mathbf{r},t) = \\hat{H}\\Psi(\\mathbf{r},t)", "x": "center", "y": "52%", "fontSize": 28, "color": "#34d399" },
      { "action": "wait", "duration": 400 },
      { "action": "rect", "x": "10%", "y": "68%", "width": "80%", "height": "22%", "color": "#475569", "fillColor": "#1e293b", "radius": 12 },
      { "action": "text", "text": "Euler's Identity:", "x": "15%", "y": "72%", "fontSize": 18, "color": "#94a3b8" },
      { "action": "math", "formula": "e^{i\\pi} + 1 = 0", "x": "center", "y": "80%", "fontSize": 26, "color": "#f43f5e" }
    ], null, 2)
  },
  {
    name: "Code & Complexity Flow",
    script: JSON.stringify([
      { "action": "setBackground", "color": "#030712" },
      { "action": "text", "text": "Algorithm Execution Flow", "x": "center", "y": "8%", "fontSize": 32, "fontWeight": "bold", "color": "#a855f7", "textAlign": "center" },
      { "action": "wait", "duration": 300 },
      { "action": "codeBlock", "code": "function fibonacci(n: number): number {\n  if (n <= 1) return n;\n  return fibonacci(n - 1) + fibonacci(n - 2);\n}", "language": "typescript", "x": "8%", "y": "22%", "width": "42%", "height": 220, "fontSize": 16 },
      { "action": "wait", "duration": 400 },
      { "action": "arrow", "x1": "53%", "y1": "35%", "x2": "59%", "y2": "35%", "color": "#a855f7", "headSize": 16 },
      { "action": "box", "x": "78%", "y": "35%", "direction": "vertical", "gap": 12, "padding": 16, "fillColor": "#1e1b4b", "color": "#818cf8", "title": "Complexity Analysis", "items": [
        { "action": "text", "text": "Time: O(2^n)", "fontSize": 16, "color": "#f43f5e" },
        { "action": "text", "text": "Space: O(n)", "fontSize": 16, "color": "#fbbf24" }
      ]},
      { "action": "wait", "duration": 500 },
      { "action": "highlight", "x": "7%", "y": "21%", "width": "44%", "height": "28%", "color": "rgba(168, 85, 247, 0.2)" },
      { "action": "paragraph", "text": "Optimizing recursion with Memoization reduces Time Complexity to O(n) and improves efficiency drastically.", "x": "8%", "y": "65%", "width": "84%", "fontSize": 18, "lineHeight": 1.6, "color": "#e2e8f0" }
    ], null, 2)
  },
  {
    name: "Multi-Slide Presentation",
    script: JSON.stringify([
      { "action": "setBackground", "color": "#090d16" },
      { "action": "text", "text": "Slide 1: Intro to DOM Board", "x": "center", "y": "30%", "fontSize": 36, "fontWeight": "bold", "color": "#38bdf8", "textAlign": "center" },
      { "action": "paragraph", "text": "Native HTML and SVG powered board for smooth whiteboard animations.", "x": "center", "y": "45%", "width": "60%", "fontSize": 20, "color": "#94a3b8", "textAlign": "center" },
      { "action": "wait", "duration": 1200 },
      { "action": "slideOutLeft", "duration": 500 },
      { "action": "text", "text": "Slide 2: Interactive Shapes", "x": "center", "y": "15%", "fontSize": 32, "fontWeight": "bold", "color": "#34d399", "textAlign": "center" },
      { "action": "wait", "duration": 300 },
      { "action": "circle", "cx": "30%", "cy": "50%", "radius": "10%", "color": "#34d399", "fillColor": "#064e3b" },
      { "action": "rect", "x": "55%", "y": "40%", "width": "20%", "height": "20%", "color": "#fbbf24", "fillColor": "#78350f", "radius": 12 },
      { "action": "arrow", "x1": "42%", "y1": "50%", "x2": "53%", "y2": "50%", "color": "#ffffff", "headSize": 14 },
      { "action": "wait", "duration": 1200 },
      { "action": "slideOutLeft", "duration": 500 },
      { "action": "text", "text": "Slide 3: Presentation Complete!", "x": "center", "y": "center", "fontSize": 40, "fontWeight": "bold", "color": "#f43f5e", "textAlign": "center" }
    ], null, 2)
  },
  {
    name: "3D Isometric Mesh",
    run: (board: Board) => {
      board.clear();
      board.beginTrigger();
      board.setBackground("#060d12");
      board.writeText({ text: "3D Isometric Cube Projection", x: "center", y: "8%", fontSize: 30, fontWeight: "bold", color: "#38bdf8", textAlign: "center" });
      board.completeTrigger();

      const scene = new Scene3D({
        projection: 'isometric',
        origin: { x: 700, y: 480 },
        scale: 130,
        light: { direction: { x: -1, y: -1, z: 2 }, ambient: 0.35 }
      });

      scene.addMesh({
        vertices: [
          [-1,-1,-1], [1,-1,-1], [1,1,-1], [-1,1,-1],
          [-1,-1,1],  [1,-1,1],  [1,1,1],  [-1,1,1]
        ],
        faces: [
          { verts: [0,1,2,3], color: '#38bdf8' },
          { verts: [4,5,6,7], color: '#38bdf8' },
          { verts: [0,1,5,4], color: '#0284c7' },
          { verts: [2,3,7,6], color: '#0284c7' },
          { verts: [0,3,7,4], color: '#0369a1' },
          { verts: [1,2,6,5], color: '#0369a1' }
        ]
      });

      scene.addEdge({ x: 0, y: 0, z: 0 }, { x: 2.5, y: 0, z: 0 }, '#ef4444');
      scene.addEdge({ x: 0, y: 0, z: 0 }, { x: 0, y: 2.5, z: 0 }, '#10b981');
      scene.addEdge({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 2.5 }, '#3b82f6');
      scene.addLabel({ x: 2.8, y: 0, z: 0 }, 'X-Axis', { color: '#ef4444', fontSize: 16 });
      scene.addLabel({ x: 0, y: 2.8, z: 0 }, 'Y-Axis', { color: '#10b981', fontSize: 16 });
      scene.addLabel({ x: 0, y: 0, z: 2.8 }, 'Z-Axis', { color: '#3b82f6', fontSize: 16 });

      scene.renderTo(board);
    }
  },
  {
    name: "Interactive 3D Three.js Scene",
    run: (board: Board) => {
      board.clear();
      board.beginTrigger();
      board.setBackground("#090d16");
      board.writeText({ text: "Interactive Three.js 3D WebGL", x: "center", y: "8%", fontSize: 30, fontWeight: "bold", color: "#fbbf24", textAlign: "center" });
      board.completeTrigger();

      const b3d = new Board3D(board, { orbitControls: true });
      const cubeId = b3d.addCube({ width: 1.5, height: 1.5, depth: 1.5, color: 0x38bdf8, position: { x: -2.2, y: 0, z: 0 } });
      const sphereId = b3d.addSphere({ radius: 1, color: 0x34d399, position: { x: 2.2, y: 0, z: 0 } });
      const torusId = b3d.addTorus({ radius: 1.2, tube: 0.3, color: 0xfbbf24, position: { x: 0, y: 0, z: 0 } });

      b3d.animate(cubeId, { rotationSpeed: { x: 0.5, y: 0.8, z: 0 } });
      b3d.animate(sphereId, { bounce: { speed: 2, amount: 0.5 } });
      b3d.animate(torusId, { rotationSpeed: { x: 0.2, y: 0.5, z: 0.8 } });

      b3d.startRenderLoop();
    }
  }
];

export default function Home() {
  const [board, setBoard] = useState<Board | null>(null)
  const [showDocs, setShowDocs] = useState(false)
  const [showPlay, setShowPlay] = useState(false)
  const [scriptInput, setScriptInput] = useState("")

  useEffect(() => {
    let isMounted = true
    let b: Board | null = null;

    const initBoard = async () => {
      if (!isMounted) return

      b = new Board("board", 1400, 870, {
        speed: 35,
        background: "#060d12",
        hiDpi: true,
        fontFamily: "'Playpen Sans', sans-serif",
        fitMode: "contain"
      })
      
      setBoard(b)

      b.writeText({
        text: "Board Whiteboard & Animation Library",
        x: "center",
        y: "center",
        fontSize: 32,
        color: "#4dd0e1",
        textAlign: "center"
      })
    }

    if (document.fonts) {
      document.fonts.ready.then(initBoard)
    } else {
      initBoard()
    }

    return () => {
      isMounted = false
      if (b) b.destroy()
      const el = document.getElementById("board")
      if (el) el.innerHTML = ""
    }
  }, [])

  const handleRunScript = () => {
    if (!board) return;
    try {
      const commands: BoardScriptCommand[] = JSON.parse(scriptInput);
      board.clear();
      board.processScript(commands);
      setShowPlay(false);
    } catch (e) {
      alert("Invalid JSON script!");
    }
  }

  const handleCopyDocs = () => {
    navigator.clipboard.writeText(boardUsagesDocs);
    alert("Copied!");
  }

  return (
    <div className="w-full min-h-screen flex flex-col items-center bg-gray-950 p-2 sm:p-4 font-sans text-gray-200">
      
      <div className="w-full max-w-[1400px] flex flex-wrap justify-between items-center gap-4 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-400">Presets:</span>
          {PRESET_SCRIPTS.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => {
                if (board) {
                  if (preset.run) {
                    preset.run(board);
                  } else if (preset.script) {
                    try {
                      const commands = JSON.parse(preset.script);
                      board.clear();
                      board.processScript(commands);
                    } catch (e) {
                      console.error(e);
                    }
                  }
                }
              }}
              className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-xs text-cyan-300 rounded font-medium transition-colors cursor-pointer border border-gray-700"
            >
              {preset.name}
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <button 
            onClick={() => setShowDocs(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded text-white font-medium text-sm transition-colors cursor-pointer"
          >
            Board Usages & Docs
          </button>
          <button 
            onClick={() => setShowPlay(true)}
            className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded text-white font-medium text-sm transition-colors cursor-pointer"
          >
            Play Custom Script
          </button>
        </div>
      </div>

      <div 
        className="w-full max-w-[1400px] aspect-[1400/870] max-h-[80vh] rounded-xl shadow-2xl overflow-hidden border border-gray-800 bg-[#060d12]"
      >
        <div id="board" className="w-full h-full" />
      </div>

      {/* Docs Dialog */}
      {showDocs && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-lg shadow-xl w-full max-w-4xl border border-gray-700 flex flex-col max-h-[85vh]">
            <div className="p-4 border-b border-gray-800 flex justify-between items-center">
              <h2 className="text-xl font-bold">Board Usages & Docs</h2>
              <button onClick={() => setShowDocs(false)} className="text-gray-400 hover:text-white cursor-pointer text-xl">✕</button>
            </div>
            <div className="p-4 overflow-y-auto flex-1 text-sm bg-gray-950 m-4 rounded border border-gray-800">
              <pre className="whitespace-pre-wrap font-mono text-gray-300">{boardUsagesDocs}</pre>
            </div>
            <div className="p-4 border-t border-gray-800 flex justify-end gap-3">
              <button onClick={() => setShowDocs(false)} className="px-4 py-2 rounded text-gray-400 hover:text-white cursor-pointer transition-colors">Close</button>
              <button onClick={handleCopyDocs} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded text-white font-medium cursor-pointer transition-colors">Copy All</button>
            </div>
          </div>
        </div>
      )}

      {/* Play Dialog */}
      {showPlay && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-lg shadow-xl w-full max-w-2xl border border-gray-700 flex flex-col">
            <div className="p-4 border-b border-gray-800 flex justify-between items-center">
              <h2 className="text-xl font-bold">Play Board Script</h2>
              <button onClick={() => setShowPlay(false)} className="text-gray-400 hover:text-white cursor-pointer text-xl">✕</button>
            </div>
            <div className="p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs text-gray-400">Load a preset or paste script below:</span>
                <div className="flex gap-2">
                  {PRESET_SCRIPTS.map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => setScriptInput(preset.script || "// Dynamic 3D Preset Function Code")}
                      className="px-2 py-1 bg-gray-800 hover:bg-gray-700 text-xs text-cyan-300 rounded border border-gray-700 cursor-pointer"
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>
              <textarea 
                className="w-full h-80 bg-gray-950 border border-gray-800 rounded p-3 text-sm text-gray-300 font-mono focus:outline-none focus:border-blue-500"
                placeholder="Paste JSON array of BoardScriptCommand here..."
                value={scriptInput}
                onChange={(e) => setScriptInput(e.target.value)}
              />
            </div>
            <div className="p-4 border-t border-gray-800 flex justify-end gap-3">
              <button onClick={() => setShowPlay(false)} className="px-4 py-2 rounded text-gray-400 hover:text-white cursor-pointer transition-colors">Cancel</button>
              <button onClick={handleRunScript} className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded text-white font-medium cursor-pointer transition-colors">Run Script</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

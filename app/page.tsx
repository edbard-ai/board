"use client"
import { Board, BoardScriptCommand } from "@/lib/board"
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
      
      <div className="w-full max-w-[1400px] flex justify-end gap-4 mb-4">
        <button 
          onClick={() => setShowDocs(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded text-white font-medium transition-colors cursor-pointer"
        >
          Board Usages & Docs
        </button>
        <button 
          onClick={() => setShowPlay(true)}
          className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded text-white font-medium transition-colors cursor-pointer"
        >
          Play Script
        </button>
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

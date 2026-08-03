"use client"
import { Board, BoardScriptCommand } from "@/lib/board"
import { useEffect, useState, useRef } from "react"

const boardUsagesDocs = `
# Board Script Commands Reference

The board accepts a JSON array of command objects. You can use the following actions:

\`\`\`typescript
type BoardScriptCommand =
  | { action: "text"; text: string; x: XCoord; y?: YCoord; fontSize?: SizeCoord; fontFamily?: string; color?: string; textAlign?: CanvasTextAlign; fontWeight?: string; fontStyle?: string }
  | { action: "paragraph"; text: string; x: XCoord; y?: YCoord; width: SizeCoord; lineHeight?: number; fontSize?: SizeCoord; fontFamily?: string; color?: string; textAlign?: CanvasTextAlign; fontWeight?: string; fontStyle?: string }
  | { action: "line"; x1: XCoord; y1: YCoord; x2: XCoord; y2: YCoord; color?: string; lineDash?: number[] }
  | { action: "rect"; x: XCoord; y?: YCoord; width: SizeCoord; height: SizeCoord; color?: string; fillColor?: string; radius?: SizeCoord }
  | { action: "fillRect"; x: XCoord; y?: YCoord; width: SizeCoord; height: SizeCoord; fillColor: string; radius?: SizeCoord }
  | { action: "circle"; cx: XCoord; cy?: YCoord; radius: SizeCoord; color?: string; fillColor?: string }
  | { action: "ellipse"; cx: XCoord; cy?: YCoord; radiusX: SizeCoord; radiusY: SizeCoord; rotation?: number; color?: string; fillColor?: string }
  | { action: "arrow"; x1: XCoord; y1: YCoord; x2: XCoord; y2: YCoord; color?: string; headSize?: number }
  | { action: "image"; src: string; x: XCoord; y?: YCoord; width?: SizeCoord; height?: SizeCoord; opacity?: number }
  | { action: "codeBlock"; code: string; language?: string; x: XCoord; y?: YCoord; width: SizeCoord; height?: SizeCoord; fontSize?: SizeCoord }
  | { action: "table"; data: string[][]; x: XCoord; y?: YCoord; cellWidth?: number; cellHeight?: number; headerBgColor?: string; headerTextColor?: string; rowBgColor?: string; altRowBgColor?: string; textColor?: string; borderColor?: string; fontSize?: SizeCoord; fontFamily?: string }
  | { action: "math"; formula: string; x: XCoord; y?: YCoord; fontSize?: SizeCoord; color?: string; fontFamily?: string; displayMode?: boolean }
  | { action: "polygon"; points: SemanticPoint[]; color?: string; fillColor?: string }
  | { action: "diamond"; cx: XCoord; cy?: YCoord; width: SizeCoord; height: SizeCoord; color?: string; fillColor?: string }
  | { action: "gridAxes"; x: XCoord; y?: YCoord; width: SizeCoord; height: SizeCoord; step?: number; color?: string }
  | { action: "gradientRect"; x: XCoord; y?: YCoord; width: SizeCoord; height: SizeCoord; colors: string[]; direction?: "horizontal" | "vertical" | "diagonal" }
  | { action: "pointer"; x: XCoord; y: YCoord; color?: string; size?: SizeCoord }
  | { action: "highlight"; x: XCoord; y: YCoord; width: SizeCoord; height: SizeCoord; color?: string }
  | { action: "wait"; duration: number }
  | { action: "clear" }
  | { action: "slideOutLeft"; duration?: number }
  | { action: "setColor"; color: string }
  | { action: "setLineWidth"; width: number }
  | { action: "setSpeed"; speed: number }
  | { action: "setBackground"; color: string };

type XCoord = number | 'center' | 'left' | 'right' | string; // string for % like "50%"
type YCoord = number | 'center' | 'top' | 'bottom' | string;
type SizeCoord = number | string;
type SemanticPoint = { x: XCoord; y: YCoord };
\`\`\`

Example Script:
\`\`\`json
[
  { "action": "setColor", "color": "#ffffff" },
  { "action": "text", "text": "Binary Search", "x": "center", "y": 40, "fontSize": 36, "fontWeight": "bold", "color": "#4dd0e1" },
  { "action": "line", "x1": 200, "y1": 70, "x2": 1080, "y2": 70, "color": "#2a3b50" },
  { "action": "wait", "duration": 500 },
  { "action": "text", "text": "A sorted array:", "x": 50, "y": 120, "fontSize": 20, "color": "#b0bec5" },
  { "action": "table", "data": [["1", "3", "5", "7", "9", "11", "15"]], "x": 50, "y": 160, "cellWidth": 80, "cellHeight": 40, "headerBgColor": "#1a2332", "headerTextColor": "#4dd0e1", "rowBgColor": "#0f1b26", "textColor": "#ffffff", "borderColor": "#2a3b50" }
]
\`\`\`
`.trim();

export default function Home() {
  const [board, setBoard] = useState<Board | null>(null)
  const [showDocs, setShowDocs] = useState(false)
  const [showPlay, setShowPlay] = useState(false)
  const [scriptInput, setScriptInput] = useState("")

  const wrapperRef = useRef<HTMLDivElement>(null)
  const boardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let isMounted = true
    let b: Board | null = null;

    const initBoard = async () => {
      if (!isMounted) return

      b = new Board("board", 1400, 870, {
        speed: 35,
        background: "#060d12",
        hiDpi: true,
        fontFamily: "'Playpen Sans', sans-serif"
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

    const handleResize = () => {
      if (wrapperRef.current && boardRef.current) {
        const wrapperWidth = wrapperRef.current.clientWidth;
        const scale = wrapperWidth / 1400; 
        
        boardRef.current.style.transform = `scale(${scale})`;
        wrapperRef.current.style.height = `${870 * scale}px`; 
      }
    };

    window.addEventListener("resize", handleResize);
    
    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    
    if (wrapperRef.current) {
      resizeObserver.observe(wrapperRef.current);
    }
    
    setTimeout(handleResize, 50);

    return () => {
      isMounted = false
      window.removeEventListener("resize", handleResize);
      resizeObserver.disconnect();
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
      
      {/* Controls */}
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
        ref={wrapperRef} 
        className="w-full max-w-[1400px] rounded-xl shadow-2xl overflow-hidden border border-gray-800 bg-[#060d12]"
      >
        <div ref={boardRef} id="board" className="origin-top-left" />
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

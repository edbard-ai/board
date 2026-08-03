import { Board } from "../board"

export function runPerspectiveExample(board: Board) {
  board.beginTrigger()

  board.writeText({
    text: "Perspective Projection",
    x: "center",
    y: 35,
    fontSize: 28,
    color: "#4dd0e1",
    fontFamily: "'Playpen Sans', sans-serif",
    fontWeight: "700",
    textAlign: "center"
  })

  board.drawLine({ x1: 250, y1: 52, x2: 600, y2: 52, color: "#4dd0e1" })

  board.writeParagraph({
    text: "Perspective projection of Prisms and Pyramids with axis perpendicular to the ground plane or picture plane.",
    x: "center",
    y: 72,
    width: 720,
    fontSize: 15,
    color: "#d4d4d4",
    fontFamily: "'Playpen Sans', sans-serif",
    textAlign: "center",
    lineHeight: 1.5
  })

  board.wait(1000)

  board.drawLine({ x1: 50, y1: 450, x2: 800, y2: 450, color: "#ffffff" })
  board.writeText({ text: "GL", x: 30, y: 455, fontSize: 16, color: "#ffffff", fontFamily: "'Playpen Sans', sans-serif" })

  board.drawLine({ x1: 50, y1: 200, x2: 800, y2: 200, color: "#aaaaaa", lineDash: [5, 5] })
  board.writeText({ text: "HL", x: 30, y: 205, fontSize: 16, color: "#aaaaaa", fontFamily: "'Playpen Sans', sans-serif" })

  const vpX = 425
  const vpY = 200
  board.drawCircle({ cx: vpX, cy: vpY, radius: 4, color: "#ffeb3b", fillColor: "#ffeb3b" })
  board.writeText({ text: "VP", x: vpX, y: vpY - 15, fontSize: 14, color: "#ffeb3b", fontFamily: "'Playpen Sans', sans-serif", textAlign: "center" })

  board.wait(1000)

  const pX = 150
  const pY = 450
  const size = 100

  board.writeText({ text: "Prism", x: pX + size / 2, y: pY + 25, fontSize: 16, color: "#4dd0e1", fontFamily: "'Playpen Sans', sans-serif", textAlign: "center" })

  const f1 = { x: pX, y: pY }
  const f2 = { x: pX + size, y: pY }
  const f3 = { x: pX + size, y: pY - size }
  const f4 = { x: pX, y: pY - size }
  board.drawPolygon({ points: [f1, f2, f3, f4], color: "#4dd0e1", fillColor: "rgba(77, 208, 225, 0.2)" })

  board.wait(500)

  board.drawLine({ x1: f1.x, y1: f1.y, x2: vpX, y2: vpY, color: "#64748b", lineDash: [3, 3] })
  board.drawLine({ x1: f2.x, y1: f2.y, x2: vpX, y2: vpY, color: "#64748b", lineDash: [3, 3] })
  board.drawLine({ x1: f3.x, y1: f3.y, x2: vpX, y2: vpY, color: "#64748b", lineDash: [3, 3] })
  board.drawLine({ x1: f4.x, y1: f4.y, x2: vpX, y2: vpY, color: "#64748b", lineDash: [3, 3] })

  board.wait(1000)

  const depth = 0.4
  const b1 = { x: f1.x + (vpX - f1.x) * depth, y: f1.y + (vpY - f1.y) * depth }
  const b2 = { x: f2.x + (vpX - f2.x) * depth, y: f2.y + (vpY - f2.y) * depth }
  const b3 = { x: f3.x + (vpX - f3.x) * depth, y: f3.y + (vpY - f3.y) * depth }
  const b4 = { x: f4.x + (vpX - f4.x) * depth, y: f4.y + (vpY - f4.y) * depth }

  board.drawPolygon({ points: [b1, b2, b3, b4], color: "#4dd0e1" })

  board.drawLine({ x1: f1.x, y1: f1.y, x2: b1.x, y2: b1.y, color: "#4dd0e1" })
  board.drawLine({ x1: f2.x, y1: f2.y, x2: b2.x, y2: b2.y, color: "#4dd0e1" })
  board.drawLine({ x1: f3.x, y1: f3.y, x2: b3.x, y2: b3.y, color: "#4dd0e1" })
  board.drawLine({ x1: f4.x, y1: f4.y, x2: b4.x, y2: b4.y, color: "#4dd0e1" })

  board.wait(1000)

  const pyrX = 600
  board.writeText({ text: "Pyramid", x: pyrX + size / 2, y: pY + 25, fontSize: 16, color: "#ff8a80", fontFamily: "'Playpen Sans', sans-serif", textAlign: "center" })

  const pf1 = { x: pyrX, y: pY }
  const pf2 = { x: pyrX + size, y: pY }

  board.drawLine({ x1: pf1.x, y1: pf1.y, x2: vpX, y2: vpY, color: "#64748b", lineDash: [3, 3] })
  board.drawLine({ x1: pf2.x, y1: pf2.y, x2: vpX, y2: vpY, color: "#64748b", lineDash: [3, 3] })

  const pb1 = { x: pf1.x + (vpX - pf1.x) * depth, y: pf1.y + (vpY - pf1.y) * depth }
  const pb2 = { x: pf2.x + (vpX - pf2.x) * depth, y: pf2.y + (vpY - pf2.y) * depth }

  board.drawPolygon({ points: [pf1, pf2, pb2, pb1], color: "#ff8a80", fillColor: "rgba(255, 138, 128, 0.2)" })

  board.wait(500)

  const centerX = (pf1.x + pf2.x + pb1.x + pb2.x) / 4
  const centerY = (pf1.y + pf2.y + pb1.y + pb2.y) / 4

  const apexY = centerY - 150
  const apex = { x: centerX, y: apexY }

  board.drawLine({ x1: centerX, y1: centerY, x2: apex.x, y2: apex.y, color: "#ffeb3b", lineDash: [4, 4] })

  board.drawLine({ x1: apex.x, y1: apex.y, x2: pf1.x, y2: pf1.y, color: "#ff8a80" })
  board.drawLine({ x1: apex.x, y1: apex.y, x2: pf2.x, y2: pf2.y, color: "#ff8a80" })
  board.drawLine({ x1: apex.x, y1: apex.y, x2: pb1.x, y2: pb1.y, color: "#ff8a80", lineDash: [2, 2] })
  board.drawLine({ x1: apex.x, y1: apex.y, x2: pb2.x, y2: pb2.y, color: "#ff8a80" })

  board.completeTrigger()
}

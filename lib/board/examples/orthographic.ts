import { Board } from "../board"

export function runOrthographicExample(board: Board) {
  board.beginTrigger()

  board.writeText({
    text: "Conversion to Orthographic Views",
    x: "center",
    y: 35,
    fontSize: 28,
    color: "#4dd0e1",
    fontFamily: "'Playpen Sans', sans-serif",
    fontWeight: "700",
    textAlign: "center"
  })

  board.drawLine({ x1: 180, y1: 52, x2: 670, y2: 52, color: "#4dd0e1" })

  board.writeParagraph({
    text: "Converting a 3D pictorial (isometric) view into 2D orthographic projections: Front, Top, and Side views.",
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

  const ox = 250
  const oy = 400
  const px = (x: number, y: number, z: number) => ({ x: ox - x * 0.8 + y * 0.8, y: oy + x * 0.4 + y * 0.4 - z })

  const p000 = px(0, 0, 0)
  const p100 = px(100, 0, 0)
  const p110 = px(100, 100, 0)
  const p010 = px(0, 100, 0)

  const p001 = px(0, 0, 100)
  const p501 = px(50, 0, 100)
  const p505 = px(50, 0, 50)
  const p105 = px(100, 0, 50)

  const p011 = px(0, 100, 100)
  const p511 = px(50, 100, 100)
  const p515 = px(50, 100, 50)
  const p115 = px(100, 100, 50)

  board.fillPolygon({ points: [p100, p110, p115, p105], fillColor: "rgba(33, 150, 243, 0.4)" })
  board.drawPolygon({ points: [p100, p110, p115, p105], color: "#2196f3" })

  board.fillPolygon({ points: [p505, p515, p511, p501], fillColor: "rgba(33, 150, 243, 0.4)" })
  board.drawPolygon({ points: [p505, p515, p511, p501], color: "#2196f3" })

  board.fillPolygon({ points: [p001, p501, p511, p011], fillColor: "rgba(76, 175, 80, 0.4)" })
  board.drawPolygon({ points: [p001, p501, p511, p011], color: "#4caf50" })

  board.fillPolygon({ points: [p505, p105, p115, p515], fillColor: "rgba(76, 175, 80, 0.4)" })
  board.drawPolygon({ points: [p505, p105, p115, p515], color: "#4caf50" })

  board.fillPolygon({ points: [p000, p100, p105, p505, p501, p001], fillColor: "rgba(244, 67, 54, 0.4)" })
  board.drawPolygon({ points: [p000, p100, p105, p505, p501, p001], color: "#f44336" })

  board.writeText({ text: "3D Isometric View", x: 250, y: 460, fontSize: 16, color: "#ffffff", textAlign: "center" })

  board.wait(1000)

  board.writeText({ text: "Top View", x: 600, y: 130, fontSize: 16, color: "#4caf50", textAlign: "center" })
  board.fillRect({ x: 550, y: 150, width: 50, height: 100, fillColor: "rgba(76, 175, 80, 0.4)" })
  board.drawRect({ x: 550, y: 150, width: 50, height: 100, color: "#4caf50" })
  board.fillRect({ x: 600, y: 150, width: 50, height: 100, fillColor: "rgba(76, 175, 80, 0.4)" })
  board.drawRect({ x: 600, y: 150, width: 50, height: 100, color: "#4caf50" })

  board.wait(500)

  board.writeText({ text: "Front View", x: 600, y: 440, fontSize: 16, color: "#f44336", textAlign: "center" })
  board.fillPolygon({
    points: [
      { x: 550, y: 420 },
      { x: 650, y: 420 },
      { x: 650, y: 370 },
      { x: 600, y: 370 },
      { x: 600, y: 320 },
      { x: 550, y: 320 }
    ],
    fillColor: "rgba(244, 67, 54, 0.4)"
  })
  board.drawPolygon({
    points: [
      { x: 550, y: 420 },
      { x: 650, y: 420 },
      { x: 650, y: 370 },
      { x: 600, y: 370 },
      { x: 600, y: 320 },
      { x: 550, y: 320 }
    ],
    color: "#f44336"
  })

  board.wait(500)

  board.writeText({ text: "Side View", x: 740, y: 440, fontSize: 16, color: "#2196f3", textAlign: "center" })
  board.fillRect({ x: 690, y: 370, width: 100, height: 50, fillColor: "rgba(33, 150, 243, 0.4)" })
  board.drawRect({ x: 690, y: 370, width: 100, height: 50, color: "#2196f3" })
  board.fillRect({ x: 690, y: 320, width: 100, height: 50, fillColor: "rgba(33, 150, 243, 0.4)" })
  board.drawRect({ x: 690, y: 320, width: 100, height: 50, color: "#2196f3" })

  board.drawLine({ x1: 530, y1: 290, x2: 810, y2: 290, color: "#64748b", lineDash: [4, 4] })
  board.drawLine({ x1: 670, y1: 130, x2: 670, y2: 460, color: "#64748b", lineDash: [4, 4] })

  board.completeTrigger()
}

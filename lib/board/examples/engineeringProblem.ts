import { Board } from "../board"

export function runEngineeringProblemExample(board: Board) {
  board.beginTrigger()

  board.writeText({
    text: "Engineering Graphics: 3D Pictorial to Orthographic Projections",
    x: "center",
    y: 20,
    fontSize: 22,
    color: "#4dd0e1",
    fontFamily: "'Playpen Sans', sans-serif",
    fontWeight: "700",
    textAlign: "center"
  })

  board.fillRect({
    x: 20,
    y: 44,
    width: 1360,
    height: 34,
    radius: 6,
    fillColor: "rgba(15, 30, 42, 0.9)"
  })
  board.drawRect({
    x: 20,
    y: 44,
    width: 1360,
    height: 34,
    radius: 6,
    color: "rgba(77, 208, 225, 0.4)"
  })

  board.writeParagraph({
    text: "QUESTION: Draw the Front View (Arrow X), Top View, and Side View of the object with all given dimensions.",
    x: 35,
    y: 53,
    width: 1330,
    fontSize: 13,
    color: "#e2e8f0",
    fontFamily: "'Playpen Sans', sans-serif"
  })

  board.fillRect({
    x: 20,
    y: 88,
    width: 450,
    height: 760,
    radius: 8,
    fillColor: "rgba(10, 20, 30, 0.95)"
  })
  board.drawRect({
    x: 20,
    y: 88,
    width: 450,
    height: 760,
    radius: 8,
    color: "rgba(77, 208, 225, 0.3)"
  })

  board.writeText({
    text: "GIVEN 3D PICTORIAL VIEW",
    x: 245,
    y: 106,
    fontSize: 15,
    color: "#4dd0e1",
    fontWeight: "700",
    textAlign: "center"
  })

  board.drawImage({
    src: "/question.png",
    x: 30,
    y: 135,
    width: 430,
    height: 380
  })

  board.fillRect({
    x: 35,
    y: 530,
    width: 420,
    height: 300,
    radius: 6,
    fillColor: "rgba(15, 23, 42, 0.9)"
  })
  board.drawRect({
    x: 35,
    y: 530,
    width: 420,
    height: 300,
    radius: 6,
    color: "rgba(56, 189, 248, 0.3)"
  })

  board.writeText({
    text: "GIVEN DIMENSIONS & SPECIFICATIONS",
    x: 245,
    y: 545,
    fontSize: 13,
    color: "#38bdf8",
    fontWeight: "700",
    textAlign: "center"
  })

  board.writeParagraph({
    text: "• Overall Length (Arrow X): 78mm (66mm straight + 12mm chamfer)\n• Total Width: 42mm (2 × 21R)\n• Total Height: 81mm (60mm height to center + 21mm radius arch)\n• Vertical Back Wall: 12mm thick with 21R semi-circular top arch\n• Wall Slot Cutout: 18mm wide × 27mm high\n• Base Plate: 12mm thick with 12mm × 12mm front corner chamfers\n• Stiffener Web (Rib): 12mm thick, 42mm vertical height on back wall, sloping down 54mm along base plate",
    x: 45,
    y: 570,
    width: 400,
    fontSize: 11,
    color: "#cbd5e1",
    lineHeight: 1.45
  })

  board.fillRect({
    x: 490,
    y: 88,
    width: 890,
    height: 760,
    radius: 8,
    fillColor: "rgba(10, 20, 30, 0.95)"
  })
  board.drawRect({
    x: 490,
    y: 88,
    width: 890,
    height: 760,
    radius: 8,
    color: "rgba(77, 208, 225, 0.3)"
  })

  const s = 3.2
  
  const oxF = 530
  const oyF = 650
  
  const oxT = 530
  const oyT = 310
  
  const oxS = 960
  const oyS = 650

  board.writeText({
    text: "TOP VIEW",
    x: oxT + (78 * s) / 2,
    y: 98,
    fontSize: 15,
    color: "#4ade80",
    fontWeight: "700",
    textAlign: "center"
  })

  board.writeText({
    text: "FRONT VIEW (Arrow X)",
    x: oxF + (78 * s) / 2,
    y: 385,
    fontSize: 15,
    color: "#f87171",
    fontWeight: "700",
    textAlign: "center"
  })

  board.writeText({
    text: "SIDE VIEW",
    x: oxS + (42 * s) / 2,
    y: 385,
    fontSize: 15,
    color: "#38bdf8",
    fontWeight: "700",
    textAlign: "center"
  })

  board.wait(600)

  const fx = (x: number, z: number) => ({ x: oxF + x * s, y: oyF - z * s })
  const fColor = "#f87171"

  board.drawLine({ x1: fx(0, 0).x, y1: fx(0, 0).y, x2: fx(78, 0).x, y2: fx(78, 0).y, color: fColor })
  board.drawLine({ x1: fx(78, 0).x, y1: fx(78, 0).y, x2: fx(78, 12).x, y2: fx(78, 12).y, color: fColor })
  board.drawLine({ x1: fx(78, 12).x, y1: fx(78, 12).y, x2: fx(66, 12).x, y2: fx(66, 12).y, color: fColor })
  board.drawLine({ x1: fx(66, 12).x, y1: fx(66, 12).y, x2: fx(12, 12).x, y2: fx(12, 12).y, color: fColor })

  board.drawLine({ x1: fx(0, 0).x, y1: fx(0, 0).y, x2: fx(0, 81).x, y2: fx(0, 81).y, color: fColor })
  board.drawLine({ x1: fx(0, 81).x, y1: fx(0, 81).y, x2: fx(12, 81).x, y2: fx(12, 81).y, color: fColor })
  board.drawLine({ x1: fx(12, 81).x, y1: fx(12, 81).y, x2: fx(12, 54).x, y2: fx(12, 54).y, color: fColor })

  board.drawLine({ x1: fx(12, 54).x, y1: fx(12, 54).y, x2: fx(66, 12).x, y2: fx(66, 12).y, color: fColor })

  board.drawLine({ x1: fx(0, 12).x, y1: fx(0, 12).y, x2: fx(12, 12).x, y2: fx(12, 12).y, color: fColor, lineDash: [3, 3] })
  board.drawLine({ x1: fx(0, 39).x, y1: fx(0, 39).y, x2: fx(12, 39).x, y2: fx(12, 39).y, color: fColor, lineDash: [3, 3] })

  board.drawLine({ x1: fx(0, -12).x, y1: fx(0, -12).y, x2: fx(78, -12).x, y2: fx(78, -12).y, color: "#e2e8f0" })
  board.writeText({ text: "78 (66+12)", x: fx(39, -12).x, y: fx(39, -12).y + 14, fontSize: 11, color: "#ffffff", fontWeight: "700", textAlign: "center" })

  board.drawLine({ x1: fx(-12, 0).x, y1: fx(-12, 0).y, x2: fx(-12, 81).x, y2: fx(-12, 81).y, color: "#e2e8f0" })
  board.writeText({ text: "81", x: fx(-12, 40.5).x - 16, y: fx(-12, 40.5).y, fontSize: 11, color: "#ffffff", fontWeight: "700" })

  board.writeText({ text: "12", x: fx(6, -26).x, y: fx(6, -26).y + 10, fontSize: 10, color: "#f87171", textAlign: "center" })
  board.writeText({ text: "54", x: fx(39, -26).x, y: fx(39, -26).y + 10, fontSize: 10, color: "#f87171", textAlign: "center" })
  board.writeText({ text: "12", x: fx(72, -26).x, y: fx(72, -26).y + 10, fontSize: 10, color: "#f87171", textAlign: "center" })

  board.wait(500)

  for (const xVal of [0, 12, 66, 78]) {
    board.drawLine({
      x1: fx(xVal, 81).x,
      y1: fx(xVal, 81).y - 5,
      x2: oxT + xVal * s,
      y2: oyT + 5,
      color: "#0284c7",
      lineDash: [3, 3]
    })
  }

  board.wait(500)

  const tx = (x: number, y: number) => ({ x: oxT + x * s, y: oyT - (42 - y) * s })
  const tColor = "#4ade80"

  board.drawLine({ x1: tx(0, 0).x, y1: tx(0, 0).y, x2: tx(0, 42).x, y2: tx(0, 42).y, color: tColor })
  board.drawLine({ x1: tx(0, 42).x, y1: tx(0, 42).y, x2: tx(66, 42).x, y2: tx(66, 42).y, color: tColor })
  board.drawLine({ x1: tx(66, 42).x, y1: tx(66, 42).y, x2: tx(78, 30).x, y2: tx(78, 30).y, color: tColor })
  board.drawLine({ x1: tx(78, 30).x, y1: tx(78, 30).y, x2: tx(78, 12).x, y2: tx(78, 12).y, color: tColor })
  board.drawLine({ x1: tx(78, 12).x, y1: tx(78, 12).y, x2: tx(66, 0).x, y2: tx(66, 0).y, color: tColor })
  board.drawLine({ x1: tx(66, 0).x, y1: tx(66, 0).y, x2: tx(0, 0).x, y2: tx(0, 0).y, color: tColor })

  board.drawLine({ x1: tx(12, 0).x, y1: tx(12, 0).y, x2: tx(12, 42).x, y2: tx(12, 42).y, color: tColor })

  board.drawLine({ x1: tx(12, 15).x, y1: tx(12, 15).y, x2: tx(66, 15).x, y2: tx(66, 15).y, color: tColor })
  board.drawLine({ x1: tx(12, 27).x, y1: tx(12, 27).y, x2: tx(66, 27).x, y2: tx(66, 27).y, color: tColor })
  board.drawLine({ x1: tx(66, 15).x, y1: tx(66, 15).y, x2: tx(66, 27).x, y2: tx(66, 27).y, color: tColor })

  board.drawLine({ x1: tx(0, 12).x, y1: tx(0, 12).y, x2: tx(12, 12).x, y2: tx(12, 12).y, color: tColor, lineDash: [3, 3] })
  board.drawLine({ x1: tx(0, 30).x, y1: tx(0, 30).y, x2: tx(12, 30).x, y2: tx(12, 30).y, color: tColor, lineDash: [3, 3] })

  board.drawLine({ x1: tx(78 + 12, 0).x, y1: tx(78 + 12, 0).y, x2: tx(78 + 12, 42).x, y2: tx(78 + 12, 42).y, color: "#e2e8f0" })
  board.writeText({ text: "42 (21R)", x: tx(78 + 12, 21).x + 8, y: tx(78 + 12, 21).y, fontSize: 11, color: "#ffffff", fontWeight: "700" })

  board.writeText({ text: "12", x: tx(78 + 24, 6).x + 4, y: tx(78 + 24, 6).y, fontSize: 10, color: "#4ade80" })
  board.writeText({ text: "18", x: tx(78 + 24, 21).x + 4, y: tx(78 + 24, 21).y, fontSize: 10, color: "#4ade80" })
  board.writeText({ text: "12", x: tx(78 + 24, 36).x + 4, y: tx(78 + 24, 36).y, fontSize: 10, color: "#4ade80" })

  board.wait(500)

  for (const zVal of [0, 12, 39, 54, 60, 81]) {
    board.drawLine({
      x1: fx(78, zVal).x + 5,
      y1: fx(78, zVal).y,
      x2: oxS - 5,
      y2: oyS - zVal * s,
      color: "#0284c7",
      lineDash: [3, 3]
    })
  }

  board.wait(500)

  const sx = (y: number, z: number) => ({ x: oxS + y * s, y: oyS - z * s })
  const sColor = "#38bdf8"

  board.drawLine({ x1: sx(0, 0).x, y1: sx(0, 0).y, x2: sx(42, 0).x, y2: sx(42, 0).y, color: sColor })
  board.drawLine({ x1: sx(0, 0).x, y1: sx(0, 0).y, x2: sx(0, 60).x, y2: sx(0, 60).y, color: sColor })
  board.drawLine({ x1: sx(42, 0).x, y1: sx(42, 0).y, x2: sx(42, 60).x, y2: sx(42, 60).y, color: sColor })

  board.drawArc({ cx: sx(21, 60).x, cy: sx(21, 60).y, radius: 21 * s, startAngle: Math.PI, endAngle: 0, color: sColor })

  board.drawLine({ x1: sx(0, 12).x, y1: sx(0, 12).y, x2: sx(42, 12).x, y2: sx(42, 12).y, color: sColor })

  board.drawLine({ x1: sx(12, 12).x, y1: sx(12, 12).y, x2: sx(12, 39).x, y2: sx(12, 39).y, color: sColor })
  board.drawLine({ x1: sx(30, 12).x, y1: sx(30, 12).y, x2: sx(30, 39).x, y2: sx(30, 39).y, color: sColor })
  board.drawLine({ x1: sx(12, 39).x, y1: sx(12, 39).y, x2: sx(30, 39).x, y2: sx(30, 39).y, color: sColor })

  board.drawRect({
    x: sx(15, 12).x,
    y: sx(15, 54).y,
    width: 12 * s,
    height: 42 * s,
    color: sColor,
    fillColor: "rgba(56, 189, 248, 0.2)"
  })

  board.drawLine({ x1: sx(0, -12).x, y1: sx(0, -12).y, x2: sx(42, -12).x, y2: sx(42, -12).y, color: "#e2e8f0" })
  board.writeText({ text: "42", x: sx(21, -12).x, y: sx(21, -12).y + 14, fontSize: 11, color: "#ffffff", fontWeight: "700", textAlign: "center" })

  board.drawLine({ x1: sx(42 + 12, 0).x, y1: sx(42 + 12, 0).y, x2: sx(42 + 12, 81).x, y2: sx(42 + 12, 81).y, color: "#e2e8f0" })
  board.writeText({ text: "81", x: sx(42 + 12, 40.5).x + 6, y: sx(42 + 12, 40.5).y, fontSize: 11, color: "#ffffff", fontWeight: "700" })

  board.writeText({ text: "15", x: sx(7.5, -26).x, y: sx(7.5, -26).y + 10, fontSize: 10, color: "#38bdf8", textAlign: "center" })
  board.writeText({ text: "12", x: sx(21, -26).x, y: sx(21, -26).y + 10, fontSize: 10, color: "#38bdf8", textAlign: "center" })
  board.writeText({ text: "15", x: sx(34.5, -26).x, y: sx(34.5, -26).y + 10, fontSize: 10, color: "#38bdf8", textAlign: "center" })

  board.fillRect({
    x: 490,
    y: 800,
    width: 890,
    height: 34,
    radius: 6,
    fillColor: "rgba(16, 185, 129, 0.15)"
  })
  board.drawRect({
    x: 490,
    y: 800,
    width: 890,
    height: 34,
    radius: 6,
    color: "#10b981"
  })

  board.writeText({
    text: "✓ ALL 3 ORTHOGRAPHIC VIEWS DRAWN TO SCALE WITH PROJECTION GUIDELINES & ACCURATE DIMENSIONS",
    x: 935,
    y: 810,
    fontSize: 11,
    color: "#10b981",
    fontWeight: "700",
    textAlign: "center"
  })

  board.completeTrigger()
}

import { Board } from "../board"

export function runBinarySearchExample(board: Board) {
  board.beginTrigger()

  board.writeText({
    text: "Understanding Binary Search",
    x: "center",
    y: 35,
    fontSize: 28,
    color: "#4dd0e1",
    fontFamily: "'Playpen Sans', sans-serif",
    fontWeight: "700",
    textAlign: "center"
  })

  board.drawLine({ x1: 220, y1: 52, x2: 630, y2: 52, color: "#4dd0e1" })

  board.writeParagraph({
    text: "Binary search is an efficient algorithm for finding an item from a sorted list of items. It works by repeatedly dividing in half the portion of the list that could contain the item, until you've narrowed down the possible locations to just one.",
    x: "center",
    y: 72,
    width: 720,
    fontSize: 15,
    color: "#d4d4d4",
    fontFamily: "'Playpen Sans', sans-serif",
    textAlign: "center",
    lineHeight: 1.5
  })

  board.wait(1500)

  board.writeText({
    text: "Target: 23",
    x: 200,
    y: 160,
    fontSize: 18,
    color: "#ffeb3b",
    fontFamily: "'Playpen Sans', sans-serif",
    textAlign: "center",
    fontWeight: "700"
  })

  const startX = 125
  const startY = 190
  board.drawRect({ x: startX, y: startY, width: 600, height: 55, color: "#fff", radius: 6 })

  const elements = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91]
  elements.forEach((el, i) => {
    if (i > 0) {
      board.drawLine({ x1: startX + i * 60, y1: startY, x2: startX + i * 60, y2: startY + 55, color: "#fff" })
    }
    board.writeText({
      text: el.toString(),
      x: startX + i * 60 + 30,
      y: startY + 36,
      fontSize: 20,
      color: "#fff",
      fontFamily: "'Playpen Sans', sans-serif",
      fontWeight: "600",
      textAlign: "center"
    })
  })

  board.wait(1000)

  const step1HighlightId = board.highlightRect(startX + 4 * 60, startY, 60, 55, "rgba(255, 138, 128, 0.4)")
  const step1PointerId = board.drawPointer(startX + 4 * 60 + 30, startY + 68, "#ff8a80", 7)
  const step1TextId = board.writeText({
    text: "16 < 23 (Go Right)",
    x: startX + 4 * 60 + 30,
    y: startY + 92,
    fontSize: 14,
    color: "#ff8a80",
    fontFamily: "'Playpen Sans', sans-serif",
    fontWeight: "600",
    textAlign: "center"
  })

  board.wait(1400)

  board.delete(step1PointerId, 300)
  board.delete(step1TextId, 300)

  board.move(step1HighlightId, 60, 0, 600)

  board.wait(1000)

  board.changeColor(step1HighlightId, "rgba(77, 208, 225, 0.4)", 600)
  board.drawPointer(startX + 5 * 60 + 30, startY - 14, "#4dd0e1", 7)
  board.writeText({
    text: "Found!",
    x: startX + 5 * 60 + 30,
    y: 160,
    fontSize: 18,
    color: "#4dd0e1",
    fontFamily: "'Playpen Sans', sans-serif",
    textAlign: "center",
    fontWeight: "700"
  })

  board.drawCodeBlock({
    code: `while (left <= right) {
  let mid = Math.floor((left + right) / 2);
  if (arr[mid] === target) return mid;
  if (arr[mid] < target) left = mid + 1;
  else right = mid - 1;
}`,
    language: "javascript",
    x: "center",
    y: 320,
    width: 520
  })

  board.completeTrigger()
}

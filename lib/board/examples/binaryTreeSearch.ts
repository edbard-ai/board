import { Board } from "../board"

export function runBinaryTreeSearchExample(board: Board) {
  board.beginTrigger()

  board.writeText({
    text: "Binary Search Tree (BST) Search",
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
    text: "Searching a Binary Search Tree starts at the root node. If the target value is smaller than the current node, search the left subtree; if larger, search the right subtree.",
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
    text: "Target: 27",
    x: 100,
    y: 160,
    fontSize: 18,
    color: "#ffeb3b",
    fontFamily: "'Playpen Sans', sans-serif",
    textAlign: "center",
    fontWeight: "700"
  })

  const nodes = [
    { val: "20", x: 340, y: 190 },
    { val: "10", x: 220, y: 265 },
    { val: "30", x: 460, y: 265 },
    { val: "5", x: 160, y: 340 },
    { val: "15", x: 280, y: 340 },
    { val: "27", x: 400, y: 340 },
    { val: "42", x: 520, y: 340 }
  ]

  const edges = [
    { from: 0, to: 1 },
    { from: 0, to: 2 },
    { from: 1, to: 3 },
    { from: 1, to: 4 },
    { from: 2, to: 5 },
    { from: 2, to: 6 }
  ]

  edges.forEach((edge) => {
    const parent = nodes[edge.from]
    const child = nodes[edge.to]
    board.drawLine({
      x1: parent.x,
      y1: parent.y,
      x2: child.x,
      y2: child.y,
      color: "#64748b"
    })
  })

  nodes.forEach((node) => {
    board.drawCircle({
      cx: node.x,
      cy: node.y,
      radius: 22,
      color: "#4dd0e1",
      fillColor: "#0f172a"
    })

    board.writeText({
      text: node.val,
      x: node.x,
      y: node.y + 6,
      fontSize: 17,
      color: "#ffffff",
      fontFamily: "'Playpen Sans', sans-serif",
      fontWeight: "700",
      textAlign: "center"
    })
  })

  board.drawCodeBlock({
    code: `function searchBST(node, target) {
  if (!node) return null;
  if (target === node.val)
    return node;
  if (target < node.val)
    return searchBST(node.left, target);
  return searchBST(node.right, target);
}`,
    language: "javascript",
    x: 565,
    y: 145,
    width: 270,
    fontSize: 13
  })

  board.wait(1000)

  const step1CircleId = board.drawCircle({
    cx: nodes[0].x,
    cy: nodes[0].y,
    radius: 24,
    color: "#ff8a80"
  })
  const step1PointerId = board.drawPointer(nodes[0].x, nodes[0].y - 32, "#ff8a80", 7)
  const step1TextId = board.writeText({
    text: "27 > 20 (Go Right)",
    x: nodes[0].x,
    y: nodes[0].y - 45,
    fontSize: 14,
    color: "#ff8a80",
    fontFamily: "'Playpen Sans', sans-serif",
    fontWeight: "600",
    textAlign: "center"
  })

  board.wait(1500)

  board.delete(step1CircleId, 300)
  board.delete(step1PointerId, 300)
  board.delete(step1TextId, 300)

  const step2CircleId = board.drawCircle({
    cx: nodes[2].x,
    cy: nodes[2].y,
    radius: 24,
    color: "#ff8a80"
  })
  const step2PointerId = board.drawPointer(nodes[2].x, nodes[2].y - 32, "#ff8a80", 7)
  const step2TextId = board.writeText({
    text: "27 < 30 (Go Left)",
    x: nodes[2].x,
    y: nodes[2].y - 45,
    fontSize: 14,
    color: "#ff8a80",
    fontFamily: "'Playpen Sans', sans-serif",
    fontWeight: "600",
    textAlign: "center"
  })

  board.wait(1500)

  board.delete(step2CircleId, 300)
  board.delete(step2PointerId, 300)
  board.delete(step2TextId, 300)

  const step3CircleId = board.drawCircle({
    cx: nodes[5].x,
    cy: nodes[5].y,
    radius: 24,
    color: "#4dd0e1",
    fillColor: "rgba(77, 208, 225, 0.3)"
  })
  board.drawPointer(nodes[5].x, nodes[5].y + 35, "#4dd0e1", 7)
  board.writeText({
    text: "27 === 27 (Found!)",
    x: nodes[5].x,
    y: nodes[5].y + 60,
    fontSize: 16,
    color: "#4dd0e1",
    fontFamily: "'Playpen Sans', sans-serif",
    fontWeight: "700",
    textAlign: "center"
  })

  board.completeTrigger()
}

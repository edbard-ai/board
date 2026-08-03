"use client"
import { Board } from "@/lib/board"
import { useEffect } from "react"

export default function Home() {
  useEffect(() => {
    let isMounted = true

    const initBoard = async () => {
      if (!isMounted) return

      const board = new Board("board", 1400, 870, {
        speed: 35,
        background: "#060d12",
        hiDpi: true,
        fontFamily: "'Playpen Sans', sans-serif"
      })

      board.writeText({
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
      const el = document.getElementById("board")
      if (el) el.innerHTML = ""
    }
  }, [])

  return (
    <div className="w-full min-h-screen flex justify-center items-center bg-gray-950 p-2 sm:p-4">
      <div id="board" className="rounded-xl shadow-2xl overflow-hidden border border-gray-800 w-full max-w-[1400px]" />
    </div>
  )
}

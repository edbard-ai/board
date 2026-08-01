"use client"
import { Board, runBinarySearchExample } from "@/lib/board"
import { useEffect } from "react"

export default function Home() {
  useEffect(() => {
    let isMounted = true

    const initBoard = () => {
      if (!isMounted) return

      const board = new Board("board", 850, 530, {
        speed: 25,
        background: "#081214",
        hiDpi: true,
        fontFamily: "'Playpen Sans', sans-serif"
      })

      runBinarySearchExample(board)
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
    <div className="w-full min-h-screen flex justify-center items-center bg-gray-950 p-4">
      <div id="board" className="rounded-xl shadow-2xl overflow-hidden border border-gray-800" />
    </div>
  )
}

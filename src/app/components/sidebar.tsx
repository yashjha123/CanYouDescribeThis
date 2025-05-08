"use client"

import { motion } from "framer-motion"
// import { ScrollArea } from "@/components/ui/scroll-area"
import { useState } from "react"
import { ChevronRight, ChevronLeft, History } from "lucide-react"

interface HistoryItem {
  attempt: string
  result: "correct" | "incorrect" | "partial"
  timestamp: Date
}

interface SidebarProps {
  history: HistoryItem[]
}

export default function Sidebar({ history }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <motion.div
        className="fixed top-24 right-0 h-[calc(100vh-150px)] z-50"
        initial={{ x: "100%" }}
        animate={{ x: isOpen ? "0%" : "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="bg-white/80 backdrop-blur-md shadow-lg rounded-l-lg h-full w-80 p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-indigo-800 flex items-center gap-2">
              <History size={20} />
              Game History
            </h2>
          </div>
          <div className="h-[calc(100%-60px)] pr-4">
            {history.length === 0 ? (
              <p className="text-gray-500 italic text-center mt-8">No attempts yet</p>
            ) : (
              <div className="space-y-3">
                {history.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-3 rounded-md ${
                      item.result === "correct"
                        ? "bg-green-100 border-l-4 border-green-500"
                        : item.result === "partial"
                          ? "bg-yellow-100 border-l-4 border-yellow-500"
                          : "bg-red-100 border-l-4 border-red-500"
                    }`}
                  >
                    <p className="font-medium">{item.attempt}</p>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-xs text-gray-500">
                        {item.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                      <span
                        className={`text-xs font-semibold ${
                          item.result === "correct"
                            ? "text-green-600"
                            : item.result === "partial"
                              ? "text-yellow-600"
                              : "text-red-600"
                        }`}
                      >
                        {item.result.charAt(0).toUpperCase() + item.result.slice(1)}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-1/2 right-0 transform -translate-y-1/2 bg-indigo-600 text-white p-2 rounded-l-md shadow-md z-50"
        aria-label={isOpen ? "Close history" : "Open history"}
      >
        {isOpen ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
      </button>
    </>
  )
}

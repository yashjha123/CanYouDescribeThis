"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { X } from "lucide-react"

interface Toast {
  id: string
  title: string
  description?: string
  type: "success" | "error" | "warning" | "info"
  duration: number
}

interface ToastContainerProps {
  toasts: Toast[]
  removeToast: (id: string) => void
}

export default function ToastContainer({ toasts, removeToast }: ToastContainerProps) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} removeToast={removeToast} />
        ))}
      </AnimatePresence>
    </div>
  )
}

function ToastItem({ toast, removeToast }: { toast: Toast; removeToast: (id: string) => void }) {
  const [progress, setProgress] = useState(100)

  useEffect(() => {
    const startTime = Date.now()
    const endTime = startTime + toast.duration

    const updateProgress = () => {
      const now = Date.now()
      const remaining = endTime - now
      const percentage = (remaining / toast.duration) * 100
      setProgress(Math.max(0, percentage))

      if (percentage > 0) {
        requestAnimationFrame(updateProgress)
      }
    }

    const animationId = requestAnimationFrame(updateProgress)
    return () => cancelAnimationFrame(animationId)
  }, [toast.duration])

  const getBgColor = () => {
    switch (toast.type) {
      case "success":
        return "bg-green-100 border-green-500"
      case "error":
        return "bg-red-100 border-red-500"
      case "warning":
        return "bg-yellow-100 border-yellow-500"
      case "info":
        return "bg-blue-100 border-blue-500"
      default:
        return "bg-gray-100 border-gray-500"
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.8 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={`relative overflow-hidden rounded-lg border-l-4 shadow-md ${getBgColor()}`}
      style={{ width: "320px" }}
    >
      <div className="p-4 pr-8">
        <button
          onClick={() => removeToast(toast.id)}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          <X size={16} />
        </button>
        <h4 className="font-semibold text-gray-800">{toast.title}</h4>
        {toast.description && <p className="mt-1 text-sm text-gray-600">{toast.description}</p>}
      </div>
      <div className="h-1 bg-gray-300" style={{ position: "relative" }}>
        <div
          className={`h-full ${
            toast.type === "success"
              ? "bg-green-500"
              : toast.type === "error"
                ? "bg-red-500"
                : toast.type === "warning"
                  ? "bg-yellow-500"
                  : "bg-blue-500"
          }`}
          style={{ width: `${progress}%`, transition: "width 0.1s linear" }}
        />
      </div>
    </motion.div>
  )
}

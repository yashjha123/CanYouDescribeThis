"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Trophy, AlertTriangle, Clock, Info } from "lucide-react"
import Button from '@mui/material/Button';

interface GameModalProps {
  isOpen: boolean
  onClose: () => void
  type: "start" | "win" | "lose"
  score?: number
  onStart?: () => void
  onRestart?: () => void
}

export default function GameModal({ isOpen, onClose, type, score = 0, onStart, onRestart }: GameModalProps) {
  const [currentStep, setCurrentStep] = useState(0)
    
  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0)
    }
  }, [isOpen])

  const startSteps = [
    {
      title: "Welcome to Grid Waldo!",
      description: "A game of attention and memory with quick-reflex mechanics.",
      icon: <Info className="w-12 h-12 text-indigo-500" />,
    },
    {
      title: "How to Play",
      description:
        "Watch carefully! One image will briefly flash for just 1 second. Your task is to identify which image was highlighted.",
      icon: <Clock className="w-12 h-12 text-indigo-500" />,
    },
    {
      title: "Ready?",
      description: "You'll have limited chances to guess correctly. Good luck!",
      icon: <AlertTriangle className="w-12 h-12 text-yellow-500" />,
    },
  ]

  const renderContent = () => {
    if (type === "start") {
      const step = startSteps[currentStep]
      return (
        <div className="text-center">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center"
          >
            <div className="mb-4">{step.icon}</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{step.title}</h2>
            <p className="text-gray-600 mb-6">{step.description}</p>
          </motion.div>

          <div className="flex justify-between mt-8">
            {currentStep > 0 && (
              <Button variant="outlined" onClick={() => setCurrentStep((prev) => prev - 1)}>
                Back
              </Button>
            )}
            <div className="flex-1" />
            {currentStep < startSteps.length - 1 ? (
              <Button onClick={() => setCurrentStep((prev) => prev + 1)}>Next</Button>
            ) : (
              <Button onClick={onStart}>Start Game</Button>
            )}
          </div>
          <div className="flex justify-center mt-4 gap-1">
            {startSteps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${index === currentStep ? "bg-indigo-500" : "bg-gray-300"}`}
              />
            ))}
          </div>
        </div>
      )
    } else if (type === "win") {
      return (
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="flex justify-center mb-6"
          >
            <Trophy className="w-16 h-16 text-yellow-500" />
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Congratulations!</h2>
          <p className="text-gray-600 mb-4">You found the correct image!</p>
          <div className="bg-indigo-100 rounded-lg p-4 mb-6">
            <p className="text-indigo-800 font-semibold">Your Score: {score}</p>
          </div>
          <Button onClick={onRestart} className="w-full">
            Play Again
          </Button>
        </div>
      )
    } else {
      return (
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="flex justify-center mb-6"
          >
            <AlertTriangle className="w-16 h-16 text-red-500" />
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Game Over</h2>
          <p className="text-gray-600 mb-4">You&apos;ve run out of chances!</p>
          <div className="bg-indigo-100 rounded-lg p-4 mb-6">
            <p className="text-indigo-800 font-semibold">Your Score: {score}</p>
          </div>
          <Button onClick={onRestart} className="w-full">
            Try Again
          </Button>
        </div>
      )
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6 z-10"
          >
            {renderContent()}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

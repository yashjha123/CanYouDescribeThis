"use client"
import { Lato } from "next/font/google"
import { CircularProgress } from "@mui/material"
import { motion } from "framer-motion"

const labrada = Lato({
  subsets: ["latin"],
  weight: ["300", "700"],
  display: "swap",
})

const AnswerBox = ({
  isLocked,
  setIsLocked,
  text,
  setText,
  checkAttempt,
}: {
  isLocked: boolean
  setIsLocked: (isLocked: boolean) => void
  text: string
  setText: (text: string) => void
  checkAttempt: (text: string) => Promise<void>
}) => {
  const shouldItBeAtTheCenter = text? {"position": "absolute", "right": 0 }: {}
  return (
    <motion.div
      className={`fixed bottom-8 w-full lg:w-200 h-[80px] bg-white/40 backdrop-blur rounded-xl backdrop-blur-sm transition-all duration-500 ease-in-out ${
        isLocked ? "scale-103 backdrop-blur-none bg-transparent" : ""
      }`}
      style={{ backgroundColor: "rgba(255, 255, 255, 0.3)", boxShadow: "0 0 20px rgba(0, 0, 0, 0.2)" }}
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      {isLocked ? (
        <div className="flex items-center justify-center gap-2 h-full">
          {text && !isLocked?
          <motion.div
            className="flex items-center justify-center gap-2 text-black w-full h-full text-xl"
            style={{ color: "gray" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {text}
          </motion.div>
          :<></>}
          <CircularProgress
            size={24}
            style={{ margin: "30px", ...shouldItBeAtTheCenter}}
            disableShrink
            color="primary"
          />
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            checkAttempt(text)
          }}
          className="w-full h-full bg-transparent text-black font-bold"
        >
          <motion.input
            type="text"
            className={`w-full h-full bg-transparent text-xl p-4 rounded-xl border-none focus:outline-none text-center ${labrada.className}`}
            placeholder="Type here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onFocus={() => setIsLocked(false)}
            disabled={isLocked}
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            whileFocus={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          />
        </form>
      )}
    </motion.div>
  )
}

export default AnswerBox

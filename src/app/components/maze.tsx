"use client"
import { useEffect, useState, useRef, useCallback, memo } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import AnswerBox from "./answerBox"
import { getRandomImages, getTextEmbeddings, checkIfTextMatchesImages } from "../api/vectors"
import { CircularProgress } from "@mui/material"
import Sidebar from "./sidebar"
import GameModal from "./game-modal"
import ToastContainer from "./toast-container"
import { useToast } from "../hooks/use-toast"
import { Trophy, AlertCircle, Clock } from "lucide-react"
import { supabase } from "../api/supabase"

type MatchResult = {
  id: string
  similarity: number
}

interface HistoryItem {
  attempt: string
  result: "correct" | "incorrect" | "partial"
  timestamp: Date
}

interface CardType {
  id: string
  src: string
  color: string
  index: number
  selected: boolean
}

// Color constants
const COLORS = {
  default: "black",
  green: "green",
  red: "red",
  gray: "gray",
}

// Background color opacity mapping (20% shade)
const BG_COLORS = {
  [COLORS.default]: "rgba(50, 50, 93, 0.25)",
  [COLORS.green]: "rgba(0, 128, 0, 0.2)",
  [COLORS.red]: "rgba(255, 0, 0, 0.2)",
  [COLORS.gray]: "rgba(128, 128, 128, 0.2)",
}

// Border color mapping
const BORDER_COLORS = {
  [COLORS.default]: "rgba(50, 50, 93, 0.25",
  [COLORS.green]: "5px solid #81E7AF",
  [COLORS.red]: "5px solid #FF6B6B",
  [COLORS.gray]: "5px solid #B2C6D5",
}

const MAX_CHANCES = 3
const HIGHLIGHT_DURATION = 1000 // 1 second for highlight

// Memoized Card component to prevent unnecessary re-renders
const GameCard = memo(({ 
  cardData, 
  isSelected, 
  isWinner, 
  gameWon, 
  gameOver 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Get the appropriate background color (20% opacity)
  const bgColor = BG_COLORS[cardData.color] || BG_COLORS[COLORS.default];
  // Get the appropriate border
  const borderStyle = BORDER_COLORS[cardData.color] || BORDER_COLORS[COLORS.default];

  return (
    <motion.div
      className={`rounded-sm backdrop-blur-sm flex flex-col gap-4 items-center justify-center cursor-pointer w-[230px] h-[180px] relative overflow-hidden card ${
        isLoaded ? "loaded" : ""
      } ${isSelected? cardData.color : ""}`}
      initial={{ scale: 1 }}
      animate={{
        scale: cardData.selected ? [1, 1.05] : 1,
        backgroundColor: bgColor,
        // boxShadow: cardData.selected ? "0 0 20px rgba(0,0,0, 0.8)" : "none",
      }}
      transition={{
        // type: "spring",
        // stiffness: 300,
        // damping: 20,
        duration: 0.1,
      }}
      style={{
        // crown color
        
        boxShadow: (cardData.selected && cardData.color === COLORS.default) ? "0 0 15px 5px rgba(128, 128, 128, 0.4), 0 0 30px 10px rgba(128, 128, 128, 0.2)" : "0px 0px 10px 2px #ffffff",
      }}
    >
      {!isLoaded && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%",
            background: "#f0f0f0",
          }}
        >
          <CircularProgress size={24} />
        </div>
      )}
      <Image
        src={cardData.src || "/placeholder.svg"}
        alt="Game Image"
        fill={true}
        className="object-cover"
        sizes="230px"
        onLoad={() => setIsLoaded(true)}
        style={{ opacity: isLoaded ? 1 : 0 }}
      />
    </motion.div>
  )
}, (prevProps, nextProps) => {
  // Custom comparison function to control when component should re-render
  return (
    prevProps.cardData.src === nextProps.cardData.src &&
    prevProps.cardData.color === nextProps.cardData.color &&
    prevProps.cardData.selected === nextProps.cardData.selected &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.gameWon === nextProps.gameWon &&
    prevProps.gameOver === nextProps.gameOver
  );
});

// Separate game status component to prevent re-renders of the grid
const GameStatus = memo(({ gameStarted, gameTimer, score, chancesLeft }) => {
  return (
    <div className="w-full flex justify-between items-center mb-2">
      <div className="flex items-center gap-2">
        <Clock className="w-5 h-5 text-indigo-800" />
        <span className="font-bold text-indigo-800">{gameStarted ? `Time: ${gameTimer}s` : "Get Ready!"}</span>
      </div>

      <div className="flex items-center gap-2">
        <Trophy className="w-5 h-5 text-yellow-600" />
        <span className="font-bold text-yellow-600">Score: {score}</span>
      </div>

      <div className="flex items-center gap-2">
        <AlertCircle className="w-5 h-5 text-red-600" />
        <span className="font-bold text-red-600">Chances: {chancesLeft}</span>
      </div>
    </div>
  );
});

const Maze = () => {
  const [text, setText] = useState("")
  const [preGameTimer, setPreGameTimer] = useState(3)
  const [gameTimer, setGameTimer] = useState(0)
  const [isLocked, setIsLocked] = useState(false)
  const [info, setInfo] = useState("")
  const [selectedCard, setSelectedCard] = useState<number>(0)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [gameWon, setGameWon] = useState(false)
  const [chancesLeft, setChancesLeft] = useState(MAX_CHANCES)
  const [score, setScore] = useState(0)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [showStartModal, setShowStartModal] = useState(true)
  const [showEndModal, setShowEndModal] = useState(false)
  const [highlightSequence, setHighlightSequence] = useState<number[]>([])
  const [currentHighlightIndex, setCurrentHighlightIndex] = useState(-1)
  const { toasts, addToast, removeToast } = useToast()
  const animationRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize 9 cards (0-8) instead of 10
  const [images, setImages] = useState<CardType[]>(
    Array.from(Array(9).keys()).map((i) => ({
      id: "00",
      src: `https://picsum.photos/seed/LifeIsGood-${i}/230/180`,
      color: COLORS.default,
      index: i,
      selected: false,
    })),
  )

  // Start the game
  const startGame = useCallback(() => {
    setShowStartModal(false)
    setGameStarted(false)
    setGameOver(false)
    setGameWon(false)
    setChancesLeft(MAX_CHANCES)
    setScore(0)
    setHistory([])

    // Reset all cards
    setImages((currentImages) =>
      currentImages.map((image) => ({
        ...image,
        color: COLORS.default,
        selected: false,
      })),
    )

    // Start pre-game countdown
    setPreGameTimer(3)

    // Add toast notification
    addToast({
      title: "Game Starting",
      description: "Watch carefully for the highlighted image!",
      type: "info",
      duration: 3000,
    })
  }, [addToast])

  // Function to list possible adjacent indices in a 3x3 grid
  const listPossibleIndices = useCallback((index: number) => {
    // It's a 3x3 grid (indices 0-8)
    const possibleIndices = [];
    const row = Math.floor(index / 3);
    const col = index % 3;
    
    // Check up
    if (row > 0) {
      possibleIndices.push(index - 3);
    }
    
    // Check down
    if (row < 2) {
      possibleIndices.push(index + 3);
    }
    
    // Check left
    if (col > 0) {
      possibleIndices.push(index - 1);
    }
    
    // Check right
    if (col < 2) {
      possibleIndices.push(index + 1);
    }
    
    return possibleIndices;
  }, []);

  // Create highlight sequence animation
  const createHighlightSequence = useCallback(() => {
    // Create a sequence that ends with the selected card
    const sequence = [];
    const numSteps = 5; // Number of cards to highlight before the target
    
    // Start with a random position
    let currentIndex = Math.floor(Math.random() * 9);
    while (currentIndex === selectedCard) {
      currentIndex = Math.floor(Math.random() * 9);
    }
    
    sequence.push(currentIndex);
    
    // Add steps that follow adjacent paths
    for (let i = 1; i < numSteps; i++) {
      // Get possible moves from current position
      const possibleMoves = listPossibleIndices(currentIndex);
      
      // Filter out moves that would go back to previous positions
      const validMoves = possibleMoves.filter(
        index => !sequence.includes(index) && index !== selectedCard
      );
      
      // If no valid moves available, pick a random new position
      if (validMoves.length === 0) {
        let randomIndex;
        do {
          randomIndex = Math.floor(Math.random() * 9);
        } while (
          randomIndex === selectedCard || 
          sequence.includes(randomIndex)
        );
        
        currentIndex = randomIndex;
      } else {
        // Pick a random valid adjacent move
        const randomMoveIndex = Math.floor(Math.random() * validMoves.length);
        currentIndex = validMoves[randomMoveIndex];
      }
      
      sequence.push(currentIndex);
    }
    
    // Now construct a path from the last random position to the target card
    let pathToTarget = [];
    currentIndex = sequence[sequence.length - 1];
    
    // Simple breadth-first search to find path to target
    if (currentIndex !== selectedCard) {
      const visited = new Set(sequence);
      const queue = [[currentIndex, []]]; // [position, path]
      
      while (queue.length > 0) {
        const [pos, path] = queue.shift();
        
        if (pos === selectedCard) {
          pathToTarget = path;
          break;
        }
        
        const nextMoves = listPossibleIndices(pos);
        for (const next of nextMoves) {
          if (!visited.has(next)) {
            visited.add(next);
            queue.push([next, [...path, next]]);
          }
        }
      }
      
      // Add path to target to our sequence
      sequence.push(...pathToTarget);
    }
    
    // Finally, add the selected card at the end if it's not already there
    if (sequence[sequence.length - 1] !== selectedCard) {
      sequence.push(selectedCard);
    }
    
    return sequence;
  }, [selectedCard, listPossibleIndices])

  // Run the highlight animation sequence
  const runHighlightSequence = useCallback(() => {
    if (currentHighlightIndex >= 0 && currentHighlightIndex < highlightSequence.length) {
      // Highlight the current card in the sequence
      const highlightIndex = highlightSequence[currentHighlightIndex]

      setImages((currentImages) =>
        currentImages.map((image, idx) => ({
          ...image,
          selected: idx === highlightIndex,
        })),
      )

      // Move to the next card in the sequence after a delay
      animationRef.current = setTimeout(() => {
        // Reset the current highlight
        setImages((currentImages) =>
          currentImages.map((image) => ({
            ...image,
            selected: false,
          })),
        )

        // Move to the next card in the sequence
        setCurrentHighlightIndex((prev) => prev + 1)
      }, 500) // Quick flash for each card
    } else {
      // End of sequence
      setGameStarted(true)
      setGameTimer(30) // Start 30-second game timer

      // Add toast notification
      addToast({
        title: "Game Started!",
        description: "Find the highlighted image before time runs out!",
        type: "success",
        duration: 3000,
      })
    }
  }, [currentHighlightIndex, highlightSequence, addToast])

  // Moving the checkAttempt function here from answerBox
  const checkAttempt = useCallback(async (text: string) => {
    // Step 1: Check if text is empty, if not then freeze the input
    const trimmedText = text.trim()
    if (trimmedText.length === 0) {
      setIsLocked(true)
      return
    }

    // Lock the input while processing
    setIsLocked(true)

    try {
      // Reduce chances
      setChancesLeft((prev) => prev - 1)

      // Step 2: Get text embeddings
      const textEmbedding = await getTextEmbeddings(trimmedText)

      // Step 3: Check if the text matches any images
      const matchResults = await checkIfTextMatchesImages(
        textEmbedding,
        images.map((image) => image.id),
        supabase,
      )

      if (!matchResults || matchResults.length === 0) {
        // No matches found, keep everything as is
        setInfo("No matching images found.")

        // Add to history
        setHistory((prev) => [
          ...prev,
          {
            attempt: trimmedText,
            result: "incorrect",
            timestamp: new Date(),
          },
        ])

        // Add toast notification
        addToast({
          title: "No Match Found",
          description: "Try a different description!",
          type: "error",
          duration: 3000,
        })

        return
      }

      // Create a map of matched image indexes
      const matchedIndexes = new Map()
      matchResults.forEach((match: MatchResult) => {
        matchedIndexes.set(match.id, {
          score: match.similarity,
        })
      })

      // Update image colors based on matching results
      setImages((currentImages: CardType[]) => {
        const reset = currentImages.map((e) => {
          return { ...e, selected: false }
        })
        return reset.map((image: CardType) => {
          const matchInfo = matchedIndexes.get(image.id)

          if (!matchInfo) {
            // Image not matched, keep it as is
            return image
          }

          if (image.index === selectedCard && matchResults.length === 1) {
            // Correct match!
            setInfo("Correct match! Great job!")

            setGameWon(true)
            setGameOver(true)

            // Calculate score based on chances left and time
            const timeBonus = Math.floor(gameTimer * 10)
            const chanceBonus = chancesLeft * 500
            const newScore = 1000 + timeBonus + chanceBonus
            setScore(newScore)

            // Add to history
            setHistory((prev) => [
              ...prev,
              {
                attempt: trimmedText,
                result: "correct",
                timestamp: new Date(),
              },
            ])

            // Show end modal
            setTimeout(() => {
              setShowEndModal(true)
            }, 1000)

            // Add toast notification
            addToast({
              title: "Correct!",
              description: "You found the right image!",
              type: "success",
              duration: 5000,
            })

            return { ...image, color: COLORS.green, selected: true }
          } else {
            // Incorrect match
            setInfo("Some correct, some incorrect matches.")

            // Add to history
            setHistory((prev) => [
              ...prev,
              {
                attempt: trimmedText,
                result: "partial",
                timestamp: new Date(),
              },
            ])

            // Check if out of chances
            if (chancesLeft <= 1) {
              setGameOver(true)

              // Show end modal
              setTimeout(() => {
                setShowEndModal(true)
              }, 1000)

              // Add toast notification
              addToast({
                title: "Game Over",
                description: "You've run out of chances!",
                type: "error",
                duration: 5000,
              })
            } else {
              // Add toast notification
              addToast({
                title: "Not Quite Right",
                description: `${chancesLeft - 1} chances left!`,
                type: "warning",
                duration: 3000,
              })
            }

            return { ...image, color: COLORS.red, selected: true }
          }
        })
      })
    } catch (error) {
      console.error("Error checking text match:", error)
      setInfo("An error occurred while checking your answer.")

      // Add toast notification
      addToast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        type: "error",
        duration: 3000,
      })
    } finally {
      // Keep the input locked if necessary or unlock after a delay
      setTimeout(() => {
        setIsLocked(false)
        setText("")
      }, 1500) // Delay to show results before allowing new input
    }
  }, [images, selectedCard, chancesLeft, gameTimer, addToast])

  // Pre-game countdown timer
  useEffect(() => {
    if (preGameTimer > 0 && !gameStarted && !showStartModal) {
      const interval = setTimeout(() => {
        setPreGameTimer((prev) => prev - 1)

        // Add toast notification for countdown
        addToast({
          title: `Starting in ${preGameTimer}`,
          type: "info",
          duration: 1000,
        })
      }, 1000)

      return () => clearTimeout(interval)
    } else if (preGameTimer === 0 && !gameStarted && !showStartModal) {
      // Create and start the highlight sequence
      const randomIndex = Math.floor(Math.random() * 9);
      setSelectedCard(randomIndex);
      const sequence = createHighlightSequence()
      setHighlightSequence(sequence)
      setCurrentHighlightIndex(0)
    }
  }, [preGameTimer, gameStarted, showStartModal, addToast, createHighlightSequence])

  // Run highlight sequence
  useEffect(() => {
    if (currentHighlightIndex >= 0) {
      runHighlightSequence()
    }

    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current)
      }
    }
  }, [currentHighlightIndex, runHighlightSequence])

  // Game timer
  useEffect(() => {
    if (gameStarted && !gameOver && gameTimer > 0) {
      const interval = setTimeout(() => {
        setGameTimer((prev) => prev - 1)
      }, 1000)

      return () => clearTimeout(interval)
    } else if (gameStarted && !gameOver && gameTimer === 0) {
      // Time's up
      setGameOver(true)

      // Show end modal
      setShowEndModal(true)

      // Add toast notification
      addToast({
        title: "Time's Up!",
        description: "You've run out of time!",
        type: "error",
        duration: 5000,
      })
    }
  }, [gameTimer, gameStarted, gameOver, addToast])

  // Fetch random images and set a selected card when component mounts
  useEffect(() => {
    getRandomImages(supabase).then((data) => {
      // Make sure we only use 9 images and properly set their indices
      const formattedData = data.slice(0, 9).map((item, index) => ({
        ...item,
        index,
        color: COLORS.default,
        selected: false,
      }))

      // Randomly select a target card
      const randomIndex = Math.floor(Math.random() * 9)
      setSelectedCard(randomIndex)

      setImages(formattedData)
    })
  }, [])

  // Memoized RestartGame handler
  const handleRestart = useCallback(() => {
    setShowEndModal(false)
    startGame()
  }, [startGame])

  return (
    <>
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start md:gap-6 p-6 rounded-xl backdrop-blur" 
      style={{backgroundColor: "rgba(255, 255, 255, 0.1)", boxShadow: "0 0 20px rgba(0, 0, 0, 0.3)"}}>
        <GameStatus 
          gameStarted={gameStarted}
          gameTimer={gameTimer}
          score={score}
          chancesLeft={chancesLeft}
        />

        <div className="grid grid-cols-3 gap-4 gap-[16px]">
          {images.map((cardData, index) => (
            <GameCard
              key={`card-${index}`}
              cardData={cardData}
              isSelected={cardData.selected}
              gameWon={gameWon}
              gameOver={gameOver}
            />
          ))}
        </div>
      </main>

      <AnswerBox
        isLocked={isLocked || !gameStarted || gameOver}
        setIsLocked={setIsLocked}
        text={text}
        setText={setText}
        checkAttempt={checkAttempt}
      />

      <Sidebar history={history} />

      <GameModal isOpen={showStartModal} onClose={() => {}} type="start" onStart={startGame} />

      <GameModal
        isOpen={showEndModal}
        onClose={() => setShowEndModal(false)}
        type={gameWon ? "win" : "lose"}
        score={score}
        onRestart={handleRestart}
      />

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </>
  )
}

export default Maze
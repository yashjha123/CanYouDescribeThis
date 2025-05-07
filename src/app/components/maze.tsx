"use client";
import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion"; // Fixed import from motion/react to framer-motion
import Image from "next/image";
import AnswerBox from "./answerBox";
import {
  getRandomImages,
  getTextEmbeddings,
  checkIfTextMatchesImages,
} from "../api/vectors";
import { createClient } from "@supabase/supabase-js";

type MatchResult = {
  id: string;
  similarity: number;
};

const randomImage = ({ i }: { i: number }) => {
  const seed = "LifeIsGood";
  return `https://picsum.photos/seed/${seed}-${i}/230/180`;
};

interface CardType {
  id: string,
  src: string;
  color: string;
  index: number;
  selected: boolean;
}

// Color constants
const COLORS = {
  default: "#03A791",
  green: "green",
  red: "red",
  gray: "gray"
};

// Background color opacity mapping (20% shade)
const BG_COLORS = {
  [COLORS.default]: "rgba(3, 167, 145, 0.2)",
  [COLORS.green]: "rgba(0, 128, 0, 0.2)",
  [COLORS.red]: "rgba(255, 0, 0, 0.2)",
  [COLORS.gray]: "rgba(128, 128, 128, 0.2)"
};

// Border color mapping
const BORDER_COLORS = {
  [COLORS.default]: "none",
  [COLORS.green]: "5px solid #81E7AF",
  [COLORS.red]: "5px solid #FF6B6B",
  [COLORS.gray]: "5px solid #B2C6D5"
};

const Maze = () => {
  const [text, setText] = useState("");
  const [timer, setTimer] = useState(1);
  const [isLocked, setIsLocked] = useState(false);
  const [info, setInfo] = useState("");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Initialize 9 cards (0-8) instead of 10
  const [images, setImages] = useState<CardType[]>(
    Array.from(Array(9).keys()).map((i) => ({
      id: "00",
      src: randomImage({ i }),
      color: COLORS.default,
      index: i,
      selected: false,
    }))
  );

  // Moving the checkAttempt function here from answerBox
  const checkAttempt = async (text: string) => {
    // Step 1: Check if text is empty, if not then freeze the input
    const trimmedText = text.trim();
    if (trimmedText.length === 0) {
      setIsLocked(true);
      return;
    }

    // Lock the input while processing
    setIsLocked(true);

    try {
      // Step 2: Get text embeddings
      const textEmbedding = await getTextEmbeddings(trimmedText);
      
      // Step 3: Check if the text matches any images
      const matchResults = await checkIfTextMatchesImages(textEmbedding, images.map(image => image.id), supabase);
      console.log(matchResults)
      if (!matchResults || matchResults.length === 0) {
        // No matches found, keep everything as is
        setInfo("No matching images found.");
        return;
      }

      
      // Create a map of matched image indexes
      const matchedIndexes = new Map();
      matchResults.forEach((match: MatchResult) => {
        matchedIndexes.set(match.id, {
          score: match.similarity
        });
      });

      // Update image colors based on matching results
      setImages((currentImages: CardType[]) => {
        const reset = currentImages.map(e=>{return {...e, selected: false}});
        return reset.map((image: CardType) => {
          const matchInfo = matchedIndexes.get(image.id);
          console.log(matchedIndexes)
          if (!matchInfo) {
            // Image not matched, keep it as is
            return image;
          }
          
          if (image.color == COLORS.green && matchResults.length == 1) {
            setInfo("Correct match! Great job!");
            return { ...image, color: COLORS.green, selected: true };
          } else {
            setInfo("Some correct, some incorrect matches.");
            return { ...image, color: COLORS.red, selected: true };
          }
        });
      });

      // // Set feedback message based on results
      // if (allCorrect && anyCorrect) {
      //   setInfo("Correct match! Great job!");
      // } else if (!anyCorrect) {
      //   setInfo("No correct matches found. Try again!");
      // } else {
      //   setInfo("Some correct, some incorrect matches.");
      // }

    } catch (error) {
      console.error("Error checking text match:", error);
      setInfo("An error occurred while checking your answer.");
    } finally {
      // Keep the input locked if necessary or unlock after a delay
      setTimeout(() => {
        setIsLocked(false);
      }, 1500); // Delay to show results before allowing new input
    }
  };

  useEffect(() => {
    const interval = setTimeout(() => {
      if (timer <= 0) {
        // setGameStarted(true);
        setText(""); // Clear the "Game starts" text
        return;
      }
      setTimer((old) => {
        setText("Game starts in " + (old - 1));
        return old - 1;
      });
    }, 1000); // Changed from 100ms to 1000ms for a more reasonable countdown
    return () => clearTimeout(interval);
  }, [timer]);

  // we pick the card randomly before the game begins
  useEffect(() => {
    getRandomImages(supabase).then((data) => {
      // Make sure we only use 9 images and properly set their indices
      const formattedData = data.slice(0, 9).map((item, index) => ({
        ...item,
        index,
        color: index === 2 ? COLORS.green : COLORS.default, // Example: marking card 2 as gray
        selected: false
      }));
      
      setImages(formattedData);
    });
  }, [supabase]);

  const Card = useMemo(
    () =>
      function CardGen({ i }: { i: number }) {
        const cardData = images[i];
        if (!cardData) return null; // Safety check
        
        // Get the appropriate background color (20% opacity)
        const bgColor = BG_COLORS[cardData.color] || BG_COLORS[COLORS.default];
        // Get the appropriate border
        const borderStyle = BORDER_COLORS[cardData.color] || BORDER_COLORS[COLORS.default];
        
        return (
          <motion.div
            className="rounded-sm backdrop-blur-sm flex flex-col gap-4 items-center justify-center cursor-pointer w-[230px] h-[180px] relative overflow-hidden"
            initial={{ scale: 1 }}
            animate={{ 
              scale: cardData.selected ? [1, 1.05] : 1,
              backgroundColor: bgColor
            }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 20,
              duration: 0.5
            }}
            style={{ border: borderStyle }}
          >
            <Image
              src={cardData.src}
              alt="Game Image"
              fill={true}
              className="object-cover"
              sizes="230px"
            />
          </motion.div>
        );
      },
    [images]
  );

  return (
    <>
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start md:gap-6 p-6 rounded-xl backdrop-blur bg-white/50">
        <div className="text-center w-full text-lg font-semibold" style={{ color: COLORS.gray }}>
          {info}
        </div>
        <div className="grid grid-cols-3 gap-4 gap-[16px]">
          <Card i={0} />
          <Card i={1} />
          <Card i={2} />
          <Card i={3} />
          <Card i={4} />
          <Card i={5} />
          <Card i={6} />
          <Card i={7} />
          <Card i={8} />
        </div>
      </main>
      <AnswerBox
        isLocked={isLocked}
        setIsLocked={setIsLocked}
        text={text}
        setText={setText}
        setImages={setImages}
        checkAttempt={checkAttempt} // Pass the checkAttempt function to AnswerBox
      />
    </>
  );
};

export default Maze;
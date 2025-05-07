"use client";
import React, { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import Image from "next/image";
import AnswerBox from "./answerBox";

const randomImage = ({ i }: { i: number }) => {
  const seed = "LifeIsGood";
  return `https://picsum.photos/seed/${seed}-${i}/230/180`;
};

const Maze = () => {
  const [text, setText] = useState("");
  const [timer, setTimer] = useState(1);
  const [isLocked, setIsLocked] = useState(false);
  const [pickedCard, setPickedCard] = useState(0);
  const [info, setInfo] = useState("");
  useEffect(() => {
    const interval = setTimeout(() => {
      if (timer <= 0) {
        startGame();
        return;
      }
      setTimer((old) => {
        setText("Game starts in " + (old - 1));
        return old - 1;
      });
    }, 100);
    return () => clearTimeout(interval);
  }, [timer]);

  const startGame = () => {
    setText("");
    const randomlyPickedCard = Math.floor(Math.random() * 10) + 1;
    console.log("Picked", randomlyPickedCard);
    setPickedCard(randomlyPickedCard);
  };

  const checkAttempt = (text: string) => {
    console.log("Checking", text);

    // for testing purposes we pick a random tile
    const randomlyPickedCard = Math.floor(Math.random() * 10) + 1;
    const isCorrect = randomlyPickedCard == pickedCard;
    if (isCorrect) {
      setInfo("Correct!");
    } else {
      setInfo("Incorrect!");
    }
  };

  const Card = useMemo(
    () =>
      function CardGen({ i }: { i: number }) {
        return (
          <motion.div
            animate={i == pickedCard ? { rotate: 360 } : {}}
            className="padding-[16px] rounded-xl bg-indigo-950/50 backdrop-blur-sm flex flex-col gap-4 items-center justify-center cursor-pointer transition-all duration-500 ease-out hover:scale-105 hover:bg-indigo-950 w-[230px] h-[180px]"
          >
            <Image
              src={randomImage({ i: i })}
              alt="Random Image"
              fill={true}
              className="margin-[30px] rounded-xl"
            />
          </motion.div>
        );
      },
    [pickedCard]
  );
  return (
    <>
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start md:gap-6 p-6 rounded-xl backdrop-blur bg-white/50">
        {info}
        <div className="grid grid-cols-3 gap-4 gap-[16px]">
          <Card i={1} />
          <Card i={2} />
          <Card i={3} />
          <Card i={4} />
          <Card i={5} />
          <Card i={6} />
          <Card i={7} />
          <Card i={8} />
          <Card i={9} />
        </div>
      </main>
      <AnswerBox
        isLocked={isLocked}
        setIsLocked={setIsLocked}
        text={text}
        setText={setText}
        checkAttempt={checkAttempt}
      />
    </>
  );
};

export default Maze;

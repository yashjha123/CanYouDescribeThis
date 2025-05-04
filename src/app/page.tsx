"use client";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import "../app/animation.css";

const randomImage = ({ i }: { i: number }) => {
  const seed = "LifeIsGood";
  return `https://picsum.photos/seed/${seed}-${i}/230/180`;
};

const TextBox = ({
  isLocked,
  setIsLocked,
  text,
  setText,
  checkAttempt,
}: {
  isLocked: boolean;
  setIsLocked: any;
  text: string;
  setText: any;
  checkAttempt: any;
}) => {

  return (
    <div
      className={`fixed bottom-15 w-full lg:w-200 h-[80px] bg-white/90 backdrop-blur rounded-xl backdrop-blur-sm transition-all duration-500 ease-in-out ${
        isLocked ? "scale-103 backdrop-blur-none bg-transparent" : ""
      }`}
    >
      {isLocked ? (
        <div className="flex items-center justify-center gap-2 text-black w-full h-full text-xl">
          Wait for the timer to stop!
        </div>
      ) : (
        <form onSubmit={(e) => {
          e.preventDefault();
          checkAttempt(text);
        }} className="w-full h-full bg-transparent text-black font-bold">
        <input
          type="text"
          className={`w-full h-full bg-transparent text-xl p-4 rounded-xl border-none focus:outline-none text-center `}
          placeholder="Type here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onFocus={() => setIsLocked(false)}
          disabled={isLocked}
        />
        </form>
      )}
    </div>
  );
};

export default function Home() {
  const [text, setText] = useState("");
  const [timer, setTimer] = useState(1);
  const [isLocked, setIsLocked] = useState(false);
  const [pickedCard, setPickedCard] = useState(0);
  const [info, setInfo] = useState("");

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
  }

  const Card = useMemo(() => {
    return ({ i }: { i: number }) => {
      return (
        <motion.div animate={i == pickedCard ? { rotate: 360 } : {}} className="padding-[16px] rounded-xl bg-indigo-950/50 backdrop-blur-sm flex flex-col gap-4 items-center justify-center cursor-pointer transition-all duration-500 ease-out hover:scale-105 hover:bg-indigo-950 w-[230px] h-[180px]">
          <Image
            src={randomImage({ i: i })}
            alt="Random Image"
            fill={true}
            className="margin-[30px] rounded-xl"
          />
        </motion.div>
      );
    };
  }, [pickedCard]);

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

  return (
    <div className="grid grid-rows-[30px_1fr_40px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)] waves">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-300 via-pink-300 to-indigo-300 text-transparent bg-clip-text">
          Can you describe this? {timer}
        </h1>
        <p className="text-indigo-200">{info}</p>
        <p className="text-indigo-200">
          Use your creativity to help AI find this image in the wild.
        </p>
      </div>
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start bg-slate-500/30 md:gap-6 p-6 rounded-xl backdrop-blur">
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
      {/* Floating Text Box */}``
      <TextBox
        isLocked={isLocked}
        setIsLocked={setIsLocked}
        text={text}
        setText={setText}
        checkAttempt={checkAttempt}
      />
      {/* Footer */}
      {/* <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          GitHub
        </a>
      </footer> */}
    </div>
  );
}

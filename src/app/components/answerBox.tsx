import React, { useEffect } from "react";
import { getRecommendations } from "../api/vectors";
// import { createClient } from '@/utils/supabase/server'
import { createClient } from "@supabase/supabase-js";

const AnswerBox = ({
  isLocked,
  setIsLocked,
  text,
  setText,
  checkAttempt,
}: {
  isLocked: boolean;
  setIsLocked: (isLocked: boolean) => void;
  text: string;
  setText: (text: string) => void;
  checkAttempt: (text: string) => void;
}) => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

  const supabase = createClient(supabaseUrl, supabaseKey);

  useEffect(() => {
    getRecommendations(text, supabase).then((data) => {
      console.log(data);
    });
  }, [supabase, text]);
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
        <form
          onSubmit={(e) => {
            e.preventDefault();
            checkAttempt(text);
          }}
          className="w-full h-full bg-transparent text-black font-bold"
        >
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

export default AnswerBox;

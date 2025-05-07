import React, { useEffect } from "react";
import {
  getPublicURL,
  getRecommendations,
  getTextEmbeddings,
} from "../api/vectors";
import { createClient } from "@supabase/supabase-js";

interface CardType {
  src: string;
  color: string;
  index: number;
  selected: boolean;
}

const randomImage = ({ i }: { i: number }) => {
  const seed = "LifeIsGoodOrIsItsNot";
  return `https://picsum.photos/seed/${seed}-${i}/230/180`;
};

const AnswerBox = ({
  isLocked,
  setIsLocked,
  text,
  setText,
  setImages,
  checkAttempt
}: {
  isLocked: boolean;
  setIsLocked: (isLocked: boolean) => void;
  text: string;
  setText: (text: string) => void;
  setImages: (images: any) => void;
  checkAttempt: (text: string) => Promise<void>;
}) => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

  const client = createClient(supabaseUrl, supabaseKey);

  // useEffect(() => {
  //   const updateImages = setTimeout(async () => {
  //     if (!text || isLocked) return; // Skip if text is empty or input is locked
      
  //     const vector = await getTextEmbeddings(text);
  //     const data = await getRecommendations(vector, client);
  //     data.map((item: any, index: number) => {
  //       console.log(item);
  //       getPublicURL(item.metadata.path, client).then((item_url) => {
  //         setImages((old: CardType[]) => {
  //           const newImages = [...old];
  //           if (index < newImages.length) {
  //             newImages[index] = {
  //               ...newImages[index],
  //               src: item_url
  //             };
  //           }
  //           return newImages;
  //         });
  //       });
  //     });
  //   }, 2000);

  //   return () => clearTimeout(updateImages);
  // }, [text, isLocked]);

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
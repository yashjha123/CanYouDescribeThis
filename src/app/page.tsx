import { useMemo } from "react";
import "../app/animation.css";
import SpinningBackground from "./components/spinningBackground";
import Maze from "./components/maze";

export default function Home() {
  const CachedSpinningBackground = useMemo(
    () =>
      function wraper() {
        return <SpinningBackground />;
      },

    []
  );

  return (
    <>
      <CachedSpinningBackground />

      <div className="grid grid-rows-[30px_1fr_40px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
        <div className="text-center space-y-4 bg-[white] bg-clip-text">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-900 via-pink-600 to-indigo-500 text-transparent bg-clip-text">
            Can you describe this?
          </h1>
          {/* <p className="text-indigo-800">{info}</p> */}
          <p className="text-indigo-800">
            Use your creativity to help AI find this image in the wild.
          </p>
        </div>
        <Maze />
        {/* Floating Text Box */}``
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
    </>
  );
}

import Image from "next/image";

const Card = () => {
  return (
    <div className="padding-[16px] rounded-xl bg-indigo-950/50 backdrop-blur-sm w-[120px] aspect-square flex flex-col gap-4 items-center justify-center cursor-pointer transition-all duration-500 ease-out hover:scale-105 hover:bg-indigo-950">
      Something
    </div>
  );
};

const TextBox = (isPicked: boolean) => {
  return (
    <div
      className={`absolute bottom-5 w-full lg:w-300 h-[100px] bg-white/70 backdrop-blur rounded-xl backdrop-blur-sm transition-all duration-500 ease-in-out ${
        !isPicked ? "hover:scale-105 hover:bg-black hover:bottom-11" : ""
      }`}
    >
      {isPicked ? (
        <div className="flex items-center justify-center gap-2 text-black w-full h-full text-xl">
          Pick your card to begin!
        </div>
      ) : (
        <input
          type="text"
          className="w-full h-full bg-transparent text-black font-bold text-xl p-4 rounded-xl border-none focus:outline-none"
          placeholder="Type here..."
        />
      )}
    </div>
  );
};

export default function Home() {
  return (
    <div className="grid grid-rows-[30px_1fr_40px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)] bg-gradient-to-br from-[#4b007d] to-[#0a043c]">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-300 via-pink-300 to-indigo-300 text-transparent bg-clip-text">
          Can you describe this?
        </h1>
        <p className="text-indigo-200">
          Use your creativity to help AI find this image in the wild.
        </p>
      </div>

      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start bg-slate-500/30 md:gap-6 p-6 rounded-xl backdrop-blur">
        <div className="grid grid-cols-3 gap-4 gap-[16px]">
          <Card />
          <Card />
          <Card />
          <Card />
          <Card />
          <Card />
          <Card />
          <Card />
          <Card />
        </div>
      </main>

      {/* Floating Text Box */}

      <TextBox isPicked={false} />

      {/* Footer */}
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
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
      </footer>
    </div>
  );
}

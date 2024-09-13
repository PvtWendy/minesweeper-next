import React, { useEffect, useState } from "react";

export default function Home() {
  const [field, setField] = useState(
    Array(81).fill({ isRevealed: false, isMine: false, isFlagged: false })
  );
  const [gameRunning, setGameRunning] = useState(false);
  useEffect(() => {
    const handleContextmenu = (e: any) => {
      e.preventDefault();
    };
    document.addEventListener("contextmenu", handleContextmenu);
    return function cleanup() {
      document.removeEventListener("contextmenu", handleContextmenu);
    };
  }, []);

  const handleGameStart = () => {
    let mineDifficulty = 10;
    const placeMine = Array.from({ length: mineDifficulty }, () =>
      Math.floor(Math.random() * 1 * 81)
    );
    const newField = field.map((c, i) => {
      if (placeMine.includes(i) && mineDifficulty >= 0) {
        mineDifficulty--;
        return { ...c, isMine: true };
      } else {
        return c;
      }
    });
    setField(newField);
    setGameRunning(true);
  };

  const handleFlag = (index: number) => {
    const newField = field.map((c, i) => {
      if (i === index) {
        if (c.isFlagged) {
          return { ...c, isFlagged: false };
        }
        if (!c.isRevealed) {
          return { ...c, isFlagged: true };
        }
        return c
      } else {
        return c;
      }
    });
    setField(newField);
  };

  const handleReveal = (index: number) => {
    const newField = field.map((c, i) => {
      if (i === index) {
        if (c.isFlagged) {
          return c;
        }
        return { ...c, isRevealed: true };
      } else {
        return c;
      }
    });
  
    setField(newField);
  };

  return (
    <div className="w-screen h-screen flex justify-center items-center">
      {!gameRunning && (
        <button
          onClick={() => handleGameStart()}
          className="bg-white text-black px-4 py-2 rounded-md "
        >
          New Game
        </button>
      )}
      {gameRunning && (
        <div className="bg-white w-[30rem] h-[30rem] grid grid-cols-9 grid-rows-9 gap-1 p-1 rounded-md ">
          {field.map((content, index) => (
            <div
              key={index}
              className={
                content.isRevealed
                  ? "bg-slate-400 rounded-md hover:cursor-pointer flex justify-center items-center text-red-500 text-4xl"
                  : "bg-slate-700 rounded-md hover:cursor-pointer flex justify-center items-center text-red-500 text-4xl"
              }
              onAuxClick={() => handleFlag(index)}
              onClick={() => handleReveal(index)}
            >
              {content.isMine && content.isRevealed && "☼"}

              {content.isFlagged && "⚑"}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

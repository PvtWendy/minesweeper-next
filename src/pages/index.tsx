import React, { useEffect, useState } from "react";

const initialField = Array(81).fill({
  isRevealed: false,
  isMine: false,
  isFlagged: false,
  closeMines: 0,
});
export default function Home() {
  const [field, setField] = useState(initialField);
  const [gameRunning, setGameRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    const handleContextmenu = (e: any) => {
      e.preventDefault();
    };
    document.addEventListener("contextmenu", handleContextmenu);
    return function cleanup() {
      document.removeEventListener("contextmenu", handleContextmenu);
    };
  }, []);

  //This is probably the absolute worst way to do this, but I'll try to find a better way later
  const detectCloseTiles = (i: number) => {
    let closeTiles = [];

    if (i % 9 == 8 && i > 0) {
      //Tile has no right tile
      closeTiles.push(i - 1);
    } else if (i % 9 == 0 || i == 0) {
      //Tile has no left tile
      closeTiles.push(i + 1);
    } else {
      //No side restriction
      closeTiles.push(i - 1, i + 1);
    }
    if (i - 8 > 0 && i % 9 != 8 && i % 9 != 0) {
      //Tile has no tiles above and no tiles to left and right
      closeTiles.push(i - 8, i - 9, i - 10);
    } else if (i - 8 > 0 && i != 8 && i % 9 == 8) {
      //Tile has no tiles below, but has a tile to the left
      closeTiles.push(i - 9, i - 10);
    } else if (i - 8 > 0 && i % 9 == 0) {
      //Tile has no tiles below, but has a tile to the right
      closeTiles.push(i - 8, i - 9);
    }
    if (i + 8 < field.length && i % 9 != 8 && i % 9 != 0) {
      //Tile has no tiles below and no tiles to left and right
      closeTiles.push(i + 8, i + 9, i + 10);
    } else if (i + 8 < field.length && i % 9 == 8) {
      //Tile has no tiles below, but has a tile to the left
      closeTiles.push(i + 8, i + 9);
    } else if (i + 8 < field.length - 8 && i % 9 == 0) {
      //Tile has no tiles below, but has a tile to the right
      closeTiles.push(i + 9, i + 10);
    }
    return closeTiles;
  };

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

    const numberedField = newField.map((c, i) => {
      const closeTiles = detectCloseTiles(i);

      let closeMines = 0;
      for (let e = 0; e < closeTiles.length; e++) {
        newField[closeTiles[e]].isMine && closeMines++;
      }
      if (c.isMine) {
        closeMines = 10;
      }
      return { ...c, closeMines: closeMines };
    });

    setField(numberedField);
    setGameRunning(true);
  };

  const handleRetry = ()=>{
    setGameOver(false)
    setGameRunning(false)
    setField(initialField)
  }

  const handleFlag = (index: number) => {
    const newField = field.map((c, i) => {
      if (i === index) {
        if (c.isFlagged) {
          return { ...c, isFlagged: false };
        }
        if (!c.isRevealed) {
          return { ...c, isFlagged: true };
        }
        return c;
      } else {
        return c;
      }
    });
    setField(newField);
  };

  const handleReveal = (index: number) => {
    if (field[index].isFlagged || field[index].isRevealed) {
      return;
    }

    const revealTile = (i: number, newField: any[]) => {
      //Always remember: You need a return case if you're using a recursive function, dumbass...
      if (i < 0 || i >= 81 || newField[i].isRevealed || gameOver) {
        return;
      }

      newField[i] = { ...newField[i], isRevealed: true };

      if (newField[i].closeMines === 0) {
        const neighbors = detectCloseTiles(i);
        neighbors.forEach((neighbor) => revealTile(neighbor, newField));
      }
      if (newField[i].isMine) {
        newField.forEach((e) => {
          if (e.isMine) {
            e.isRevealed = true;
          }
        });
        setGameOver(true);
      }
    };

    const newField = [...field];
    revealTile(index, newField);
    setField(newField);
  };

  return (
    <div className="w-screen h-screen flex flex-col justify-center items-center gap-10">
      {!gameRunning && (
        <button
          onClick={() => handleGameStart()}
          className="bg-white text-black px-4 py-2 rounded-md "
        >
          New Game
        </button>
      )}
      {gameOver && <p className="text-4xl">Game Over</p>}
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
              {content.closeMines != 10 &&
                content.closeMines != 0 &&
                content.isRevealed &&
                content.closeMines}
              {content.isFlagged && "⚑"}
            </div>
          ))}
        </div>
      )}
      {gameOver && (
        <button
          onClick={() => handleRetry()}
          className="bg-white text-black px-4 py-2 rounded-md "
        >
          Try Again
        </button>
      )}
    </div>
  );
}

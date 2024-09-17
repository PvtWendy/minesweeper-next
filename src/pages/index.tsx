import React, { useEffect, useState } from "react";

const initialField = Array(81).fill({
  isRevealed: false,
  isMine: false,
  isFlagged: false,
  closeMines: 0,
});

interface field {
  isRevealed: boolean;
  isMine: boolean;
  isFlagged: boolean;
  closeMines: number;
}
export default function Home() {
  const [field, setField] = useState(initialField);
  const [gameRunning, setGameRunning] = useState(false);
  const [columns, setColumns] = useState(9);
  const [gameOver, setGameOver] = useState(false);
  const [gameWin, setGameWin] = useState(false);
  
  useEffect(() => {
    const handleContextmenu = (e: MouseEvent) => {
      e.preventDefault();
    };
    if (gameRunning) {
      document
        .getElementById("GameContainer")!
        .addEventListener("contextmenu", handleContextmenu);
      return function cleanup() {
        document
          .getElementById("GameContainer")!
          .removeEventListener("contextmenu", handleContextmenu);
      };
    }
  }, [gameRunning]);

  //So... Direction Offsets exists... It took me a while to grasp it, but damn, does it feel good
  const detectCloseTiles = (i: number) => {
    const closeTiles: Array<number> = [];
    const position = [Math.floor(i / columns), i % columns];
    console.log(position)
    const positionOffset = [
      [0, 1], //Right
      [0, -1], //Left
      [1, 0], //Down
      [-1, 0], //Up
      [-1, -1], //Up-Left
      [-1, 1], //Up-Right
      [1, -1], //Down-Left
      [1, 1], //Down-Right
    ];
    positionOffset.forEach((e: Array<number>) => {
      const newPos = [e[0] + position[0], e[1] + position[1]];
      console.log(newPos)
      if (
        newPos[0] >= 0 &&
        newPos[1] >= 0 &&
        newPos[0] < columns  &&
        newPos[1] < columns
      ) {
        closeTiles.push(
          newPos[0] * columns + newPos[1]
        );
      }
     
    
    });
    console.log(closeTiles)
    return closeTiles;
  };

  const handleGameStart = () => {
    let mineDifficulty = 10;
    setColumns(9)
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

  const handleRetry = () => {
    setGameOver(false);
    setGameRunning(false);
    setField(initialField);
    setGameWin(false);
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

    const revealTile = (i: number, newField: field[]) => {
      //Always remember: You need a return case if you're using a recursive function, dumbass...
      if (i < 0 || i >= 81 || newField[i].isRevealed || gameOver || gameWin) {
        return;
      }

      newField[i] = { ...newField[i], isRevealed: true };
      if (
        newField.every((field) => {
          if (field.isMine && !field.isRevealed) {
            return true;
          }
          if (!field.isMine && field.isRevealed) {
            return true;
          }
          return false;
        })
      ) {
        setGameWin(true);
      }

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

  const numberColors = (c: number) => {
    switch (c) {
      case 1:
        return "text-blue-700";
      case 2:
        return "text-green-700";
      case 3:
        return "text-red-600";
      case 4:
        return "text-purple-600";
      case 5:
        return "text-amber-800";
      case 6:
        return "text-cyan-500";
      case 7:
        return "text-yellow-500";
      case 8:
        return "text-gray-600";
      default:
        break;
    }
  };
  return (
    <div className="w-screen h-screen flex flex-col justify-center items-center gap-10">
      {!gameRunning && (
        <button
          onClick={() => handleGameStart()}
          className="bg-white text-black  t px-4 py-2 rounded-md "
          id="GameContainer"
        >
          New Game
        </button>
      )}
      {gameOver && <p className="text-4xl">Game Over</p>}
      {gameWin && <p className="text-4xl">You Win!</p>}
      {gameRunning && (
        <div
          className="bg-white w-[20rem] h-[20rem] md:w-[30rem] md:h-[30rem] grid grid-cols-9 grid-rows-9 gap-1 p-1 rounded-md "
          id="GameContainer"
        >
          {field.map((content, index) => (
            <div
              key={index}
              className={
                content.isRevealed
                  ? "bg-slate-400 rounded-md hover:cursor-pointer flex justify-center items-center text-red-500 text-xl md:text-4xl"
                  : "bg-slate-700 rounded-md hover:cursor-pointer flex justify-center items-center text-red-500 texl-xl md:text-4xl"
              }
              onAuxClick={() => handleFlag(index)}
              onClick={() => handleReveal(index)}
            >
              {content.isMine &&
                content.isRevealed &&
                !content.isFlagged &&
                "☼"}
              {content.closeMines != 10 &&
                content.closeMines != 0 &&
                content.isRevealed && (
                  <p className={numberColors(content.closeMines)}>
                    {content.closeMines}
                  </p>
                )}
              {content.isFlagged && "⚑"}
            </div>
          ))}
        </div>
      )}
      {(gameOver || gameWin) && (
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

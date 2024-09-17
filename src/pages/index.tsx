import React, { useEffect, useState } from "react";

interface field {
  isRevealed: boolean;
  isMine: boolean;
  isFlagged: boolean;
  closeMines: number;
}
export default function Home() {
  const [size, setSize] = useState([9, 9]);
  const initialField = Array(81).fill({
    isRevealed: false,
    isMine: false,
    isFlagged: false,
    closeMines: 0,
  });

  const [field, setField] = useState(initialField);
  const [gameRunning, setGameRunning] = useState(false);

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
    const position = [Math.floor(i / size[0]), i % size[1]];

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

      if (
        newPos[0] >= 0 &&
        newPos[1] >= 0 &&
        newPos[0] < size[0] &&
        newPos[1] < size[1]
      ) {
        closeTiles.push(newPos[0] * size[0] + newPos[1]);
      }
    });

    return closeTiles;
  };

  const handleGameStart = () => {
    const sizedField = Array(size[0] * size[1]).fill({
      isRevealed: false,
      isMine: false,
      isFlagged: false,
      closeMines: 0,
    });

    let mineDifficulty = Math.floor(
      Math.random() * (sizedField.length / 5 - sizedField.length / 5 - 4) +
        (sizedField.length / 5 - 1)
    );

    const placeMine = Array.from({ length: mineDifficulty }, () =>
      Math.floor(Math.random() * 1 * sizedField.length)
    );
  
    const newField = sizedField.map((c, i) => {
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
      if (
        i < 0 ||
        i >= field.length ||
        newField[i].isRevealed ||
        gameOver ||
        gameWin
      ) {
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
        <div className="flex flex-col gap-4">
          <h1>Columns: {size[1]}</h1>
          <div className="flex gap-4">
            <button
              onClick={() => setSize([9, 9])}
              className="bg-white text-black   h-10 w-16 rounded-md "
              id="GameContainer"
            >
              9x9
            </button>
            <button
              onClick={() => setSize([16, 16])}
              className="bg-white text-black   h-10 w-16 rounded-md "
              id="GameContainer"
            >
              16x16
            </button>
            <button
              onClick={() => setSize([20, 20])}
              className="bg-white text-black  h-10 w-16 rounded-md "
              id="GameContainer"
            >
              20x20
            </button>
          </div>

          <button
            onClick={() => handleGameStart()}
            className="bg-white text-black  t px-4 py-2 rounded-md "
            id="GameContainer"
          >
            New Game
          </button>
        </div>
      )}
      {gameOver && <p className="text-4xl">Game Over</p>}
      {gameWin && <p className="text-4xl">You Win!</p>}
      {gameRunning && (
        <div
          className="bg-white w-[25rem] h-[25rem] md:w-[40rem] md:h-[40rem] grid grid-cols-9 gap-[1px] p-1 rounded-md "
          style={{
            gridTemplateColumns: `repeat(${size[1]}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${size[0]}, minmax(0, 1fr))`,
          }}
          id="GameContainer"
        >
          {field.map((content, index) => (
            <div
              key={index}
              className={
                content.isRevealed
                  ? "bg-slate-400 rounded-md hover:cursor-pointer flex justify-center items-center text-red-500"
                  : "bg-slate-700 rounded-md hover:cursor-pointer flex justify-center items-center text-red-500"
                  
              }
              style={{fontSize: window.innerWidth >720 ? 420 / size[0] +"px": 260 / size[0] +"px"}}
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

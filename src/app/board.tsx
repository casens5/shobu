"use client";

import clsx from "clsx";
import "./board.css";
import Stone, { StoneId, StoneObject } from "./stone";
import { PlayerColor, BoardColor } from "./game";
import React, {
  useImperativeHandle,
  forwardRef,
  useState,
  useEffect,
  useRef,
} from "react";

type Coord = 0 | 1 | 2 | 3;

type BoardProps = {
  boardColor: BoardColor;
  playerTurn: PlayerColor;
  playerHome: PlayerColor;
  canPlay: boolean;
};

type CellProps = {
  cell: StoneObject | null;
  row: Coord;
  col: Coord;
  handleMoveStone: (id: StoneId, newPosition: [number, number]) => void;
  className?: string;
};

type LastMoveType = {
  from: [Coord | null, Coord | null];
  to: [Coord | null, Coord | null];
  push: [Coord | null, Coord | null];
};

export function Cell({
  cell,
  row,
  col,
  handleMoveStone,
  className,
}: CellProps) {
  const cellRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    const updateWidth = () => {
      if (cellRef.current) {
        const width = cellRef.current.getBoundingClientRect().width;
        setContainerWidth(width);
      }
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);

    return () => {
      window.removeEventListener("resize", updateWidth);
    };
  }, []);

  return (
    <div
      key={4 * row + col}
      ref={cellRef}
      className={clsx(
        "box-border aspect-square h-auto w-full touch-none border-black",
        className,
      )}
      style={{
        gridColumn: col + 1,
        gridRow: row + 1,
      }}
    >
      {cell && (
        <Stone
          id={cell.id}
          color={cell.color}
          canMove={cell.canMove}
          containerWidth={containerWidth}
          handleMoveStone={handleMoveStone}
        />
      )}
    </div>
  );
}

const Board = forwardRef((props: BoardProps, ref) => {
  const { boardColor, playerTurn, canPlay } = props;
  const [board, setBoard] = useState<(StoneObject | null)[][]>([
    [
      { id: 0, color: "black", canMove: false },
      null,
      null,
      { id: 4, color: "white", canMove: false },
    ],
    [
      { id: 1, color: "black", canMove: false },
      null,
      null,
      { id: 5, color: "white", canMove: false },
    ],
    [
      { id: 2, color: "black", canMove: false },
      null,
      null,
      { id: 6, color: "white", canMove: false },
    ],
    [
      { id: 3, color: "black", canMove: false },
      null,
      null,
      { id: 7, color: "white", canMove: false },
    ],
  ]);
  const [boardDimensions, setBoardDimensions] = useState({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  });
  const [lastMoveWhite, setLastMoveWhite] = useState<LastMoveType>({
    from: [null, null],
    to: [null, null],
    push: [null, null],
  });
  const [lastMoveBlack, setLastMoveBlack] = useState<LastMoveType>({
    from: [null, null],
    to: [null, null],
    push: [null, null],
  });

  useEffect(() => {
    setBoard((prevBoard) =>
      prevBoard.map((row) =>
        row.map((cell) => {
          if (cell === null) return null;
          return {
            ...cell,
            canMove: canPlay && cell.color === playerTurn,
          };
        }),
      ),
    );
  }, [playerTurn, canPlay]);

  function getMoveColor(rowIndex: Coord, colIndex: Coord) {
    if (
      (lastMoveWhite.from[0] === colIndex &&
        lastMoveWhite.from[1] === rowIndex) ||
      (lastMoveBlack.from[0] === colIndex && lastMoveBlack.from[1] === rowIndex)
    ) {
      return "dark-transparent";
    }
    if (
      (lastMoveWhite.to[0] === colIndex && lastMoveWhite.to[1] === rowIndex) ||
      (lastMoveBlack.to[0] === colIndex && lastMoveBlack.to[1] === rowIndex)
    ) {
      return "dark-transparent";
    }
    if (
      (lastMoveWhite.push[0] === colIndex &&
        lastMoveWhite.push[0] === rowIndex) ||
      (lastMoveBlack.push[0] === colIndex && lastMoveBlack.push[0] === rowIndex)
    ) {
      return "red-transparent";
    }
    return "";
  }

  function clearLastMove(playerColor: PlayerColor) {
    if (playerColor === "white") {
      setLastMoveWhite({
        from: [null, null],
        to: [null, null],
        push: [null, null],
      });
    } else {
      setLastMoveBlack({
        from: [null, null],
        to: [null, null],
        push: [null, null],
      });
    }
  }

  useImperativeHandle(ref, () => ({
    clearLastMove,
  }));

  const boardRef = useRef<HTMLDivElement>(null);

  function updateBoardDimensions() {
    if (boardRef.current) {
      const rect = boardRef.current.getBoundingClientRect();
      setBoardDimensions({
        top: rect.top,
        bottom: rect.bottom,
        left: rect.left,
        right: rect.right,
      });
    }
  }

  useEffect(() => {
    updateBoardDimensions();
    window.addEventListener("resize", updateBoardDimensions);

    return () => {
      window.removeEventListener("resize", updateBoardDimensions);
    };
  }, []);

  const handleMoveStone = (id: StoneId, newPosition: [number, number]) => {
    const newCoords = [
      Math.floor(
        (4 * (newPosition[0] - boardDimensions.left)) /
          (boardDimensions.right - boardDimensions.left),
      ),
      Math.floor(
        (4 * (newPosition[1] - boardDimensions.top)) /
          (boardDimensions.bottom - boardDimensions.top),
      ),
    ];
    if (
      newCoords[0] > 3 ||
      newCoords[0] < 0 ||
      newCoords[1] > 3 ||
      newCoords[1] < 0
    ) {
      return; // exit; move is out of bounds
    }

    // get previous stone coordinates and color by its id
    let oldCoords = null;
    let stoneColor = null;
    for (let colIndex = 0; colIndex < board.length; colIndex++) {
      for (let rowIndex = 0; rowIndex < board[colIndex].length; rowIndex++) {
        if (board[colIndex][rowIndex]?.id === id) {
          oldCoords = [colIndex, rowIndex];
          stoneColor = board[colIndex][rowIndex]!.color;
          break;
        }
      }
      if (oldCoords) break;
    }

    if (!oldCoords) return; // Exit if stone not found

    if (stoneColor === "white") {
      setLastMoveWhite({
        // @ts-expect-error onethu
        from: oldCoords,
        // @ts-expect-error onethu
        to: newCoords,
        push: [null, null],
      });
    } else {
      setLastMoveBlack({
        // @ts-expect-error onethu
        from: oldCoords,
        // @ts-expect-error onethu
        to: newCoords,
        push: [null, null],
      });
    }

    const stone = { ...board[oldCoords[0]][oldCoords[1]] };

    const newBoard = [...board];
    newBoard[oldCoords[0]][oldCoords[1]] = null;
    // @ts-expect-error typescript is bad and ugly
    newBoard[newCoords[0]][newCoords[1]] = stone;
    setBoard(newBoard);
  };

  return (
    <div
      ref={boardRef}
      className={clsx(
        "grid aspect-square h-auto w-full touch-none grid-cols-4 rounded-2xl",
        {
          "board-dark": boardColor === "dark",
          "board-light": boardColor === "light",
        },
      )}
    >
      {
        // @ts-expect-error onetuhnoethunht
        board.map((col, colIndex: Coord) => {
          // the padding is a weird hack that fixes the spacing for the top
          // right corner of the board
          const rightBorder =
            colIndex !== 3 ? "border-r sm:border-r-2" : "pr-px sm:pr-0.5";

          // @ts-expect-error onetuhnoethunht
          return col.map((cell, rowIndex: Coord) => {
            const bottomBorder = rowIndex !== 3 ? "border-b sm:border-b-2" : "";
            const moveColor = getMoveColor(rowIndex, colIndex);

            return (
              <Cell
                key={4 * rowIndex + colIndex}
                row={rowIndex}
                col={colIndex}
                cell={cell}
                handleMoveStone={handleMoveStone}
                className={`${rightBorder} ${bottomBorder} ${moveColor}`}
              />
            );
          });
        })
      }
    </div>
  );
});

export default Board;

"use client";

import clsx from "clsx";
import "./board.css";
import Stone, { StoneId, StoneObject } from "./stone";
import { PlayerColor, BoardColor } from "./game";
import React, { useState, useEffect, useRef } from "react";

type BoardProps = {
  boardColor: BoardColor;
  playerTurn: PlayerColor;
  playerHome: PlayerColor;
};

type CellProps = {
  cell: StoneObject | null;
  row: 0 | 1 | 2 | 3;
  col: 0 | 1 | 2 | 3;
  className?: string;
  handleMoveStone: (id: StoneId, newPosition: [number, number]) => void;
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
          containerWidth={containerWidth}
          handleMoveStone={handleMoveStone}
        />
      )}
    </div>
  );
}

export default function Board({
  boardColor,
  playerTurn,
  playerHome,
}: BoardProps) {
  const [board, setBoard] = useState<(StoneObject | null)[][]>([
    [{ id: 0, color: "black" }, null, null, { id: 4, color: "white" }],
    [{ id: 1, color: "black" }, null, null, { id: 5, color: "white" }],
    [{ id: 2, color: "black" }, null, null, { id: 6, color: "white" }],
    [{ id: 3, color: "black" }, null, null, { id: 7, color: "white" }],
  ]);
  const [boardDimensions, setBoardDimensions] = useState({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  });

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

    // get previous stone coordinates by its id
    let oldCoords = null;
    for (let colIndex = 0; colIndex < board.length; colIndex++) {
      for (let rowIndex = 0; rowIndex < board[colIndex].length; rowIndex++) {
        if (board[colIndex][rowIndex]?.id === id) {
          oldCoords = [colIndex, rowIndex];
          break;
        }
      }
      if (oldCoords) break;
    }

    if (!oldCoords) return; // Exit if stone not found

    const stone = { ...board[oldCoords[0]][oldCoords[1]] };

    const newBoard = [...board];
    newBoard[oldCoords[0]][oldCoords[1]] = null;
    console.log("hoho", newCoords, board, newBoard);
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
      {board.map((col, colIndex: number) => {
        // the padding is a weird hack that fixes the spacing for the top right corner of the board
        const rightBorder =
          colIndex !== 3 ? "border-r sm:border-r-2" : "pr-px sm:pr-0.5";

        return col.map((cell, rowIndex: number) => {
          const bottomBorder = rowIndex !== 3 ? "border-b sm:border-b-2" : "";

          return (
            <Cell
              key={4 * rowIndex + colIndex}
              // @ts-expect-error anoetuhnt
              row={rowIndex}
              // @ts-expect-error anoetuhnt
              col={colIndex}
              cell={cell}
              handleMoveStone={handleMoveStone}
              className={rightBorder + " " + bottomBorder}
            />
          );
        });
      })}
    </div>
  );
}

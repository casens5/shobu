"use client";

import clsx from "clsx";
import Stone, { StoneId, StoneColor, StoneObject } from "./stone";
import React, { useState, useEffect, useRef } from "react";

type BoardProps = {
  color: "light" | "dark";
};

export default function Board({ color }: BoardProps) {
  const [board, setBoard] = useState<(StoneObject | null)[][]>([
    [
      { id: 0, color: StoneColor.BLACK },
      null,
      null,
      { id: 4, color: StoneColor.WHITE },
    ],
    [
      { id: 1, color: StoneColor.BLACK },
      null,
      null,
      { id: 5, color: StoneColor.WHITE },
    ],
    [
      { id: 2, color: StoneColor.BLACK },
      null,
      null,
      { id: 6, color: StoneColor.WHITE },
    ],
    [
      { id: 3, color: StoneColor.BLACK },
      null,
      null,
      { id: 7, color: StoneColor.WHITE },
    ],
  ]);

  const boardRef = useRef<HTMLDivElement>(null);
  const globalCoordinatesRef = useRef({ top: 0, bottom: 0, left: 0, right: 0 });

  useEffect(() => {
    if (boardRef.current) {
      const rect = boardRef.current.getBoundingClientRect();
      globalCoordinatesRef.current = {
        top: rect.top,
        bottom: rect.bottom,
        left: rect.left,
        right: rect.right,
      };
    }
  }, []);

  const handleMoveStone = (id: StoneId, newPosition: [number, number]) => {
    const newCoords = [
      Math.floor(
        (4 * (newPosition[0] - globalCoordinatesRef.current.left)) /
          (globalCoordinatesRef.current.right -
            globalCoordinatesRef.current.left),
      ),
      Math.floor(
        (4 * (newPosition[1] - globalCoordinatesRef.current.top)) /
          (globalCoordinatesRef.current.bottom -
            globalCoordinatesRef.current.top),
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
      className={clsx("w-80 h-80 rounded-2xl grid grid-cols-4", {
        "bg-yellow-950": color === "dark",
        "bg-yellow-800": color === "light",
      })}
    >
      {board.map((col, colIndex: number) => {
        let rightBorder = "border-r-2";
        if (colIndex === 3) {
          rightBorder = "";
        }

        return col.map((cell, rowIndex: number) => {
          let bottomBorder = "border-b-2";
          if (rowIndex === 3) {
            bottomBorder = "";
          }

          return (
            <div
              key={4 * rowIndex + colIndex}
              className={clsx(
                "min-w-20 min-h-20 border-black",
                rightBorder,
                bottomBorder,
              )}
              style={{
                gridColumn: colIndex + 1,
                gridRow: rowIndex + 1,
              }}
              //position={[colIndex, rowIndex] as BoardCoordinates}
            >
              {cell && (
                <Stone
                  id={cell.id}
                  color={cell.color}
                  handleMoveStone={handleMoveStone}
                />
              )}
            </div>
          );
        });
      })}
    </div>
  );
}

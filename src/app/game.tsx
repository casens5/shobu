"use client";

import Board from "./board";
import { useState, useRef } from "react";

export type PlayerColor = "black" | "white";
export type BoardColor = "dark" | "light";

export type BoardId = 0 | 1 | 2 | 3;
export enum Direction {
  N,
  NE,
  E,
  SE,
  S,
  SW,
  W,
  NW,
}
export type Length = 1 | 2;

interface BoardRef {
  clearLastMove: (playerColor: "white" | "black") => void;
}

type TurnIndicatorProps = {
  playerTurn: PlayerColor;
};

export function TurnIndicator({ playerTurn }: TurnIndicatorProps) {
  return <div className="mb-4 text-center">{playerTurn}&apos;s turn</div>;
}

export default function Game() {
  const [playerTurn, setPlayerTurn] = useState<PlayerColor>("black");
  const boardRefs = [
    useRef<BoardRef | null>(null),
    useRef<BoardRef | null>(null),
    useRef<BoardRef | null>(null),
    useRef<BoardRef | null>(null),
  ];
  const boards = [
    {
      id: 0,
      ref: boardRefs[0],
      boardColor: "dark",
      playerTurn: playerTurn,
      playerHome: "white",
      canPlay: true,
    },
    {
      id: 1,
      ref: boardRefs[1],
      boardColor: "light",
      playerTurn: playerTurn,
      playerHome: "white",
      canPlay: true,
    },
    {
      id: 2,
      ref: boardRefs[2],
      boardColor: "light",
      playerTurn: playerTurn,
      playerHome: "black",
      canPlay: true,
    },
    {
      id: 3,
      ref: boardRefs[3],
      boardColor: "dark",
      playerTurn: playerTurn,
      playerHome: "black",
      canPlay: true,
    },
  ];
  const [moves, setMoves] = useState<
    {
      boardId: BoardId;
      direction: Direction;
      length: Length;
    }[]
  >([]);

  function clearAllPlayerMoves(playerColor: PlayerColor) {
    boardRefs.forEach((ref) => {
      if (ref.current) {
        ref.current.clearLastMove(playerColor);
      }
    });
  }

  function handleMove(boardId: BoardId, direction: Direction, length: Length) {
    setMoves((prevMoves) => [...prevMoves, { boardId, direction, length }]);
  }

  return (
    <div className="max-h-2xl h-auto w-full max-w-2xl">
      <div
        onClick={() => {
          setPlayerTurn((prev) => {
            return prev === "white" ? "black" : "white";
          });
        }}
      >
        change player
      </div>
      <TurnIndicator playerTurn={playerTurn} />
      <div className="text-left" onClick={() => clearAllPlayerMoves("white")}>
        clear white moves
      </div>
      <div className="text-right" onClick={() => clearAllPlayerMoves("black")}>
        clear black moves
      </div>
      <div className="max-h-2xl h-auto w-full max-w-2xl items-center">
        <div className="grid grid-cols-2 gap-x-7 bg-[#00000088] py-6 sm:gap-x-8 sm:rounded-t-3xl sm:p-8">
          {/* @ts-expect-error onetunheot */}
          <Board {...boards[0]} onMove={handleMove} />
          {/* @ts-expect-error onetunheot */}
          <Board {...boards[1]} onMove={handleMove} />
        </div>
        <div className="grid grid-cols-2 gap-x-7 bg-[#ffffff22] py-6 sm:gap-x-8 sm:rounded-b-3xl sm:p-8">
          {/* @ts-expect-error onetunheot */}
          <Board {...boards[2]} onMove={handleMove} />
          {/* @ts-expect-error onetunheot */}
          <Board {...boards[3]} onMove={handleMove} />
        </div>
      </div>
      <div className="mt-4">
        <h3>Moves:</h3>
        <ul>
          {moves.map((entry, index) => (
            <li key={index}>
              {entry.boardId}: {entry.direction} {entry.length}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

"use client";

import Board from "./board";
import { useState, useRef } from "react";

export type PlayerColor = "black" | "white";
export type BoardColor = "dark" | "light";

interface BoardRef {
  clearLastMove: (playerColor: "white" | "black") => void;
}

type TurnIndicatorProps = {
  playerTurn: PlayerColor;
};

export function TurnIndicator({ playerTurn }: TurnIndicatorProps) {
  return <div className="mb-4 text-center">{playerTurn}'s turn</div>;
}

export default function Game() {
  const [playerTurn, setPlayerTurn] = useState<PlayerColor>("black");
  const boardRefs = [
    useRef<BoardRef | null>(null),
    useRef<BoardRef | null>(null),
    useRef<BoardRef | null>(null),
    useRef<BoardRef | null>(null),
  ];

  function clearAllPlayerMoves(playerColor: PlayerColor) {
    boardRefs.forEach((ref) => {
      if (ref.current) {
        ref.current.clearLastMove(playerColor);
      }
    });
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
      <div className="max-h-2xl grid h-auto w-full max-w-2xl grid-cols-2 items-center gap-x-7 gap-y-12 sm:gap-x-8 sm:gap-y-16">
        <Board
          ref={boardRefs[0]}
          boardColor="dark"
          playerTurn={playerTurn}
          playerHome="white"
          canPlay={true}
        />
        <Board
          ref={boardRefs[1]}
          boardColor="light"
          playerTurn={playerTurn}
          playerHome="white"
          canPlay={true}
        />
        <Board
          ref={boardRefs[2]}
          boardColor="light"
          playerTurn={playerTurn}
          playerHome="black"
          canPlay={true}
        />
        <Board
          ref={boardRefs[3]}
          boardColor="dark"
          playerTurn={playerTurn}
          playerHome="black"
          canPlay={true}
        />
      </div>
    </div>
  );
}

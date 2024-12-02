"use client";

import Board from "./board";
import { useState } from "react";

export type PlayerColor = "black" | "white";
export type BoardColor = "dark" | "light";

type TurnIndicatorProps = {
  playerTurn: PlayerColor;
};

export function TurnIndicator({ playerTurn }: TurnIndicatorProps) {
  return <div className="mb-4 text-center">{playerTurn}'s turn</div>;
}

export default function Game() {
  const [playerTurn, setPlayerTurn] = useState<PlayerColor>("black");

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
      <div className="max-h-2xl grid h-auto w-full max-w-2xl grid-cols-2 items-center gap-x-7 gap-y-12 sm:gap-x-8 sm:gap-y-16">
        <Board boardColor="dark" playerTurn={playerTurn} playerHome="white" />
        <Board boardColor="light" playerTurn={playerTurn} playerHome="white" />
        <Board boardColor="light" playerTurn={playerTurn} playerHome="black" />
        <Board boardColor="dark" playerTurn={playerTurn} playerHome="black" />
      </div>
    </div>
  );
}

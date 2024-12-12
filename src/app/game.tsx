"use client";

import clsx from "clsx";
import Board from "./board";
import { useState, useRef, ReactNode } from "react";
import {
  MoveType,
  PlayerColor,
  BoardId,
  Direction,
  Length,
  BoardMessage,
} from "./types";

interface BoardRef {
  clearLastMove: (playerColor: "white" | "black") => void;
}

type TurnIndicatorProps = {
  playerTurn: PlayerColor;
};

export function TurnIndicator({ playerTurn }: TurnIndicatorProps) {
  return <div className="mb-4 text-center">{playerTurn}&apos;s turn</div>;
}

type WinIndicatorProps = {
  playerWin: PlayerColor;
};

export function WinIndicator({ playerWin }: WinIndicatorProps) {
  return <div className="mb-4 text-center">{playerWin} is the winner</div>;
}

type ErrorMessageProps = {
  message: BoardMessage;
};

export function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <div className="mb-4 text-center">
      {message === BoardMessage.MOVEUNEQUALTOPASSIVEMOVE &&
        "your active move must be the same direction and distance as the passive move"}
      {message === BoardMessage.MOVETOOLONG &&
        "you can only move a stone by a distance of 1 or 2 squares"}
      {message === BoardMessage.MOVEOUTOFBOUNDS && "move is out of bounds"}
      {message === BoardMessage.MOVESAMECOLORBLOCKING &&
        "you can't push stones of your own color"}
      {message === BoardMessage.MOVETWOSTONESBLOCKING &&
        "you can't push two stones in a row"}
      {message === BoardMessage.MOVEKNIGHT &&
        "you can only move orthogonally or diagonally (no knight moves)"}
    </div>
  );
}

type HomeAreaProps = {
  color: PlayerColor;
  children: ReactNode;
};

export function HomeArea({ color, children }: HomeAreaProps) {
  return (
    <div
      className={clsx(
        "grid grid-cols-2 gap-x-7 py-[23px] sm:gap-x-8 sm:rounded-t-3xl sm:p-[26px]",
        {
          "bg-[#00000088]": color === "black",
          "bg-[#ffffff22]": color === "white",
        },
      )}
    >
      {children}
    </div>
  );
}

export default function Game() {
  const [playerTurn, setPlayerTurn] = useState<PlayerColor>("black");
  const boardRefs = [
    useRef<BoardRef | null>(null),
    useRef<BoardRef | null>(null),
    useRef<BoardRef | null>(null),
    useRef<BoardRef | null>(null),
  ];
  const [boards, setBoards] = useState([
    {
      id: 0,
      ref: boardRefs[0],
      boardColor: "dark",
      playerTurn: playerTurn,
      playerHome: "black",
      canPlay: true,
      allowedMove: null,
    },
    {
      id: 1,
      ref: boardRefs[1],
      boardColor: "light",
      playerTurn: playerTurn,
      playerHome: "black",
      canPlay: true,
      allowedMove: null,
    },
    {
      id: 2,
      ref: boardRefs[2],
      boardColor: "light",
      playerTurn: playerTurn,
      playerHome: "white",
      canPlay: false,
      allowedMove: null,
    },
    {
      id: 3,
      ref: boardRefs[3],
      boardColor: "dark",
      playerTurn: playerTurn,
      playerHome: "white",
      canPlay: false,
      allowedMove: null,
    },
  ]);

  const [moves, setMoves] = useState<MoveType>([]);
  const [playerWin, setPlayerWin] = useState<PlayerColor | undefined>();
  const [boardMessage, setBoardMessage] = useState<BoardMessage | undefined>();

  function clearMoves(playerColor: PlayerColor) {
    boardRefs.forEach((ref) => {
      if (ref.current) {
        ref.current.clearLastMove(playerColor);
      }
    });
  }

  function handleMessage(message: BoardMessage) {
    switch (message) {
      case BoardMessage.WINBLACK:
        handlePlayerWin("black");
        return;
      case BoardMessage.WINWHITE:
        handlePlayerWin("white");
        return;
      case BoardMessage.MOVECLEARERROR:
        setBoardMessage(undefined);
        return;
      default:
        setBoardMessage(message);
        return;
    }
  }

  function handlePlayerWin(playerColor: PlayerColor) {
    setBoards(
      boards.map((board) => ({
        ...board,
        canPlay: false,
      })),
    );
    setPlayerWin(playerColor);
  }

  function handleMove(boardId: BoardId, direction: Direction, length: Length) {
    if (moves.length === 0 || moves[moves.length - 1].length === 3) {
      const color = boards[boardId].boardColor;
      setBoards(
        // @ts-expect-error onetuh
        boards.map((board) => {
          if (board.boardColor === color) {
            return {
              ...board,
              allowedMove: null,
              canPlay: false,
            };
          } else {
            return {
              ...board,
              allowedMove: { direction, length },
              canPlay: true,
            };
          }
        }),
      );
    } else {
      setPlayerTurn((prev) => {
        const color = prev === "white" ? "black" : "white";
        setBoards(
          boards.map((board) => ({
            ...board,
            playerTurn: color,
            canPlay: board.playerHome !== playerTurn,
            allowedMove: null,
          })),
        );
        clearMoves(color);
        return color;
      });
    }

    const newMove = { boardId, direction, length };

    // @ts-expect-error why would typescript complain? this code is awesome
    setMoves((prev) => {
      if (prev.length === 0) {
        return [[playerTurn, newMove]];
      } else if (prev[prev.length - 1].length === 3) {
        return [...prev, [playerTurn, newMove]];
      } else {
        return [
          ...prev.slice(0, prev.length - 1),
          [...prev[prev.length - 1], newMove],
        ];
      }
    });
  }

  return (
    <div className="max-h-2xl h-auto w-full max-w-2xl">
      {playerWin ? (
        <WinIndicator playerWin={playerWin} />
      ) : (
        <TurnIndicator playerTurn={playerTurn} />
      )}
      {boardMessage ? (
        <ErrorMessage message={boardMessage} />
      ) : (
        <div className="h-[44px]" />
      )}
      <div className="max-h-2xl h-auto w-full max-w-2xl items-center">
        <HomeArea color="black">
          {/* @ts-expect-error onetunheot */}
          <Board {...boards[0]} onMove={handleMove} onMessage={handleMessage} />
          {/* @ts-expect-error onetunheot */}
          <Board {...boards[1]} onMove={handleMove} onMessage={handleMessage} />
        </HomeArea>
        <HomeArea color="white">
          {/* @ts-expect-error onetunheot */}
          <Board {...boards[2]} onMove={handleMove} onMessage={handleMessage} />
          {/* @ts-expect-error onetunheot */}
          <Board {...boards[3]} onMove={handleMove} onMessage={handleMessage} />
        </HomeArea>
      </div>
      <div
        onClick={() => {
          console.log("what is board", playerTurn, boards);
        }}
      >
        test
      </div>
    </div>
  );
}

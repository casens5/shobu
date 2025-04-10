import clsx from "clsx";
import Board from "./board";
import { useState, useRef, ReactNode } from "react";
import {
  MoveRecord,
  PlayerColor,
  BoardMessage,
  NewMove,
  MoveCondition,
} from "../types";

export interface BoardRef {
  clearLastMove: (playerColor: "white" | "black") => void;
}

type TurnIndicatorProps = {
  playerTurn: PlayerColor;
};

function TurnIndicator({ playerTurn }: TurnIndicatorProps) {
  return <div className="mb-4 text-center">{playerTurn}&apos;s turn</div>;
}

type WinIndicatorProps = {
  playerWin: PlayerColor;
};

function WinIndicator({ playerWin }: WinIndicatorProps) {
  return <div className="mb-4 text-center">{playerWin} is the winner</div>;
}

type ErrorMessageProps = {
  message: BoardMessage;
};

function ErrorMessage({ message }: ErrorMessageProps) {
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
      {message === BoardMessage.MOVEPASSIVECANTPUSH &&
        "your first move must be passive (can't push a stone)"}
      {message === BoardMessage.MOVENOTINHOMEAREA &&
        "your first move must be passive (in your home area)"}
      {message === BoardMessage.MOVEWRONGCOLOR &&
        "you must play on a opposite color board from your first move"}
    </div>
  );
}

type HomeAreaProps = {
  color: PlayerColor;
  children: ReactNode;
};

function HomeArea({ color, children }: HomeAreaProps) {
  return (
    <div
      className={clsx(
        "grid grid-cols-2 gap-x-7 py-[23px] sm:gap-x-8 sm:p-[26px]",
        {
          "bg-[#00000088] sm:rounded-t-3xl": color === "black",
          "bg-[#ffffff22] sm:rounded-b-3xl": color === "white",
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
      restrictedMove: null,
      moveCondition: MoveCondition.ISPASSIVE,
    },
    {
      id: 1,
      ref: boardRefs[1],
      boardColor: "light",
      playerTurn: playerTurn,
      playerHome: "black",
      restrictedMove: null,
      moveCondition: MoveCondition.ISPASSIVE,
    },
    {
      id: 2,
      ref: boardRefs[2],
      boardColor: "light",
      playerTurn: playerTurn,
      playerHome: "white",
      restrictedMove: null,
      moveCondition: MoveCondition.NOTINHOMEBOARD,
    },
    {
      id: 3,
      ref: boardRefs[3],
      boardColor: "dark",
      playerTurn: playerTurn,
      playerHome: "white",
      restrictedMove: null,
      moveCondition: MoveCondition.NOTINHOMEBOARD,
    },
  ]);

  const [moves, setMoves] = useState<MoveRecord[]>([]);
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
        moveCondition: MoveCondition.GAMEOVER,
      })),
    );
    setPlayerWin(playerColor);
  }

  function handleMove(newMove: NewMove) {
    // there are 2 cases.  one is where you change the passive move to another passive move on that board, and one where you undo the passive move so that you can make a passive move on the other board!
    if (newMove.undoPassive) {
      setMoves((prev) => {
        prev.pop();
        return prev;
      });

      setBoards(
        boards.map((board) => ({
          ...board,
          MoveCondition:
            board.playerHome === playerTurn
              ? MoveCondition.ISPASSIVE
              : MoveCondition.NOTINHOMEBOARD,
        })),
      );

      return;
    }

    if (newMove.changePassive) {
      setMoves((prev) => {
        return [
          ...prev.slice(0, prev.length - 1),
          { playerColor: playerTurn, firstMove: newMove },
        ];
      });
      return;
    }

    // passive move
    if (moves.length === 0 || moves[moves.length - 1].secondMove != null) {
      const color = boards[newMove.boardId].boardColor;
      setBoards(
        //@ts-expect-error notehunothe
        boards.map((board) => {
          if (board.id === newMove.boardId) {
            return {
              ...board,
              restrictedMove: null,
              moveCondition: MoveCondition.CHANGEPASSIVE,
            };
          } else if (board.boardColor === color) {
            return {
              ...board,
              restrictedMove: null,
              moveCondition: MoveCondition.WRONGCOLOR,
            };
          } else {
            return {
              ...board,
              restrictedMove: {
                direction: newMove.direction,
                length: newMove.length,
              },
              moveCondition: MoveCondition.ISACTIVE,
            };
          }
        }),
      );
      setMoves((prev) => {
        const copy = prev.slice();
        copy.push({ playerColor: playerTurn, firstMove: newMove });
        return copy;
      });
    } else {
      // active move, switch players

      // you would really think that you don't have to shove all this logic inside the setPlayerTurn function, but react doesn't handle state as well as we wish it would.  so in it goes.
      setPlayerTurn((prev) => {
        const color = prev === "white" ? "black" : "white";
        setBoards(
          boards.map((board) => ({
            ...board,
            playerTurn: color,
            restrictedMove: null,
            moveCondition:
              board.playerHome === color
                ? MoveCondition.ISPASSIVE
                : MoveCondition.NOTINHOMEBOARD,
          })),
        );
        clearMoves(color);
        return color;
      });
      setMoves((prev) => {
        prev[prev.length - 1].secondMove = newMove;
        return prev;
      });
    }
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
        <div className="h-[44px]">
          {/* empty space so that the appearance/hiding of error message doesn't jostle */}
        </div>
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
          console.log("oh hi", boards, moves);
        }}
      >
        test
      </div>
    </div>
  );
}

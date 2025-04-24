import clsx from "clsx";
import Board from "./board";
import { useState, useRef, ReactNode } from "react";
import {
  MoveRecord,
  BoardRef,
  PlayerColor,
  BoardMessage,
  BoardType,
  NewMove,
  MoveCondition,
} from "../types";

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
  const messages: { [key in BoardMessage]?: string } = {
    [BoardMessage.MOVEUNEQUALTOPASSIVEMOVE]:
      "your active move must be the same direction and distance as the passive move",
    [BoardMessage.MOVETOOLONG]:
      "you can only move a stone by a distance of 1 or 2 squares",
    [BoardMessage.MOVEOUTOFBOUNDS]: "move is out of bounds",
    [BoardMessage.MOVESAMECOLORBLOCKING]:
      "you can't push stones of your own color",
    [BoardMessage.MOVETWOSTONESBLOCKING]: "you can't push two stones in a row",
    [BoardMessage.MOVEKNIGHT]:
      "you can only move orthogonally or diagonally (no knight moves)",
    [BoardMessage.MOVEPASSIVECANTPUSH]:
      "your first move must be passive (can't push a stone)",
    [BoardMessage.MOVENOTINHOMEAREA]:
      "your first move must be passive (in your home area)",
    [BoardMessage.MOVEWRONGCOLOR]:
      "you must play on a opposite color board from your first move",
    [BoardMessage.MOVECLEARERROR]: "",
  };
  return <div className="mb-4 text-center">{messages[message] || ""}</div>;
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
  const [boards, setBoards] = useState<BoardType[]>([
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
  const [boardMessage, setBoardMessage] = useState<BoardMessage>(
    BoardMessage.MOVECLEARERROR,
  );

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
    // undo the passive move
    if (
      moves.length > 0 &&
      newMove.type === "undo" &&
      moves[moves.length - 1].firstMove.boardId === newMove.boardId
    ) {
      setMoves((prev) => {
        return prev.slice(0, -1);
      });

      setBoards(
        boards.map((board) => ({
          ...board,
          restrictedMove: null,
          moveCondition:
            board.playerHome === playerTurn
              ? MoveCondition.ISPASSIVE
              : MoveCondition.NOTINHOMEBOARD,
        })),
      );

      return null;
    }

    if (newMove.type === "undo") {
      console.error("attempted to undo a move in an invalid state");
      return null;
    }

    const validatedMove = {
      boardId: newMove.boardId,
      direction: newMove.direction,
      length: newMove.length,
      stoneId: newMove.stoneId,
      origin: newMove.origin,
      destination: newMove.destination,
    };

    // passive move
    if (moves.length === 0 || moves[moves.length - 1].secondMove != null) {
      const color = boards[validatedMove.boardId].boardColor;
      setBoards(
        boards.map((board) => {
          if (board.id === validatedMove.boardId) {
            return {
              ...board,
              restrictedMove: {
                direction: validatedMove.direction,
                length: validatedMove.length,
                origin: validatedMove.origin,
                destination: validatedMove.destination,
              },
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
                direction: validatedMove.direction,
                length: validatedMove.length,
                origin: validatedMove.origin,
                destination: validatedMove.destination,
              },
              moveCondition: MoveCondition.ISACTIVE,
            };
          }
        }),
      );
      setMoves((prev) => {
        const copy = prev.slice();
        copy.push({ playerColor: playerTurn, firstMove: validatedMove });
        return copy;
      });
    } else {
      // active move, switch players

      // you would really think that you don't have to shove all this logic inside the setPlayerTurn function, but react doesn't handle state as well as we wish it would.  so in it goes.
      setPlayerTurn((prev) => {
        const color = prev === "white" ? "black" : "white";
        setBoards((prev) =>
          prev.map((board) => ({
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

      setMoves((prev) => [
        ...prev.slice(0, -1),
        { ...prev[prev.length - 1], secondMove: validatedMove },
      ]);
    }
  }

  const [board0, board1, board2, board3] = boards;

  return (
    <div className="max-h-2xl h-auto w-full max-w-2xl">
      {playerWin ? (
        <WinIndicator playerWin={playerWin} />
      ) : (
        <TurnIndicator playerTurn={playerTurn} />
      )}
      <div className="h-[44px]">
        <ErrorMessage message={boardMessage} />
      </div>
      <div className="max-h-2xl h-auto w-full max-w-2xl items-center">
        <HomeArea color="black">
          <Board {...board0} onMove={handleMove} onMessage={handleMessage} />
          <Board {...board1} onMove={handleMove} onMessage={handleMessage} />
        </HomeArea>
        <HomeArea color="white">
          <Board {...board2} onMove={handleMove} onMessage={handleMessage} />
          <Board {...board3} onMove={handleMove} onMessage={handleMessage} />
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

import clsx from "clsx";
import Board from "./board";
import gameEngine, { initialGameState } from "./gameEngine";
import { useReducer, ReactNode } from "react";
import { PlayerColor, BoardMessage, GameWinnerType } from "../types";

type TurnIndicatorProps = {
  playerTurn: PlayerColor;
};

function TurnIndicator({ playerTurn }: TurnIndicatorProps) {
  return (
    <div className="mb-4 text-center">
      {playerTurn === PlayerColor.BLACK ? "black" : "white"}&apos;s turn
    </div>
  );
}

type WinIndicatorProps = {
  playerWin: GameWinnerType;
};

function WinIndicator({ playerWin }: WinIndicatorProps) {
  const winnerText = {
    0: "black",
    1: "white",
    DRAW: "draw",
  };
  return (
    <div className="mb-4 text-center">
      {winnerText[playerWin]} is the winner
    </div>
  );
}

type ErrorMessageProps = {
  message: BoardMessage | null;
};

function ErrorMessage({ message }: ErrorMessageProps) {
  const recievedMessage =
    message == null ? BoardMessage.MOVECLEARERROR : message;
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
    [BoardMessage.MOVEWRONGSHADEBOARD]:
      "you must play on a opposite shade board from your first move",
    [BoardMessage.MOVENOTYOURPIECE]: "you can only move pieces of your color",
    [BoardMessage.MOVENOTYOURTURN]: "it's not your turn",
    [BoardMessage.MOVEUNDOWRONGDESTINATION]:
      "you can undo this move by returning this stone to its origin square",
    [BoardMessage.MOVEUNDOWRONGSTONE]:
      "you can only move 1 stone on this board.  if you want to undo, return the stone you moved to its origin square",
    [BoardMessage.MOVEILLEGAL]: "move is illegal",
    [BoardMessage.MOVECLEARERROR]: "",
  };
  return (
    <div className="mb-4 h-10 text-center">
      {messages[recievedMessage] || ""}
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
        "grid grid-cols-2 gap-x-7 py-[23px] sm:gap-x-8 sm:p-[26px] xs:px-4",
        {
          "bg-[#00000088] sm:rounded-t-3xl": color === PlayerColor.BLACK,
          "bg-[#ffffff44] sm:rounded-b-3xl": color === PlayerColor.WHITE,
        },
      )}
    >
      {children}
    </div>
  );
}

async function createGame() {
  try {
    const response = await fetch("/api/game/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        opponent: "ai",
      }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log("created game:", data);
    } else {
      const errorData = await response.json();
      console.error("failed to create game:", errorData.message);
    }
  } catch (error) {
    console.error("failed to create game:", error);
  }
}


export default function Game() {
  const [{ boards, moves, playerTurn, winner, boardMessage }, dispatch] =
    useReducer(gameEngine, {
      boards: initialGameState.boards,
      moves: [],
      playerTurn: PlayerColor.BLACK,
      winner: null,
      boardMessage: null,
    });

  const [board0, board1, board2, board3] = boards;

  return (
    <div className="max-h-2xl h-auto w-full max-w-2xl">
      {winner == null ? (
        <TurnIndicator playerTurn={playerTurn} />
      ) : (
        <WinIndicator playerWin={winner} />
      )}
      <ErrorMessage message={boardMessage} />
      <div className="max-h-2xl h-auto w-full max-w-2xl items-center">
        <HomeArea color={PlayerColor.BLACK}>
          <Board {...board0} dispatch={dispatch} />
          <Board {...board1} dispatch={dispatch} />
        </HomeArea>
        <HomeArea color={PlayerColor.WHITE}>
          <Board {...board2} dispatch={dispatch} />
          <Board {...board3} dispatch={dispatch} />
        </HomeArea>
      </div>
      <div className="flex w-full flex-row justify-between">
        <div onClick={createGame}>start new game</div>
      <div
        onClick={() => {
            console.log("oh hi", moves);
        }}
      >
        test
        </div>
      </div>
    </div>
  );
}

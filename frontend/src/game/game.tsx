import clsx from "clsx";
import Board from "./board";
import GameEngine from "./gameEngine";
import { useReducer, ReactNode } from "react";
import { PlayerColor, BoardMessage } from "../types";

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
  return <div className="mb-4 h-10 text-center">{messages[message] || ""}</div>;
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
  const initialGrid = [
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
  ];

  const initialBoards = [
    {
      id: 0,
      boardColor: "dark",
      playerHome: "black",
      grid: [...initialGrid],
      lastMove: null,
    },
    {
      id: 1,
      boardColor: "light",
      playerHome: "black",
      grid: [...initialGrid],
      lastMove: null,
    },
    {
      id: 2,
      boardColor: "light",
      playerHome: "white",
      grid: [...initialGrid],
      lastMove: null,
    },
    {
      id: 3,
      boardColor: "dark",
      playerHome: "white",
      grid: [...initialGrid],
      lastMove: null,
    },
  ];

  const [{ boards, moves, playerTurn, winner, boardMessage }, dispatch] =
    useReducer(GameEngine, {
      boards: initialBoards,
      moves: [],
      playerTurn: "black",
      winner: null,
      boardMessage: null,
    });

  const [board0, board1, board2, board3] = boards;

  //console.log("what", gameEngine, boards);

  return (
    <div className="max-h-2xl h-auto w-full max-w-2xl">
      {winner ? (
        <WinIndicator playerWin={winner} />
      ) : (
        <TurnIndicator playerTurn={playerTurn} />
      )}
      <ErrorMessage message={boardMessage} />
      <div className="max-h-2xl h-auto w-full max-w-2xl items-center">
        <HomeArea color="black">
          <Board {...board0} dispatch={dispatch} />
          <Board {...board1} dispatch={dispatch} />
        </HomeArea>
        <HomeArea color="white">
          <Board {...board2} dispatch={dispatch} />
          <Board {...board3} dispatch={dispatch} />
        </HomeArea>
      </div>
      <div
        onClick={() => {
          console.log("oh hi", boards, moves, playerTurn, winner, boardMessage);
        }}
      >
        test
      </div>
    </div>
  );
}

import clsx from "clsx";
import Board, { coordinateToId } from "./board";
import { useReducer, ReactNode } from "react";
import {
  PlayerColor,
  BoardMessage,
  Coord,
  GridType,
  BoardCoordinates,
  Direction,
  Length,
  BoardType,
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

//@ts-ignore
function gameEngine(gameState, action) {
  function getMoveLength(a: BoardCoordinates, b: BoardCoordinates): number {
    return Math.max(Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1]));
  }

  function switchPlayer(player: PlayerColor) {
    return player === "white" ? "black" : "white";
  }

  function getMoveDirection(
    origin: BoardCoordinates,
    destination: BoardCoordinates,
  ): Direction {
    // north/south movement
    if (origin[0] === destination[0]) {
      if (origin[1] > destination[1]) {
        return Direction.N;
      } else {
        return Direction.S;
      }
    }
    // east/west movement
    if (origin[1] === destination[1]) {
      if (origin[0] < destination[0]) {
        return Direction.E;
      } else {
        return Direction.W;
      }
    }
    // diagonal
    if (origin[0] < destination[0] && origin[1] > destination[1]) {
      return Direction.NE;
    } else if (origin[0] < destination[0] && origin[1] < destination[1]) {
      return Direction.SE;
    } else if (origin[0] > destination[0] && origin[1] > destination[1]) {
      return Direction.NW;
    } else if (origin[0] > destination[0] && origin[1] < destination[1]) {
      return Direction.SW;
    }

    console.error(`invalid direction: ${origin}, ${destination}`);
    return Direction.N;
  }

  // checks that a move is legal locally on board, including direction, length, and pushing stones
  function isMoveLegal(
    origin: BoardCoordinates,
    destination: BoardCoordinates,
    boardGrid: GridType,
    playerTurn: PlayerColor,
  ): BoardMessage | "LEGAL" {
    const length = getMoveLength(origin, destination);

    if ([0, 1, 2, 3].includes(length) !== true) {
      console.error(
        `move length is some kind of crazy value.  value: ${length}`,
      );
      return BoardMessage.MOVEILLEGAL;
    }
    // player selected and de-selected the stone
    if (length === 0) {
      return "LEGAL";
    }
    if (length === 3) {
      return BoardMessage.MOVETOOLONG;
    }

    const moveLength = length as Length;
    const direction = getMoveDirection(origin, destination);
    direction;

    // only allow orthogonal or diagonal moves, no knight moves
    const xMove = Math.abs(origin[0] - destination[0]);
    const yMove = Math.abs(origin[1] - destination[1]);
    if (
      !(xMove === 0 || xMove === moveLength) ||
      !(yMove === 0 || yMove === moveLength)
    ) {
      return BoardMessage.MOVEKNIGHT;
    }

    const betweenCoords =
      moveLength === 2
        ? ([
            origin[0] + (destination[0] - origin[0]) / 2,
            origin[1] + (destination[1] - origin[1]) / 2,
          ] as BoardCoordinates)
        : undefined;
    const nextX = destination[0] + (destination[0] - origin[0]) / moveLength;
    const nextY = destination[1] + (destination[1] - origin[1]) / moveLength;
    const nextCoords =
      nextX >= 0 && nextX <= 3 && nextY >= 0 && nextY <= 3
        ? ([nextX, nextY] as BoardCoordinates)
        : undefined;

    const destinationSquare = boardGrid[destination[0]][destination[1]];
    const pushDestination = nextCoords
      ? boardGrid[nextCoords[0]][nextCoords[1]]
      : null;
    const intermediarySquare = betweenCoords
      ? boardGrid[betweenCoords[0]][betweenCoords[1]]
      : null;

    // can't push your own stone(s)
    if (
      (destinationSquare != null && destinationSquare.color === playerTurn) ||
      (intermediarySquare != null && intermediarySquare.color === playerTurn)
    ) {
      return BoardMessage.MOVESAMECOLORBLOCKING;
    }

    // can't push 2 stones in a row
    if (
      Number(intermediarySquare != null) +
        Number(destinationSquare != null) +
        Number(pushDestination != null) >
      1
    ) {
      return BoardMessage.MOVETWOSTONESBLOCKING;
    }

    return "LEGAL";
  }

  function checkWin(boardGrid: GridType): PlayerColor | null {
    if (
      !boardGrid.some((row) =>
        row.some((cell) => cell && cell.color === "black"),
      )
    ) {
      return "white";
    }
    if (
      !boardGrid.some((row) =>
        row.some((cell) => cell && cell.color === "white"),
      )
    ) {
      return "black";
    }
    return null;
  }

  // default to clearing the boardMessage
  const newGameState = { ...gameState, boardMessage: null };
  const newMoves = gameState.moves.slice();

  switch (action.type) {
    case "moveStone": {
      const isLegalMessage = isMoveLegal(
        action.origin,
        action.destination,
        gameState.boards[action.boardId].grid,
        gameState.playerTurn,
      );

      if (isLegalMessage !== "LEGAL") {
        return { ...newGameState, boardMessage: isLegalMessage };
      }

      if (
        (newMoves.length % 2 === 0 && action.color === "white") ||
        (newMoves.length % 2 === 1 && action.color === "black")
      ) {
        // can't move the other color stones / turn error
        return { ...newGameState };
      }

      // clicked but didn't move stone
      if (
        coordinateToId(action.origin) === coordinateToId(action.destination)
      ) {
        return { ...newGameState };
      }

      // undo passive move
      if (newMoves.length > 0 && newMoves[newMoves.length - 1].secondMove) {
        const lastMove = newMoves[newMoves.length - 1].firstMove;

        if (lastMove.boardId === action.boardId) {
          if (
            coordinateToId(lastMove.origin) ===
              coordinateToId(action.destination) &&
            coordinateToId(lastMove.destination) ===
              coordinateToId(action.origin)
          ) {
            return {
              ...newGameState,
              moves: newMoves.slice(0, -1),
            };
          } else {
            // invalid undo attempt, probably need a more clear error message
            return { ...newGameState };
          }
        }
        // else, not an undo move
      }

      //@ts-ignore
      const newGrid = gameState.boards[action.boardId].grid.map((row) => [
        ...row,
      ]);

      const stone = newGrid[action.origin[0]][action.origin[1]];

      const moveLength = getMoveLength(action.origin, action.destination);
      const betweenCoords =
        moveLength === 2
          ? ([
              action.origin[0] + (action.destination[0] - action.origin[0]) / 2,
              action.origin[1] + (action.destination[1] - action.origin[1]) / 2,
            ] as BoardCoordinates)
          : undefined;
      const nextX =
        action.destination[0] +
        (action.destination[0] - action.origin[0]) / moveLength;
      const nextY =
        action.destination[1] +
        (action.destination[1] - action.origin[1]) / moveLength;
      const nextCoords =
        nextX >= 0 && nextX <= 3 && nextY >= 0 && nextY <= 3
          ? ([nextX, nextY] as BoardCoordinates)
          : undefined;

      const pushedStone =
        newGrid[action.destination[0]][action.destination[1]] ||
        (betweenCoords ? newGrid[betweenCoords[0]][betweenCoords[1]] : null);

      if (pushedStone && betweenCoords) {
        newGrid[betweenCoords[0]][betweenCoords[1]] = null;
      }
      if (pushedStone && nextCoords) {
        newGrid[nextCoords[0]][nextCoords[1]] = pushedStone;
      }
      newGrid[action.origin[0]][action.origin[1]] = null;
      newGrid[action.destination[0]][action.destination[1]] = stone;

      const newBoards = gameState.boards.map(
        (board: BoardType, index: Coord) =>
          index === action.boardId ? { ...board, grid: newGrid } : board,
      );
      newBoards[action.boardId].grid = newGrid;
      const move = {
        player: action.color,
        firstMove: {
          boardId: action.boardId,
          origin: action.origin,
          destination: action.destination,
          isPush: pushedStone !== null,
        },
      };
      newMoves.push(move);

      if (
        gameState.moves.length === 0 ||
        gameState.moves[gameState.moves.length - 1].secondMove
      ) {
        console.log("hello my baby", newMoves);
        return { ...newGameState, boards: newBoards, moves: newMoves };
      } else {
        // active
        if (checkWin(newGrid)) {
          return { ...newGameState, boardMessage: "baba" };
        }
        return {
          ...newGameState,
          moves: newMoves,
          boards: newBoards,
          playerTurn: switchPlayer(gameState.playerTurn),
        };
      }

      // some kind of crazy error?
      //return { ...newGameState };
    }

    case "displayError": {
      return { ...newGameState, boardMessage: action.boardMessage };
    }

    case "draw": {
      return { ...newGameState, boardMessage: "baba" };
    }

    case "concede": {
      return { ...newGameState, boardMessage: "baba" };
    }

    default: {
      throw Error(`unknown action: ${action}`);
    }
  }
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
    },
    {
      id: 1,
      boardColor: "light",
      playerHome: "black",
      grid: [...initialGrid],
    },
    {
      id: 2,
      boardColor: "light",
      playerHome: "white",
      grid: [...initialGrid],
    },
    {
      id: 3,
      boardColor: "dark",
      playerHome: "white",
      grid: [...initialGrid],
    },
  ];

  const [{ boards, moves, playerTurn, winner, boardMessage }, dispatch] =
    useReducer(gameEngine, {
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

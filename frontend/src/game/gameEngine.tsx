import { coordinateToId } from "./board";
import {
  PlayerColor,
  BoardMessage,
  GridType,
  BoardCoordinates,
  Direction,
  Length,
  BoardsType,
  GameStateType,
  GameEngineAction,
  ActionType,
  StoneObject,
  MoveStoneAction,
  GameWinnerType,
} from "../types";

export const blankGrid = [
  [null, null, null, null],
  [null, null, null, null],
  [null, null, null, null],
  [null, null, null, null],
] as GridType;

export const initialGrid = [
  [
    { id: 0, color: PlayerColor.BLACK, canMove: false },
    null,
    null,
    { id: 4, color: PlayerColor.WHITE, canMove: false },
  ],
  [
    { id: 1, color: PlayerColor.BLACK, canMove: false },
    null,
    null,
    { id: 5, color: PlayerColor.WHITE, canMove: false },
  ],
  [
    { id: 2, color: PlayerColor.BLACK, canMove: false },
    null,
    null,
    { id: 6, color: PlayerColor.WHITE, canMove: false },
  ],
  [
    { id: 3, color: PlayerColor.BLACK, canMove: false },
    null,
    null,
    { id: 7, color: PlayerColor.WHITE, canMove: false },
  ],
] as GridType;

export const initialBoards = [
  {
    id: 0,
    boardColor: "dark",
    playerHome: PlayerColor.BLACK,
    grid: structuredClone(initialGrid),
    lastMove: null,
  },
  {
    id: 1,
    boardColor: "light",
    playerHome: PlayerColor.BLACK,
    grid: structuredClone(initialGrid),
    lastMove: null,
  },
  {
    id: 2,
    boardColor: "light",
    playerHome: PlayerColor.WHITE,
    grid: structuredClone(initialGrid),
    lastMove: null,
  },
  {
    id: 3,
    boardColor: "dark",
    playerHome: PlayerColor.WHITE,
    grid: structuredClone(initialGrid),
    lastMove: null,
  },
] as BoardsType;

export const initialGameState = {
  boards: structuredClone(initialBoards),
  moves: [],
  playerTurn: PlayerColor.BLACK,
  winner: null,
  boardMessage: null,
} as GameStateType;

export function switchPlayer(player: PlayerColor) {
  return player === PlayerColor.WHITE ? PlayerColor.BLACK : PlayerColor.WHITE;
}

export function getMoveLength(
  a: BoardCoordinates,
  b: BoardCoordinates,
): number {
  return Math.max(Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1]));
}

export function getMoveDirection(
  origin: BoardCoordinates,
  destination: BoardCoordinates,
): Direction {
  const xMove = Math.abs(origin[0] - destination[0]);
  const yMove = Math.abs(origin[1] - destination[1]);
  if (
    (xMove === 0 && yMove === 0) ||
    (xMove > 0 && yMove > 0 && xMove !== yMove)
  ) {
    // only allow pure othogonal / diagonal moves
    throw new Error(`invalid direction: ${origin}, ${destination}`);
  }

  // north/south movement
  if (xMove === 0) {
    if (origin[1] > destination[1]) {
      return Direction.N;
    } else {
      return Direction.S;
    }
  }
  // east/west movement
  if (yMove === 0) {
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

  // this shouldn't even be possible
  throw new Error(
    `extremely cursed invalid direction: ${origin}, ${destination}`,
  );
}

// checks that a move is legal locally on board, including direction, length, and pushing stones
export function isMoveLegal(
  origin: BoardCoordinates,
  destination: BoardCoordinates,
  boardGrid: GridType,
  playerTurn: PlayerColor,
): BoardMessage | "LEGAL" {
  const length = getMoveLength(origin, destination);

  if ([0, 1, 2, 3].includes(length) !== true) {
    throw new Error(`move length is some kind of crazy value: ${length}`);
  }

  if (length === 0) {
    // player selected and de-selected the stone
    return "LEGAL";
  }
  if (length === 3) {
    return BoardMessage.MOVETOOLONG;
  }

  const moveLength = length as Length;

  try {
    getMoveDirection(origin, destination);
  } catch (error) {
    // only allow orthogonal or diagonal moves, no knight moves
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

  if (
    (destinationSquare != null && destinationSquare.color === playerTurn) ||
    (intermediarySquare != null && intermediarySquare.color === playerTurn)
  ) {
    // can't push your own stone(s)
    return BoardMessage.MOVESAMECOLORBLOCKING;
  }

  if (
    Number(intermediarySquare != null) +
      Number(destinationSquare != null) +
      Number(pushDestination != null) >
    1
  ) {
    // can't push 2 stones in a row
    return BoardMessage.MOVETWOSTONESBLOCKING;
  }

  return "LEGAL";
}

export function isInputValid(
  gameState: GameStateType,
  action: MoveStoneAction,
) {
  const newGameState = structuredClone(gameState);
  if (gameState.playerTurn !== action.color) {
    // can't move when it's not your turn
    return { ...newGameState, boardMessage: BoardMessage.MOVENOTYOURTURN };
  }

  const stone = structuredClone(
    gameState.boards[action.boardId].grid[action.origin[0]][action.origin[1]],
  );
  if (stone == null) {
    throw new Error(`stone does not exist at origin ${action.origin}`);
  }

  const movedStone = stone as StoneObject;
  if (gameState.playerTurn !== movedStone.color) {
    // can't move the other player's color stones
    return { ...newGameState, boardMessage: BoardMessage.MOVENOTYOURPIECE };
  }

  return "VALID";
}

export function checkWin(boardGrid: GridType): PlayerColor | null {
  if (
    !boardGrid.some((row) =>
      row.some((cell) => cell && cell.color === PlayerColor.BLACK),
    )
  ) {
    return PlayerColor.WHITE;
  }
  if (
    !boardGrid.some((row) =>
      row.some((cell) => cell && cell.color === PlayerColor.WHITE),
    )
  ) {
    return PlayerColor.BLACK;
  }
  return null;
}

export default function gameEngine(
  gameState: GameStateType,
  action: GameEngineAction,
) {
  // default to clearing the boardMessage
  const newGameState = structuredClone(gameState);
  newGameState.boardMessage = null;
  const newMoves = structuredClone(gameState.moves);

  switch (action.type) {
    case ActionType.MOVESTONE: {
      const isInputValidResult = isInputValid(gameState, action);
      if (isInputValidResult !== "VALID") {
        return isInputValidResult;
      }

      const isLegalMessage = isMoveLegal(
        action.origin,
        action.destination,
        gameState.boards[action.boardId].grid,
        gameState.playerTurn,
      );

      if (isLegalMessage !== "LEGAL") {
        return {
          ...newGameState,
          boardMessage: isLegalMessage as BoardMessage,
        };
      }

      // clicked but didn't move stone
      if (
        coordinateToId(action.origin) === coordinateToId(action.destination)
      ) {
        return { ...newGameState };
      }

      // movedStone exists, checked in isInputValid
      const movedStone = structuredClone(
        newGameState.boards[action.boardId].grid[action.origin[0]][
          action.origin[1]
        ],
      ) as StoneObject;

      const currentPlayerFirstMove =
        newMoves.length > 0 && newMoves[newMoves.length - 1].secondMove == null
          ? newMoves[newMoves.length - 1].firstMove
          : null;

      // undo passive move
      if (
        currentPlayerFirstMove &&
        currentPlayerFirstMove.boardId === action.boardId
      ) {
        // selected the stone that moved last move
        if (
          coordinateToId(currentPlayerFirstMove.destination) ===
          coordinateToId(action.origin)
        ) {
          // moved the stone to the last move's origin
          if (
            coordinateToId(currentPlayerFirstMove.origin) ===
            coordinateToId(action.destination)
          ) {
            const grid = newGameState.boards[action.boardId].grid;
            grid[action.destination[0]][action.destination[1]] = movedStone;
            grid[action.origin[0]][action.origin[1]] = null;

            return {
              ...newGameState,
              moves: newMoves.slice(0, -1),
            };

            // moved the stone somewhere else
          } else {
            throw new Error(
              "you must undo the passive move by returning the stone to its origin square",
            );
          }
        } else {
          throw new Error(
            "you can't move another stone on the board you made your passive move on.  if you're trying to undo, move the stone you moved back to its origin",
          );
        }
        // else, not an undo move
      }

      //@ts-ignore
      const newGrid = structuredClone(gameState.boards[action.boardId].grid);

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
      newGrid[action.destination[0]][action.destination[1]] = movedStone;

      const newBoards = structuredClone(gameState.boards);
      newBoards[action.boardId].grid = newGrid;
      const newMove = {
        boardId: action.boardId,
        origin: action.origin,
        destination: action.destination,
        isPush: pushedStone != null,
      };

      if (
        gameState.moves.length === 0 ||
        gameState.moves[gameState.moves.length - 1].secondMove
      ) {
        // passive move
        if (pushedStone) {
          throw new Error("can't push stones with passive move");
        }

        if (action.color !== gameState.boards[action.boardId].playerHome) {
          throw new Error(
            "can't make the first (passive) move outside the player's home area",
          );
        }

        newMoves.push({
          player: action.color,
          firstMove: newMove,
        });
        return { ...newGameState, boards: newBoards, moves: newMoves };
      } else {
        // active move
        if (currentPlayerFirstMove!.boardId + action.boardId === 3) {
          throw new Error(
            "can't play active move on the same color board as the passive move",
          );
        }

        newMoves[newMoves.length - 1].secondMove = newMove;
        const winner = checkWin(newGrid);

        return {
          ...newGameState,
          moves: newMoves,
          boards: newBoards,
          playerTurn: switchPlayer(gameState.playerTurn),
          winner: winner,
        };
      }
    }

    case ActionType.DISPLAYERROR: {
      return {
        ...newGameState,
        boardMessage: action.boardMessage as BoardMessage,
      };
    }

    case ActionType.DRAW: {
      return { ...newGameState, winner: "DRAW" as GameWinnerType };
    }

    case ActionType.CONCEDE: {
      return { ...newGameState, winner: switchPlayer(gameState.playerTurn) };
    }

    default: {
      throw Error(`unknown action: ${action}`);
    }
  }
}

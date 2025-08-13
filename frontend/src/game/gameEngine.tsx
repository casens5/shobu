import {
  PlayerColor,
  BoardMessage,
  GridType,
  Coordinate,
  Direction,
  Length,
  BoardsType,
  GameStateType,
  GameEngineAction,
  ActionType,
  StoneObject,
  MoveStoneAction,
  GameWinnerType,
  InitializeGameAction,
  BoardShade,
  Cartesians,
  Cart,
  ActiveMoveTrigger,
} from "../types";

export const blankGrid = new Array(16).fill(null) as GridType;

const gridTemplate = [
  { id: 0, color: PlayerColor.BLACK, canMove: false },
  { id: 1, color: PlayerColor.BLACK, canMove: false },
  { id: 2, color: PlayerColor.BLACK, canMove: false },
  { id: 3, color: PlayerColor.BLACK, canMove: false },
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  { id: 4, color: PlayerColor.WHITE, canMove: false },
  { id: 5, color: PlayerColor.WHITE, canMove: false },
  { id: 6, color: PlayerColor.WHITE, canMove: false },
  { id: 7, color: PlayerColor.WHITE, canMove: false },
] as GridType;

const boardsTemplate = [
  {
    id: 0,
    boardShade: BoardShade.DARK,
    playerHome: PlayerColor.BLACK,
    grid: structuredClone(gridTemplate),
    lastMoves: [null, null],
  },
  {
    id: 1,
    boardShade: BoardShade.LIGHT,
    playerHome: PlayerColor.BLACK,
    grid: structuredClone(gridTemplate),
    lastMoves: [null, null],
  },
  {
    id: 2,
    boardShade: BoardShade.LIGHT,
    playerHome: PlayerColor.WHITE,
    grid: structuredClone(gridTemplate),
    lastMoves: [null, null],
  },
  {
    id: 3,
    boardShade: BoardShade.DARK,
    playerHome: PlayerColor.WHITE,
    grid: structuredClone(gridTemplate),
    lastMoves: [null, null],
  },
] as BoardsType;

export const gameStateTemplate = {
  boards: structuredClone(boardsTemplate),
  moves: [],
  playerTurn: PlayerColor.BLACK,
  winner: null,
  boardMessage: null,
  activeMoveTrigger: null,
} as GameStateType;

const initAction: InitializeGameAction = {
  type: ActionType.INITIALIZEGAME,
};

export const initialGameState = gameEngine(gameStateTemplate, initAction);

export function switchPlayer(player: PlayerColor) {
  return player === PlayerColor.WHITE ? PlayerColor.BLACK : PlayerColor.WHITE;
}

export function coordinateToCartesian(coord: Coordinate): Cartesians {
  const aX = coord % 4;
  const aY = Math.floor(coord / 4);
  if (
    !Number.isInteger(aX) ||
    !Number.isInteger(aY) ||
    aX < 0 ||
    aX > 3 ||
    aY < 0 ||
    aY > 3
  ) {
    throw new Error(`invalid input to coordinateToCartesian: ${coord}`);
  }
  return [aX, aY] as Cartesians;
}

export function cartesianToCoordinate(carts: Cartesians): Coordinate {
  if (
    !Number.isInteger(carts[0]) ||
    !Number.isInteger(carts[1]) ||
    carts[0] < 0 ||
    carts[0] > 3 ||
    carts[1] < 0 ||
    carts[1] > 3
  ) {
    throw new Error(`invalid input to cartesianToCoordinate: ${carts}`);
  }
  return (4 * carts[1] + carts[0]) as Coordinate;
}

export function getMoveLength(a: Coordinate, b: Coordinate): number {
  const [aX, aY] = coordinateToCartesian(a);
  const [bX, bY] = coordinateToCartesian(b);
  return Math.max(Math.abs(aX - bX), Math.abs(aY - bY));
}

export function getMoveDirection(
  origin: Coordinate,
  destination: Coordinate,
): Direction {
  const [originX, originY] = coordinateToCartesian(origin);
  const [destinationX, destinationY] = coordinateToCartesian(destination);
  const xMove = Math.abs(originX - destinationX);
  const yMove = Math.abs(originY - destinationY);

  // offset by 10, dicts can't have negative indicies
  const moveDiff = origin - destination + 10;
  const directionDict: { [key: number]: Direction } = {
    2: Direction.S,
    6: Direction.S,
    14: Direction.N,
    18: Direction.N,
    11: Direction.W,
    12: Direction.W,
    9: Direction.E,
    8: Direction.E,
    7: Direction.SW,
    4: Direction.SW,
    15: Direction.NW,
    20: Direction.NW,
    13: Direction.NE,
    16: Direction.NE,
    5: Direction.SE,
    0: Direction.SE,
  };

  if (
    (xMove === 0 && yMove === 0) ||
    (xMove > 0 && yMove > 0 && xMove !== yMove) ||
    directionDict[moveDiff] == null
  ) {
    // only allow pure othogonal / diagonal moves
    throw new Error(
      `invalid direction: origin: ${origin}, destination: ${destination}`,
    );
  }

  return directionDict[moveDiff];
}

export function setCanMove(
  grid: GridType,
  playerColor: PlayerColor,
  canMove: boolean,
) {
  return grid.map((cell) => {
    if (cell && cell.color === playerColor) {
      return { ...cell, canMove: canMove };
    }
    return cell;
  }) as GridType;
}

export function setBoardsForPassiveMove(gameState: GameStateType) {
  const newGameState = structuredClone(gameState);
  const playerColor = newGameState.playerTurn;

  newGameState.boards.forEach((board) => {
    board.grid = setCanMove(board.grid, switchPlayer(playerColor), false);
    board.lastMoves[playerColor] = null;
    if (board.playerHome === playerColor && gameState.winner == null) {
      board.grid = setCanMove(board.grid, playerColor, true);
    }
  });

  return newGameState.boards;
}

// checks that a move is legal locally on board, including direction, length, and pushing stones
export function isMoveLegal(
  origin: Coordinate,
  destination: Coordinate,
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    // only allow orthogonal or diagonal moves, no knight moves
    return BoardMessage.MOVEKNIGHT;
  }

  const [originX, originY] = coordinateToCartesian(origin);
  const [destinationX, destinationY] = coordinateToCartesian(destination);

  const betweenCoord =
    moveLength === 2
      ? cartesianToCoordinate([
          (originX + (destinationX - originX) / 2) as Cart,
          (originY + (destinationY - originY) / 2) as Cart,
        ])
      : undefined;
  const nextX = (destinationX + (destinationX - originX) / moveLength) as Cart;
  const nextY = (destinationY + (destinationY - originY) / moveLength) as Cart;
  const nextCoord =
    nextX >= 0 && nextX <= 3 && nextY >= 0 && nextY <= 3
      ? cartesianToCoordinate([nextX, nextY])
      : undefined;

  const destinationSquare = boardGrid[destination];
  const pushDestination = nextCoord ? boardGrid[nextCoord] : null;
  const intermediarySquare = betweenCoord ? boardGrid[betweenCoord] : null;

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

  if (gameState.winner != null) {
    return { ...newGameState };
  }

  if (gameState.playerTurn !== action.color) {
    // can't move when it's not your turn
    return { ...newGameState, boardMessage: BoardMessage.MOVENOTYOURTURN };
  }

  const stone = structuredClone(
    gameState.boards[action.boardId].grid[action.origin],
  );
  if (stone == null) {
    throw new Error(`stone does not exist at origin ${action.origin}`);
  }

  const movedStone: StoneObject = stone;
  if (gameState.playerTurn !== movedStone.color) {
    // can't move the other player's color stones
    return { ...newGameState, boardMessage: BoardMessage.MOVENOTYOURPIECE };
  }

  const lastTurn =
    gameState.moves.length > 0
      ? gameState.moves[gameState.moves.length - 1]
      : null;

  // if is the active move, and the move is on the same shade board as the passive move
  if (
    lastTurn &&
    lastTurn.activeMove == null &&
    lastTurn.passiveMove.boardId + action.boardId === 3
  ) {
    return {
      ...newGameState,
      boardMessage: BoardMessage.MOVEWRONGSHADEBOARD,
    };
  }

  if (!movedStone.canMove) {
    return { ...newGameState, boardMessage: BoardMessage.MOVEILLEGAL };
  }

  return "VALID";
}

export function checkWin(boardGrid: GridType): PlayerColor | null {
  if (!boardGrid.some((cell) => cell && cell.color === PlayerColor.BLACK)) {
    return PlayerColor.WHITE;
  }
  if (!boardGrid.some((cell) => cell && cell.color === PlayerColor.WHITE)) {
    return PlayerColor.BLACK;
  }
  return null;
}

export default function gameEngine(
  gameState: GameStateType,
  action: GameEngineAction,
) {
  // default to clearing the boardMessage, ActiveMoveTrigger
  const newGameState = structuredClone(gameState);
  newGameState.boardMessage = null;
  newGameState.activeMoveTrigger = null;
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
      if (action.origin === action.destination) {
        return { ...newGameState };
      }

      // movedStone exists, checked in isInputValid
      const stone = newGameState.boards[action.boardId].grid[action.origin];
      if (!stone) {
        throw new Error(`stone does not exist at origin ${action.origin}`);
      }
      const movedStone: StoneObject = structuredClone(stone);

      const currentPlayerFirstMove =
        newMoves.length > 0 && newMoves[newMoves.length - 1].activeMove == null
          ? newMoves[newMoves.length - 1].passiveMove
          : null;

      // undo passive move
      if (
        currentPlayerFirstMove &&
        currentPlayerFirstMove.boardId === action.boardId
      ) {
        // selected the stone that moved last move
        if (currentPlayerFirstMove.destination === action.origin) {
          // moved the stone to the last move's origin
          if (currentPlayerFirstMove.origin === action.destination) {
            const grid = newGameState.boards[action.boardId].grid;
            grid[action.destination] = movedStone;
            grid[action.origin] = null;

            newGameState.boards[action.boardId].lastMoves[action.color] = null;

            newGameState.boards.forEach((board) => {
              board.grid = setCanMove(
                board.grid,
                action.color,
                board.playerHome === action.color,
              );
            });

            return {
              ...newGameState,
              moves: newMoves.slice(0, -1),
            };

            // moved the stone somewhere else
          } else {
            return {
              ...newGameState,
              boardMessage: BoardMessage.MOVEUNDOWRONGDESTINATION,
            };
          }
        } else {
          return {
            ...newGameState,
            boardMessage: BoardMessage.MOVEUNDOWRONGSTONE,
          };
        }
        // else, not an undo move
      }

      const newGrid = structuredClone(gameState.boards[action.boardId].grid);

      const [originX, originY] = coordinateToCartesian(action.origin);
      const [destinationX, destinationY] = coordinateToCartesian(
        action.destination,
      );
      const moveLength = getMoveLength(action.origin, action.destination);
      const betweenCoord =
        moveLength === 2
          ? cartesianToCoordinate([
              (originX + (destinationX - originX) / 2) as Cart,
              (originY + (destinationY - originY) / 2) as Cart,
            ])
          : undefined;
      const nextX = (destinationX +
        (destinationX - originX) / moveLength) as Cart;
      const nextY = (destinationY +
        (destinationY - originY) / moveLength) as Cart;
      const nextCoord =
        nextX >= 0 && nextX <= 3 && nextY >= 0 && nextY <= 3
          ? cartesianToCoordinate([nextX, nextY])
          : undefined;

      const pushedStone =
        newGrid[action.destination] ||
        (betweenCoord ? newGrid[betweenCoord] : null);

      if (pushedStone && betweenCoord) {
        newGrid[betweenCoord] = null;
      }
      if (pushedStone && nextCoord) {
        newGrid[nextCoord] = pushedStone;
      }
      newGrid[action.origin] = null;
      newGrid[action.destination] = movedStone;

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
        gameState.moves[gameState.moves.length - 1].activeMove
      ) {
        // passive move
        if (pushedStone) {
          return {
            ...newGameState,
            boardMessage: BoardMessage.MOVEPASSIVECANTPUSH,
          };
        }

        if (action.color !== gameState.boards[action.boardId].playerHome) {
          throw new Error(
            "can't make the first (passive) move outside the player's home area",
          );
        }
        const boardShade = newGameState.boards[action.boardId].boardShade;
        newBoards.forEach((board) => {
          board.grid = setCanMove(
            board.grid,
            action.color,
            board.boardShade !== boardShade,
          );
        });

        newBoards[action.boardId].grid[action.destination]!.canMove = true;

        newMoves.push({
          playerColor: action.color,
          passiveMove: newMove,
        });

        newBoards[action.boardId].lastMoves[action.color] = {
          origin: action.origin,
          destination: action.destination,
          isPush: false,
        };
        return { ...newGameState, boards: newBoards, moves: newMoves };
      } else {
        // active move
        const passiveDirection = getMoveDirection(
          currentPlayerFirstMove!.origin,
          currentPlayerFirstMove!.destination,
        );
        const passiveLength = getMoveLength(
          currentPlayerFirstMove!.origin,
          currentPlayerFirstMove!.destination,
        );
        const moveDirection = getMoveDirection(
          action.origin,
          action.destination,
        );
        if (
          passiveLength !== moveLength ||
          passiveDirection !== moveDirection
        ) {
          return {
            ...newGameState,
            boardMessage: BoardMessage.MOVEUNEQUALTOPASSIVEMOVE,
          };
        }

        newBoards[action.boardId].lastMoves[action.color] = {
          origin: action.origin,
          destination: action.destination,
          isPush: pushedStone != null,
        };

        newMoves[newMoves.length - 1].activeMove = newMove;
        newGameState.moves = newMoves;
        newGameState.winner = checkWin(newGrid);
        newGameState.playerTurn = switchPlayer(newGameState.playerTurn);

        newGameState.boards = newBoards;
        newGameState.boards = setBoardsForPassiveMove(newGameState);
        const trigger = structuredClone(newMoves[newMoves.length - 1]);
        //@ts-expect-error notehunoethunt
        delete trigger.activeMove.isPush;
        //@ts-expect-error notehunoethunt
        delete trigger.passiveMove.isPush;
        newGameState.activeMoveTrigger = trigger as ActiveMoveTrigger;

        return newGameState;
      }
    }

    case ActionType.CANTMOVE: {
      if (newGameState.winner != null) {
        return { ...newGameState };
      }

      if (newGameState.playerTurn !== action.color) {
        return {
          ...newGameState,
          boardMessage: BoardMessage.MOVENOTYOURTURN,
        };
      }

      if (newMoves.length === 0 || newMoves[newMoves.length - 1].activeMove) {
        // passive move
        if (newGameState.boards[action.boardId].playerHome !== action.color) {
          return {
            ...newGameState,
            boardMessage: BoardMessage.MOVENOTINHOMEAREA,
          };
        } else {
          throw Error(
            `invalid ActionType.CANTMOVE: ${action}; ${newGameState}`,
          );
        }
      } else {
        // active move
        if (
          newGameState.moves[newGameState.moves.length - 1].passiveMove
            .boardId === action.boardId
        ) {
          // undo passive move with the wrong stone
          return {
            ...newGameState,
            boardMessage: BoardMessage.MOVEUNDOWRONGSTONE,
          };
        } else if (
          newGameState.moves[newGameState.moves.length - 1].passiveMove
            .boardId +
            action.boardId ===
          3
        ) {
          // active move on the same board shade as the passive
          return {
            ...newGameState,
            boardMessage: BoardMessage.MOVEWRONGSHADEBOARD,
          };
        } else {
          throw Error(
            `invalid ActionType.CANTMOVE: ${action}; ${newGameState}`,
          );
        }
      }
    }

    case ActionType.INITIALIZEGAME: {
      const initializedGameState = structuredClone(gameStateTemplate);
      initializedGameState.boards = initializedGameState.boards.map((board) => {
        if (board.id < 2) {
          board.grid = setCanMove(board.grid, PlayerColor.BLACK, true);
        } else {
          board.grid = setCanMove(board.grid, PlayerColor.BLACK, false);
        }
        board.grid = setCanMove(board.grid, PlayerColor.WHITE, false);

        return board;
      }) as BoardsType;

      return initializedGameState;
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

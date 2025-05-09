import { expect, test } from "vitest";
import gameEngine, {
  getMoveDirection,
  getMoveLength,
  checkWin,
  switchPlayer,
  isMoveLegal,
  blankGrid,
  initialGrid,
  initialGameState,
} from "./gameEngine";
import {
  ActionType,
  BoardCoordinates,
  BoardId,
  BoardMessage,
  Direction,
  DisplayErrorAction,
  MoveStoneAction,
  PlayerColor,
  StoneObject,
} from "../types";

test("getMoveLength works", () => {
  expect(getMoveLength([0, 0], [0, 2])).toBe(2);
  expect(getMoveLength([3, 3], [1, 3])).toBe(2);
  expect(getMoveLength([1, 3], [3, 1])).toBe(2);
  expect(getMoveLength([3, 3], [3, 3])).toBe(0);
  expect(getMoveLength([0, 1], [1, 1])).toBe(1);
  expect(getMoveLength([3, 2], [2, 3])).toBe(1);
  expect(getMoveLength([0, 0], [1, 1])).toBe(1);
});

test("switchPlayer works", () => {
  expect(switchPlayer(PlayerColor.WHITE)).toBe(PlayerColor.BLACK);
  expect(switchPlayer(PlayerColor.BLACK)).toBe(PlayerColor.WHITE);
});

test("getMoveDirection works", () => {
  expect(getMoveDirection([0, 1], [0, 0])).toBe(Direction.N);
  expect(getMoveDirection([1, 1], [1, 3])).toBe(Direction.S);
  expect(getMoveDirection([1, 2], [2, 2])).toBe(Direction.E);
  expect(getMoveDirection([2, 3], [0, 3])).toBe(Direction.W);
  expect(getMoveDirection([0, 1], [1, 0])).toBe(Direction.NE);
  expect(getMoveDirection([1, 2], [2, 3])).toBe(Direction.SE);
  expect(getMoveDirection([2, 1], [1, 0])).toBe(Direction.NW);
  expect(getMoveDirection([1, 0], [0, 1])).toBe(Direction.SW);
  const origin = [2, 1] as BoardCoordinates;
  const destination = [0, 2] as BoardCoordinates;
  expect(() => getMoveDirection(origin, destination)).toThrow();
});

test("isMoveLegal works", () => {
  expect(isMoveLegal([0, 0], [0, 1], initialGrid, PlayerColor.BLACK)).toBe(
    "LEGAL",
  );
  expect(isMoveLegal([0, 3], [0, 3], initialGrid, PlayerColor.WHITE)).toBe(
    "LEGAL",
  );

  let grid = structuredClone(initialGrid);
  let stone = structuredClone(grid[0][0]) as StoneObject;
  grid[0][0] = null;
  grid[0][1] = stone;
  expect(isMoveLegal([0, 1], [3, 1], grid, PlayerColor.BLACK)).toBe(
    BoardMessage.MOVETOOLONG,
  );

  expect(isMoveLegal([0, 3], [1, 1], initialGrid, PlayerColor.WHITE)).toBe(
    BoardMessage.MOVEKNIGHT,
  );

  expect(isMoveLegal([1, 0], [0, 1], grid, PlayerColor.BLACK)).toBe(
    BoardMessage.MOVESAMECOLORBLOCKING,
  );

  stone = structuredClone(grid[3][3]) as StoneObject;
  grid[3][3] = null;
  grid[0][2] = stone;
  expect(isMoveLegal([0, 1], [0, 2], grid, PlayerColor.BLACK)).toBe(
    BoardMessage.MOVETWOSTONESBLOCKING,
  );

  expect(() =>
    // @ts-expect-error intentionally disobeying the BoardCoordinates type
    isMoveLegal([0, 0], [0, 4], initialGrid, PlayerColor.BLACK),
  ).toThrow("move length is some kind of crazy value: 4");
});

test("checkWin works", () => {
  expect(checkWin(initialGrid)).toBe(null);

  let grid = structuredClone(blankGrid);
  let stone0 = structuredClone(initialGrid[0][0]) as StoneObject;
  grid[3][1] = stone0;

  expect(checkWin(grid)).toBe(PlayerColor.BLACK);

  grid = structuredClone(blankGrid);
  stone0 = structuredClone(initialGrid[3][3]) as StoneObject;
  let stone1 = structuredClone(initialGrid[0][3]) as StoneObject;
  grid[3][3] = stone0;
  grid[3][0] = stone1;

  expect(checkWin(grid)).toBe(PlayerColor.WHITE);
});

test("gameEngine renders error messages", () => {
  const action: DisplayErrorAction = {
    type: ActionType.DISPLAYERROR,
    color: PlayerColor.WHITE,
    boardMessage: BoardMessage.MOVEOUTOFBOUNDS,
  };
  expect(gameEngine(initialGameState, action)).toStrictEqual({
    ...initialGameState,
    boardMessage: BoardMessage.MOVEOUTOFBOUNDS,
  });
});

test("gameEngine handles moveStone actions", () => {
  let grid = structuredClone(blankGrid);
  let stone0 = structuredClone(initialGrid[2][0]) as StoneObject;
  let stone1 = structuredClone(initialGrid[3][3]) as StoneObject;
  grid[1][2] = stone0;
  grid[1][0] = stone1;
  let gameState = structuredClone(initialGameState);
  gameState.boards[1].grid = structuredClone(grid);

  let action: MoveStoneAction = {
    type: ActionType.MOVESTONE,
    boardId: 1,
    color: PlayerColor.BLACK,
    origin: [1, 2],
    destination: [1, 1],
  };

  let resultGrid = structuredClone(grid);
  resultGrid[1][1] = resultGrid[1][2];
  resultGrid[1][2] = null;
  let resultGameState = structuredClone(gameState);
  resultGameState.boards[1].grid = structuredClone(resultGrid);

  let moves = [
    {
      firstMove: {
        boardId: 1 as BoardId,
        isPush: false,
        origin: [1, 2] as BoardCoordinates,
        destination: [1, 1] as BoardCoordinates,
      },
      player: PlayerColor.BLACK,
    },
  ];
  resultGameState.moves = structuredClone(moves);

  // standard legal move
  expect(gameEngine(gameState, action)).toStrictEqual({
    ...resultGameState,
  });

  action = {
    type: ActionType.MOVESTONE,
    boardId: 1,
    color: PlayerColor.WHITE,
    origin: [1, 0],
    destination: [1, 1],
  };

  // wrong player's turn
  expect(gameEngine(gameState, action)).toStrictEqual({
    ...gameState,
    boardMessage: BoardMessage.MOVENOTYOURTURN,
  });

  action = {
    type: ActionType.MOVESTONE,
    boardId: 1,
    color: PlayerColor.BLACK,
    origin: [1, 0],
    destination: [1, 1],
  };

  // black can't move white's pieces
  expect(gameEngine(gameState, action)).toStrictEqual({
    ...gameState,
    boardMessage: BoardMessage.MOVENOTYOURPIECE,
  });

  action = {
    type: ActionType.MOVESTONE,
    boardId: 1,
    color: PlayerColor.BLACK,
    origin: [3, 2],
    destination: [3, 1],
  };

  // stone doesn't exist at origin
  expect(() => gameEngine(gameState, action)).toThrow(
    new Error("stone does not exist at origin 3,2"),
  );

  action = {
    type: ActionType.MOVESTONE,
    boardId: 1,
    color: PlayerColor.BLACK,
    origin: [1, 2],
    destination: [3, 1],
  };

  // illegal move caught by isMoveLegal
  expect(gameEngine(gameState, action)).toStrictEqual({
    ...gameState,
    boardMessage: BoardMessage.MOVEKNIGHT,
  });

  let gameState1 = structuredClone(initialGameState);
  gameState1.playerTurn = switchPlayer(gameState1.playerTurn);

  action = {
    type: ActionType.MOVESTONE,
    boardId: 2,
    color: PlayerColor.WHITE,
    origin: [0, 3],
    destination: [0, 3],
  };

  // click and de-select stone
  expect(gameEngine(gameState1, action)).toStrictEqual({
    ...gameState1,
  });

  action = {
    type: ActionType.MOVESTONE,
    boardId: 1,
    color: PlayerColor.BLACK,
    origin: [1, 1],
    destination: [1, 2],
  };

  // successful undo move
  expect(gameEngine(resultGameState, action)).toStrictEqual({
    ...gameState,
  });

  action = {
    type: ActionType.MOVESTONE,
    boardId: 1,
    color: PlayerColor.BLACK,
    origin: [1, 1],
    destination: [2, 1],
  };

  // invalid undo move
  expect(() => gameEngine(resultGameState, action)).toThrow(
    new Error(
      "you must undo the passive move by returning the stone to its origin square",
    ),
  );
});

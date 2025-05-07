import { expect, test } from "vitest";
import gameEngine, {
  getMoveDirection,
  getMoveLength,
  gridCopy,
  checkWin,
  switchPlayer,
  isMoveLegal,
} from "./gameEngine";
import {
  BoardCoordinates,
  BoardMessage,
  Direction,
  GridType,
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
  expect(switchPlayer("white")).toBe("black");
  expect(switchPlayer("black")).toBe("white");
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

const blankGrid = [
  [null, null, null, null],
  [null, null, null, null],
  [null, null, null, null],
  [null, null, null, null],
] as GridType;
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
] as GridType;
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
const gameState = {
  boards: initialBoards,
  moves: [],
  playerTurn: "black",
  winner: null,
  boardMessage: null,
};

test("isMoveLegal works", () => {
  expect(isMoveLegal([0, 0], [0, 1], initialGrid, "black")).toBe("LEGAL");
  expect(isMoveLegal([0, 3], [0, 3], initialGrid, "white")).toBe("LEGAL");

  let grid = gridCopy(initialGrid);
  let stone = { ...grid[0][0] } as StoneObject;
  grid[0][0] = null;
  grid[0][1] = stone;
  expect(isMoveLegal([0, 1], [3, 1], grid, "black")).toBe(
    BoardMessage.MOVETOOLONG,
  );

  expect(isMoveLegal([0, 3], [1, 1], initialGrid, "white")).toBe(
    BoardMessage.MOVEKNIGHT,
  );

  expect(isMoveLegal([1, 0], [0, 1], grid, "black")).toBe(
    BoardMessage.MOVESAMECOLORBLOCKING,
  );

  stone = { ...grid[3][3] } as StoneObject;
  grid[3][3] = null;
  grid[0][2] = stone;
  expect(isMoveLegal([0, 1], [0, 2], grid, "black")).toBe(
    BoardMessage.MOVETWOSTONESBLOCKING,
  );

  // @ts-expect-error intentionally disobeying the BoardCoordinates type
  expect(() => isMoveLegal([0, 0], [0, 4], initialGrid, "black")).toThrow(
    "move length is some kind of crazy value: 4",
  );
});

test("checkWin works", () => {
  expect(checkWin(initialGrid)).toBe(null);

  let grid = gridCopy(blankGrid);
  let stone0 = { ...initialGrid[0][0] } as StoneObject;
  grid[3][1] = stone0;

  expect(checkWin(grid)).toBe("black");

  grid = gridCopy(blankGrid);
  stone0 = { ...initialGrid[3][3] } as StoneObject;
  let stone1 = { ...initialGrid[0][3] } as StoneObject;
  grid[3][3] = stone0;
  grid[3][0] = stone1;

  expect(checkWin(grid)).toBe("white");
});

test("gameEngine renders error messages", () => {
  const action = {
    type: "displayError",
    boardId: 1,
    boardMessage: BoardMessage.MOVEOUTOFBOUNDS,
  };
  expect(gameEngine(gameState, action)).toStrictEqual({
    ...gameState,
    boardMessage: BoardMessage.MOVEOUTOFBOUNDS,
  });
});

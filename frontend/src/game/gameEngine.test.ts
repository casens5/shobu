import { expect, test } from "vitest";
import { getMoveLength } from "./gameEngine";

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
const gameState = {
  boards: initialBoards,
  moves: [],
  playerTurn: "black",
  winner: null,
  boardMessage: null,
};

test("getMoveLength works", () => {
  expect(getMoveLength([0, 0], [0, 2])).toBe(2);
  expect(getMoveLength([3, 3], [1, 3])).toBe(2);
  expect(getMoveLength([1, 3], [3, 1])).toBe(2);
  expect(getMoveLength([3, 3], [3, 3])).toBe(0);
  expect(getMoveLength([0, 1], [1, 1])).toBe(1);
  expect(getMoveLength([3, 2], [2, 3])).toBe(1);
  expect(getMoveLength([0, 0], [1, 1])).toBe(1);
});

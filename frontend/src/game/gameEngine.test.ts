import { expect, test } from "vitest";
import gameEngine, {
  getMoveDirection,
  getMoveLength,
  checkWin,
  switchPlayer,
  isMoveLegal,
  blankGrid,
  initialGameState,
  setCanMove,
  gameStateTemplate,
} from "./gameEngine";
import {
  ActionType,
  BoardCoordinates,
  BoardId,
  BoardMessage,
  CantMoveAction,
  Direction,
  DisplayErrorAction,
  InitializeGameAction,
  MoveRecord,
  MoveStoneAction,
  PlayerColor,
  StoneObject,
} from "../types";

function fullPrint(json: object) {
  return JSON.stringify(json, null, 2);
}

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

  const grid = structuredClone(initialGrid);
  let stone: StoneObject = { id: 0, color: PlayerColor.BLACK, canMove: false };
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

  stone = { id: 7, color: PlayerColor.WHITE, canMove: false };
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
  let stone0 = initialGrid[0][0];
  grid[3][1] = stone0;

  expect(checkWin(grid)).toBe(PlayerColor.BLACK);

  grid = structuredClone(blankGrid);
  stone0 = initialGrid[3][3];
  const stone1 = initialGrid[0][3];
  grid[3][3] = stone0;
  grid[3][0] = stone1;

  expect(checkWin(grid)).toBe(PlayerColor.WHITE);
});

test("setCanMove works", () => {
  grid = structuredClone(blankGrid);
  const blackStone: StoneObject = {
    id: 3,
    color: PlayerColor.BLACK,
    canMove: false,
  };
  grid[3][2] = blackStone;

  resultGrid = structuredClone(grid);
  resultGrid[3][2]!.canMove = true;

  // flips canMove on a single stone
  expect(setCanMove(grid, PlayerColor.BLACK, true)).toStrictEqual(resultGrid);

  const whiteStone = initialGrid[1][3]!;
  whiteStone.canMove = false;
  grid[3][0] = whiteStone;
  grid[3][2]!.canMove = false;

  resultGrid = structuredClone(grid);

  resultGrid[3][0]!.canMove = true;
  resultGrid[3][2]!.canMove = false;

  // flips canMove on a single stone, doesn't affect other color stones
  expect(setCanMove(grid, PlayerColor.WHITE, true)).toStrictEqual(resultGrid);

  grid = structuredClone(initialGrid);
  grid[2][3]!.canMove = true;
  grid[3][3]!.canMove = true;

  resultGrid = structuredClone(grid);
  resultGrid[2][3]!.canMove = false;
  resultGrid[3][3]!.canMove = false;

  // flips canMove when stones are a mix of true and false
  expect(setCanMove(grid, PlayerColor.WHITE, false)).toStrictEqual(resultGrid);

  grid[0][0]!.canMove = true;
  grid[1][0]!.canMove = true;
  grid[2][0]!.canMove = true;
  grid[3][0]!.canMove = true;

  resultGrid = structuredClone(grid);
  resultGrid[0][0]!.canMove = false;
  resultGrid[1][0]!.canMove = false;
  resultGrid[2][0]!.canMove = false;
  resultGrid[3][0]!.canMove = false;

  // flips canMove for black and doesn't affect white
  expect(setCanMove(grid, PlayerColor.BLACK, false)).toStrictEqual(resultGrid);
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

let gameState = structuredClone(initialGameState);
let grid = structuredClone(blankGrid);
const initialGrid = structuredClone(gameState.boards[0].grid);
const blackStone: StoneObject = structuredClone(initialGrid[2][0]!);
const whiteStone: StoneObject = structuredClone(initialGrid[3][3]!);
grid[1][2] = blackStone;
grid[1][0] = whiteStone;
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

resultGameState.boards[1].grid = setCanMove(
  resultGameState.boards[1].grid,
  PlayerColor.BLACK,
  false,
);
resultGameState.boards[1].grid[1][1]!.canMove = true;
resultGameState.boards[3].grid = setCanMove(
  resultGameState.boards[3].grid,
  PlayerColor.BLACK,
  true,
);

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

test("gameEngine initializes the boards", () => {
  const initializedGameState = structuredClone(gameStateTemplate);
  let grid0 = structuredClone(initializedGameState.boards[0].grid);
  let grid1 = structuredClone(initializedGameState.boards[1].grid);
  grid0 = setCanMove(grid0, PlayerColor.BLACK, true);
  grid0 = setCanMove(grid0, PlayerColor.WHITE, false);
  grid1 = setCanMove(grid1, PlayerColor.BLACK, true);
  grid1 = setCanMove(grid1, PlayerColor.WHITE, false);
  initializedGameState.boards[0].grid = grid0;
  initializedGameState.boards[1].grid = grid1;

  const initAction: InitializeGameAction = {
    type: ActionType.INITIALIZEGAME,
  };

  expect(gameEngine(gameState, initAction)).toStrictEqual(initializedGameState);
});

test("gameEngine handles invalid/illegal moveStone actions", () => {
  // standard legal move
  action = {
    type: ActionType.MOVESTONE,
    boardId: 1,
    color: PlayerColor.BLACK,
    origin: [1, 2],
    destination: [1, 1],
  };

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

  expect(() => gameEngine(gameState, action)).toThrow(
    new Error("stone does not exist at origin [3,2]"),
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

  const gameState1 = structuredClone(initialGameState);

  action = {
    type: ActionType.MOVESTONE,
    boardId: 0,
    color: PlayerColor.BLACK,
    origin: [3, 0],
    destination: [3, 0],
  };

  // click and de-select stone
  expect(gameEngine(gameState1, action)).toStrictEqual({
    ...gameState1,
  });
});

test("gameEngine handles undo moves", () => {
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

  expect(gameEngine(resultGameState, action)).toStrictEqual({
    ...resultGameState,
    boardMessage: BoardMessage.MOVEUNDOWRONGDESTINATION,
  });

  const stone2 = initialGrid[1][0];
  const gameState1 = structuredClone(resultGameState);
  gameState1.boards[1].grid[1][3] = stone2;

  action = {
    type: ActionType.MOVESTONE,
    boardId: 1,
    color: PlayerColor.BLACK,
    origin: [1, 3],
    destination: [2, 2],
  };

  expect(gameEngine(gameState1, action)).toStrictEqual({
    ...gameState1,
    boardMessage: BoardMessage.MOVEUNDOWRONGSTONE,
  });
});

test("gameEngine handles passive moves", () => {
  action = {
    type: ActionType.MOVESTONE,
    boardId: 1,
    color: PlayerColor.BLACK,
    origin: [1, 2],
    destination: [1, 1],
  };

  resultGrid = structuredClone(gameState.boards[1].grid);
  const stone = resultGrid[1][2];
  resultGrid[1][1] = stone;
  resultGrid[1][2] = null;

  // successful passive move
  expect(gameEngine(gameState, action).boards[1].grid).toStrictEqual(
    resultGrid,
  );

  action = {
    type: ActionType.MOVESTONE,
    boardId: 1,
    color: PlayerColor.BLACK,
    origin: [1, 2],
    destination: [1, 0],
  };

  expect(() => gameEngine(gameState, action)).toThrow(
    new Error("can't push stones with passive move"),
  );

  action = {
    type: ActionType.MOVESTONE,
    boardId: 2,
    color: PlayerColor.BLACK,
    origin: [1, 0],
    destination: [2, 1],
  };

  gameState.boards[2].grid[1][0]!.canMove = true;

  expect(() => gameEngine(gameState, action)).toThrow(
    new Error(
      "can't make the first (passive) move outside the player's home area",
    ),
  );
});

test("gameEngine handles active moves", () => {
  gameState = structuredClone(initialGameState);
  const passiveGrid = structuredClone(blankGrid);
  passiveGrid[1][0] = initialGrid[2][0];
  passiveGrid[1][2] = initialGrid[3][3];
  gameState.boards[1].grid = passiveGrid;

  action = {
    type: ActionType.MOVESTONE,
    boardId: 1,
    color: PlayerColor.BLACK,
    origin: [1, 0],
    destination: [1, 1],
  };

  let activeGameState = gameEngine(gameState, action);

  let stone0 = initialGrid[3][0];
  let stone1 = initialGrid[0][0];
  let stone2 = initialGrid[0][3];
  const stone3 = initialGrid[1][3];
  let activeGrid = structuredClone(blankGrid);
  activeGrid[2][0] = stone0;
  activeGrid[0][1] = stone1;
  activeGrid[0][2] = stone2;
  activeGrid[2][3] = stone3;

  activeGameState.boards[0].grid = activeGrid;
  resultGameState = structuredClone(activeGameState);

  resultGrid = structuredClone(activeGrid);
  resultGrid[0][1] = null;
  resultGrid[0][2] = stone1;
  resultGrid[0][3] = stone2;

  moves = [
    {
      player: PlayerColor.BLACK,
      firstMove: {
        boardId: 1,
        origin: [1, 0],
        destination: [1, 1],
        isPush: false,
      },
      secondMove: {
        boardId: 0,
        origin: [0, 1],
        destination: [0, 2],
        isPush: true,
      },
    } as MoveRecord,
  ];

  resultGameState.playerTurn = switchPlayer(resultGameState.playerTurn);
  resultGameState.boards[0].grid = resultGrid;
  resultGameState.moves = moves;

  action = {
    type: ActionType.MOVESTONE,
    boardId: 0,
    color: PlayerColor.BLACK,
    origin: [0, 1],
    destination: [0, 2],
  };

  // push but no stone removal
  expect(gameEngine(activeGameState, action)).toStrictEqual(resultGameState);

  const blackStone = passiveGrid[1][0];
  const whiteStone = passiveGrid[1][2];
  passiveGrid[1][2] = null;
  passiveGrid[1][1] = blackStone;
  passiveGrid[1][0] = whiteStone;

  gameState.boards[1].grid = passiveGrid;
  gameState.boards[0].grid = structuredClone(resultGrid);

  action = {
    type: ActionType.MOVESTONE,
    boardId: 1,
    color: PlayerColor.BLACK,
    origin: [1, 1],
    destination: [1, 3],
  };

  activeGameState = gameEngine(gameState, action);
  activeGameState.boards[0].grid = setCanMove(
    activeGameState.boards[0].grid,
    PlayerColor.BLACK,
    true,
  );
  resultGameState = structuredClone(activeGameState);

  resultGrid = structuredClone(resultGameState.boards[0].grid);
  let stone = resultGrid[2][0];
  resultGrid[2][2] = stone;
  resultGrid[2][0] = null;

  resultGameState.boards[0].grid = structuredClone(resultGrid);
  resultGameState.playerTurn = PlayerColor.WHITE;

  moves = [
    {
      player: 0,
      firstMove: {
        boardId: 1,
        origin: [1, 1],
        destination: [1, 3],
        isPush: false,
      },
      secondMove: {
        boardId: 0,
        origin: [2, 0],
        destination: [2, 2],
        isPush: false,
      },
    } as MoveRecord,
  ];

  resultGameState.moves = moves;

  action = {
    type: ActionType.MOVESTONE,
    boardId: 0,
    color: PlayerColor.BLACK,
    origin: [2, 0],
    destination: [2, 2],
  };

  // move with no push
  expect(gameEngine(activeGameState, action)).toStrictEqual(resultGameState);

  stone = passiveGrid[1][1];
  passiveGrid[2][0] = stone;
  passiveGrid[1][1] = null;

  gameState.boards[1].grid = structuredClone(passiveGrid);

  stone0 = resultGrid[0][2];
  resultGrid[0][1] = stone0;
  stone1 = resultGrid[0][3];
  resultGrid[0][2] = stone1;
  resultGrid[0][3] = null;
  stone2 = resultGrid[2][2];
  resultGrid[2][0] = stone2;
  resultGrid[2][2] = null;

  gameState.boards[0].grid = structuredClone(resultGrid);

  action = {
    type: ActionType.MOVESTONE,
    boardId: 1,
    color: PlayerColor.BLACK,
    origin: [2, 0],
    destination: [0, 2],
  };

  activeGameState = gameEngine(gameState, action);
  resultGameState = structuredClone(activeGameState);

  moves = [
    {
      player: 0,
      firstMove: {
        boardId: 1,
        isPush: false,
        origin: [2, 0],
        destination: [0, 2],
      },
      secondMove: {
        boardId: 0,
        origin: [2, 0],
        destination: [0, 2],
        isPush: true,
      },
    } as MoveRecord,
  ];
  resultGameState.moves = moves;

  resultGrid[0][2] = stone2;
  resultGrid[2][0] = null;

  resultGameState.boards[0].grid = structuredClone(resultGrid);
  resultGameState.playerTurn = PlayerColor.WHITE;

  action = {
    type: ActionType.MOVESTONE,
    boardId: 0,
    color: PlayerColor.BLACK,
    origin: [2, 0],
    destination: [0, 2],
  };

  // push and remove opponent's stone
  expect(gameEngine(activeGameState, action)).toStrictEqual(resultGameState);

  action = {
    type: ActionType.MOVESTONE,
    boardId: 2,
    color: PlayerColor.BLACK,
    origin: [2, 0],
    destination: [3, 1],
  };

  activeGameState.boards[2].grid[2][0]!.canMove = true;

  expect(gameEngine(activeGameState, action)).toStrictEqual({
    ...activeGameState,
    boardMessage: BoardMessage.MOVEWRONGSHADEBOARD,
  });

  action = {
    type: ActionType.MOVESTONE,
    boardId: 3,
    color: PlayerColor.BLACK,
    origin: [3, 0],
    destination: [2, 1],
  };

  let errorGameState = {
    ...activeGameState,
    boardMessage: BoardMessage.MOVEUNEQUALTOPASSIVEMOVE,
  };

  activeGameState.boards[3].grid = setCanMove(
    activeGameState.boards[3].grid,
    PlayerColor.BLACK,
    true,
  );
  // active direction must be the same as passive direction
  expect(gameEngine(activeGameState, action)).toStrictEqual(errorGameState);

  action = {
    type: ActionType.MOVESTONE,
    boardId: 1,
    color: PlayerColor.BLACK,
    origin: [2, 0],
    destination: [2, 1],
  };

  stone = activeGrid[0][1];
  activeGrid[2][1] = stone;

  gameState.boards[1].grid = structuredClone(passiveGrid);
  gameState.boards[0].grid = structuredClone(activeGrid);

  activeGameState = gameEngine(gameState, action);

  action = {
    type: ActionType.MOVESTONE,
    boardId: 0,
    color: PlayerColor.BLACK,
    origin: [2, 0],
    destination: [2, 1],
  };

  errorGameState = {
    ...activeGameState,
    boardMessage: BoardMessage.MOVESAMECOLORBLOCKING,
  };

  // can't push your own stone
  expect(gameEngine(activeGameState, action)).toStrictEqual(errorGameState);

  stone = activeGrid[2][1];
  activeGrid[0][1] = stone;
  stone = activeGrid[0][2];
  activeGrid[2][1] = stone;
  stone = activeGrid[2][3];
  activeGrid[2][2] = stone;
  activeGrid[2][3] = null;

  activeGrid = setCanMove(activeGrid, PlayerColor.BLACK, true);

  activeGameState.boards[0].grid = structuredClone(activeGrid);

  action = {
    type: ActionType.MOVESTONE,
    boardId: 0,
    color: PlayerColor.BLACK,
    origin: [2, 0],
    destination: [2, 1],
  };

  errorGameState = {
    ...activeGameState,
    boardMessage: BoardMessage.MOVETWOSTONESBLOCKING,
  };

  // can't push 2 stones in a row
  expect(gameEngine(activeGameState, action)).toStrictEqual(errorGameState);
});

test("gameEngine handles cant moves", () => {
  gameState = structuredClone(initialGameState);

  let action = {
    type: ActionType.CANTMOVE,
    boardId: 2,
    color: PlayerColor.WHITE,
  } as CantMoveAction;

  // handles not your turn
  expect(gameEngine(gameState, action)).toStrictEqual({
    ...gameState,
    boardMessage: BoardMessage.MOVENOTYOURTURN,
  });

  action = {
    type: ActionType.CANTMOVE,
    boardId: 2,
    color: PlayerColor.BLACK,
  };

  // handles playing outside home area
  expect(gameEngine(gameState, action)).toStrictEqual({
    ...gameState,
    boardMessage: BoardMessage.MOVENOTINHOMEAREA,
  });

  const newGrid = structuredClone(gameState.boards[1].grid);

  const stone = newGrid[0][0]!;
  newGrid[1][1] = stone;
  newGrid[0][0] = null;

  moves = [
    {
      player: 0,
      firstMove: {
        boardId: 1,
        origin: [0, 0],
        destination: [1, 1],
        isPush: false,
      },
    },
  ];

  gameState.boards[1].grid = structuredClone(newGrid);
  gameState.moves = structuredClone(moves);

  action = {
    type: ActionType.CANTMOVE,
    boardId: 1,
    color: PlayerColor.BLACK,
  };

  // handles undoing the passive move with the wrong stone
  expect(gameEngine(gameState, action)).toStrictEqual({
    ...gameState,
    boardMessage: BoardMessage.MOVEUNDOWRONGSTONE,
  });

  action = {
    type: ActionType.CANTMOVE,
    boardId: 2,
    color: PlayerColor.BLACK,
  };

  // handles active move on the wrong board shade
  expect(gameEngine(gameState, action)).toStrictEqual({
    ...gameState,
    boardMessage: BoardMessage.MOVEWRONGSHADEBOARD,
  });
});

console.log(fullPrint({ hi: "all done now" }));

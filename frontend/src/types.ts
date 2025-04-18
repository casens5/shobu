import { RefObject } from "react";

export type BoardCoordinates = [Coord, Coord];
export type StoneId = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
export type StoneObject = {
  id: StoneId;
  color: PlayerColor;
  canMove: boolean;
};
export type Coord = 0 | 1 | 2 | 3;
export type GridType = [
  [
    StoneObject | null,
    StoneObject | null,
    StoneObject | null,
    StoneObject | null,
  ],
  [
    StoneObject | null,
    StoneObject | null,
    StoneObject | null,
    StoneObject | null,
  ],
  [
    StoneObject | null,
    StoneObject | null,
    StoneObject | null,
    StoneObject | null,
  ],
  [
    StoneObject | null,
    StoneObject | null,
    StoneObject | null,
    StoneObject | null,
  ],
];
export type BoardType = {
  id: BoardId;
  ref: RefObject<BoardRef | null>;
  boardColor: BoardColor;
  playerTurn: PlayerColor;
  playerHome: PlayerColor;
  restrictedMove: MoveType | null;
  moveCondition: MoveCondition;
};
export interface BoardRef {
  clearLastMove: (playerColor: "white" | "black") => void;
}
export type LastMoveType = {
  from: BoardCoordinates | [null, null];
  to: BoardCoordinates | [null, null];
  isPush: boolean;
};
export type PlayerColor = "black" | "white";
export type BoardColor = "dark" | "light";
export type BoardId = 0 | 1 | 2 | 3;
export enum Direction {
  N,
  NE,
  E,
  SE,
  S,
  SW,
  W,
  NW,
}
export type Length = 1 | 2;
export type MoveRecord = {
  playerColor: PlayerColor;
  firstMove: {
    boardId: BoardId;
    direction: Direction;
    length: Length;
    stoneId: StoneId;
  };
  secondMove?: {
    boardId: BoardId;
    direction: Direction;
    length: Length;
    stoneId: StoneId;
  };
};
export type MoveType = { direction: Direction; length: Length };
export enum MoveCondition {
  ISACTIVE,
  ISPASSIVE,
  GAMEOVER,
  NOTINHOMEBOARD,
  WRONGCOLOR,
  CHANGEPASSIVE,
}
export type NewMove = {
  boardId: BoardId;
  direction: Direction | null;
  length: Length | null;
  stoneId: StoneId | null;
};

export enum BoardMessage {
  WINBLACK,
  WINWHITE,
  MOVETOOLONG,
  MOVEOUTOFBOUNDS,
  MOVEKNIGHT,
  MOVESAMECOLORBLOCKING,
  MOVETWOSTONESBLOCKING,
  MOVEUNEQUALTOPASSIVEMOVE,
  MOVECLEARERROR,
  MOVEPASSIVECANTPUSH,
  MOVENOTINHOMEAREA,
  MOVEWRONGCOLOR,
}

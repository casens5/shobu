export type BoardCoordinates = [0 | 1 | 2 | 3, 0 | 1 | 2 | 3];
export type StoneId = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
export type StoneObject = {
  id: StoneId;
  color: PlayerColor;
  canMove: boolean;
};
export type Coord = 0 | 1 | 2 | 3;
export type BoardType = [
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
export type LastMoveType = {
  from: [Coord | null, Coord | null];
  to: [Coord | null, Coord | null];
  push: [Coord | null, Coord | null];
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
export type MoveType = [
  PlayerColor,
  {
    boardId: BoardId;
    direction: Direction;
    length: Length;
  },
  {
    boardId: BoardId;
    direction: Direction;
    length: Length;
  }?,
][];

export type Coordinate =
  | 0
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15;
export type Cart = 0 | 1 | 2 | 3;
export type Cartesians = [Cart, Cart];
export type StoneId = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
export type StoneObject = {
  id: StoneId;
  color: PlayerColor;
  canMove: boolean;
};
export type GridType = [
  StoneObject | null,
  StoneObject | null,
  StoneObject | null,
  StoneObject | null,
  StoneObject | null,
  StoneObject | null,
  StoneObject | null,
  StoneObject | null,
  StoneObject | null,
  StoneObject | null,
  StoneObject | null,
  StoneObject | null,
  StoneObject | null,
  StoneObject | null,
  StoneObject | null,
  StoneObject | null,
];
export type BoardType = {
  id: BoardId;
  boardShade: BoardShade;
  playerHome: PlayerColor;
  grid: GridType;
  lastMoves: LastMovesStoreType;
};
export type BoardsType = [BoardType, BoardType, BoardType, BoardType];
export type GameStateType = {
  boards: BoardsType;
  moves: MoveRecord[];
  playerTurn: PlayerColor;
  winner: GameWinnerType | null;
  boardMessage: BoardMessage | null;
};
export type GameWinnerType = PlayerColor | "DRAW";
export type LastMovesStoreType = [LastMoveType | null, LastMoveType | null];
export type LastMoveType = {
  origin: Coordinate;
  destination: Coordinate;
  isPush: boolean;
};
export enum PlayerColor {
  BLACK,
  WHITE,
}
export enum BoardShade {
  DARK,
  LIGHT,
}
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
  passiveMove: MoveType;
  activeMove?: MoveType;
};
export type MoveType = {
  boardId: BoardId;
  isPush: boolean;
  origin: Coordinate;
  destination: Coordinate;
};
export enum MoveCondition {
  ISACTIVE,
  ISPASSIVE,
  GAMEOVER,
  NOTINHOMEBOARD,
  WRONGCOLOR,
  CHANGEPASSIVE,
}
export type GameEngineAction =
  | MoveStoneAction
  | CantMoveAction
  | InitializeGameAction
  | DisplayErrorAction
  | DrawAction
  | ConcedeAction;

export type MoveStoneAction = {
  type: ActionType.MOVESTONE;
  boardId: BoardId;
  color: PlayerColor;
  origin: Coordinate;
  destination: Coordinate;
};

export type CantMoveAction = {
  type: ActionType.CANTMOVE;
  boardId: BoardId;
  color: PlayerColor;
};

export type InitializeGameAction = {
  type: ActionType.INITIALIZEGAME;
};

export type DisplayErrorAction = {
  type: ActionType.DISPLAYERROR;
  color: PlayerColor;
  boardMessage: BoardMessage;
};

export type DrawAction = {
  type: ActionType.DRAW;
  color: PlayerColor;
};

export type ConcedeAction = {
  type: ActionType.CONCEDE;
  color: PlayerColor;
};

export enum ActionType {
  MOVESTONE,
  CANTMOVE,
  INITIALIZEGAME,
  DISPLAYERROR,
  DRAW,
  CONCEDE,
}

// filler
// so that BoardMessage indexes line up with line numbers

export enum BoardMessage {
  MOVETOOLONG,
  MOVEOUTOFBOUNDS,
  MOVEKNIGHT,
  MOVESAMECOLORBLOCKING,
  MOVETWOSTONESBLOCKING,
  MOVEUNEQUALTOPASSIVEMOVE,
  MOVECLEARERROR,
  MOVEPASSIVECANTPUSH,
  MOVENOTINHOMEAREA,
  MOVEWRONGSHADEBOARD,
  MOVENOTYOURTURN,
  MOVENOTYOURPIECE,
  MOVEUNDOWRONGDESTINATION,
  MOVEUNDOWRONGSTONE,
  MOVEILLEGAL,
}

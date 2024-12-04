"use client";

import clsx from "clsx";
import "./board.css";
import Stone from "./stone";
import {
  PlayerColor,
  BoardColor,
  BoardId,
  Length,
  Direction,
  Coord,
  BoardType,
  LastMoveType,
  StoneId,
  StoneObject,
} from "./types";
import React, {
  useImperativeHandle,
  forwardRef,
  useState,
  useEffect,
  useRef,
} from "react";

function getMoveLength(
  oldCoords: [Coord, Coord],
  newCoords: [Coord, Coord],
): number {
  return Math.max(
    Math.abs(oldCoords[0] - newCoords[0]),
    Math.abs(oldCoords[1] - newCoords[1]),
  );
}

function getDirection(
  oldCoords: [Coord, Coord],
  newCoords: [Coord, Coord],
): Direction {
  // north/south movement
  if (oldCoords[0] === newCoords[0]) {
    if (oldCoords[1] > newCoords[1]) {
      return Direction.N;
    } else {
      return Direction.S;
    }
  }
  // east/west movement
  if (oldCoords[1] === newCoords[1]) {
    if (oldCoords[0] < newCoords[0]) {
      return Direction.E;
    } else {
      return Direction.W;
    }
  }
  // diagonal
  if (oldCoords[0] < newCoords[0] && oldCoords[1] > newCoords[1]) {
    return Direction.NE;
  } else if (oldCoords[0] < newCoords[0] && oldCoords[1] < newCoords[1]) {
    return Direction.SE;
  } else if (oldCoords[0] > newCoords[0] && oldCoords[1] > newCoords[1]) {
    return Direction.NW;
  } else if (oldCoords[0] > newCoords[0] && oldCoords[1] < newCoords[1]) {
    return Direction.SW;
  }

  console.error("invalid direction: ${oldCoords}, ${newCoords}");
  return Direction.N;
}

type CellProps = {
  cell: StoneObject | null;
  row: Coord;
  col: Coord;
  handleMoveStoneAction: (id: StoneId, newPosition: [number, number]) => void;
  className?: string;
};

export function Cell({
  cell,
  row,
  col,
  handleMoveStoneAction,
  className,
}: CellProps) {
  const cellRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    const updateWidth = () => {
      if (cellRef.current) {
        const width = cellRef.current.getBoundingClientRect().width;
        setContainerWidth(width);
      }
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);

    return () => {
      window.removeEventListener("resize", updateWidth);
    };
  }, []);

  return (
    <div
      key={4 * row + col}
      ref={cellRef}
      className={clsx(
        "box-border aspect-square h-auto w-full touch-none border-black",
        className,
      )}
      style={{
        gridColumn: col + 1,
        gridRow: row + 1,
      }}
    >
      {cell && (
        <Stone
          id={cell.id}
          color={cell.color}
          canMove={cell.canMove}
          containerWidth={containerWidth}
          handleMoveStoneAction={handleMoveStoneAction}
        />
      )}
    </div>
  );
}

type BoardProps = {
  id: BoardId;
  boardColor: BoardColor;
  playerTurn: PlayerColor;
  playerHome: PlayerColor;
  canPlay: boolean;
  onMove: (boardId: BoardId, direction: Direction, length: Length) => void;
  allowedMove: { direction: Direction; length: Length };
};

const Board = forwardRef((props: BoardProps, ref) => {
  const { id, boardColor, playerTurn, canPlay, onMove } = props;

  const [board, setBoard] = useState<BoardType>([
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
  ]);

  useEffect(() => {
    // @ts-expect-error typescript is the actual worst
    setBoard((prevBoard) =>
      prevBoard.map((row) =>
        row.map((cell) => {
          if (cell === null) return null;
          return {
            ...cell,
            canMove: canPlay && cell.color === playerTurn,
          };
        }),
      ),
    );
  }, [playerTurn, canPlay]);

  // record the last player's moves
  const [lastMoveWhite, setLastMoveWhite] = useState<LastMoveType>({
    from: [null, null],
    to: [null, null],
    push: [null, null],
  });
  const [lastMoveBlack, setLastMoveBlack] = useState<LastMoveType>({
    from: [null, null],
    to: [null, null],
    push: [null, null],
  });

  function getMoveColor(rowIndex: Coord, colIndex: Coord) {
    if (
      (lastMoveWhite.from[0] === colIndex &&
        lastMoveWhite.from[1] === rowIndex) ||
      (lastMoveBlack.from[0] === colIndex && lastMoveBlack.from[1] === rowIndex)
    ) {
      return "dark-transparent";
    }
    if (
      (lastMoveWhite.to[0] === colIndex && lastMoveWhite.to[1] === rowIndex) ||
      (lastMoveBlack.to[0] === colIndex && lastMoveBlack.to[1] === rowIndex)
    ) {
      return "dark-transparent";
    }
    if (
      (lastMoveWhite.push[0] === colIndex &&
        lastMoveWhite.push[0] === rowIndex) ||
      (lastMoveBlack.push[0] === colIndex && lastMoveBlack.push[0] === rowIndex)
    ) {
      return "red-transparent";
    }
    return "";
  }

  // clear the last move via function passed to the parent game
  function clearLastMove(playerColor: PlayerColor) {
    if (playerColor === "white") {
      setLastMoveWhite({
        from: [null, null],
        to: [null, null],
        push: [null, null],
      });
    } else {
      setLastMoveBlack({
        from: [null, null],
        to: [null, null],
        push: [null, null],
      });
    }
  }

  useImperativeHandle(ref, () => ({
    clearLastMove,
  }));

  // handle board resizing
  const boardRef = useRef<HTMLDivElement>(null);
  const [boardDimensions, setBoardDimensions] = useState({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  });

  function updateBoardDimensions() {
    if (boardRef.current) {
      const rect = boardRef.current.getBoundingClientRect();
      setBoardDimensions({
        top: rect.top,
        bottom: rect.bottom,
        left: rect.left,
        right: rect.right,
      });
    }
  }

  useEffect(() => {
    updateBoardDimensions();
    window.addEventListener("resize", updateBoardDimensions);

    return () => {
      window.removeEventListener("resize", updateBoardDimensions);
    };
  }, []);

  function isMoveLegal(
    oldCoords: [Coord, Coord],
    newCoords: [Coord, Coord],
    length: number,
  ): boolean {
    if (length < 1 || length > 2) {
      return false;
    }
    const xMove = Math.abs(oldCoords[0] - newCoords[0]);
    const yMove = Math.abs(oldCoords[1] - newCoords[1]);
    if (
      !(xMove === 0 || xMove === length) ||
      !(yMove === 0 || yMove === length)
    ) {
      return false;
    }
    return true;
  }

  const handleMoveStoneAction = (
    stoneId: StoneId,
    newPosition: [number, number],
  ) => {
    const newCoords = [
      Math.floor(
        (4 * (newPosition[0] - boardDimensions.left)) /
          (boardDimensions.right - boardDimensions.left),
      ),
      Math.floor(
        (4 * (newPosition[1] - boardDimensions.top)) /
          (boardDimensions.bottom - boardDimensions.top),
      ),
    ] as [Coord, Coord];
    if (
      newCoords[0] > 3 ||
      newCoords[0] < 0 ||
      newCoords[1] > 3 ||
      newCoords[1] < 0
    ) {
      return; // exit; move is out of bounds
    }

    // get previous stone coordinates and color by its id
    let oldCoords = null;
    let stoneColor = null;
    for (let colIndex = 0; colIndex < board.length; colIndex++) {
      for (let rowIndex = 0; rowIndex < board[colIndex].length; rowIndex++) {
        if (board[colIndex][rowIndex]?.id === stoneId) {
          oldCoords = [colIndex, rowIndex] as [Coord, Coord];
          stoneColor = board[colIndex][rowIndex]!.color;
          break;
        }
      }
      if (oldCoords) break;
    }

    if (!oldCoords) return; // Exit if stone not found

    // moved to the starting place.  de-select.
    if (oldCoords === newCoords) {
      if (stoneColor === "white") {
        setLastMoveWhite({
          from: [null, null],
          to: [null, null],
          push: [null, null],
        });
      } else {
        setLastMoveBlack({
          from: [null, null],
          to: [null, null],
          push: [null, null],
        });
      }
      return;
    }

    if (
      !isMoveLegal(oldCoords, newCoords, getMoveLength(oldCoords, newCoords))
    ) {
      return null;
    }

    if (stoneColor === "white") {
      setLastMoveWhite({
        from: oldCoords,
        to: newCoords,
        push: [null, null],
      });
    } else {
      setLastMoveBlack({
        from: oldCoords,
        to: newCoords,
        push: [null, null],
      });
    }

    const stone = { ...board[oldCoords[0]][oldCoords[1]] };

    const newBoard = [...board];
    newBoard[oldCoords[0]][oldCoords[1]] = null;
    // @ts-expect-error typescript is bad and ugly
    newBoard[newCoords[0]][newCoords[1]] = stone;
    // @ts-expect-error typescript is bad and ugly
    setBoard(newBoard);

    const direction = getDirection(oldCoords, newCoords);
    const length = getMoveLength(oldCoords, newCoords) as Length;
    console.log("baba", direction, length);

    onMove(id, direction!, length);
  };

  return (
    <div
      ref={boardRef}
      className={clsx(
        "grid aspect-square h-auto w-full touch-none grid-cols-4 rounded-2xl",
        {
          "board-dark": boardColor === "dark",
          "board-light": boardColor === "light",
        },
      )}
    >
      {/* @ts-expect-error typescript is bad and ugly */}
      {board.map((col, colIndex: Coord) => {
        // the padding is a weird hack that fixes the spacing for the top
        // right corner of the board
        const rightBorder =
          colIndex !== 3 ? "border-r sm:border-r-2" : "pr-px sm:pr-0.5";

        // @ts-expect-error onetuhnoethunht
        return col.map((cell, rowIndex: Coord) => {
          const bottomBorder = rowIndex !== 3 ? "border-b sm:border-b-2" : "";
          const moveColor = getMoveColor(rowIndex, colIndex);

          return (
            <Cell
              key={4 * rowIndex + colIndex}
              row={rowIndex}
              col={colIndex}
              cell={cell}
              handleMoveStoneAction={handleMoveStoneAction}
              className={`${rightBorder} ${bottomBorder} ${moveColor}`}
            />
          );
        });
      })}
    </div>
  );
});

Board.displayName = "Board";
export default Board;

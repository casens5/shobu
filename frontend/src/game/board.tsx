import clsx from "clsx";
import "./board.css";
import Stone from "./stone";
import {
  PlayerColor,
  BoardColor,
  BoardId,
  CoordinateId,
  Coord,
  GridType,
  LastMoveType,
  StoneId,
  StoneObject,
  BoardMessage,
  BoardCoordinates,
} from "../types";
import { useState, useEffect, useRef } from "react";

export function coordinateToId(coords: BoardCoordinates): CoordinateId {
  return (4 * coords[0] + coords[1]) as CoordinateId;
}

/*
function isStoneMovable(
  coords: BoardCoordinates,
  moveCondition: MoveCondition,
  restricted: MoveType | null
): boolean {
  if (
    moveCondition === MoveCondition.WRONGCOLOR ||
    moveCondition === MoveCondition.NOTINHOMEBOARD ||
    moveCondition === MoveCondition.GAMEOVER
  ) {
    return false;
  }
  if (moveCondition === MoveCondition.CHANGEPASSIVE) {
    return coordinateToId(coords) === coordinateToId(restricted!.destination);
  }

  return true;
}
*/

type CellProps = {
  cell: StoneObject | null;
  row: Coord;
  col: Coord;
  onMouseDownAction: () => void;
  handleStoneMove: (id: StoneId, newPosition: [number, number]) => void;
  className?: string;
};

function Cell({
  cell,
  row,
  col,
  onMouseDownAction,
  handleStoneMove,
  className,
}: CellProps) {
  const cellRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    function updateWidth() {
      if (cellRef.current) {
        const width = cellRef.current.getBoundingClientRect().width;
        setContainerWidth(width);
      }
    }

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
      onMouseDown={onMouseDownAction}
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
          handleStoneMove={handleStoneMove}
        />
      )}
    </div>
  );
}

type BoardProps = {
  id: BoardId;
  boardColor: BoardColor;
  grid: GridType;
  dispatch: any;
};

export default function Board({
  id,
  boardColor,
  grid,
  dispatch,
}: BoardProps) {
  // record the last player's moves
  const [lastMoveWhite, setLastMoveWhite] = useState<LastMoveType>({
    from: [null, null],
    to: [null, null],
    isPush: false,
  });
  const [lastMoveBlack, setLastMoveBlack] = useState<LastMoveType>({
    from: [null, null],
    to: [null, null],
    isPush: false,
  });

  function getMoveColor(rowIndex: Coord, colIndex: Coord): string {
    if (
      (lastMoveWhite.from[0] === colIndex &&
        lastMoveWhite.from[1] === rowIndex) ||
      (lastMoveBlack.from[0] === colIndex && lastMoveBlack.from[1] === rowIndex)
    ) {
      return "dark-transparent";
    }
    if (
      (lastMoveWhite.isPush &&
        lastMoveWhite.to[0] === colIndex &&
        lastMoveWhite.to[1] === rowIndex) ||
      (lastMoveBlack.isPush &&
        lastMoveBlack.to[0] === colIndex &&
        lastMoveBlack.to[1] === rowIndex)
    ) {
      return "red-transparent";
    }
    if (
      (lastMoveWhite.to[0] === colIndex && lastMoveWhite.to[1] === rowIndex) ||
      (lastMoveBlack.to[0] === colIndex && lastMoveBlack.to[1] === rowIndex)
    ) {
      return "dark-transparent";
    }
    return "";
  }

  function clearLastMove(playerColor: PlayerColor) {
    if (playerColor === "white") {
      setLastMoveWhite({
        from: [null, null],
        to: [null, null],
        isPush: false,
      });
    } else {
      setLastMoveBlack({
        from: [null, null],
        to: [null, null],
        isPush: false,
      });
    }
  }
  if (id > 10) {
    clearLastMove("white");
  }

  // handle board resizing
  const boardRef = useRef<HTMLDivElement>(null);
  const [boardDimensions, setBoardDimensions] = useState({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  });

  function handleStoneMove(stoneId: StoneId, newPosition: [number, number]) {
    const destination = [
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
      destination[0] > 3 ||
      destination[0] < 0 ||
      destination[1] > 3 ||
      destination[1] < 0
    ) {
      dispatch({
        type: "displayError",
        boardId: id,
        boardMessage: BoardMessage.MOVEOUTOFBOUNDS,
      });
      return null; // exit; move is out of bounds
    }

    // get previous stone coordinates by its id
    let origin = null;
    for (let colIndex = 0; colIndex < grid.length; colIndex++) {
      for (let rowIndex = 0; rowIndex < grid[colIndex].length; rowIndex++) {
        if (grid[colIndex][rowIndex]?.id === stoneId) {
          const origin = [colIndex, rowIndex] as BoardCoordinates;
          const color = grid[colIndex][rowIndex]?.color as PlayerColor;
          break;
        }
      }
      if (origin) break;
    }

    if (origin == null) {
      console.error("could not get coordinates from stone id");
      return null;
    }
    dispatch({
      type: "moveStone",
      boardId: id,
      color: color!,
      origin: origin as BoardCoordinates,
      destination: destination,
    });
  }

  /*
  function playMove(oldCoords: BoardCoordinates, newCoords: BoardCoordinates) {
    onMessage(BoardMessage.MOVECLEARERROR);

    const newBoard = board.map((row) => [...row]) as GridType;
    let stone = newBoard[oldCoords[0]][oldCoords[1]];
    if (stone == null) {
      console.error(`no stone exists: ${oldCoords}`);
      return null;
    }

    // moved to the starting place; undo
    if (
      restrictedMove &&
      moveCondition === MoveCondition.CHANGEPASSIVE &&
      coordinateToId(restrictedMove.origin) === coordinateToId(newCoords) &&
      coordinateToId(restrictedMove.destination) === coordinateToId(oldCoords)
    ) {
      newBoard[oldCoords[0]][oldCoords[1]] = null;
      newBoard[newCoords[0]][newCoords[1]] = stone;
      clearLastMove(stone.color);
      setBoard(newBoard);
      onMove({
        type: "undo",
        boardId: id,
      });
      return null;
    }

    const direction = getMoveDirection(oldCoords, newCoords);
    const length = getMoveLength(oldCoords, newCoords);

    const moveLength = length as Length;

    if (
      moveCondition === MoveCondition.ISACTIVE &&
      restrictedMove != null &&
      (restrictedMove.direction !== direction ||
        restrictedMove.length !== moveLength)
    ) {
      onMessage(BoardMessage.MOVEUNEQUALTOPASSIVEMOVE);
      return null;
    }

    const betweenCoords =
      moveLength === 2
        ? ([
            oldCoords[0] + (newCoords[0] - oldCoords[0]) / 2,
            oldCoords[1] + (newCoords[1] - oldCoords[1]) / 2,
          ] as [Coord, Coord])
        : undefined;
    const nextX = newCoords[0] + (newCoords[0] - oldCoords[0]) / moveLength;
    const nextY = newCoords[1] + (newCoords[1] - oldCoords[1]) / moveLength;
    const nextCoords =
      nextX >= 0 && nextX <= 3 && nextY >= 0 && nextY <= 3
        ? ([nextX, nextY] as [Coord, Coord])
        : undefined;

    const destinationSquare = board[newCoords[0]][newCoords[1]];
    const pushDestination = nextCoords
      ? board[nextCoords[0]][nextCoords[1]]
      : null;
    const intermediarySquare = betweenCoords
      ? board[betweenCoords[0]][betweenCoords[1]]
      : null;

    const moveLegalMessage = isMoveLegal(
      oldCoords,
      newCoords,
      moveLength,
      playerTurn,
      destinationSquare,
      pushDestination,
      intermediarySquare,
    );
    if (moveLegalMessage !== "LEGAL") {
      onMessage(moveLegalMessage);
      return null;
    }

    const isPush = destinationSquare || intermediarySquare;

    if (isPush) {
      // can't push if this is the passive move
      if (moveCondition == MoveCondition.ISPASSIVE) {
        onMessage(BoardMessage.MOVEPASSIVECANTPUSH);
        return null;
      }

      const pushedStone = destinationSquare
        ? ({
            ...destinationSquare,
          } as StoneObject)
        : ({
            ...intermediarySquare,
          } as StoneObject);
      if (nextCoords) {
        newBoard[nextCoords[0]][nextCoords[1]] = pushedStone;
      }

      if (intermediarySquare) {
        newBoard[betweenCoords![0]][betweenCoords![1]] = null;
      }

      if (playerTurn === "white") {
        setLastMoveWhite((prev) => ({
          ...prev,
          isPush: true,
        }));
      } else {
        setLastMoveBlack((prev) => ({
          ...prev,
          isPush: true,
        }));
      }
    }

    // move is successful
    if (playerTurn === "white") {
      setLastMoveWhite((prev) => ({
        ...prev,
        from: oldCoords,
        to: newCoords,
      }));
    } else {
      setLastMoveBlack((prev) => ({
        ...prev,
        from: oldCoords,
        to: newCoords,
      }));
    }

    newBoard[oldCoords[0]][oldCoords[1]] = null;
    newBoard[newCoords[0]][newCoords[1]] = stone;
    setBoard(newBoard);

    onMove({
      type: "move",
      boardId: id,
      direction: direction,
      length: moveLength,
      stoneId: stone.id,
      origin: oldCoords,
      destination: newCoords,
    });
  } */

  function showError() {
    /*
    if (moveCondition === MoveCondition.NOTINHOMEBOARD) {
      onMessage(BoardMessage.MOVENOTINHOMEAREA);
    }
    if (moveCondition === MoveCondition.WRONGCOLOR) {
      onMessage(BoardMessage.MOVEWRONGCOLOR);
    }
    */
  }

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
      {grid.map((col, colIndex) => {
        // the padding is a weird hack that fixes the spacing for the top
        // right corner of the board
        const rightBorder =
          colIndex !== 3 ? "border-r sm:border-r-2" : "pr-px sm:pr-0.5";

        return col.map((cell, rowIndex) => {
          const x = rowIndex as Coord;
          const y = colIndex as Coord;
          const bottomBorder = x !== 3 ? "border-b sm:border-b-2" : "";
          const moveColor = getMoveColor(x, y);
          // makes the transparecy effect on LastMove squares not look weird
          // on the corners
          const cornerBorderDict: { [key: number]: string } = {
            0: "rounded-tl-2xl",
            3: "rounded-tr-2xl",
            12: "rounded-bl-2xl",
            15: "rounded-br-2xl",
          };
          const cornerBorder = cornerBorderDict[coordinateToId([x, y])] || "";
          const canMove = true;
          /*
            cell != null &&
            playerTurn === cell.color &&
            isStoneMovable([x, y], moveCondition, restrictedMove);
            */

          return (
            <Cell
              key={4 * x + y}
              row={x}
              col={y}
              cell={cell && { ...cell, canMove }}
              handleStoneMove={handleStoneMove}
              className={`${rightBorder} ${bottomBorder} ${cornerBorder} ${moveColor}`}
              onMouseDownAction={showError}
            />
          );
        });
      })}
      {/*<div onClick={() => console.log("test baba")}>baba</div>*/}
    </div>
  );
}

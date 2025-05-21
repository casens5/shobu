import clsx from "clsx";
import "./board.css";
import Stone from "./stone";
import {
  PlayerColor,
  BoardId,
  CoordinateId,
  Coord,
  GridType,
  StoneId,
  StoneObject,
  BoardMessage,
  BoardCoordinates,
  ActionType,
  BoardShade,
} from "../types";
import { useState, useEffect, useRef } from "react";

export function coordinateToId(coords: BoardCoordinates): CoordinateId {
  return (4 * coords[0] + coords[1]) as CoordinateId;
}

type CellProps = {
  cell: StoneObject | null;
  row: Coord;
  col: Coord;
  onMouseDownAction: () => void;
  handleStoneMove: (
    id: StoneId,
    color: PlayerColor,
    newPosition: [number, number],
  ) => void;
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
  boardShade: BoardShade;
  grid: GridType;
  dispatch: any;
};

export default function Board({ id, boardShade, grid, dispatch }: BoardProps) {
  // handle board resizing
  const boardRef = useRef<HTMLDivElement>(null);
  const [boardDimensions, setBoardDimensions] = useState({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  });

  function handleStoneMove(
    stoneId: StoneId,
    color: PlayerColor,
    newPosition: [number, number],
  ) {
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
        type: ActionType.DISPLAYERROR,
        playerColor: color,
        boardMessage: BoardMessage.MOVEOUTOFBOUNDS,
      });
      return null; // exit; move is out of bounds
    }

    // get previous stone coordinates by its id
    let origin = null;
    for (let colIndex = 0; colIndex < grid.length; colIndex++) {
      for (let rowIndex = 0; rowIndex < grid[colIndex].length; rowIndex++) {
        if (grid[colIndex][rowIndex]?.id === stoneId) {
          origin = [colIndex, rowIndex] as BoardCoordinates;
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
      type: ActionType.MOVESTONE,
      boardId: id,
      color: color,
      origin: origin as BoardCoordinates,
      destination: destination,
    });
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
          "board-dark": boardShade === BoardShade.DARK,
          "board-light": boardShade === BoardShade.LIGHT,
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
          const moveColor = ""; //getMoveColor(x, y);
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
              onMouseDownAction={() => {
                dispatch({
                  type: ActionType.DISPLAYERROR,
                  color: cell?.color,
                  boardMessage: BoardMessage.MOVECLEARERROR,
                });
              }}
            />
          );
        });
      })}
      {/*<div onClick={() => console.log("test baba")}>baba</div>*/}
    </div>
  );
}

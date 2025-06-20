import clsx from "clsx";
import "./board.css";
import Stone from "./stone";
import {
  PlayerColor,
  BoardId,
  Coordinate,
  GridType,
  StoneId,
  StoneObject,
  BoardMessage,
  ActionType,
  BoardShade,
  LastMoveType,
  Cartesians,
} from "../types";
import { useState, useEffect, useRef } from "react";
import { cartesianToCoordinate, coordinateToCartesian } from "./gameEngine";

type CellProps = {
  cell: StoneObject | null;
  boardId: BoardId;
  coord: Coordinate;
  handleStoneMove: (
    id: StoneId,
    color: PlayerColor,
    newPosition: [number, number],
  ) => void;
  dispatch: any;
  className?: string;
};

function Cell({
  cell,
  boardId,
  coord,
  handleStoneMove,
  dispatch,
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
  const [col, row] = coordinateToCartesian(coord);

  return (
    <div
      key={coord}
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
          boardId={boardId}
          color={cell.color}
          canMove={cell.canMove}
          containerWidth={containerWidth}
          handleStoneMove={handleStoneMove}
          dispatch={dispatch}
        />
      )}
    </div>
  );
}

type BoardProps = {
  id: BoardId;
  boardShade: BoardShade;
  grid: GridType;
  lastMoves: [LastMoveType | null, LastMoveType | null];
  dispatch: any;
};

export default function Board({
  id,
  boardShade,
  grid,
  lastMoves,
  dispatch,
}: BoardProps) {
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
    ] as [number, number];
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
      return null;
    }

    // get previous stone coordinates by its id
    let origin = null;
    for (let coord = 0; coord < 16; coord++) {
      if (grid[coord]?.id === stoneId) {
        origin = coord as Coordinate;
        break;
      }
    }

    if (origin == null) {
      console.error("could not get coordinates from stone id");
      return null;
    }
    dispatch({
      type: ActionType.MOVESTONE,
      boardId: id,
      color: color,
      origin: origin,
      destination: cartesianToCoordinate(destination as Cartesians),
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

  function getCellColor(coord: Coordinate) {
    if (lastMoves[0] == null && lastMoves[1] == null) {
      return null;
    }

    for (const lastMove of lastMoves) {
      if (lastMove && lastMove.origin === coord) {
        return "dark-transparent";
      }

      if (lastMove && lastMove.destination === coord) {
        return lastMove.isPush ? "red-transparent" : "dark-transparent";
      }
    }
    return null;
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
      {grid.map((cell, index) => {
        if (index < 0 || index > 15) {
          throw new Error("grid has illegal number of cells");
        }
        const coord = index as Coordinate;
        const [x, y] = coordinateToCartesian(coord);

        // the padding is a weird hack that fixes the spacing for the top
        // right corner of the board
        const rightBorder =
          x !== 3 ? "border-r sm:border-r-2" : "pr-px sm:pr-0.5";

        const bottomBorder = y !== 3 ? "border-b sm:border-b-2" : "";
        const cellColor = getCellColor(coord);
        // makes the transparecy effect on LastMove squares not look weird
        // on the corners
        const cornerBorderDict: { [key: number]: string } = {
          0: "rounded-tl-2xl",
          3: "rounded-tr-2xl",
          12: "rounded-bl-2xl",
          15: "rounded-br-2xl",
        };
        const cornerBorder = cornerBorderDict[coord] || "";

        return (
          <Cell
            key={coord}
            cell={cell}
            boardId={id}
            coord={coord}
            handleStoneMove={handleStoneMove}
            dispatch={dispatch}
            className={clsx(rightBorder, bottomBorder, cornerBorder, cellColor)}
          />
        );
      })}

      {/*<div
        onClick={() => {
          console.log("oh hi", lastMoves);
        }}
      >
        test
      </div>*/}
    </div>
  );
}

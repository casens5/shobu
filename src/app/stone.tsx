import clsx from "clsx";
import "./stone.css";
import React, {
  MouseEventHandler,
  TouchEventHandler,
  MouseEvent,
  TouchEvent,
  useState,
  useEffect,
  useCallback,
} from "react";
import { PlayerColor } from "./game";

export type BoardCoordinates = [0 | 1 | 2 | 3, 0 | 1 | 2 | 3];
export type StoneId = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type StoneObject = {
  id: StoneId;
  color: PlayerColor;
  canMove: boolean;
};

export type StoneProps = StoneObject & {
  containerWidth: number;
  handleMoveStone: (id: StoneId, newPosition: [number, number]) => void;
};

export default function Stone({
  id,
  color,
  canMove,
  containerWidth,
  handleMoveStone,
}: StoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState([0, 0]);

  const getEventPosition = (e: MouseEvent | TouchEvent): [number, number] => {
    if ("touches" in e) {
      const touch = e.touches[0];
      return [touch.clientX, touch.clientY];
    } else {
      return [e.clientX, e.clientY];
    }
  };

  const handleStart = (
    e: MouseEvent<HTMLDivElement> | TouchEvent<HTMLDivElement>,
  ) => {
    if ("button" in e && e.button !== 0) return;
    if (!canMove) return;

    e.preventDefault();
    setIsDragging(true);
    const position = getEventPosition(e);
    setPosition([
      position[0] - containerWidth / 2,
      position[1] - containerWidth / 2,
    ]);
  };

  const handleEnd = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleMoveStone(id, getEventPosition(e));
    },
    [id, handleMoveStone],
  );

  const handleMove = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!isDragging) return;
      e.preventDefault();
      const position = getEventPosition(e);
      setPosition([
        position[0] - containerWidth / 2,
        position[1] - containerWidth / 2,
      ]);
    },
    [isDragging, containerWidth],
  );

  useEffect(() => {
    if (isDragging) {
      // @ts-expect-error anoetuhn
      window.addEventListener("mousemove", handleMove);
      // @ts-expect-error anoetuhn
      window.addEventListener("mouseup", handleEnd);
      // @ts-expect-error anoetuhn
      window.addEventListener("touchmove", handleMove);
      // @ts-expect-error anoetuhn
      window.addEventListener("touchend", handleEnd);
    }

    return () => {
      // @ts-expect-error anoetuhn
      window.removeEventListener("mousemove", handleMove);
      // @ts-expect-error anoetuhn
      window.removeEventListener("mouseup", handleEnd);
      // @ts-expect-error anoetuhn
      window.removeEventListener("touchmove", handleMove);
      // @ts-expect-error anoetuhn
      window.removeEventListener("touchend", handleEnd);
    };
  }, [isDragging, handleMove, handleEnd]);

  return (
    <div
      className={clsx("aspect-square h-auto w-full touch-none", {
        "absolute cursor-grabbing": isDragging === true,
        "cursor-grab": canMove && isDragging === false,
      })}
      style={{
        left: isDragging ? position[0] : "",
        top: isDragging ? position[1] : "",
        padding: containerWidth / 10,
        maxWidth: containerWidth,
        maxHeight: containerWidth,
      }}
      // we want the (invisible) frame to be clickable, not just the stone
      onMouseDown={handleStart as MouseEventHandler}
      onTouchStart={handleStart as TouchEventHandler}
    >
      <div
        className={clsx(
          "aspect-square h-auto max-h-20 w-full max-w-20 touch-none rounded-full shadow-lg",
          {
            "stone-black": color === "black",
            "stone-white": color === "white",
          },
        )}
      />
    </div>
  );
}

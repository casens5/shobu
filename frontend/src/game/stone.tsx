import clsx from "clsx";
import "./stone.css";
import React, {
  MouseEventHandler,
  TouchEventHandler,
  useState,
  useEffect,
  useCallback,
} from "react";
import { StoneId, StoneObject } from "../types";

type StoneProps = StoneObject & {
  containerWidth: number;
  handleStoneMove: (id: StoneId, newPosition: [number, number]) => void;
};

export default function Stone({
  id,
  color,
  canMove,
  containerWidth,
  handleStoneMove,
}: StoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState([0, 0]);

  function getEventPosition(
    e: globalThis.MouseEvent | globalThis.TouchEvent,
  ): [number, number] {
    if ("touches" in e) {
      const touch = e.touches[0];
      return [touch.clientX, touch.clientY];
    } else {
      return [e.clientX, e.clientY];
    }
  }

  function handleStart(
    e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>,
  ) {
    if ("button" in e && e.button !== 0) return null;
    if (!canMove) return null;

    e.preventDefault();
    setIsDragging(true);
    const position = getEventPosition(e.nativeEvent);
    setPosition([
      position[0] - containerWidth / 2,
      position[1] - containerWidth / 2,
    ]);
  }

  const handleEnd = useCallback(
    (e: globalThis.MouseEvent | globalThis.TouchEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleStoneMove(id, getEventPosition(e));
    },
    [id, handleStoneMove],
  );

  const handleMove = useCallback(
    (e: globalThis.MouseEvent | globalThis.TouchEvent) => {
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
      window.addEventListener("mousemove", handleMove);
      window.addEventListener("mouseup", handleEnd);
      window.addEventListener("touchmove", handleMove);
      window.addEventListener("touchend", handleEnd);
    }

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleEnd);
      window.removeEventListener("touchmove", handleMove);
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

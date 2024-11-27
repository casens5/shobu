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

export type BoardCoordinates = [0 | 1 | 2 | 3, 0 | 1 | 2 | 3];
export type StoneId = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

export enum StoneColor {
  BLACK = "black",
  WHITE = "white",
}

export type StoneObject = {
  id: StoneId;
  color: StoneColor;
};

export type StoneProps = StoneObject & {
  //onMove?: any;
  handleMoveStone: (id: StoneId, newPosition: [number, number]) => void;
};

export default function Stone({ id, color, handleMoveStone }: StoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState([0, 0]);

  const getEventPosition = (e: MouseEvent | TouchEvent): [number, number] => {
    if ("touches" in e) {
      // Touch event
      const touch = e.touches[0];
      return [touch.clientX, touch.clientY];
    } else {
      // Mouse event
      return [e.clientX, e.clientY];
    }
  };

  const handleStart = (
    e: MouseEvent<HTMLDivElement> | TouchEvent<HTMLDivElement>,
  ) => {
    e.preventDefault();
    setIsDragging(true);
    const position = getEventPosition(e);
    setPosition([position[0] - 40, position[1] - 40]);
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
      setPosition([position[0] - 40, position[1] - 40]);
    },
    [isDragging],
  );

  // Attach global listeners during drag
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
    } else {
      // @ts-expect-error anoetuhn
      window.removeEventListener("mousemove", handleMove);
      // @ts-expect-error anoetuhn
      window.removeEventListener("mouseup", handleEnd);
      // @ts-expect-error anoetuhn
      window.removeEventListener("touchmove", handleMove);
      // @ts-expect-error anoetuhn
      window.removeEventListener("touchend", handleEnd);
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
      className={clsx("p-2 w-full h-full touch-none", {
        "cursor-grab absolute": isDragging === true,
        "cursor-grabbing": isDragging === false,
      })}
      style={{
        left: isDragging ? position[0] : "",
        top: isDragging ? position[1] : "",
      }}
      // we want the (invisible) frame to be clickable, not just the stone
      onMouseDown={handleStart as MouseEventHandler}
      onTouchStart={handleStart as TouchEventHandler}
    >
      <div
        className={clsx("w-16 h-16 rounded-full shadow-lg touch-none", {
          "stone-black": color === "black",
          "stone-white": color === "white",
        })}
      />
    </div>
  );
}

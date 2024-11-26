import clsx from "clsx";
import "./stone.css";
import React, { useState, useEffect } from "react";

export type BoardCoordinates = [0 | 1 | 2 | 3, 0 | 1 | 2 | 3];
export type StoneId = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

export enum StoneColor {
  BLACK = "black",
  WHITE = "white",
}

export type StoneProps = {
  id: StoneId;
  color: StoneColor;
  onMove?: any;
  handleMoveStone?: any;
};

export default function Stone({ id, color, handleMoveStone }: StoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState([0, 0]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    setPosition([e.clientX - 50, e.clientY - 50]);
  };

  const handleMouseUp = (e: MouseEvent) => {
    setIsDragging(false);
    handleMoveStone(id, color, [e.clientX, e.clientY]);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      setPosition([e.clientX - 50, e.clientY - 50]);
    }
  };

  // Attach global listeners during drag
  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div
      className={clsx("p-2 w-full h-full", {
        "cursor-grab absolute": isDragging === true,
        "cursor-grabbing": isDragging === false,
      })}
      style={{
        left: isDragging ? position[0] : "",
        top: isDragging ? position[1] : "",
      }}
      // we want the (invisible) frame to be clickable, not just the stone
      onMouseDown={handleMouseDown}
    >
      <div
        className={clsx("w-16 h-16 rounded-full shadow-lg", {
          "stone-black": color === "black",
          "stone-white": color === "white",
        })}
      />
    </div>
  );
}

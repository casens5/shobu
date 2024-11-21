import clsx from "clsx";
import "./stone.css";

export type BoardCoordinates = [0 | 1 | 2 | 3, 0 | 1 | 2 | 3];

export enum StoneColor {
  BLACK = "black",
  WHITE = "white",
}

export type StoneProps = {
  id: number;
  color: StoneColor;
  position: BoardCoordinates;
  onMove?: any;
  dragging?: any;
  setDraggingStone?: any;
};

export default function Stone({
  id,
  color,
  position,
  onMove,
  dragging,
  setDraggingStone,
}: StoneProps) {
  return (
    <div
      className={clsx("w-full h-full rounded-full shadow-lg", {
        "stone-black": color === "black",
        "stone-white": color === "white",
      })}
    />
  );
}

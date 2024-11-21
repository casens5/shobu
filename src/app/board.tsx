"use client";

import clsx from "clsx";
import Stone, { StoneColor, BoardCoordinates, StoneProps } from "./stone";
import React, { ReactNode, useState } from "react";

type CellProps = {
  className?: string;
  position: BoardCoordinates;
  children?: ReactNode;
};

export function Cell({ children, className }: CellProps) {
  return <div className={clsx("p-2 border-black", className)}>{children}</div>;
}

type BoardProps = {
  color: "light" | "dark";
};

export default function Board({ color }: BoardProps) {
  // State to track positions of stones
  const [stones, setStones] = useState<StoneProps[]>([
    { id: 0, color: StoneColor.BLACK, position: [0, 0] },
    { id: 1, color: StoneColor.BLACK, position: [1, 0] },
    { id: 2, color: StoneColor.BLACK, position: [2, 0] },
    { id: 3, color: StoneColor.BLACK, position: [3, 0] },
    { id: 4, color: StoneColor.WHITE, position: [0, 3] },
    { id: 5, color: StoneColor.WHITE, position: [1, 3] },
    { id: 6, color: StoneColor.WHITE, position: [2, 3] },
    { id: 7, color: StoneColor.WHITE, position: [3, 3] },
  ]);

  const [draggingStone, setDraggingStone] = useState(null);

  const handleMoveStone = (id, newPosition) => {
    setStones((prevStones) => ({
      ...prevStones,
      [id]: { ...prevStones[id], position: newPosition },
    }));
  };

  function generateBoard() {
    return Array.from({ length: 16 }).map((_, index) => {
      let classStr = "";
      if (index % 4 !== 3) {
        classStr += "border-r-2 ";
      }
      if (index < 12) {
        classStr += "border-b-2";
      }

      const position = [Math.floor(index / 4), index % 4];

      return (
        <Cell
          key={index}
          position={position as BoardCoordinates}
          className={classStr}
        />
      );
    });
  }

  return (
    <div
      className={clsx("w-80 h-80 rounded-2xl grid grid-cols-4", {
        "bg-yellow-950": color === "dark",
        "bg-yellow-800": color === "light",
      })}
    >
      {generateBoard()}
      {/*
      <Cell className="border-r border-b">
        <Stone
          id={stones[0].id}
          color={stones[0].color}
          position={stones[0].position}
          onMove={handleMoveStone}
          dragging={draggingStone === stones[0].id}
          setDraggingStone={setDraggingStone}
        />
      </Cell>
      <Cell className="border-r border-b">
        <Stone
          id={stones[1].id}
          color={stones[1].color}
          position={stones[1].position}
          onMove={handleMoveStone}
          dragging={draggingStone === stones[1].id}
          setDraggingStone={setDraggingStone}
        />
      </Cell>
      <Cell className="border-r border-b">
        <Stone
          id={stones[2].id}
          color={stones[2].color}
          position={stones[2].position}
          onMove={handleMoveStone}
          dragging={draggingStone === stones[2].id}
          setDraggingStone={setDraggingStone}
        />
      </Cell>
      <Cell className="border-b">
        <Stone
          id={stones[3].id}
          color={stones[3].color}
          position={stones[3].position}
          onMove={handleMoveStone}
          dragging={draggingStone === stones[3].id}
          setDraggingStone={setDraggingStone}
        />
      </Cell>

      <Cell className="border-r border-b" />
      <Cell className="border-r border-b" />
      <Cell className="border-r border-b" />
      <Cell className="border-b" />

      <Cell className="border-r border-b" />
      <Cell className="border-r border-b" />
      <Cell className="border-r border-b" />
      <Cell className="border-b" />

      <Cell className="border-r">
        <Stone
          id={stones[4].id}
          color={stones[4].color}
          position={stones[4].position}
          onMove={handleMoveStone}
          dragging={draggingStone === stones[4].id}
          setDraggingStone={setDraggingStone}
        />
      </Cell>
      <Cell className="border-r">
        <Stone
          id={stones[5].id}
          color={stones[5].color}
          position={stones[5].position}
          onMove={handleMoveStone}
          dragging={draggingStone === stones[5].id}
          setDraggingStone={setDraggingStone}
        />
      </Cell>
      <Cell className="border-r">
        <Stone
          id={stones[6].id}
          color={stones[6].color}
          position={stones[6].position}
          onMove={handleMoveStone}
          dragging={draggingStone === stones[6].id}
          setDraggingStone={setDraggingStone}
        />
      </Cell>
      <Cell>
        <Stone
          id={stones[7].id}
          color={stones[7].color}
          position={stones[7].position}
          onMove={handleMoveStone}
          dragging={draggingStone === stones[7].id}
          setDraggingStone={setDraggingStone}
        />
      </Cell>
    */}
    </div>
  );
}

import Board from "./board";

export default function Game() {
  return (
    <div className="grid grid-cols-2 gap-10 items-center justify-items-center">
      <Board color="dark" />
      <Board color="light" />
      <Board color="light" />
      <Board color="dark" />
    </div>
  );
}

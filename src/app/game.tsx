import Board from "./board";

export default function Game() {
  return (
    <div className="max-h-2xl grid h-auto w-full max-w-2xl grid-cols-2 items-center gap-x-7 gap-y-12 sm:gap-x-8 sm:gap-y-16">
      <Board color="dark" />
      <Board color="light" />
      <Board color="light" />
      <Board color="dark" />
    </div>
  );
}

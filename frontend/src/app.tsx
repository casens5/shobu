import Game from "./game/game";

export default function App() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center sm:p-8 bg-zinc-800 text-zinc-50">
      <main className="flex h-full w-full flex-1 flex-col items-center text-xl">
        <Game />
      </main>
      <footer className=""></footer>
    </div>
  );
}

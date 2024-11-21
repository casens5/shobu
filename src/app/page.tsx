import Game from "./game";

export default function Home() {
  return (
    <div className="items-center justify-items-center min-h-screen p-8">
      <main className="flex flex-col gap-8 row-start-2 text-xl items-center justify-center">
        <Game />
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center"></footer>
    </div>
  );
}

import { ActiveMoveTrigger } from "../types.ts";

export async function createGame(opponentType: "ai" | "open") {
  const response = await fetch("/api/game/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      opponent: opponentType,
    }),
  });

  const data = await response.json();

  if (response.ok) {
    return data;
  } else {
    const errorData = await response.json();
    throw new Error(errorData.message);
  }
}

export async function sendMove(gameId: number, move: ActiveMoveTrigger) {
  try {
    const response = await fetch(`/api/game/${gameId}/move`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ move: move }),
    });

    if (response.ok) {
      console.log("move successfully sent to API:", move);
    } else {
      const errorData = await response.json();
      console.error("move failure:", errorData.message);
    }
  } catch (error) {
    console.error("failed to send move:", error);
  }
}

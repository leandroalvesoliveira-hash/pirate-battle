import { http, HttpResponse } from "msw";

const ranking = [
  { playerId: "player-1", playerName: "Blackbeard", score: 15 },
  { playerId: "player-2", playerName: "Anne Bonny", score: 10 },
  { playerId: "player-3", playerName: "Jack Sparrow", score: 7 },
];

export const handlers = [
  http.get("/api/ranking", ({ request }) => {
    const url = new URL(request.url);

    const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
    const pageSize = 10;

    const sortedRanking = [...ranking].sort((a, b) => b.score - a.score);

    return HttpResponse.json({
      data: sortedRanking.slice((page - 1) * pageSize, page * pageSize),
      page,
      pageSize,
      total: sortedRanking.length,
    });
  }),

  http.get("/api/matches", ({ request }) => {
    const url = new URL(request.url);

    const page = Math.max(1, Number(url.searchParams.get("page")) || 1);

    return HttpResponse.json({
      data: [],
      page,
      pageSize: 10,
      total: 0,
    });
  }),
];
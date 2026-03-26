import { graphqlRequest } from "./graphql";

export async function getDashboardGames(limit = 5) {
    const query = `
    query GetDashboardData ($limit: Int) {
      getMostPopularGames(limit: $limit) {
          appid
          name
          thumb
          developer
          genres
          current_players
          price
          popularityScore
          ranking_data {
              score
              positive_votes
          }
          achievements {
              name
          }
      }
      getGamesCount
      getTotalActivePlayers
    }
  `;

    const response = await graphqlRequest(query, { limit });

    const games = (response.getMostPopularGames || []).map((game) => ({
        id: game.appid,
        appid: game.appid,
        name: game.name,
        image: game.thumb,
        developer: game.developer || "Desenvolvedor desconhecido",
        genres: game.genres || [],
        currentPlayers: game.current_players || 0,
        price: game.price ?? null,
        popularityScore: game.popularityScore ?? 0,
        score: game.ranking_data?.score ?? 0,
        positiveVotes: game.ranking_data?.positive_votes ?? 0,
        achievementsCount: game.achievements?.length || 0,
    }));

    return {
        games,
        totalGames: response.getGamesCount || 0,
        totalActivePlayers: response.getTotalActivePlayers || 0,
    };
}

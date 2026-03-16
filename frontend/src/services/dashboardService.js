import { graphqlRequest } from "./graphql";

export async function getDashboardGames(limit = 20, offset = 0) {
    const query = `
    query GetGames($limit: Int, $offset: Int) {
      getGames(limit: $limit, offset: $offset) {
        appid
        name
        thumb
        achievements {
          name
        }
      }
    }
  `;

    const data = await graphqlRequest(query, { limit, offset });

    return (data.getGames || []).map((game) => ({
        id: game.appid,
        appid: game.appid,
        name: game.name,
        image: game.thumb,
        achievementsCount: game.achievements?.length || 0,
    }));
}

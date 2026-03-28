import { graphqlRequest } from "./graphql";

export async function getGameDetails(appid) {
    const query = `
        query GetGame($appid: Int!) {
            getGameByAppId(appid: $appid) {
                appid
                name
                description
                cover
                developer
                release_date
                genres
                current_players
                price
                is_free
                ranking_data {
                    score
                    positive_votes
                }
                achievements {
                    name
                    description
                    icon
                    completion_percentage
                }
            }
        }
    `;

    const response = await graphqlRequest(query, {
        appid: Number(appid),
    });

    return response.getGameByAppId;
}

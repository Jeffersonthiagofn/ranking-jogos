import { graphqlRequest } from "./graphql";

export async function getMe() {
    const query = `
        query {
            getMe {
            id
            name
            avatar
            bgProfile
            steamId
            steamLevel
            steamXp
            steamXpNeeded
            ownedGames {
                    appid
                    playtime_forever
                    completed_achievements
                    total_achievements
                    achievements
                }
            }
        }
`;

    const response = await graphqlRequest(query);
    console.log(response.getMe);

    return response.getMe;
}

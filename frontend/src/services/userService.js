import { graphqlRequest } from "./graphql";

export async function getMe() {
    const query = `
        query {
            getMe {
            id
            name
            ownedGames {
                    appid
                    playtime_forever
                    completed_achievements
                    total_achievements
                    unlocked_achievements
                }
            }
        }
`;

    const response = await graphqlRequest(query);
    console.log(response.getMe);

    return response.getMe;
}

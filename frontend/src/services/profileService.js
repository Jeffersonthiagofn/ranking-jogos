import { graphqlRequest } from "./graphql";

export async function getMyFavorites() {
    const query = `
        query {
            getMe {
                favorites {
                    appid
                    gameDetails {
                        name
                        cover
                        genres
                        current_players
                    }
                }
            }
        }
    `;

    const data = await graphqlRequest(query);
    return data.getMe.favorites;
}

export async function getMyTopGames() {
    const query = `
        query {
            getMyTopGames {
                appid
                name
                cover
                playtime_forever
            }
        }
    `;

    const data = await graphqlRequest(query);
    return data.getMyTopGames;
}

export async function updateBgProfile(bgId) {
    const query = `
        mutation($bgId: Int!) {
            updateBgProfile(bgId: $bgId) {
                id
                bgProfile
            }
        }
    `;

    const data = await graphqlRequest(query, { bgId });
    return data.updateBgProfile;
}

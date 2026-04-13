export const typeDefs = `#graphql
  
#Define the shapes of our MongoDB models
type Achievement {
  name: String
  description: String
  icon: String
  completion_percentage: Float
}

type RankingData {
  positive_votes: Int
  negative_votes: Int
  score: Float
}

type Game {
  appid: ID
  name: String
  description: String
  genres: [String]
  developer: String
  release_date: String
  achievements: [Achievement]
  current_players: Int
  all_time_peak: Int
  playtime_forever: Int
  is_free: Boolean
  price: String
  status: String
  thumb: String
  cover: String
  icon: String
  ranking_data: RankingData
  popularityScore: Float
}

type OwnedGame {
  appid: Int!
  playtime_forever: Int
  completed_achievements: Int
  total_achievements: Int
  achievements: [Achievement]
  gameDetails: Game 
}

type Favorite {
  appid: Int!
  gameDetails: Game 
}

type User {
  id: ID!
  name: String!
  email: String
  steamId: String
  avatar: String
  steamLevel: Int
  steamXp: Int
  steamXpNeeded: Int
  ownedGames: [OwnedGame]
  favorites: [Favorite]
}

type GamesResponse {
  games: [Game]
  total: Int
}

type Query {
  getUser(id: ID!): User  
  getMe: User
  getGames(limit: Int, offset: Int): [Game]
  getGameByAppId(appid: Int!): Game
  getGameAchievements(appid: Int!): [Achievement]
  getGamesCount: Int!
  getTotalActivePlayers: Int!
  getGenres: [String]
  getMostPopularGames(limit: Int): [Game!]!
  getMyTopGames: [Game]
  searchGames(query: String!): [Game!]!
  getGamesFiltered(genre: String, sort: String, limit: Int, offset: Int): GamesResponse
}

#Login Responses
type AuthPayload {
  msg: String!
  token: String!
}

type Mutation {
  register(name: String!, email: String!, password: String!): String
  login(email: String!, password: String!): AuthPayload
  syncMyLibrary: [OwnedGame]
  toggleFavorite(appid: Int!): [Favorite]
}
`;
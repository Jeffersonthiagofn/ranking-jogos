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
  is_free: Boolean
  price: String
  status: String
  thumb: String
  cover: String
  ranking_data: RankingData
  popularityScore: Float
}

type OwnedGame {
  appid: Int!
  playtime_forever: Int
  completed_achievements: Int
  total_achievements: Int
  unlocked_achievements: [String]
  gameDetails: Game 
}

type User {
  id: ID!
  name: String!
  email: String!
  steamId: String
  avatar: String
  ownedGames: [OwnedGame]
}

type Query {
  getUser(id: ID!): User  
  getGames(limit: Int, offset: Int): [Game]
  getGameAchievements(appid: Int!): [Achievement]
  getGamesCount: Int!
  getTotalActivePlayers: Int!
  getMostPopularGames(limit: Int): [Game!]!
}

#Login Responses
type AuthPayload {
  msg: String!
  token: String!
}

type Mutation {
  register(name: String!, email: String!, password: String!): String
  login(email: String!, password: String!): AuthPayload
  syncMyLibrary: String!
}
`;

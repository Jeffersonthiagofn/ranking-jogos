export const typeDefs = `#graphql
  # resposta do login
  type AuthPayload {
    msg: String!
    token: String!
  }

  # O GraphQL exige pelo menos uma Query (consulta) para funcionar
  type Query {
    hello: String
  }

  type Mutation {
    register(nome: String!, email: String!, senha: String!): String!
    login(email: String!, senha: String!): AuthPayload!
  }
`;
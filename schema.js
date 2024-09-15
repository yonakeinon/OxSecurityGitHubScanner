const { gql } = require('apollo-server');

const typeDefs = gql`
  type Repository {
    name: String!
    size: Int!
    owner: String!
    isPrivate: Boolean
    fileCount: Int
    ymlContent: [String!]
    activeWebhooks: [String!]
  }

  type Query {
    repositories: [Repository!]!
    repository(name: String!): Repository!
    allRepositoriesDetails: [Repository!]!
  }
`;

module.exports = { typeDefs };

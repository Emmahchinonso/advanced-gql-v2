const { ApolloServer } = require("apollo-server");
const gql = require("graphql-tag");

const typeDefs = gql`
  type User {
    id: ID!
    username: String!
    createdAt: Int!
  }

  type Settings {
    user: User!
    theme: String!
  }

  input NewSettingsInput {
    user: ID!
    theme: String!
  }

  type Item {
    task: String
  }

  type Query {
    me: User!
    settings(user: ID!): Settings!
  }

  type Mutation {
    settings(input: NewSettingsInput!): Settings!
    createItem(task: String): Item
  }

  type Subscription {
    newItem: Item
  }
`;

const resolvers = {
  Query: {
    me() {
      return {
        id: "287368",
        username: "coder12",
        createdAt: 347698291,
      };
    },
    settings(_, { user }) {
      return {
        user,
        theme: "light",
      };
    },
  },
  Mutation: {
    settings(_, { input }) {
      return input;
    },
  },
  Settings: {
    user(settings) {
      return {
        id: "287368",
        username: "coder12",
        createdAt: 347698291,
      };
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

server.listen().then((url) => console.log(`Server at ${url.url}`));

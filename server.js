const {
  ApolloServer,
  PubSub,
  AuthenticationError,
  UserInputError,
  ApolloError,
  SchemaDirectiveVisitor,
} = require("apollo-server");
const gql = require("graphql-tag");
const { defaultFieldResolver, GraphQLString } = require("graphql");

const pubsub = new PubSub();
const NEW_EVENT = "NEW_ITEM";

class LogDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field) {
    const { resolve = defaultFieldResolver } = field;
    const { message } = this.args;

    field.args.push({
      type: GraphQLString,
      name: "message",
    });
    console.log("message -->", message);
    field.resolve = async (root, { message, ...rest }, ctx, info) => {
      const { message: schemaMessage } = this.args;
      console.log("⚡️ Hello there", message || schemaMessage);
      return await resolve.call(this, root, rest, ctx, info);
    };
  }
}

const typeDefs = gql`
  directive @log(message: String = "my message") on FIELD_DEFINITION

  type User {
    id: ID! @log
    username: String!
    createdAt: Int!
    error: String!
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
    createItem(task: String!): Item!
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
    createItem(_, { task }) {
      const item = { task };
      pubsub.publish(NEW_EVENT, { newItem: item });
      return item;
    },
  },
  Subscription: {
    newItem: {
      subscribe: () => pubsub.asyncIterator(NEW_EVENT),
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
  User: {
    error() {
      return "something huge";
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  schemaDirectives: {
    log: LogDirective,
  },
  context({ connection }) {
    if (connection) {
      return { ...connection.context };
    }
  },
  subscriptions: {
    onConnect() {},
  },
});

server.listen().then((url) => console.log(`Server at ${url.url}`));

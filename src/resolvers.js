const { PubSub, AuthenticationError } = require("apollo-server");
const { authenticated, authorized } = require("./auth");
const NEW_POST = "NEW_POST";
const pubsub = new PubSub();
/**
 * Anything Query / Mutation resolver
 * using a user for a DB query
 * requires user authenication
 */
module.exports = {
  Query: {
    me: (root, __, { user }) => {
      console.log("user_res ----->", user, root);
      return user;
    },
    posts: (_, __, { user, models }) => {
      return models.Post.findMany({ author: user.id });
    },

    post: (_, { id }, { user, models }) => {
      return models.Post.findOne({ id, author: user.id });
    },

    userSettings: (_, __, { user, models }) => {
      return models.Settings.findOne({ user: user.id });
    },
    // public resolver
    feed(_, __, { models }) {
      return models.Post.findMany();
    },
  },
  Mutation: {
    updateSettings: (_, { input }, { user, models }) => {
      return models.Settings.updateOne({ user: user.id }, input);
    },

    createPost: (_, { input }, { user, models }) => {
      const post = models.Post.createOne({ ...input, author: user.id });
      pubsub.publish(NEW_POST, { newPost: post });
      console.log("post_event_published -->", post);
      return post;
    },

    updateMe: (_, { input }, { user, models }) => {
      return models.User.updateOne({ id: user.id }, input);
    },
    // admin role
    invite: authorized("ADMIN", (_, { input }, { user }) => {
      return {
        from: user.id,
        role: input.role,
        createdAt: Date.now(),
        email: input.email,
      };
    }),

    signup(_, { input }, { models, createToken }) {
      const existing = models.User.findOne({ email: input.email });

      if (existing) {
        throw new AuthenticationError("nope");
      }
      const user = models.User.createOne({
        ...input,
        verified: false,
        avatar: "http",
      });
      const token = createToken(user);
      return { token, user };
    },
    signin(_, { input }, { models, createToken }) {
      const user = models.User.findOne(input);

      if (!user) {
        throw new AuthenticationError("nope");
      }

      const token = createToken(user);
      return { token, user };
    },
  },
  Subscription: {
    newPost: {
      subscribe: () => pubsub.asyncIterator(NEW_POST),
    },
  },
  User: {
    posts(root, _, { user, models }) {
      if (root.id !== user.id) {
        throw new Error("nope");
      }

      return models.Post.findMany({ author: root.id });
    },
    settings(root, __, { user, models }) {
      return models.Settings.findOne({ id: root.settings, user: user.id });
    },
  },
  Settings: {
    user(settings, _, { user, models }) {
      return models.Settings.findOne({ id: settings.id, user: user.id });
    },
  },
  Post: {
    author(post, _, { models }) {
      console.log("author_field_resolved --->");
      return models.User.findOne({ id: post.author });
    },
  },
};

const gql = require("graphql-tag");

module.exports = gql`
  directive @formatDate(format: String = "yyyy-MM-dd") on FIELD_DEFINITION
  directive @isAuth on FIELD_DEFINITION
  directive @authorized(role: Role = ADMIN) on FIELD_DEFINITION

  enum Theme {
    DARK
    LIGHT
  }

  enum Role {
    ADMIN
    MEMBER
    GUEST
  }

  type User {
    id: ID!
    email: String!
    avatar: String!
    verified: Boolean!
    createdAt: String! @formatDate
    posts: [Post]!
    role: Role!
    settings: Settings!
  }

  type AuthUser {
    token: String!
    user: User!
  }

  type Post {
    id: ID!
    message: String!
    author: User!
    createdAt: String! @formatDate
    likes: Int!
    views: Int!
  }

  type Settings {
    id: ID!
    user: User!
    theme: Theme!
    emailNotifications: Boolean!
    pushNotifications: Boolean!
  }

  type Invite {
    email: String!
    from: User!
    createdAt: String!
    role: Role!
  }

  input NewPostInput {
    message: String!
  }

  input UpdateSettingsInput {
    theme: Theme
    emailNotifications: Boolean
    pushNotifications: Boolean
  }

  input UpdateUserInput {
    email: String
    avatar: String
    verified: Boolean
  }

  input InviteInput {
    email: String!
    role: Role!
  }

  input SignupInput {
    email: String!
    password: String!
    role: Role!
  }

  input SigninInput {
    email: String!
    password: String!
  }

  type Query {
    me: User! @isAuth
    posts: [Post]! @isAuth
    post(id: ID!): Post! @isAuth
    userSettings: Settings! @isAuth
    feed: [Post]!
  }

  type Mutation {
    updateSettings(input: UpdateSettingsInput!): Settings! @isAuth
    createPost(input: NewPostInput!): Post! @isAuth
    updateMe(input: UpdateUserInput!): User @isAuth
    invite(input: InviteInput!): Invite! @isAuth @authorized
    signup(input: SignupInput!): AuthUser!
    signin(input: SigninInput!): AuthUser!
  }

  type Subscription {
    newPost: Post!
  }
`;

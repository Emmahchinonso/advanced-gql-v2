const {
  SchemaDirectiveVisitor,
  AuthenticationError,
} = require("apollo-server");
const {
  defaultFieldResolver,
  GraphQLString,
  GraphQLEnumType,
} = require("graphql");
const { formatDate } = require("./utils");

class FormatDateDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field) {
    const { resolve = defaultFieldResolver } = field;
    const { format: defaultFormat } = this.args;

    field.args.push({
      type: GraphQLString,
      name: "format",
    });

    field.resolve = async (root, { format }, context, info) => {
      const date = await resolve.call(this, root, { format }, context, info);
      const formatType = format || defaultFormat;
      return formatDate(date, formatType);
    };
  }
}

class IsAuthDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field) {
    const { resolve = defaultFieldResolver } = field;

    field.resolve = async (root, args, { user }, info) => {
      if (!user) {
        throw new AuthenticationError("Not authenticated");
      }
      return await resolve.call(this, root, args, { user }, info);
    };
  }
}

class AuthorizationDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field) {
    const { resolve = defaultFieldResolver } = field;

    const RoleEnumType = new GraphQLEnumType({
      name: "Role",
      values: {
        ADMIN: { value: "ADMIN" },
        GUEST: { value: "GUEST" },
        MEMBER: { value: "MEMBER" },
      },
    });

    field.args.push({
      name: "role",
      type: RoleEnumType,
    });

    field.resolve = async (root, args, { user }, info) => {
      const role = args.role || this.args.role;
      if (user.role !== role) {
        throw new AuthenticationError("Not authorized");
      }
      return await resolve.call(this, root, args, { user }, info);
    };
  }
}

module.exports = {
  FormatDateDirective,
  IsAuthDirective,
  AuthorizationDirective,
};

const gql = require("graphql-tag");
const createTestServer = require("./helper");
const db = require("../src/db");
const FEED = gql`
  {
    feed {
      id
      message
      createdAt
      likes
      views
    }
  }
`;

describe("queries", () => {
  test("feed", async () => {
    const { query } = createTestServer({
      user: { id: 1 },
      models: {
        Post: {
          findMany: jest.fn(() => [
            {
              id: 1,
              message: "hello",
              createdAt: 12345839,
              likes: 20,
              views: 300,
            },
          ]),
        },
      },
    });

    const res = await query({ query: FEED });
    expect(res).toMatchSnapshot();
  });

  test("Me", async () => {
    const { query } = createTestServer({
      user: { id: 1 },
    });
    const res = await query({
      query: gql`
        {
          me {
            email
            id
          }
        }
      `,
    });
    expect(res.data).not.toBeNull();
    expect(res.data.me.id).toBe("1");
  });

  test("fetchSinglePost", async () => {
    const { query } = createTestServer({
      user: {
        role: "ADMIN",
        id: "U9b9Y-1cqy3xwM1bXvQQ7",
      },
      ...db,
    });

    const res = await query({
      query: gql`
        {
          post(id: "kBaq23k2gxDjGaLjKKkEO") {
            message
          }
        }
      `,
    });

    expect(res.data.post).toBeDefined();
    expect(res.data.post.message).toBeDefined();
  });
});

describe("mutation", () => {
  test("createPost", async () => {});
});

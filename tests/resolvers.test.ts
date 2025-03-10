const resolvers = require("../src/resolvers");

describe("resolvers", () => {
  test("feed", async () => {
    const result = resolvers.Query.feed(null, null, {
      models: {
        Post: {
          findMany() {
            return ["men", "women"];
          },
        },
      },
    });

    expect(result).toEqual(["men", "women"]);
    expect(result).toHaveBeenCalled();
  });
});

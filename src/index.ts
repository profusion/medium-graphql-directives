import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { setTimeout as promiseSetTimeout } from "timers/promises";

import directives from "./directives";
import typeDefs from "./typeDefs";

const books = [
  { id: "1234", title: "Harry Potter", isbn: "1234" },
  { id: "5678", title: "The Lord of the Rings", isbn: "5678" },
];

const resolvers = {
  Query: {
    books: () => {
      return promiseSetTimeout(3000 + Math.random() * 3000, books);
    },
  },
  Mutation: {
    addBook: (_: unknown, { input }: any) => {
      const book = { id: input.id, title: input.title, isbn: input.id };
      books.push(book);
      return book;
    },
  },
};

const schema = directives.reduce(
  (mappedSchema, directive) => {
    return directive.transformer(mappedSchema);
  },
  makeExecutableSchema({
    typeDefs: [...directives.map((directive) => directive.typeDefs), typeDefs],
    resolvers,
  })
);

const startServer = async () => {
  const server = new ApolloServer({ schema });
  const { url } = await startStandaloneServer(server, {
    context: async ({ req }) => {
      return {
        user: req.headers.authorization,
      };
    },
  });
  console.log(`🚀 Server ready at ${url}`);
};

startServer();

import gql from "graphql-tag";
import { mapSchema, getDirective, MapperKind } from "@graphql-tools/utils";
import { defaultFieldResolver, type GraphQLSchema } from "graphql";

const typeDefs = gql`
  directive @requiredAuth on FIELD_DEFINITION
`;

const transformer = (graphQLSchema: GraphQLSchema) => {
  return mapSchema(graphQLSchema, {
    [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
      if (!getDirective(graphQLSchema, fieldConfig, "requiredAuth")) {
        return fieldConfig;
      }
      const originalResolver = fieldConfig.resolve ?? defaultFieldResolver;
      fieldConfig.resolve = async (source, args, context, info) => {
        if (!context.user) {
          throw new Error("Unauthorized");
        }
        return originalResolver(source, args, context, info);
      };
      return fieldConfig;
    },
  });
};

export default {
  typeDefs,
  transformer,
}

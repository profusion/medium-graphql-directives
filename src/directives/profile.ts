import gql from "graphql-tag";
import { mapSchema, getDirective, MapperKind } from "@graphql-tools/utils";
import { defaultFieldResolver, type GraphQLSchema } from "graphql";

const typeDefs = gql`
  directive @profile(logArgsValues: Boolean) on FIELD_DEFINITION
`;

const transformer = (graphQLSchema: GraphQLSchema) => {
  return mapSchema(graphQLSchema, {
    [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
      if (!getDirective(graphQLSchema, fieldConfig, "profile")) {
        return fieldConfig;
      }
      const originalResolver = fieldConfig.resolve ?? defaultFieldResolver;
      fieldConfig.resolve = async (source, args, context, info) => {
        const timeStart = Date.now();
        const result = originalResolver(source, args, context, info);
        if (result instanceof Promise) {
          await result.finally(() =>
            console.log(
              `Execution time for ${info.parentType.name}.${info.fieldName}: ${
                Date.now() - timeStart
              }ms`
            )
          );
        }
        return result;
      };
      return fieldConfig;
    },
  });
};

export default {
  typeDefs,
  transformer,
};

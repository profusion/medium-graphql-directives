import gql from "graphql-tag";
import { mapSchema, getDirective, MapperKind } from "@graphql-tools/utils";
import {
  defaultFieldResolver,
  GraphQLError,
  type GraphQLSchema,
} from "graphql";

import timeoutPromise from "../helpers/timeoutPromise";

const typeDefs = gql`
  directive @timeout(ms: Int) on FIELD_DEFINITION
`;

const transformer = (graphQLSchema: GraphQLSchema) => {
  return mapSchema(graphQLSchema, {
    [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
      const directiveArgs = getDirective(
        graphQLSchema,
        fieldConfig,
        "timeout"
      )?.[0];
      if (!directiveArgs) {
        return fieldConfig;
      }
      const originalResolver = fieldConfig.resolve ?? defaultFieldResolver;
      fieldConfig.resolve = async (...resolverArgs) => {
        const result = originalResolver(...resolverArgs);
        if (!(result instanceof Promise)) {
          return result;
        }

        const timeoutSymbol = Symbol();
        const raceResult = await timeoutPromise(
          result,
          directiveArgs.ms,
          timeoutSymbol
        );

        const { fieldName, parentType } = resolverArgs[3];
        if (raceResult === timeoutSymbol) {
          throw new GraphQLError(
            `${parentType.name}.${fieldName} timed out in ${directiveArgs.ms}ms`
          );
        }
        return raceResult;
      };

      return fieldConfig;
    },
  });
};

export default {
  typeDefs,
  transformer,
}

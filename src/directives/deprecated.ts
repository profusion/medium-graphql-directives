import gql from "graphql-tag";
import { mapSchema, getDirective, MapperKind } from "@graphql-tools/utils";
import type { GraphQLSchema } from "graphql";

const typeDefs = gql`
  directive @customDeprecated(reason: String!) on FIELD_DEFINITION
`;

const transformer = (graphQLSchema: GraphQLSchema) => {
  return mapSchema(graphQLSchema, {
    [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
      const args = getDirective(
        graphQLSchema,
        fieldConfig,
        "customDeprecated"
      )?.[0];
      if (args) {
        fieldConfig.deprecationReason = args.reason;
        fieldConfig.description = `Deprecated field: ${args.reason}\n\n${fieldConfig.description}`;
      }
      return fieldConfig;
    },
  });
};

export default {
  typeDefs,
  transformer,
}

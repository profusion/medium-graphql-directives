import gql from "graphql-tag";

export default  gql`
  type Book {
    """
    The book unique identifier
    """
    id: ID!
    """
    The book title
    """
    title: String!
    """
    The book ISBN
    """
    isbn: String! @customDeprecated(reason: "Use 'id' instead")
  }

  input AddBookInput {
    id: ID!
    title: String!
  }

  type Query {
    books: [Book!]! @profile @timeout(ms: 4500)
  }

  type Mutation {
    addBook(input: AddBookInput!): Book! @requiredAuth
  }
`;

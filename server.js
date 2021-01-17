const express = require('express')
const { graphqlHTTP } = require('express-graphql')
const authors = require('./mockData/authors')
const books = require('./mockData/books')
const {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLList,
    GraphQLInt,
    GraphQLNonNull
} = require('graphql')

const AuthorType = new GraphQLObjectType({
    name: 'Author', 
    description: 'This represents an author',
    fields: () => ({
        id: {type: GraphQLNonNull(GraphQLInt)},
        name: {type: GraphQLNonNull(GraphQLString) },
        books: { 
            type: new GraphQLList(BookType),
            resolve: (author) => {
                return books.filter(book => book.authorId === author.id)
            }
        }
    })
})

const BookType = new GraphQLObjectType({
    name: 'Book',
    description: 'This represents a book written by an author',
    fields: () => ({
        id: {type: GraphQLNonNull(GraphQLInt) },
        name: {type: GraphQLNonNull(GraphQLString)},
        authorId: { type: GraphQLNonNull(GraphQLString)},
        author: {
            type: AuthorType,
            resolve: (book) => {
                return authors.find(author => author.id === book.authorId)
            }
        }
    })
})

const RootQueryType = new GraphQLObjectType({
    name: 'Query',
    description: 'Root Query',
    fields: () => ({
        book: {
            type: BookType,
            description: 'A single book',
            args: {
                id: { type: GraphQLInt}
            },
            resolve: (parent, args) => books.find(book => book.id === args.id)
        },
        books: {
            type: new GraphQLList(BookType),
            description: 'List of books',
            resolve: () => books
        },
        authors: {
            type: new GraphQLList(AuthorType),
            description: 'List of all authors',
            resolve: () => authors
        },
        author: {
            type: AuthorType,
            description: 'A single author', 
            args: {
                id: {type: GraphQLInt}
            },
            resolve: (parent, args) => authors.find(author => author.id === args.id)
        }
    })
})

const bookSchema = new GraphQLSchema({
    query: RootQueryType
})

const app = express()

app.use('/graphql', graphqlHTTP({
    schema: bookSchema,
    graphiql: true
}))

app.listen(5000, () => console.log("server running"))
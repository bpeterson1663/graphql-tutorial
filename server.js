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
            args: {
                name: {type: GraphQLString }
            },
            resolve: (parent, args) => {
                if(args.name){
                    return books.filter(book => book.name.toLowerCase().includes(args.name.toLowerCase()))
                }else{
                    return books
                }
            },
        },
        authors: {
            type: new GraphQLList(AuthorType),
            description: 'List of all authors',
            args: {
                name: {type: GraphQLString}
            },
            resolve: (parent, args) => {
                if(args.name){
                   return authors.filter(author => author.name.toLowerCase().includes(args.name.toLowerCase()))
                }else {
                    return authors
                }
            }
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

const RootMutationType =  new GraphQLObjectType({
    name: 'Mutation',
    description: 'Root Mutation',
    fields: () => ({
        addBook: {
            type: BookType,
            descrption: 'Add a book',
            args: {
                name: { type: GraphQLNonNull(GraphQLString) }, 
                authorId: { type: GraphQLNonNull(GraphQLInt) },
            },
            resolve: (parent, args) => {
                const book = {
                    id: books.length + 1,
                    name: args.name,
                    authorId: args.authorId
                }
                books.push(book)
                return book
            }
        },
        addAuthor: {
            type: AuthorType,
            description: 'Add an author',
            args: {
                name: { type: GraphQLNonNull(GraphQLString)}
            },
            resolve: (parent, args) => {
                const author = {
                    id: authors.length + 1,
                    name: args.name
                }
                authors.push(author)
                return author
            }
        },
        deleteAuthor: {
            type: AuthorType,
            description: 'Delete an author',
            args: {
                name: { type: GraphQLNonNull(GraphQLString)}
            },
            resolve: (parent, args) => {
                if(args.name){
                    authors.filter(author => author.name.toLowerCase().includes(args.name.toLowerCase()))
                    const author = {name: args.name}
                    return author
                }else {
                     return {name: "error"}
                 }
            }
        }
    })
})

const bookSchema = new GraphQLSchema({
    query: RootQueryType,
    mutation: RootMutationType
})

const app = express()

app.use('/graphql', graphqlHTTP({
    schema: bookSchema,
    graphiql: true
}))

app.listen(5000, () => console.log("server running"))
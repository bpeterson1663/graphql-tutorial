const express = require('express')
const { graphqlHTTP } = require('express-graphql')
const {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString
} = require('graphql')

const schema = new GraphQLSchema({
    query: new GraphQLObjectType({
        name: 'HelloWorld',
        fields: () => ({
            message: { 
                type: GraphQLString,
                resolve: () => 'Hello World'
            },
        })
    })
})

const app = express()

app.use('/graphql', graphqlHTTP({
    schema: schema,
    graphiql: true
}))

app.listen(5000, () => console.log("server running"))
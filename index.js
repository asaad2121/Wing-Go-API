const express = require('express')
const { ApolloServer } = require('@apollo/server')
const { expressMiddleware } = require('@apollo/server/express4')
const bodyParser = require('body-parser')
const {default : axios } = require('axios')
const cors = require('cors')

async function startFunction(){
    const app = express();
    const server = new ApolloServer({
        typeDefs: `
            type User {
                id: ID!
                name: String
                username: String
            }
            type Todo {
                id: ID!
                title: String
                completed: Boolean
                user: User
            }
            type Query {
                getTodo: [Todo]
                getUser(id: ID!): User
            }`,
        resolvers: {
            Todo: {
                user: async(todo) => (await axios.get(`https://jsonplaceholder.typicode.com/users/${todo.id}`)).data,
            },
            Query: {
                getTodo: async () =>
                    (await axios.get(`https://jsonplaceholder.typicode.com/todos`)).data,
                getUser: async (parent, {id}) =>
                    (await axios.get(`https://jsonplaceholder.typicode.com/users/${id}`)).data,
            }
        },
    });

    const port = 8000

    app.use(bodyParser.json());
    app.use(cors());

    await server.start();
    app.use('/graphql', expressMiddleware(server))

    // app.get('/', (req, res) => {
    // res.send('Hello World!')
    // })

    app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
    })
};

startFunction();
const express = require("express");
const app = express();
const PORT = 5000;
const userData = require("./MOCK_DATA.json");
const graphql = require("graphql");
const {
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLList,
  GraphQLInt,
  GraphQLString,
} = graphql;
const { graphqlHTTP } = require("express-graphql");
const cors = require("cors");

const UserType = new GraphQLObjectType({
  name: "User",
  fields: () => ({
    id: { type: GraphQLInt },
    firstName: { type: GraphQLString },
    lastName: { type: GraphQLString },
    email: { type: GraphQLString },
    password: { type: GraphQLString },  
  }),
});

const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {
    getAllUsers: {
      type: new GraphQLList(UserType),
      args: { id: { type: GraphQLInt } },
      resolve(parent, args) {
        return userData;
      },
    },
    findUserById: {
      type: UserType,
      description: "Fetch single user",
      args: { id: { type: GraphQLInt } },
      resolve(parent, args) {
        return userData.find((a) => a.id == args.id);
      },
    },
  },
});

const Mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    // Mutation to create a new user
    createUser: {
      type: UserType,
      args: {
        firstName: { type: GraphQLString },
        lastName: { type: GraphQLString },
        email: { type: GraphQLString },
        password: { type: GraphQLString },
      },
      resolve(parent, args) {
        const newUser = {
          id: userData.length + 1,
          firstName: args.firstName,
          lastName: args.lastName,
          email: args.email,
          password: args.password,
        };
        userData.push(newUser);
        return newUser;
      },
    },
    // Mutation to edit an existing user
    editUser: {
      type: UserType,
      args: {
        id: { type: GraphQLInt },
        firstName: { type: GraphQLString },
        lastName: { type: GraphQLString },
        email: { type: GraphQLString },
        password: { type: GraphQLString },
      },
      resolve(parent, args) {
        const user = userData.find((user) => user.id === args.id);
        if (!user) {
          throw new Error("User not found");
        }
        // Update user fields if provided
        if (args.firstName) user.firstName = args.firstName;
        if (args.lastName) user.lastName = args.lastName;
        if (args.email) user.email = args.email;
        if (args.password) user.password = args.password;
        return user;
      },
    },
    // Mutation to delete a user
    deleteUser: {
      type: UserType,
      args: {
        id: { type: GraphQLInt },
      },
      resolve(parent, args) {
        const userIndex = userData.findIndex((user) => user.id === args.id);
        if (userIndex === -1) {
          throw new Error("User not found");
        }
        const deletedUser = userData.splice(userIndex, 1)[0];
        return deletedUser;
      },
    },
  },
});

const schema = new GraphQLSchema({ query: RootQuery, mutation: Mutation });

app.use(cors());

app.use(
  "/graphql",
  graphqlHTTP({
    schema,
    graphiql: true,
  })
);

// REST API route for fetching all users
app.get("/rest/getAllUsers", (req, res) => {
  res.send(userData);
});

app.listen(PORT, () => {
  console.log("Server running on http://localhost:" + PORT + "/graphql");
});

const { AuthenticationError } = require('apollo-server-express');
const { User } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
  Query: {
    me: async (parents, context) => {
      if (!context.user) {
        throw new AuthenticationError('No user found')
      }
      const currentUser = await User.findById(context.user._id)
      return currentUser
    }
  },

  Mutation: {
    login: async (parent, args, context, info) => {
      const user = await User.findOne( args.email )
      if (!user) {
        throw new AuthenticationError('Wrong username or password')
      }
      const userPassword = await user.isCorrectPassword(args.password)
      if (!userPassword) {
        throw new AuthenticationError('Wrong username or password')
      }
      const loginToken = signToken(user)
      return {
        loginToken,
        user
      }
    },
    addUser: async (parent, args, context, info) => {
      const newUser = await User.create(args)
      if (!newUser) {
        throw new AuthenticationError('User cannot be created at this time')
      }
      const newToken = signToken(newUser)
      return {
        token,
        newUser
      }
    },
    saveBook: async (parent, args, context, info) => {
      if (!context.user) {
        throw new AuthenticationError('No user found')
      }
      const user = await User.findOneAndUpdate(
          { _id : context.user._id }, 
          { $addToSet : {savedBooks : args.input} },
          { new : true }
        )
        return user
    },
    removeBook: async (parent, args, context, info) => {
      if (!context.user) {
        throw new AuthenticationError('No user found')
      }
      if (!args.bookId) {
        throw new AuthenticationError('No book found')
      }
      const user = await User.findOneAndUpdate(
          { _id : context.user._id },
          { $pull : { savedBooks : { bookId : args.bookId } } },
          { new : true }
        )
        return user
    },
  }
}

module.exports = resolvers
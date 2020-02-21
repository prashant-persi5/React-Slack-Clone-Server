import { ApolloServer } from 'apollo-server-express';
import path from 'path';
import {fileLoader, mergeTypes, mergeResolvers } from 'merge-graphql-schemas';
import models from '../models';
import { SECRET, SECRET2 } from '../config';

const typeDefs = mergeTypes(fileLoader(path.join(__dirname, './types')));
const resolvers = mergeResolvers(fileLoader(path.join(__dirname, './resolvers')));

const SERVER = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({req}) => ({
    models,
    user: req.user,
    SECRET,
    SECRET2,
  }),
  playground: {
    endpoint: `http://localhost:8081/graphql`,
    settings: {
      'editor.theme': 'light'
    }
  }
});

export default SERVER;

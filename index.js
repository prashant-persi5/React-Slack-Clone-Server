import express from 'express';
import SERVER from './graphql/schema.js';
import cors from 'cors';
import models from './models';
import jwt from 'jsonwebtoken';
import { refreshTokens } from './auth.js';
import { SECRET, SECRET2 } from './config';

const APP = express();

const addUser = async(req, res, next) => {
  const token = req.headers['x-token'];
  if(token) {
    try {
      const { user } = jwt.verify(token, SECRET);
      req.user = user;
    } catch(err) {
      const refreshToken = req.headers['x-refresh-token'];
      const newTokens = await refreshTokens(token, refreshToken, models, SECRET, SECRET2);
      if(newTokens.token && newTokens.refreshToken) {
        res.set('Access-Control-Expose-Headers', 'x-token, x-refresh-token');
        res.set('x-token', newTokens.token);        
        res.set('x-refresh-token', newTokens.refreshToken);
      }
      req.user = newTokens.user;
    }
  }
  
  next();
};

APP.use(addUser);

SERVER.applyMiddleware({
  app: APP,
});

const PORT = 8081 || process.env;

APP.use(cors('*'));

/* If force is true, Each time DB will drop after connecting and creates new tables*/
models.sequelize.sync({ force: false }).then(() => {
  APP.listen(PORT, () => {
    console.log(`The server has started on http://localhost:${PORT}`);
  });
});

export default APP;

import {Sequelize} from 'sequelize';
import config from '../config';

const {sequelizeConfig} = config;

export const seq = new Sequelize("test", "osu", "12345", {
    dialect: "mysql",
    host: "localhost"
  });
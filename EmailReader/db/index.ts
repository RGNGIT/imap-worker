import {Sequelize} from 'sequelize';
import config from '../config';

const {sequelizeConfig} = config;

export const seq = new Sequelize({
    logging: false,
    dialect: 'postgres',
    ...sequelizeConfig
});

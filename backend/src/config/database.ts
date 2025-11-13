import {Sequelize} from "sequelize";
import {config} from "./index";

const { host, port, password, user, name } = config.database
const { env } = config.server

const sequelize = new Sequelize({
    dialect: "mysql",
    host: host,
    port: port,
    database: name,
    username: user,
    password: password,
    logging: env === 'development' ? console.log : false,
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
    }
});

export default sequelize;
const config = require('../configs/config.js');
const mysql = require('mysql');

exports.connection = mysql.createConnection(
    {
        host: config.sqlInformation.hostname,
        user: config.sqlInformation.username,
        password: config.sqlInformation.password,
        database: config.sqlInformation.database,
        charset: "utf8mb4"
    }
)
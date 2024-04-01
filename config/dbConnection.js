const dotenv = require("dotenv").config();
const mysql = require('mysql');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: process.env.MYSQL_PASS,
    database: 'task_app'
});

module.exports = pool;
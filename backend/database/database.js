const mysql = require('mysql2/promise');
const dbconfig = require('./dbconfig.js'); 

const pool = mysql.createPool(dbconfig);

module.exports = pool; 
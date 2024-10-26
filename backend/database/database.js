const mysql = require('mysql2/promise');
const dbconfig = require('../config/dbconfig.js'); 

const pool = mysql.createPool(dbconfig);

module.exports = pool; 
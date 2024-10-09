const path = require('path');
const dotenv = require('dotenv');

const currentDir = __dirname;
const envPath = path.join(currentDir, '..', 'project.env');

const result = dotenv.config({ path: envPath });

if (result.error) {
    throw result.error;
}

const dbconfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
};

module.exports = dbconfig;

const path = require('path');
const dotenv = require('dotenv');
const crypto = require('crypto'); 
const fs = require('fs'); 

const currentDir = __dirname;
const envPath = path.join(currentDir, '..', 'project.env');
dotenv.config({ path: envPath });

let secretKey = process.env.SECRET_KEY;

if (!secretKey) {
    secretKey = crypto.randomBytes(32).toString('hex');
    console.warn('SECRET_KEY tidak ditemukan dalam file .env. Menggunakan secret key acak: ', secretKey);
    
    fs.appendFileSync(envPath, `\nSECRET_KEY=${secretKey}`, 'utf8');
}

module.exports = { secretKey };
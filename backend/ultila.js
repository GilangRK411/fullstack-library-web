const bcrypt = require('bcryptjs');

const password = 'qwqw1212!@!@';
const hashedPassword = bcrypt.hashSync(password, 8);
console.log(hashedPassword);

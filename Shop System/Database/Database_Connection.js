import mySql from 'mysql2'
const connection = mySql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'shopdb'
});

export {connection};
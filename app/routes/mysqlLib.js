var mysql = require('mysql');
var DBSettings = require('../config/ApplicationSettings').getDBSettings();


var dbPoolConfig = {
    host: DBSettings.host,
    user: DBSettings.username,
    password: DBSettings.password,
    database: DBSettings.database,
    connectionLimit: DBSettings.connectionLimit
};
//database connection
var numConnectionsInPool = 0;
var numEnqueueOccurred = 0;

function initializePool(dbPoolConfig) {

    console.log('CALLING INITIALIZE POOL');
    console.log('');
    connection = mysql.createPool(dbPoolConfig);

    connection.on('connection', function(connection) {
        numConnectionsInPool++;
        console.log('NUMBER OF CONNECTION IN POOL : ' + numConnectionsInPool);
    });
    connection.on('error', function(err) {
        console.log('db error', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') { 
            initializePool(dbPoolConfig);
        } else {
            throw err;
        }
    });
}
initializePool(dbPoolConfig);

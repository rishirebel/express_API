var newrelic = require('newrelic');
var pmx = require('pmx').init();
var express = require('express');
var logfmt = require("logfmt");
var favicon = require('serve-favicon');
var http = require('http');
var path = require('path');
var errorhandler = require('errorhandler');
var methodOverride = require('method-override');
var bodyParser = require('body-parser');
var logger = require('morgan');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();

var ApplicationSettings = require('./config/ApplicationSettings');
var args = process.argv;
if (!args[2]) {
    ApplicationSettings.ENV = 'qa';
} else {
    ApplicationSettings.ENV = args[2];
}

console.log("Using envoirnment " + ApplicationSettings.ENV);


if (!ApplicationSettings.hasAllSettings()) {
    console.log("Couldn't load environment settings");
    sys.exit(-1);
}

mysqlLib = require('./routes/mysqlLib');
var admin = require('./routes/admin');

genVarSettings = require('./config/ApplicationSettings').generalVariableSettings();
var app = express();

// all environments
app.set('port', process.env.PORT || genVarSettings.port);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.set('json spaces', 1);
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());
app.use(favicon(path.join(__dirname, 'views', 'favicon.ico')));
app.use(logger('dev'));
app.use(methodOverride());
app.use(express.static(path.join(__dirname, 'public')));
app.use(logfmt.requestLogger());

// development only
if ('development' == app.get('env')) {
    app.use(errorhandler());
}

app.get('/test', function (req, res) {
    res.render('test');
});


app.all('*', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
});

app.post('/admin_login', blowLtdAdmin.adminLogin);
app.post('/forgot_password', blowLtdAdmin.forgotPassword);
app.post('/reset_password', blowLtdAdmin.resetPassword);
app.post('/change_password', blowLtdAdmin.changePassword);

http.createServer(app).listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});

var fs = require('fs');
var http = require('http');
var path = require('path');

var express = require('express');
var favicon = require('serve-favicon');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var multipart = require('connect-multiparty');
var cookieParser = require('cookie-parser');
var session = require('express-session');

var config = require('./config');

var app = express();

app.set('port', config.port);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(cookieParser(config.cookieSecret));
app.use(session({ secret: config.cookieSecret, resave: true, saveUninitialized: true }));
app.use(express.static(path.join(__dirname, config.isProduction ? 'dist' : 'src')));
app.use(express.static(path.join(__dirname, 'upload')));
app.use(favicon(path.join(__dirname, 'favicon.ico')));
app.use(multipart({ uploadDir: path.join(__dirname, '/upload/temp') }));

app.use(sendInject);

// routes
var routes = require('./routes/index');
app.use('/', routes);

// dynamic load routes
fs.readdirSync(path.join(__dirname, 'routes')).filter(function(file) {
    return (file.indexOf('.') !== 0) && (file !== 'index.js');
}).forEach(function(file) {
    var name = file.split('.')[0];
    var route = require('./routes/' + name);
    app.use('/services/' + name, route);
});

function sendInject(req, res, next) {
    res.success = inject(res, 'success');
    res.warning = inject(res, 'warning');
    res.error = inject(res, 'error');

    next();

    function inject(res, status) {
        return function(data) {
            if(res._end) return;

            res._end = true;

            res.send({
                status: status,
                data: data
            });
        };
    }
}

module.exports = app;

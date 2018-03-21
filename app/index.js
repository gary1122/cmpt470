var express = require('express');
var bodyParser = require('body-parser');
var multer = require('multer');
var upload = multer();
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var path = require('path');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var randomString = require("randomstring");
var sessionMiddleware = session({
    secret: randomString.generate(),
    auth: "my auth",
    usrname: ""
});


app.use(express.static(path.join(__dirname, 'public')))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(upload.array());
app.use(cookieParser());

io.use(function(socket, next) {
    sessionMiddleware(socket.request, socket.request.res, next);
});

app.use(sessionMiddleware);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

var DBManager = require('./server/DBManager');
var dbManager = new DBManager('test_db', 'localhost');

var Authenticator = require('./server/Authenticator');
var auth = new Authenticator(app, dbManager);

app.get('/', function(req, res) {
    res.render('index');
});

app.get('/freedrawing', function(req, res) {
    res.render('freedrawing');
});

var AccountRouter = require('./server/AccountRouter');
app.use('/account', new AccountRouter().router);

var GameRouter = require('./server/GameRouter');
app.use('/game', new GameRouter(dbManager, io.sockets).router);


server.listen(8080);

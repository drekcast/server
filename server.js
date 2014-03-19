'use strict';

var http        = require('http'),
    express     = require('express'),
    passport    = require('passport'),
    debug       = require('debug')('eventcast:server'),

    Primus      = require('primus'),
    PrimusRooms = require('primus-rooms'),

    channels    = require('./lib/channelRepository'),
    users       = require('./lib/userRepository')
    ;

var env = process.env.NODE_ENV || 'development',
    config = require('./config/config')[env];

var app = express();

require('./config/passport')(app, passport, config);

app.configure(function() {
    app.set('port', process.env.PORT || 3000);
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.static('public'))
    app.use(passport.initialize());
    app.use(express.methodOverride());
    app.use(app.router);
});

app.configure('development', function () {
    app.use(express.errorHandler());
});

app.use(function (req, res, next) {
    app.disable( 'x-powered-by' );
    res.header("X-Powered-By", "EventCast");
    next()
})

app.use(function(err, req, res, next){
    res.status(err.status || 500);
    res.render('500', { error: err });
});

app.use(function(req, res, next){
    res.status(404);
    if (req.accepts('json')) {
        res.send({ error: 'Not found' });
        return;
    }
    res.type('txt').send('Not found');
});

channels.loadConfigFromFile(__dirname+'/data/channels.json');
users.loadFromFile(__dirname+'/data/users.json');
app.set('channels', channels);
app.set('users', users);

require('./config/routes')(app, passport);

var server = http.createServer(app);
var primus = new Primus(server, { });
primus.use('rooms', PrimusRooms);

primus.on('connection', function(spark) {
    console.log('connection has the following headers', spark.headers);
    console.log('connection was made from', spark.address);
    console.log('connection id', spark.id);


});

server.listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'))
});
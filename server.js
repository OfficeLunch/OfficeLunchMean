var express = require('express');
var app = express();
var mongoose = require('mongoose');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var passport = require('passport');
var config = require('./configs/database');
var User = require('./models/user');
//var jwt = require('jsonwebtoken');
var apiroutes = require('./routes/apiroutes');

//mongoose.connect('127.0.0.1:27017');
mongoose.connect(config.database);

//require('./configs/passport')(passport);

app.use(express.static(__dirname + '/public'));
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({'extended':'true'}));
app.use(bodyParser.json());
app.use(bodyParser.json({type: 'application/vnd.api+json'}));
app.use(methodOverride());
app.use(passport.initialize());


app.use('/', apiroutes);

app.listen(8080);

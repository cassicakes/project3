var express = require('express');
var ejsLayouts = require("express-ejs-layouts");
var app = express();
var bodyParser = require('body-parser');
var radioCtrl = require('./controllers/radio'); //NEED HELP WITH THIS
var request = require('request');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/hash-rocket');

var User = require('./models/user')

app.use(express.static(__dirname + '/static'));

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:false}));
app.use(ejsLayouts);
app.use('radio', radioCtrl); //NEED HELP WITH THIS

app.get('/', function(req, res) {
  res.render('index');
});

app.get('/profile', function (req, res) {
  res.render('profile');
});

app.get('/search', function (req, res) {
  res.render('search');
});

app.get('/login', function (req, res) {
  res.render('login');
});

app.get('/signup', function (req, res) {
  res.render('signup');
});

app.get('/secret', function (req, res) {
  res.render('secret');
});

app.get('/details', function (req, res) {
  res.render('details');
});


app.listen(3000);
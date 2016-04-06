var express = require('express');
var ejsLayouts = require("express-ejs-layouts");
var app = express();
var bodyParser = require('body-parser');
var radioCtrl = require('./controllers/radio'); //NEED HELP WITH THIS
var request = require('request');
var session = require('express-session');
var flash = require('connect-flash');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/hash-rocket');

var User = require('./models/user')

app.use(express.static(__dirname + '/static'));

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:false}));
app.use(session({
 secret:'3da6f15641a9a688457d114185f91ea907b4f7d5f793770baf5ae',
 resave: false,
 saveUninitialized: true
}));
app.use(ejsLayouts);
app.use(flash());
app.use('radio', radioCtrl); //NEED HELP WITH THIS

app.get('/', function(req, res) {
  res.render('index', {alerts: req.flash()});
});

app.get('/profile', function (req, res) {
  res.render('profile', {alerts: req.flash()});
});

app.get('/search', function (req, res) {
  res.render('search');
});

app.get('/login', function (req, res) {
  res.render('login', {alerts: req.flash()});
});

app.post('/login', function (req, res) {
  User.findOne({
    email: req.body.email, //PUT PW IN AFTER ENCRYPT
  }, function(err, user) {
    if (err) {
      req.flash('danger', "Try again, we suck right now.");
      res.redirect('/login');
      return
    }
    if (!user) {
      req.flash('danger', "Could not find user.");
      res.redirect('/login');
      return
    }
    if (user.password === req.body.password) {
      req.flash('success', "Music lover logged in.");
      req.session.user = user;
      res.redirect('/profile');
      return
    } else {
      req.flash('danger', "Incorrect Password.");
      res.redirect('/profile');
      return
    }
  })
});

app.get('/logout', function (req,res) {
  req.session.destroy();
  res.redirect('/');
});

app.get('/signup', function (req, res) {
  res.render('signup', {alerts: req.flash()});
});

app.post('/signup', function (req, res) {
  if (req.body.password1 !== req.body.password2){
    req.flash('danger', "Passwords do not match.");
    res.redirect('/signup');
    return //if err this ends if statment/ sign up capabilities. 
  }
  if (req.body.email == "" ) { //LOOK INTO IMPLENTING CORRECT EMAIL FILTER
    req.flash('danger', "Please enter a email.");
    res.redirect('/signup');
    return
  }
  if (req.body.name == "") {
    req.flash('danger', "Please enter a name.");
    res.redirect('/signup');
    return
  }
  if (req.body.password1 == ""){
    req.flash('danger', "Please enter a password.");
    res.redirect('/signup');
    return
  }
  User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password1
  },function(err, user){
    if (err) {
      req.flash('danger', "Email already exists.");
      res.redirect('/signup');
      return
    }
    req.flash('success', "Profile Created");
    res.redirect('/');
  })
});

app.get('/secret', function (req, res) {
  res.render('secret');
});

app.get('/details', function (req, res) {
  res.render('details');
});


app.listen(3000);
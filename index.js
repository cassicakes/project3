var express = require('express');
var ejsLayouts = require("express-ejs-layouts");
var app = express();
var bodyParser = require('body-parser');
var radioCtrl = require('./controllers/radio'); //NEED HELP WITH THIS
var request = require('request');
var session = require('express-session');
var flash = require('connect-flash');
var mongoose = require('mongoose');
mongoose.connect(process.env.MONGOLAB_URI || 'mongodb://localhost/hash-rocket');

var User = require('./models/user')

app.use(express.static(__dirname + '/static'));

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:false}));
app.use(session({
 secret: process.env.SECRET,
 resave: false,
 saveUninitialized: true
}));
app.use(ejsLayouts);
app.use(flash());

app.use(function (req, res, next) {
   res.locals.session = req.session;
   next();
});

app.use('radio', radioCtrl); //NEED HELP WITH THIS

app.get('/', function(req, res) {
  res.render('index', {alerts: req.flash()});
});

app.get('/profile', function (req, res) {
  if (!req.session.user) {
    res.redirect('/');
    return
  }
  User.findById(req.session.user._id, function(err, user) {
  res.render('profile', {alerts: req.flash(), user: user});

  })
});

app.post('/profile', function (req, res) {
  if (!req.session.user) { //checking that someone is logged in before getting to this page
    res.redirect('/');
    return
  }
  var about = req.body.aboutMe;
  User.findOneAndUpdate({
    _id: req.session.user._id
  },{ 
    about: about 
  }, function(err, doc){
    res.redirect('/profile')
  }) 
});

app.get('/results', function (req, res) {
  res.render('results');
});

app.get('/login', function (req, res) {
  res.render('login', {alerts: req.flash()});
});

app.post('/login', function (req, res) {
  User.findOne({
    email: req.body.email, 
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
    user.comparePassword(req.body.password, function(err, isMatch) {
      if (err || !isMatch) {
        req.flash('danger', "Incorrect Password.");
        res.redirect('/login');
        return
      } else {
        req.flash('success', "Music lover logged in.");
        req.session.user = user;
        res.redirect('/profile');
        return
      }
    });
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

app.get("/search", function (req, res ) {
  var artist = req.query.artist
  request('https://api.spotify.com/v1/search?type=artist&q=' + artist, function(err, response, body) {
    if (!err && response.statusCode === 200) {
      res.render('results', { artists: JSON.parse(body).artists});
    } else {
      req.flash('danger', "Error getting ya data yo!")
      res.redirect('/profile');
    }
  });
});

app.get('/secret', function (req, res) {
  res.render('secret');
});

app.get('/details/:id', function (req, res) {
  request('https://api.spotify.com/v1/artists/' + req.params.id + "/related-artists", function(err, response, body) {
    if (!err && response.statusCode === 200) {
      request('https://api.spotify.com/v1/artists/' + req.params.id, function(err2, response2, body2) {
        if (!err2 && response2.statusCode === 200) {
          var artist = JSON.parse(body2);
          var related = JSON.parse(body);
          getItunesData( artist, related, res)
        } else {
          req.flash('danger', "Error getting ya data yo!")
          res.redirect('/profile');
        }
      })    
    } else {
      req.flash('danger', "Error getting ya data yo!")
      res.redirect('/profile');
    }
  });
});

app.post('/addtofavs', function (req, res) {
  if (req.session.user) {
    User.findById(req.session.user._id, function(err, user) {
    user.favs.push(req.body);
    user.save();
    res.redirect('/profile'); 
    });
  } else {
    req.flash('danger', "You gotta login MAN!")
    res.redirect('/login');
  }
});


app.listen(process.env.PORT || 3000)

//this is going to get all itunes data (tracks and albums) to diplay on page, keeping Itunes seperated from spotify
function getItunesData( artist, related, res) {
  // console.log(artist.name) testing 
  request('https://itunes.apple.com/search?term=' + artist.name + "&entity=song&limit=5", function(err, response, body) {
    var tracks = JSON.parse(body).results;
    res.render('details', { artist: artist, related: related, tracks: tracks});
  });
};

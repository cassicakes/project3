var express = require('express');
var ejsLayouts = require("express-ejs-layouts");
var app = express();
var bodyParser = require('body-parser');
var radioCtrl = require('./controllers/radio'); //NEED HELP WITH THIS
var request = require('request');

app.use(express.static(__dirname + '/static'));

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:false}));
app.use(ejsLayouts);
app.use('radio', radioCtrl); //NEED HELP WITH THIS

app.get('/', function(req, res) {
  res.render('index');
});



app.listen(3000);
var express = require('express'); //manipulate data
var app = express();
var bodyParser = require('body-parser'); //allows us to recieve post data and stores in req.body to use (middlewear)
var ejsLayouts = require("express-ejs-layouts");
var radioCtrl = require('./controllers/radio'); //NEED HELP WITH THIS
var request = require('request');

app.use(express.static(__dirname + '/views'));

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:false}));
app.use(ejsLayouts);
app.use('radio', radioCtrl); //NEED HELP WITH THIS, ALSO DO I NEEED PARTIALS WITH THIS?

app.get('/', function(req, res) {
  res.render('index');
});



app.listen(3000);
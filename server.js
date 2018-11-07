// modules =================================================
var express        = require('express');
var app            = express();
var mongoose       = require('mongoose');
var bodyParser     = require('body-parser');
var methodOverride = require('method-override');

// configuration ===========================================
	
// config files
var config = require('./config/config');

var port = process.env.PORT || 8080; 
mongoose.connect(config.db_url); 


app.use(bodyParser.json()); 
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); 
app.use(bodyParser.urlencoded({ extended: true })); 

app.use(methodOverride('X-HTTP-Method-Override'));
app.use(express.static(__dirname + '/public')); 

// routes ==================================================
require('./app/routes')(app); 

// start app ===============================================
app.listen(port);	

console.log("server listening on "+ "localhost:" + port);
exports = module.exports = app;
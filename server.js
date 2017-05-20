var express = require('express'),
  app = express(),
  port = 8080,
  mongoose = require('mongoose'),
  livabilityScore = require('./api/models/livabilityScoreModel'),
  bodyParser = require('body-parser');
  require('dotenv').config();

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/crime');

var db = mongoose.connection;
db.on('error', function () {
  throw new Error('unable to connect to database at ' + mongoUri);
});

db.on('open', function() {
  console.log("db opened");
})

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var routes = require('./api/routes/livabilityScoreRoutes');
routes(app);

console.log('livabilityScore RESTful API server started on: ' + port);

module.exports = app;

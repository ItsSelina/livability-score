var express = require('express'),
  app = express(),
  port = 8080,
  mongoose = require('mongoose'),
  livabilityScore = require('./api/models/livabilityScoreModel'),
  bodyParser = require('body-parser');
  require('dotenv').config();

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/db');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var routes = require('./api/routes/livabilityScoreRoutes');
routes(app);

console.log('livabilityScore RESTful API server started on: ' + port);

module.exports = app;

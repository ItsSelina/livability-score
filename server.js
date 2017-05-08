var express = require('express'),
  app = express(),
  port = process.env.PORT || 3000,
  mongoose = require('mongoose'),
  livabilityScore = require('./api/models/livabilityScoreModel'),
  bodyParser = require('body-parser');
  
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/db'); 


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var routes = require('./api/routes/livabilityScoreRoutes');
routes(app);


app.listen(port);


console.log('livabilityScore RESTful API server started on: ' + port);
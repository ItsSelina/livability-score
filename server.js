const app = require('express')(),
  port = 8080,
  mongoose = require('mongoose'),
  crimeSchema = require('./api/models/crime'),
  bodyParser = require('body-parser'),
  mongoUri = 'mongodb://localhost/crime'; // TODO: Use env var to specify mongodb uri

// Configure env variables
require('dotenv').config();

// Declare db schemas
mongoose.model('crime', crimeSchema, 'sf');

// Connect to mongo driver
mongoose.connect(mongoUri);
mongoose.Promise = global.Promise;
const db = mongoose.connection;
db.on('error', error => {
  throw new Error(`Unable to connect to database at ${mongoUri}!\nReason: ${error}`);
});
db.on('open', () => {
  console.log("MongoDB connection established");
})

// Register parsers
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Register routes
const routes = {
  score: require('./api/routes/score')
};
app.use('/score', routes.score);
app.use((req, res) => {
  res.status(404).send({ error: `Route ${req.originalUrl} not found!` })
});

console.log(`LivabilityScore RESTful API server started on: ${port}`);

module.exports = app;

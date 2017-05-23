'use strict';

const mongoose = require('mongoose');
const request = require('request');
const crimeModel = mongoose.model('crime');

const maxRestaurants = 700;
const maxRecreation = 300;
const maxCrime = 200;
const kmInCoordinates = 0.01;

/**
 * Helper function to generate a Promise wrapping common Yelp requests
 * @param lat Latitude of location
 * @param lng Longitude of location
 * @param type Term / type of location to search Yelp
 * @returns Promise containing Yelp request
 */
const getYelpRequestPromise = (lat, lng, type) => {
  const options = {
    headers: {
      'Authorization': `Bearer ${process.env.YELP_ACCESS_TOKEN}`
    },
    url: `https://api.yelp.com/v3/businesses/search?latitude=${lat}&longitude=${lng}&radius=1000&term=${type}`,
    json: true
  }
  return new Promise((resolve, reject) => {
    request(options, (error, response, body) => {
      if (error || body.total === undefined) {
        console.error(`Encountered error on fetching ${type} score, setting it to 0! Error: ${error || 'Unknown error.'}`);
        resolve(0);
      } else {
        resolve(body.total);
      }
    });
  });
};

/**
 * Calculate livability score from walkscore, yelp amenity scores, and crime score
 * @param req
 * @param res
 */
exports.getLivabilityScore = (req, res) => {
  // Validate request
  if (req.query.lat === undefined || req.query.lng === undefined) {
    res.json({ 'error': 'Invalid request. Please enter valid coordinates!' });
    return;
  }

  const lat = req.query.lat;
  const lng = req.query.lng;

  // Fetch walkscore and transit scores
  const walkscoreOptions = {
    url: `http://api.walkscore.com/score?format=json&lat=${lat}&lon=${lng}&transit=1&bike=1&wsapikey=${process.env.WALKSCORE_KEY}`,
    json: true
  };
  const fetchWalkScore = new Promise((resolve, reject) => {
    request(walkscoreOptions, (error, response, body) => {
      let scores = [0, 0];
      // Check for walkscore
      if (body.walkscore) {
        scores[0] = body.walkscore
      }
      // Check for transit score
      if (body.transit && body.transit.score) {
        scores[1] = body.transit.score
      }
      resolve(scores);
    });
  });

  // Fetch restaurant, gym, park, and mall scores from yelp
  const fetchRestaurantScore = getYelpRequestPromise(lat, lng, 'restaurant');
  const fetchGymScore = getYelpRequestPromise(lat, lng, 'gym');
  const fetchParkScore = getYelpRequestPromise(lat, lng, 'park');
  const fetchMallScore = getYelpRequestPromise(lat, lng, 'mall');

  // Fetch crime score from database
  const fetchCrimeScore = new Promise((resolve, reject) => {
      const latNum = Number(lat);
      const lngNum = Number(lng);
      crimeModel.count({
        'location.coordinates.0': { $gt: lngNum - kmInCoordinates, $lt: lngNum + kmInCoordinates},
        'location.coordinates.1': { $gt: latNum - kmInCoordinates, $lt: latNum + kmInCoordinates}},
        (error, count) => {
          if (error) {
            console.error(`Encountered error on fetching crime score, setting it to 0! Error: ${error || 'Unknown error.'}`);
            resolve(0);
          } else {
            resolve((maxCrime - count) * 100 /maxCrime);
          }
        });
  });

  // Merge promises and calculate scores
  Promise.all([fetchWalkScore, fetchRestaurantScore, fetchGymScore, fetchParkScore, fetchMallScore, fetchCrimeScore])
    .then(values => {
      // Walkscore & Transit scores
      const walkScore = values[0][0];
      const transitScore = values[0][1];

      // Normalize yelp scores
      let restaurantScore = Math.round(values[1] / maxRestaurants * 100);
      if (restaurantScore > 100) restaurantScore = 100;
      let recreationScore = Math.round((values[2] + values[3] + values[4]) * 100 / maxRecreation);
      if (recreationScore > 100) recreationScore = 100;

      // Crime score
      const crimeScore = values[5];

      // Calculate livability score
      const livabilityScore = Math.round(walkScore/8 + transitScore/8 + restaurantScore/4 + recreationScore/4 + crimeScore/4);
      res.json({
        'livabilityScore': livabilityScore,
        'walkScore': walkScore,
        'transitScore': transitScore,
        'restaurantScore': restaurantScore,
        'recreationScore': recreationScore,
        'crimeScore': crimeScore
      });
    })
    .catch((error) => {
      console.log(error);
      res.json({ "error": error });
    });
};

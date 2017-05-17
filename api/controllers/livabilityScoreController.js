'use strict';

const maxRestaurants = 700;
const maxRecreation = 300;

var mongoose = require('mongoose');
var request = require('request');

var errorMessage = "Please enter valid coordinates";

exports.getLivabilityScore = function(req, res) {
  var walkScoreUrl = `http://api.walkscore.com/score?format=json&lat=${req.query.lat}&lon=${req.query.lng}&transit=1&bike=1&wsapikey=${process.env.WALKSCORE_KEY}`;

  var yelpOptions = {
    headers: {
      'Authorization': `Bearer ${process.env.YELP_ACCESS_TOKEN}`
    }
  };

  function getYelpOptions(type) {
    yelpOptions.url = `https://api.yelp.com/v3/businesses/search?latitude=${req.query.lat}&longitude=${req.query.lng}&radius=1000&term=${type}`;
    return yelpOptions;
  }

  var fetchWalkScore = new Promise(
    function(resolve, reject) {
      request(walkScoreUrl, function(error, response, body) {
        if (error != null) reject(error);
        var walkScoreResponse = JSON.parse(body);

        var walkScore = walkScoreResponse.walkscore;
        var transitScore = walkScoreResponse.transit;

        if (!transitScore) reject(errorMessage);
        else resolve([walkScore, transitScore["score"]]);
      });
    });

  var fetchRestaurantScore = new Promise(
    function(resolve, reject) {
      request(getYelpOptions("restaurant"), function(error, response, body) {
        if (error != null) reject(error);
        var restaurantResponse = JSON.parse(body);
        var restaurantScore = restaurantResponse.total;

        if (!restaurantScore) reject(errorMessage);
        else {
          var restaurantScore = restaurantScore/maxRestaurants * 100;

          if (restaurantScore > 100) {
            restaurantScore = 100;
          }

          resolve(restaurantScore);
        }
      });
    });

  var fetchGymScore = new Promise(
    function(resolve, reject) {
      request(getYelpOptions("gym"), function(error, response, body) {
        if (error != null) reject(error);
        var gymResponse = JSON.parse(body);

        var gymScore = gymResponse.total;

        if (!gymScore) reject(errorMessage);
        else resolve(gymScore);
      });
    });

  var fetchParkScore = new Promise(
    function(resolve, reject) {
      request(getYelpOptions("park"), function(error, response, body) {
        if (error != null) reject(error);
        var parkResponse = JSON.parse(body);

        var parkScore = parkResponse.total;

        if (!parkScore) reject(errorMessage);
        else resolve(parkScore);
      });
    });

  var fetchMallScore = new Promise(
    function(resolve, reject) {
      request(getYelpOptions("mall"), function(error, response, body) {
        if (error != null) reject(error);
        var mallResponse = JSON.parse(body);

        var mallScore = mallResponse.total;

        if (!mallScore) reject(error);
        else resolve(mallScore);
      });
    });

  Promise.all([fetchWalkScore, fetchRestaurantScore, fetchGymScore,
    fetchParkScore, fetchMallScore])
    .then(values => {
      var walkScore = values[0][0];
      var transitScore = values[0][1];
      var restaurantScore = Math.round(values[1]);
      var recreationScore = Math.round((values[2] + values[3] + values[4]) * 100 / maxRecreation);

      if (recreationScore > 100) recreationScore = 100;

      var livabilityScore = Math.round(walkScore/6 + transitScore/6 + restaurantScore/3 + recreationScore/3);

      res.json({
        "livabilityScore":livabilityScore,
        "walkScore":walkScore,
        "transitScore":transitScore,
        "restaurantScore":restaurantScore,
        "recreationScore":recreationScore
      });
    })
    .catch(function(e) {
      res.json({"error":e});
      console.log(e);
    });
};

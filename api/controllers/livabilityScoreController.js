'use strict';

const maxRestaurants = 700;
const maxRecreation = 300;

var mongoose = require('mongoose');
var request = require('request');

var livabilityScore;
var walkScore;
var transitScore;
var restaurantScore;
var recreationScore;

exports.getLivabilityScore = function(req, res) {

  var restaurantOptions = {
    url: `https://api.yelp.com/v3/businesses/search?latitude=${req.query.lat}&longitude=${req.query.lng}&radius=1000&term=restaurant`,
    headers: {
      'Authorization': `Bearer ${process.env.YELP_ACCESS_TOKEN}`
    }
  };

  var gymOptions = {
    url: `https://api.yelp.com/v3/businesses/search?latitude=${req.query.lat}&longitude=${req.query.lng}&radius=1000&term=gym`,
    headers: {
      'Authorization': `Bearer ${process.env.YELP_ACCESS_TOKEN}`
    }
  };

  var parkOptions = {
    url: `https://api.yelp.com/v3/businesses/search?latitude=${req.query.lat}&longitude=${req.query.lng}&radius=1000&term=park`,
    headers: {
      'Authorization': `Bearer ${process.env.YELP_ACCESS_TOKEN}`
    }
  };

  var mallOptions = {
    url: `https://api.yelp.com/v3/businesses/search?latitude=${req.query.lat}&longitude=${req.query.lng}&radius=1000&term=mall`,
    headers: {
      'Authorization': `Bearer ${process.env.YELP_ACCESS_TOKEN}`
    }
  };

  var walkScoreOptions = {
    url: `http://api.walkscore.com/score?format=json&lat=${req.query.lat}&lon=${req.query.lng}&transit=1&bike=1&wsapikey=${process.env.WALKSCORE_KEY}`
  };

  var fetchWalkScore = new Promise(
    function(resolve, reject) {
      request(walkScoreOptions, function(error, response, body) {
        if (error != null) reject(error);
        var walkScoreResponse = JSON.parse(body);

        resolve([walkScoreResponse.walkscore, walkScoreResponse.transit["score"]]);
      });
    });

  var fetchRestaurantScore = new Promise(
    function(resolve, reject) {
      request(restaurantOptions, function(error, response, body) {
        if (error != null) reject(error);
        var restaurantResponse = JSON.parse(body);
        restaurantScore = restaurantResponse.total/maxRestaurants * 100;

        if (restaurantScore > 100) {
          restaurantScore = 100;
        }

        resolve(restaurantScore);
      });
    });

  var fetchGymScore = new Promise(
    function(resolve, reject) {
      request(gymOptions, function(error, response, body) {
        if (error != null) reject(error);
        var gymResponse = JSON.parse(body);

        resolve(gymResponse.total);
      });
    });

  var fetchParkScore = new Promise(
    function(resolve, reject) {
      request(parkOptions, function(error, response, body) {
        if (error != null) reject(error);
        var parkResponse = JSON.parse(body);
        resolve(parkResponse.total);
      });
    });

  var fetchMallScore = new Promise(
    function(resolve, reject) {
      request(mallOptions, function(error, response, body) {
        if (error != null) reject(error);
        var mallResponse = JSON.parse(body);
        resolve(mallResponse.total);
      });
    });

  Promise.all([fetchWalkScore, fetchRestaurantScore, fetchGymScore,
    fetchParkScore, fetchMallScore])
    .then(values => {
      walkScore = values[0][0];
      transitScore = values[0][1];
      restaurantScore = Math.round(values[1]);
      recreationScore = Math.round((values[2] + values[3] + values[4]) * 100 / maxRecreation);

      if (recreationScore > 100) recreationScore = 100;

      livabilityScore = Math.round(walkScore/6 + transitScore/6 + restaurantScore/3 + recreationScore/3);

      res.json({
        "livabilityScore":livabilityScore,
        "walkScore":walkScore,
        "transitScore":transitScore,
        "restaurantScore":restaurantScore,
        "recreationScore":recreationScore
      });
    })
    .catch(function(e) {
      console.log(e);
    });
};

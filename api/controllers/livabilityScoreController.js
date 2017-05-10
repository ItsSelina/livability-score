'use strict';

const maxRestaurants = 700;
const maxRecreation = 300;

var mongoose = require('mongoose');
var request = require('request');
var rp = require('request-promise');

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

  rp(walkScoreOptions)
    .then(function(response) {
      var walkScoreResponse = JSON.parse(response);
      walkScore = walkScoreResponse.walkscore;
      transitScore = walkScoreResponse.transit.score;

      return rp(restaurantOptions);
    })
    .then(function(response) {
      var restaurantResponse = JSON.parse(response);
      restaurantScore = restaurantResponse.total/maxRestaurants * 100;

      if (restaurantScore > 100) {
        restaurantScore = 100;
      }

      return rp(gymOptions);
    })
    .then(function(response) {
      var gymResponse = JSON.parse(response);
      recreationScore = 0;
      recreationScore = recreationScore + gymResponse.total;

      return rp(parkOptions);
    })
    .then(function(response) {
      var parkResponse = JSON.parse(response);
      recreationScore = recreationScore + parkResponse.total;

      return rp(mallOptions);
    })
    .then(function(response) {
      var mallResponse = JSON.parse(response);
      recreationScore = recreationScore + mallResponse.total;
      //
      recreationScore = recreationScore * 100/maxRecreation;
      if (recreationScore > 100) recreationScore = 100;

      res.json({
        "walkScore":walkScore,
        "transitScore":transitScore,
        "restaurantScore":restaurantScore,
        "recreationScore":recreationScore});
    })
    .catch(err => console.log);
};

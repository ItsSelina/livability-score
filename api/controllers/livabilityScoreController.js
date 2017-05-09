'use strict';

var mongoose = require('mongoose');
var request = require('request');

exports.getLivabilityScore = function(req, res) {

  var options = {
    url: `https://api.yelp.com/v3/businesses/search?latitude=${req.query.lat}
    &longitude=${req.query.lng}&radius=1000&term=restaurants`,
    headers: {
      'Authorization': `Bearer ${process.env.YELP_ACCESS_TOKEN}`
    }
  };

  request(options, function (error, response, body) {
    console.log('error:', error);
    console.log('statusCode:', response && response.statusCode);
    console.log('body:', body);
    res.json(body);
  });
};

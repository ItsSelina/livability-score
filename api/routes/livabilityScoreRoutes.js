'use strict';
module.exports = function(app) {

  app.route('/score')
    .get(function(req, res) {
    	res.send("1234");
    });
};
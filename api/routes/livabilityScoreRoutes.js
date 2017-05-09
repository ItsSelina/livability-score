'use strict';
module.exports = function(app) {

  var controller = require('../controllers/livabilityScoreController');

  app.route('/score/')
    .get(controller.getLivabilityScore);
};
'use strict';
module.exports = function(app) {

  var controller = require('../controllers/livabilityScoreController');

  app.route('/score/')
    .get(controller.getLivabilityScore);

  app.route('/list/')
    .get(controller.listCrime);

  app.use(function(req, res) {
    res.status(404).send({error: req.originalUrl + ' not found'})
  });
};

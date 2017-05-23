'use strict';

const express = require('express');
const router = express.Router();
const controller = require('../controllers/scoreController');

router.route('/')
  .get(controller.getLivabilityScore);

module.exports = router;

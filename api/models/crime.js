'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CrimeSchema = new Schema({
  address: String
});

module.exports = CrimeSchema

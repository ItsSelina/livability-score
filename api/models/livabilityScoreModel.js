'use strict';
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CrimeSchema = new Schema({
  address: String,
});

mongoose.model('crime', CrimeSchema, "sf");

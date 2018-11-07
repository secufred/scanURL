'use strict';

var mongoose = require('mongoose'), Schema = mongoose.Schema;

var SiteInfoSchema = new Schema({
  img : {data : Buffer, contentType: String},
  url: String,
  ip: String
});


module.exports = mongoose.model('SiteInfo', SiteInfoSchema);
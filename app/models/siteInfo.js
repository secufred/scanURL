'use strict';

var mongoose = require('mongoose'), Schema = mongoose.Schema;

var SiteInfoSchema = new Schema({
  img : {data : Buffer,  contentType: String},
  url: String,
  ip: String,
  source : {type : String, default : 'n/a'},
  destination : {type : String, default : 'n/a'}
});

module.exports = mongoose.model('SiteInfo', SiteInfoSchema);
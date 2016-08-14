var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// set up a mongoose model
var LunchGroupSchema = new Schema({
  groupname:{
    type: String,
    required: true,
    unique: true
  },
  users:[{
    type: String,
    required: true
  }],
  origin:[{
    type: Number,
    required: true
  }]
});

module.exports = mongoose.model("LunchGroup", LunchGroupSchema);

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const itemSchema = new Schema({
   itemName: {
      type: String,
      required: true
   },
   itemExp: {
      type: Date,
      required: true
   },
   dateAdded: {
      type: Date,
      required: true
   },
   quantity: {
      type: Number,
      required: true
   },
   description: {
      type: String
   },
   userId: {
      type: Schema.Types.ObjectId,
      required: true
   }

});

module.exports = mongoose.model('Item', itemSchema);
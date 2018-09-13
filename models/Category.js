const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CategorySchema = new Schema({
  title: {
    type: String,
    required: true
  },
  slug: {
    type: String,
  },
});

module.exports = mongoose.model('Category', CategorySchema);
/**
 * Created by Richard on 14.07.2016.
 */
// import mongoose from 'mongoose';

const mongoose = require('mongoose');

const mappingSchema = new mongoose.Schema({
  patternId: { type: String, required: true },
  tacticId: { type: String, required: true },
  owner: { type: String, required: true },
	info: String,
	commentIds : Array,
	ratingNumb : Number,
	rating : Number,
});

mappingSchema.methods.addRating = (rating) => {
	this.ratingNumb += 1;
	this.rating += rating;
};

mappingSchema.methods.getRating = () => {
  return this.rating / this.ratingNumb;
};

module.exports = mongoose.model('Mapping', mappingSchema);

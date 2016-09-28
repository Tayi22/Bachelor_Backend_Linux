/**
 * Created by Richard on 14.07.2016.
 */
// import mongoose from 'mongoose';

const mongoose = require('mongoose');

const tacticsSchema = new mongoose.Schema({
  name: { type: String, index: { unique: true } },
  info: String,
  mappingIds: Array,
  parentTacticId: String,
  childTacticIds: Array,
});

module.exports = mongoose.model('Tactic', tacticsSchema);

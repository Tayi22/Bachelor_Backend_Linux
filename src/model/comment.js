// import mongoose from 'mongoose';

const mongoose = require('mongoose');


const commentMapping = new mongoose.Schema({
	username: {type: String, required: true},
	mappingId: {type: String, required: true},
	comment: {type: String, required: true},
	date: Date
})

module.exports = mongoose.model('Comment',commentMapping);

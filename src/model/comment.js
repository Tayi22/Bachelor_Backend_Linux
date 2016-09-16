import mongoose from 'mongoose';

const commentMapping = new mongoose.Schema({
	username: {type: String, required: true},
	mappingId: {type: String, required: true},
	comment: {type: String, required: true},
	date: Date
})

export default mongoose.model('Comment',commentMapping);

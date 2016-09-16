// import mongoose from 'mongoose' 

const mongoose = require('mongoose');
 
const patternSchema = new mongoose.Schema({ 
    name: String, 
    info: String, 
    mappingIds: Array, 
    relatedPatternIds: Array 
}); 
 
module.exports = mongoose.model('Pattern', patternSchema);
/**
 * Created by lukas on 14.07.2016.
 */

import mongoose from 'mongoose'

const patternSchema = new mongoose.Schema({
    name: String,
    info: String
});

export default mongoose.model('Pattern', patternSchema);
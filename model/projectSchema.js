const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    title : {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    tags: {
        type: String,
        required: true
    },
    visit : {
        type: String,
        required: true
    },
    code : {
        type: String,
        required: true
    }
})

const Project = mongoose.model('PROJECT', projectSchema);

module.exports = Project;
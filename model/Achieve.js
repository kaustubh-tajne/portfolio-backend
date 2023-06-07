const mongoose = require('mongoose');

const achieveSchema = new mongoose.Schema({
    count : {
        type: String,
        required: true
    },
    logo : {
        type: String
    }, 
    desc: {
        type: String
    },
    show: {
        type: Boolean
    }
})

const Achieve = new mongoose.model("ACHIEVE", achieveSchema);

module.exports = Achieve;
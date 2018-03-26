const mongoose = require('mongoose');

const Food = mongoose.model('Food', {
    name: {
        type: String,
        required: true,
        minlength: 1,
        trim: true
    }, carbs: {
        type: Number,
        required: true,
        min: 0
    },
    prot: {
        type: Number,
        required: true,
        min: 0
    },
    fat: {
        type: Number,
        required: true,
        min: 0
    },
    servingSize: {
        type: Number,
        required: true,
        min: 0.01
    },
    servingUnit: {
        type: String,
        required: true,
        minlength: 1,
        trim: true
    }
});

module.exports = {Food};

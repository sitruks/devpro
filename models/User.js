const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    // using namely due to current convention to use email over username
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    // adding in the option to pull the user's gravatar in a separate process to help auto-setup the user's profile
    avatar: {
        type: String,
        required: false
    },
    // setting a default date type for each entry for later validation
    date: {
        type: Date,
        default: Date.now
    },
});

module.exports = User = mongoose.model('user', UserSchema);
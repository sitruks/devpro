const mongoose = require('mongoose');
const config = require('config');
const db = config.get('mongoURI');

const connectDB = async () => {
    try {
        await mongoose.connect(db, {
            useCreateIndex: true,
            useFindAndModify: false,
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log(`You son of a bitch, YOU\'RE IN! \n(MongoDB Connected)`);
    } catch (err) {
        console.error(err.message);
        // Exit process with failure
        process.exit(1);
    }
}

module.exports = connectDB;
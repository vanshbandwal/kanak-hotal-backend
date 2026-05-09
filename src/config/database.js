const mongoose = require("mongoose");
const config = require('./config')

const connectDB = async () => {
    try {
        await mongoose.connect(config.mongoose.url);
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
}
module.exports = connectDB;
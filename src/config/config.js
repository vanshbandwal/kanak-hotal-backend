const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, '../../.env') });

const envVars = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: process.env.PORT || 3000,
    MONGODB_URL: process.env.MONGODB_URL,
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_ACCESS_EXPIRATION_MINUTES: process.env.JWT_ACCESS_EXPIRATION_MINUTES,
};
const { NODE_ENV, PORT, MONGODB_URL, JWT_SECRET, JWT_ACCESS_EXPIRATION_MINUTES } = envVars;

const mongooseConfig = {
    url: MONGODB_URL + (NODE_ENV === 'test' ? '-test' : ''),
};
const config = {
    env: NODE_ENV,
    port: PORT,
    mongoose: mongooseConfig,
    jwt: {
        secret: JWT_SECRET,
        accessExpirationMinutes: JWT_ACCESS_EXPIRATION_MINUTES,
    }
}

module.exports = config;

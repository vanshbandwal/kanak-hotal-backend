const http = require('http');
const express = require('express');
const mongoose = require('mongoose');
const app = require('./app');
const config = require('./config/config');
const connectDB = require('./config/database');

const server = http.createServer(app);
const port = config.port;
connectDB().then(() => {
    server.listen(port, () => console.log("Listening at PORT: ", port));
});
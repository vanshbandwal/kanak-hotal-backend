const express = require('express')
const helmet = require('helmet')
const cors = require('cors')
const config = require('./config/config')
const privateRoutes = require('./routes/v1/private')
const publicRoutes = require('./routes/v2/public')

const { notFound, errorHandler } = require('./middleware/errorMiddleware')

const app = express()

app.use(
    helmet({
        crossOriginResourcePolicy: { policy: "cross-origin" },
        contentSecurityPolicy: {
            directives: {
                ...helmet.contentSecurityPolicy.getDefaultDirectives(),
                "img-src": ["'self'", "data:", "*"],
                "frame-ancestors": ["*"],
            },
        },
    })
)
app.use(cors({
    origin: true,
    credentials: true,
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
const path = require('path')
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

app.use('/v1', privateRoutes)
app.use('/v2', publicRoutes)


// Error handling middleware
app.use(notFound)
app.use(errorHandler)

module.exports = app
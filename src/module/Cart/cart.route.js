const express = require('express')
const router = express.Router()
const { addToCart, getUserCart } = require('./cart.controller')
const authMiddleware = require('../../middlewares/auth.middleware')

router.post('/add-to-cart', authMiddleware, addToCart)
router.get('/get-user-cart', authMiddleware, getUserCart)

module.exports = router
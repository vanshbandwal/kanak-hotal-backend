const express = require('express')
const router = express.Router()
const { addToCart, getUserCart, removeFromCart, RemoveallItem } = require('./cart.controller')
const authMiddleware = require('../../middlewares/auth.middleware')

router.post('/add-to-cart', authMiddleware, addToCart)
router.get('/get-user-cart', authMiddleware, getUserCart)
router.post('/remove-from-cart', authMiddleware, removeFromCart)
router.delete('/remove-all-item',authMiddleware, RemoveallItem)

module.exports = router
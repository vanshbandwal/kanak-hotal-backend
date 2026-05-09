const express = require('express')
const router = express.Router()
const userRouter = require('../../module/User/user.route')
const adminRouter = require('../../module/Admin/admin.route')
const categoryRouter = require('../../module/Category/category.route')
const subcategoryRouter = require('../../module/Subcategory/subcategory.route')
const subSubcategoryRouter = require('../../module/SubSubcategory/subSubcategory.route')
const bannerRouter = require('../../module/Banner/banner.route')

router.use('/user', userRouter)
router.use('/admin', adminRouter)
router.use('/category', categoryRouter)
router.use('/subcategory', subcategoryRouter)
router.use('/sub-subcategory', subSubcategoryRouter)

// 🌍 PUBLIC Banner Access for Customers
router.get('/banner', bannerRouter);
router.get('/banner/:id', bannerRouter);

module.exports = router 
const monsgoose = require('mongoose');

const couponSchema = new monsgoose.Schema({
    code:{
        type:String,
        required:true,
        unique:true,
        trim:true
    },
    description:{
        type:String,
        trim:true
    },
    discountType:{
        type:String,
        enum:['percentage','fixed'],
        required:true
    },
    discountValue:{
        type:Number,
        required:true
    },
    minPurchaseAmount:{
        type:Number,
        default:0
    },
    maxDiscountAmount:{
        type:Number
    },
    startDate:{
        type:Date,
        required:true
    },
    endDate:{
        type:Date,
        required:true
    },
    usageLimit:{
        type:Number
    },
    userCountLimit:{
        type:Number
    },
    isActive:{
        type:Boolean,
        default:true
    },
},{timestamps:true})

module.exports = monsgoose.model('Coupon',couponSchema)         
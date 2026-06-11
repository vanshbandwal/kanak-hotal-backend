const AsyncHandler = require('express-async-handler');
const Order = require('../Order/order.model');
const Customer = require('../Customer/customer.model');
const Product = require('../Product/product.model');


/**
 * @desc    Get high-level overview statistics (KPIs)
 * @route   GET /api/report/overview
 * @access  Private (Admin)
 */
const getDashboardOverview = AsyncHandler(async (req, res) => {
    // 1. Setup Date Ranges based on filters
    const filterRange = req.query.range || 'last_30_days'; // today, last_7_days, last_30_days, this_month, this_year
    let startDate = new Date();
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(); // now

    if (filterRange === 'today') {
        // startDate is already today at 00:00:00
    } else if (filterRange === 'last_7_days') {
        startDate.setDate(startDate.getDate() - 7);
    } else if (filterRange === 'last_30_days') {
        startDate.setDate(startDate.getDate() - 30);
    } else if (filterRange === 'this_month') {
        startDate.setDate(1); // 1st of current month
    } else if (filterRange === 'this_year') {
        startDate.setMonth(0, 1); // Jan 1st of current year
    }

    // 2. Fetch KPIs
    // Total Active Customers
    const totalCustomers = await Customer.countDocuments({ status: { $ne: 'inactive' } });

    // Orders Aggregation Pipeline
    const orderStats = await Order.aggregate([
        {
            // Match orders within the date range and only successful/valid orders (e.g., exclude cancelled if needed)
            $match: {
                createdAt: { $gte: startDate, $lte: endDate },
                orderStatus: { $ne: 'cancelled' } 
            }
        },
        {
            // Group to calculate Total Revenue, Total Orders, Average Order Value
            $group: {
                _id: null,
                totalRevenue: { $sum: '$grandTotal' },
                totalOrders: { $sum: 1 },
                totalDiscount: { $sum: '$discountAmount' },
                totalTax: { $sum: '$taxAmount' }
            }
        }
    ]);

    const stats = orderStats.length > 0 ? orderStats[0] : {
        totalRevenue: 0,
        totalOrders: 0,
        totalDiscount: 0,
        totalTax: 0
    };

    const averageOrderValue = stats.totalOrders > 0 ? (stats.totalRevenue / stats.totalOrders) : 0;

    // 3. Simple Chart Data (Revenue per day for the selected range)
    // We group by the day using $dateToString
    const salesChartData = await Order.aggregate([
        {
            $match: {
                createdAt: { $gte: startDate, $lte: endDate },
                orderStatus: { $ne: 'cancelled' }
            }
        },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                dailyRevenue: { $sum: '$grandTotal' },
                dailyOrders: { $sum: 1 }
            }
        },
        {
            $sort: { _id: 1 } // Sort by date ascending
        }
    ]);

    // 4. Order Status Breakdown
    const orderStatusBreakdown = await Order.aggregate([
        { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
        {
            $group: {
                _id: '$orderStatus',
                count: { $sum: 1 }
            }
        }
    ]);

    // 5. Top Products (by quantity sold)
    const topProducts = await Order.aggregate([
        { $match: { createdAt: { $gte: startDate, $lte: endDate }, orderStatus: { $ne: 'cancelled' } } },
        { $unwind: '$items' },
        {
            $group: {
                _id: '$items.product',
                totalQuantity: { $sum: '$items.qty' },
                totalRevenue: { $sum: { $multiply: ['$items.qty', '$items.price'] } }
            }
        },
        { $sort: { totalQuantity: -1 } },
        { $limit: 5 },
        {
            $lookup: {
                from: 'products',
                localField: '_id',
                foreignField: '_id',
                as: 'productInfo'
            }
        },
        { $unwind: '$productInfo' },
        {
            $project: {
                name: '$productInfo.name',
                image: { $arrayElemAt: ['$productInfo.images', 0] },
                totalQuantity: 1,
                totalRevenue: 1
            }
        }
    ]);

    // 6. Sales by Category
    const salesByCategory = await Order.aggregate([
        { $match: { createdAt: { $gte: startDate, $lte: endDate }, orderStatus: { $ne: 'cancelled' } } },
        { $unwind: '$items' },
        {
            $lookup: {
                from: 'products',
                localField: 'items.product',
                foreignField: '_id',
                as: 'productInfo'
            }
        },
        { $unwind: '$productInfo' },
        {
            $lookup: {
                from: 'categories',
                localField: 'productInfo.category',
                foreignField: '_id',
                as: 'categoryInfo'
            }
        },
        { $unwind: { path: '$categoryInfo', preserveNullAndEmptyArrays: true } },
        {
            $group: {
                _id: '$categoryInfo.name',
                revenue: { $sum: { $multiply: ['$items.qty', '$items.price'] } }
            }
        },
        {
            $project: {
                name: { $ifNull: ['$_id', 'Uncategorized'] },
                revenue: 1,
                _id: 0
            }
        },
        { $sort: { revenue: -1 } }
    ]);

    res.status(200).json({
        success: true,
        data: {
            kpis: {
                totalCustomers,
                totalRevenue: stats.totalRevenue,
                totalOrders: stats.totalOrders,
                averageOrderValue,
                totalDiscount: stats.totalDiscount,
            },
            chart: salesChartData,
            orderStatusBreakdown,
            topProducts,
            salesByCategory
        }
    });
});

module.exports = {
    getDashboardOverview
};

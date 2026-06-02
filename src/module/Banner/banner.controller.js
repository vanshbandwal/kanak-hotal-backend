const AsyncHandler = require('express-async-handler');
const Banner = require('./banner.model');

// ➕ Create Banner
const createBanner = AsyncHandler(async (req, res) => {
    const bodyData = { ...req.body };

    if (req.file) {
        bodyData.image = req.file.path;
    }

    const newBanner = new Banner(bodyData);
    await newBanner.save();

    res.status(201).json({ success: true, 
        message: "Banner created successfully",
        data: newBanner
    });
});

// 📖 Get All Banners (Paginated)
const getAllBanners = AsyncHandler(async (req, res) => {
    const { isActive, type, search, page = 1, limit = 10, sort = 'order', order = 'asc' } = req.query;
    const query = {};
    
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (type) query.type = type;
    if (search) {
        query.$or = [
            { title: { $regex: search, $options: 'i' } },
            { subtitle: { $regex: search, $options: 'i' } }
        ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = {};
    sortOptions[sort] = order === 'desc' ? -1 : 1;

    const totalItems = await Banner.countDocuments(query);
    const banners = await Banner.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit));

    res.status(200).json({ success: true, 
        data: banners,
        pagination: {
            totalItems,
            totalPages: Math.ceil(totalItems / limit),
            currentPage: parseInt(page),
            limit: parseInt(limit)
        }
    });
});

// 🔎 Get Single Banner
const getBannerById = AsyncHandler(async (req, res) => {
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
        res.status(404);
        throw new Error("Banner not found");
    }

    res.status(200).json({ success: true,  data: banner });
});

// 🖊️ Update Banner
const updateBanner = AsyncHandler(async (req, res) => {
    const bodyData = { ...req.body };
    if (req.file) {
        bodyData.image = req.file.path;
    }

    const updatedBanner = await Banner.findByIdAndUpdate(
        req.params.id,
        { $set: bodyData },
        { new: true, runValidators: true }
    );

    if (!updatedBanner) {
        res.status(404);
        throw new Error("Banner not found");
    }

    res.status(200).json({ success: true,  message: "Banner updated successfully", data: updatedBanner });
});

// 🗑️ Delete Banner
const deleteBanner = AsyncHandler(async (req, res) => {
    const banner = await Banner.findByIdAndDelete(req.params.id);
    if (!banner) {
        res.status(404);
        throw new Error("Banner not found");
    }

    res.status(200).json({ success: true,  message: "Banner deleted successfully" });
});

module.exports = {
    createBanner,
    getAllBanners,
    getBannerById,
    updateBanner,
    deleteBanner
};

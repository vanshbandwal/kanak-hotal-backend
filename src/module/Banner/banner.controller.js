const Banner = require('./banner.model');

// ➕ Create Banner
const createBanner = async (req, res) => {
    try {
        const bodyData = { ...req.body };

        if (req.file) {
            bodyData.image = req.file.path;
        }

        const newBanner = new Banner(bodyData);
        await newBanner.save();

        res.status(201).json({
            success: true,
            message: "Banner created successfully",
            data: newBanner
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 📖 Get All Banners (Paginated)
const getAllBanners = async (req, res) => {
    try {
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

        res.status(200).json({
            success: true,
            data: banners,
            pagination: {
                totalItems,
                totalPages: Math.ceil(totalItems / limit),
                currentPage: parseInt(page),
                limit: parseInt(limit)
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 🔎 Get Single Banner
const getBannerById = async (req, res) => {
    try {
        const banner = await Banner.findById(req.params.id);
        if (!banner) return res.status(404).json({ success: false, message: "Banner not found" });

        res.status(200).json({ success: true, data: banner });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 🖊️ Update Banner
const updateBanner = async (req, res) => {
    try {
        const bodyData = { ...req.body };
        if (req.file) {
            bodyData.image = req.file.path;
        }

        const updatedBanner = await Banner.findByIdAndUpdate(
            req.params.id,
            { $set: bodyData },
            { new: true, runValidators: true }
        );

        if (!updatedBanner) return res.status(404).json({ success: false, message: "Banner not found" });

        res.status(200).json({ success: true, message: "Banner updated successfully", data: updatedBanner });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 🗑️ Delete Banner
const deleteBanner = async (req, res) => {
    try {
        const banner = await Banner.findByIdAndDelete(req.params.id);
        if (!banner) return res.status(404).json({ success: false, message: "Banner not found" });

        res.status(200).json({ success: true, message: "Banner deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    createBanner,
    getAllBanners,
    getBannerById,
    updateBanner,
    deleteBanner
};

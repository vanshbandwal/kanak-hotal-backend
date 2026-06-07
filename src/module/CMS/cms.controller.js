const AsyncHandler = require('express-async-handler');
const CmsPage = require('./cmsPage.model');
const Faq = require('./faq.model');

/**
 * @desc    Get a CMS page by its key
 * @route   GET /api/v1/cms/page/:pageKey
 * @access  Public
 */
const getCmsPage = AsyncHandler(async (req, res) => {
    const { pageKey } = req.params;
    
    // Using findOne because pageKey is unique
    let page = await CmsPage.findOne({ pageKey });

    // If page doesn't exist yet in the DB, return a default empty structure
    // so the frontend doesn't crash
    if (!page) {
        page = {
            pageKey,
            title: pageKey.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
            content: '',
            isActive: true
        };
    }

    res.status(200).json({
        success: true,
        data: page
    });
});

/**
 * @desc    Create or update a CMS page
 * @route   PUT /api/v1/cms/page/:pageKey
 * @access  Private (Admin)
 */
const updateCmsPage = AsyncHandler(async (req, res) => {
    const { pageKey } = req.params;
    const { title, content, isActive } = req.body;

    // We use findOneAndUpdate with upsert: true. 
    // This creates the document if it doesn't exist, or updates it if it does.
    const updatedPage = await CmsPage.findOneAndUpdate(
        { pageKey },
        { title, content, isActive },
        { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({
        success: true,
        message: 'Page updated successfully',
        data: updatedPage
    });
});

/**
 * @desc    Get all FAQs
 * @route   GET /api/v1/cms/faq
 * @access  Public
 */
const getAllFaqs = AsyncHandler(async (req, res) => {
    // Optionally filter by isActive if it's a public request, 
    // but for Admin we usually want to see all.
    const isAdmin = req.user && (req.user.role === 'admin' || req.user.role === 'super_admin');
    const filter = isAdmin ? {} : { isActive: true };

    const faqs = await Faq.find(filter).sort({ order: 1, createdAt: -1 });

    res.status(200).json({
        success: true,
        data: faqs
    });
});

/**
 * @desc    Create a new FAQ
 * @route   POST /api/v1/cms/faq
 * @access  Private (Admin)
 */
const createFaq = AsyncHandler(async (req, res) => {
    const { question, answer, order, isActive } = req.body;

    const newFaq = await Faq.create({
        question,
        answer,
        order: order || 0,
        isActive: isActive !== undefined ? isActive : true
    });

    res.status(201).json({
        success: true,
        message: 'FAQ created successfully',
        data: newFaq
    });
});

/**
 * @desc    Update an FAQ
 * @route   PUT /api/v1/cms/faq/:id
 * @access  Private (Admin)
 */
const updateFaq = AsyncHandler(async (req, res) => {
    const { id } = req.params;

    const updatedFaq = await Faq.findByIdAndUpdate(
        id,
        req.body,
        { new: true, runValidators: true }
    );

    if (!updatedFaq) {
        res.status(404);
        throw new Error('FAQ not found');
    }

    res.status(200).json({
        success: true,
        message: 'FAQ updated successfully',
        data: updatedFaq
    });
});

/**
 * @desc    Delete an FAQ
 * @route   DELETE /api/v1/cms/faq/:id
 * @access  Private (Admin)
 */
const deleteFaq = AsyncHandler(async (req, res) => {
    const { id } = req.params;

    const deletedFaq = await Faq.findByIdAndDelete(id);

    if (!deletedFaq) {
        res.status(404);
        throw new Error('FAQ not found');
    }

    res.status(200).json({
        success: true,
        message: 'FAQ deleted successfully'
    });
});

module.exports = {
    getCmsPage,
    updateCmsPage,
    getAllFaqs,
    createFaq,
    updateFaq,
    deleteFaq
};

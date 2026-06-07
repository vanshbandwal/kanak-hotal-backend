const express = require('express');
const router = express.Router();
const cmsController = require('./cms.controller');
const validate = require('../../middlewares/validate');
const cmsSchemas = require('./cms.validation');
const authMiddleware = require('../../middlewares/auth.middleware');
const { checkPermission } = require('../../middleware/rbac.middleware'); // Check exact path in your project

// Public Routes (For mobile app and frontend users to read)
router.get('/page/:pageKey', cmsController.getCmsPage);
router.get('/faq', cmsController.getAllFaqs);

// Admin Routes (Protected)
// Assuming "EDIT_CMS" is the permission, or similar.
router.put('/page/:pageKey', 
    authMiddleware, 
    checkPermission('EDIT_CMS'), 
    validate(cmsSchemas.updateCmsPage), 
    cmsController.updateCmsPage
);

router.post('/faq', 
    authMiddleware, 
    checkPermission('EDIT_CMS'), 
    validate(cmsSchemas.createFaq), 
    cmsController.createFaq
);

router.put('/faq/:id', 
    authMiddleware, 
    checkPermission('EDIT_CMS'), 
    validate(cmsSchemas.updateFaq), 
    cmsController.updateFaq
);

router.delete('/faq/:id', 
    authMiddleware, 
    checkPermission('EDIT_CMS'), 
    validate(cmsSchemas.faqIdParam), 
    cmsController.deleteFaq
);

module.exports = router;

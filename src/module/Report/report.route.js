const express = require('express');
const router = express.Router();
const { getDashboardOverview } = require('./report.controller');
const validate = require('../../middlewares/validate');
const reportValidation = require('./report.validation');

// Import authentication middleware if required.
// For now, assuming private routes automatically use authentication middleware in private.js

router.route('/overview').get(validate(reportValidation.getOverview), getDashboardOverview);

module.exports = router;

const express = require('express');
const router = express.Router();
const validate = require('../../middlewares/validate');
const unitSchemas = require('./unit.validation');
const {
    createUnit,
    getAllUnits,
    getUnitById,
    updateUnit,
    deleteUnit,
    toggleUnitStatus
} = require('./unit.controller');

const authMiddleware = require('../../middlewares/auth.middleware');
const { checkPermission } = require('../../middleware/rbac.middleware');

router.post('/create', authMiddleware, checkPermission("CREATE_UNIT"), validate(unitSchemas.createUnit), createUnit);
router.get('/', authMiddleware, checkPermission("VIEW_UNIT"), getAllUnits);
router.get('/:id', authMiddleware, checkPermission("VIEW_UNIT"), validate(unitSchemas.unitIdParam), getUnitById);
router.put('/update/:id', authMiddleware, checkPermission("EDIT_UNIT"), validate(unitSchemas.updateUnit), updateUnit);
router.delete('/delete/:id', authMiddleware, checkPermission("DELETE_UNIT"), validate(unitSchemas.unitIdParam), deleteUnit);
router.patch('/toggle-status/:id', authMiddleware, checkPermission("EDIT_UNIT"), validate(unitSchemas.unitIdParam), toggleUnitStatus);



module.exports = router;


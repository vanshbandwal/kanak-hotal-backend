const Joi = require('joi');

/**
 * Middleware to validate request data using Joi
 * @param {Object} schemas - Object containing Joi schemas for body, query, and params
 */
const validate = (schemas) => {
    return (req, res, next) => {
        // Helper to convert absolute path to relative 'uploads/...' path
        const toRelative = (fullPath) => {
            if (!fullPath || typeof fullPath !== 'string') return fullPath;
            const index = fullPath.indexOf('uploads');
            return index !== -1 ? fullPath.substring(index).replace(/\\/g, '/') : fullPath;
        };

        // If files are uploaded via multer, ensure they pass Joi string validation
        // by populating the corresponding body fields with the file path.
        if (req.file) {
            req.body[req.file.fieldname] = toRelative(req.file.path);
        }
        if (req.files) {
            if (Array.isArray(req.files)) {
                // Handle multer.array() or multer.any()
                req.files.forEach(file => {
                    const relPath = toRelative(file.path);
                    if (req.body[file.fieldname]) {
                        if (Array.isArray(req.body[file.fieldname])) {
                            req.body[file.fieldname].push(relPath);
                        } else {
                            req.body[file.fieldname] = [req.body[file.fieldname], relPath];
                        }
                    } else {
                        req.body[file.fieldname] = relPath;
                    }
                });
            } else {
                // Handle multer.fields()
                Object.keys(req.files).forEach(key => {
                    const files = req.files[key];
                    if (Array.isArray(files)) {
                        if (files.length === 1 && key !== 'images' && key !== 'gallery') {
                            // If it's a single file field, map to string
                            req.body[key] = toRelative(files[0].path);
                        } else {
                            // Map to array of paths for gallery/images
                            req.body[key] = files.map(file => toRelative(file.path));
                        }
                    }
                });
            }
        }

        // Clean up any remaining objects in body that should be strings (like 'image' if not caught above)
        // This handles cases where a File object might be sent but not handled by Multer
        if (req.body) {
            Object.keys(req.body).forEach(key => {
                if (req.body[key] && typeof req.body[key] === 'object' && !Array.isArray(req.body[key])) {
                    // If the schema expects a string but we have an object, and it's a common file field
                    if (['image', 'thumbnail', 'file', 'avatar', 'logo', 'mainImage', 'cover'].includes(key)) {
                        // If we didn't get a file from multer for this key, just remove the object 
                        // to allow Joi's .allow('', null) or .optional() to work
                        delete req.body[key];
                    }
                }
            });
        }

        const validations = [];

        // Validate req.body if schema is provided
        if (schemas.body) {
            validations.push({
                data: req.body,
                schema: schemas.body,
                type: 'body'
            });
        }

        // Validate req.params if schema is provided
        if (schemas.params) {
            validations.push({
                data: req.params,
                schema: schemas.params,
                type: 'params'
            });
        }

        // Validate req.query if schema is provided
        if (schemas.query) {
            validations.push({
                data: req.query,
                schema: schemas.query,
                type: 'query'
            });
        }

        const errors = [];

        validations.forEach(({ data, schema, type }) => {
            const { error, value } = schema.validate(data, {
                abortEarly: false,
                stripUnknown: true, // Remove unknown fields for security
                errors: {
                    wrap: {
                        label: ''
                    }
                }
            });

            if (error) {
                const errorMessage = error.details.map(detail => detail.message).join(', ');
                errors.push(`${type}: ${errorMessage}`);
            } else {
                // Update request data with sanitized/validated values
                if (type === 'body') req.body = value;
                if (type === 'params') req.params = value;
                if (type === 'query') req.query = value;
            }
        });

        if (errors.length > 0) {
            return res.status(400).json({
                status: false,
                message: 'Validation error',
                errors: errors
            });
        }

        next();
    };
};

module.exports = validate;

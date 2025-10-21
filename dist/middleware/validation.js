"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateQuery = exports.validateParams = exports.validateRequest = void 0;
const errorHandler_1 = require("./errorHandler");
const validateRequest = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, {
            abortEarly: false,
            allowUnknown: false,
            stripUnknown: true
        });
        if (error) {
            const errorDetails = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message,
                value: detail.context?.value
            }));
            const errorMessage = error.details.map(detail => detail.message).join(', ');
            const validationError = (0, errorHandler_1.createError)(`Validation error: ${errorMessage}`, 400);
            validationError.details = errorDetails;
            return next(validationError);
        }
        next();
    };
};
exports.validateRequest = validateRequest;
const validateParams = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.params, {
            abortEarly: false,
            allowUnknown: false,
            stripUnknown: true
        });
        if (error) {
            const errorDetails = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message,
                value: detail.context?.value
            }));
            const errorMessage = error.details.map(detail => detail.message).join(', ');
            const validationError = (0, errorHandler_1.createError)(`Parameter validation error: ${errorMessage}`, 400);
            validationError.details = errorDetails;
            return next(validationError);
        }
        next();
    };
};
exports.validateParams = validateParams;
const validateQuery = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.query, {
            abortEarly: false,
            allowUnknown: false,
            stripUnknown: true
        });
        if (error) {
            const errorDetails = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message,
                value: detail.context?.value
            }));
            const errorMessage = error.details.map(detail => detail.message).join(', ');
            const validationError = (0, errorHandler_1.createError)(`Query validation error: ${errorMessage}`, 400);
            validationError.details = errorDetails;
            return next(validationError);
        }
        next();
    };
};
exports.validateQuery = validateQuery;
//# sourceMappingURL=validation.js.map
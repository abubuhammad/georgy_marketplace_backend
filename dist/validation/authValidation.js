"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.authValidation = void 0;
const Joi = __importStar(require("joi"));
const userRoles = ['customer', 'seller', 'admin', 'delivery', 'realtor', 'house_agent', 'house_owner', 'employer', 'job_seeker', 'artisan'];
exports.authValidation = {
    register: Joi.object({
        email: Joi.string()
            .email()
            .required()
            .messages({
            'string.email': 'Please provide a valid email address',
            'any.required': 'Email is required'
        }),
        password: Joi.string()
            .min(8)
            .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)'))
            .required()
            .messages({
            'string.min': 'Password must be at least 8 characters long',
            'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
            'any.required': 'Password is required'
        }),
        firstName: Joi.string()
            .trim()
            .min(2)
            .max(50)
            .required()
            .messages({
            'string.min': 'First name must be at least 2 characters long',
            'string.max': 'First name must not exceed 50 characters',
            'any.required': 'First name is required'
        }),
        lastName: Joi.string()
            .trim()
            .min(2)
            .max(50)
            .required()
            .messages({
            'string.min': 'Last name must be at least 2 characters long',
            'string.max': 'Last name must not exceed 50 characters',
            'any.required': 'Last name is required'
        }),
        role: Joi.string()
            .valid(...userRoles)
            .default('customer')
            .messages({
            'any.only': `Role must be one of: ${userRoles.join(', ')}`
        })
    }),
    login: Joi.object({
        email: Joi.string()
            .email()
            .required()
            .messages({
            'string.email': 'Please provide a valid email address',
            'any.required': 'Email is required'
        }),
        password: Joi.string()
            .required()
            .messages({
            'any.required': 'Password is required'
        })
    }),
    updateProfile: Joi.object({
        firstName: Joi.string()
            .trim()
            .min(2)
            .max(50)
            .optional()
            .messages({
            'string.min': 'First name must be at least 2 characters long',
            'string.max': 'First name must not exceed 50 characters'
        }),
        lastName: Joi.string()
            .trim()
            .min(2)
            .max(50)
            .optional()
            .messages({
            'string.min': 'Last name must be at least 2 characters long',
            'string.max': 'Last name must not exceed 50 characters'
        }),
        avatar: Joi.string()
            .uri()
            .optional()
            .allow(null, '')
            .messages({
            'string.uri': 'Avatar must be a valid URL'
        })
    }),
    changePassword: Joi.object({
        currentPassword: Joi.string()
            .required()
            .messages({
            'any.required': 'Current password is required'
        }),
        newPassword: Joi.string()
            .min(8)
            .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)'))
            .required()
            .messages({
            'string.min': 'New password must be at least 8 characters long',
            'string.pattern.base': 'New password must contain at least one uppercase letter, one lowercase letter, and one number',
            'any.required': 'New password is required'
        })
    }),
    requestPasswordReset: Joi.object({
        email: Joi.string()
            .email()
            .required()
            .messages({
            'string.email': 'Please provide a valid email address',
            'any.required': 'Email is required'
        })
    }),
    resetPassword: Joi.object({
        token: Joi.string()
            .required()
            .messages({
            'any.required': 'Reset token is required'
        }),
        newPassword: Joi.string()
            .min(8)
            .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)'))
            .required()
            .messages({
            'string.min': 'New password must be at least 8 characters long',
            'string.pattern.base': 'New password must contain at least one uppercase letter, one lowercase letter, and one number',
            'any.required': 'New password is required'
        })
    }),
    refreshToken: Joi.object({
        refreshToken: Joi.string()
            .required()
            .messages({
            'any.required': 'Refresh token is required'
        })
    })
};
//# sourceMappingURL=authValidation.js.map
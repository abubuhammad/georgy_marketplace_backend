"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jobRoutes = void 0;
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
exports.jobRoutes = router;
// Public routes
router.get('/', auth_1.optionalAuth, (req, res) => {
    res.json({
        success: true,
        message: 'Jobs API endpoint',
        data: { jobs: [] }
    });
});
router.get('/:id', auth_1.optionalAuth, (req, res) => {
    res.json({
        success: true,
        message: 'Get job by ID',
        data: { job: null }
    });
});
// Protected routes
router.use(auth_1.authenticateToken);
router.post('/', (req, res) => {
    res.json({
        success: true,
        message: 'Create job posting',
        data: { job: null }
    });
});
router.post('/:id/apply', (req, res) => {
    res.json({
        success: true,
        message: 'Apply for job',
        data: { application: null }
    });
});
//# sourceMappingURL=jobs.js.map
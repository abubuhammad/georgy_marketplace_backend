"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentController = exports.generateInvoice = exports.getPaymentHistory = exports.verifyPayment = exports.calculatePayment = exports.getSellerPayouts = exports.getUserPayments = exports.getFinancialReports = exports.getSellerFinancials = exports.calculateBreakdown = exports.getPaymentConfig = exports.processRefund = exports.releaseEscrow = exports.handleWebhook = exports.getPayment = exports.initiatePayment = void 0;
const paymentService_1 = require("../services/paymentService");
const errorHandler_1 = require("../middleware/errorHandler");
require("../types"); // Import type definitions
// Define payment methods enum
var PaymentMethod;
(function (PaymentMethod) {
    PaymentMethod["card"] = "card";
    PaymentMethod["bank_transfer"] = "bank_transfer";
    PaymentMethod["ussd"] = "ussd";
    PaymentMethod["qr"] = "qr";
    PaymentMethod["mobile_money"] = "mobile_money";
    PaymentMethod["bank"] = "bank";
})(PaymentMethod || (PaymentMethod = {}));
// Initialize payment
exports.initiatePayment = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { orderId, serviceRequestId, amount, currency = 'NGN', method, description, escrow = false, metadata } = req.body;
    // Validate required fields
    if (!amount || amount <= 0) {
        return res.status(400).json({
            success: false,
            error: 'Valid amount is required'
        });
    }
    if (!method || !Object.values(PaymentMethod).includes(method)) {
        return res.status(400).json({
            success: false,
            error: 'Valid payment method is required'
        });
    }
    // Optional: Get seller ID from order or service request
    let sellerId;
    // TODO: Fetch sellerId based on orderId or serviceRequestId
    const result = await paymentService_1.PaymentService.initiatePayment({
        userId: req.user.id,
        sellerId,
        orderId,
        serviceRequestId,
        amount: parseFloat(amount),
        currency,
        method,
        description,
        escrow,
        metadata
    });
    if (!result.success) {
        return res.status(400).json(result);
    }
    res.status(201).json(result);
});
// Get payment by reference
exports.getPayment = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { reference } = req.params;
    const payment = await paymentService_1.PaymentService.getPaymentByReference(reference);
    if (!payment) {
        return res.status(404).json({
            success: false,
            error: 'Payment not found'
        });
    }
    res.json({
        success: true,
        data: { payment }
    });
});
// Payment webhook handler
exports.handleWebhook = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { provider } = req.params;
    const payload = req.body;
    const success = await paymentService_1.PaymentService.processWebhook(provider, payload);
    if (!success) {
        return res.status(400).json({
            success: false,
            error: 'Failed to process webhook'
        });
    }
    res.json({
        success: true,
        message: 'Webhook processed successfully'
    });
});
// Release escrow payment
exports.releaseEscrow = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { paymentId } = req.params;
    const userId = req.user.id;
    // TODO: Add authorization checks (only customer, artisan, or admin can release)
    const success = await paymentService_1.PaymentService.releaseEscrow(paymentId, userId);
    if (!success) {
        return res.status(400).json({
            success: false,
            error: 'Failed to release escrow payment'
        });
    }
    res.json({
        success: true,
        message: 'Escrow payment released successfully'
    });
});
// Process refund
exports.processRefund = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { paymentId } = req.params;
    const { amount, reason } = req.body;
    const userId = req.user.id;
    // TODO: Add authorization checks (only admin or customer can request refund)
    if (!amount || amount <= 0) {
        return res.status(400).json({
            success: false,
            error: 'Valid refund amount is required'
        });
    }
    if (!reason) {
        return res.status(400).json({
            success: false,
            error: 'Refund reason is required'
        });
    }
    const success = await paymentService_1.PaymentService.processRefund(paymentId, amount, reason, userId);
    if (!success) {
        return res.status(400).json({
            success: false,
            error: 'Failed to process refund'
        });
    }
    res.json({
        success: true,
        message: 'Refund processed successfully'
    });
});
// Get payment configuration
exports.getPaymentConfig = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const config = await paymentService_1.PaymentService.getPaymentConfig();
    res.json({
        success: true,
        data: config
    });
});
// Calculate payment breakdown
exports.calculateBreakdown = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { amount, currency = 'NGN', sellerId, category, userType, escrow = false } = req.body;
    if (!amount || amount <= 0) {
        return res.status(400).json({
            success: false,
            error: 'Valid amount is required'
        });
    }
    const breakdown = await paymentService_1.PaymentService.calculatePaymentBreakdown({
        amount: parseFloat(amount),
        currency,
        sellerId,
        category,
        userType,
        escrow
    });
    res.json({
        success: true,
        data: { breakdown }
    });
});
// Get seller financial summary
exports.getSellerFinancials = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { sellerId } = req.params;
    const userId = req.user.id;
    // TODO: Check authorization - user must be the seller or admin
    const financials = await paymentService_1.PaymentService.getSellerFinancials(sellerId);
    res.json({
        success: true,
        data: financials
    });
});
// Get financial reports (admin only)
exports.getFinancialReports = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    // TODO: Check admin authorization
    const { startDate, endDate, groupBy = 'day' } = req.query;
    const reports = await paymentService_1.PaymentService.getFinancialReports({
        startDate: startDate,
        endDate: endDate,
        groupBy: groupBy
    });
    res.json({
        success: true,
        data: reports
    });
});
// Get user payments
exports.getUserPayments = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user.id;
    const { page = 1, limit = 20, status, method } = req.query;
    const payments = await paymentService_1.PaymentService.getUserPayments(userId, {
        page: parseInt(page),
        limit: parseInt(limit),
        status: status,
        method: method
    });
    res.json({
        success: true,
        data: payments
    });
});
// Get seller payouts
exports.getSellerPayouts = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { sellerId } = req.params;
    const userId = req.user.id;
    // TODO: Check authorization
    const { page = 1, limit = 20, status } = req.query;
    const payouts = await paymentService_1.PaymentService.getSellerPayouts(sellerId, {
        page: parseInt(page),
        limit: parseInt(limit),
        status: status
    });
    res.json({
        success: true,
        data: payouts
    });
});
// Additional payment methods
exports.calculatePayment = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { amount, currency = 'NGN', method, sellerId, category, userType, escrow = false } = req.body;
    if (!amount || amount <= 0) {
        return res.status(400).json({
            success: false,
            error: 'Valid amount is required'
        });
    }
    // Use the existing calculateBreakdown logic
    const breakdown = await paymentService_1.PaymentService.calculatePaymentBreakdown({
        amount: parseFloat(amount),
        currency,
        sellerId,
        category,
        userType,
        escrow
    });
    res.json({
        success: true,
        data: breakdown
    });
});
exports.verifyPayment = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { reference } = req.params;
    // This would integrate with payment provider to verify payment status
    const verification = await paymentService_1.PaymentService.verifyPaymentStatus(reference);
    res.json({
        success: true,
        data: verification
    });
});
exports.getPaymentHistory = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user.id;
    const { page = 1, limit = 20, status, dateFrom, dateTo } = req.query;
    const history = await paymentService_1.PaymentService.getPaymentHistory(userId, {
        page: parseInt(page),
        limit: parseInt(limit),
        status: status, // This will be handled in the service
        dateFrom: dateFrom ? new Date(dateFrom) : undefined,
        dateTo: dateTo ? new Date(dateTo) : undefined
    });
    res.json({
        success: true,
        data: history
    });
});
exports.generateInvoice = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { paymentId } = req.params;
    const userId = req.user.id;
    // Generate invoice for the payment
    const invoice = await paymentService_1.PaymentService.generateInvoice(paymentId);
    res.json({
        success: true,
        data: invoice
    });
});
// Export as object for easier importing
exports.paymentController = {
    initiatePayment: exports.initiatePayment,
    getPayment: exports.getPayment,
    handleWebhook: exports.handleWebhook,
    releaseEscrow: exports.releaseEscrow,
    processRefund: exports.processRefund,
    getPaymentConfig: exports.getPaymentConfig,
    calculateBreakdown: exports.calculateBreakdown,
    calculatePayment: exports.calculatePayment,
    verifyPayment: exports.verifyPayment,
    getPaymentHistory: exports.getPaymentHistory,
    generateInvoice: exports.generateInvoice,
    getSellerFinancials: exports.getSellerFinancials,
    getFinancialReports: exports.getFinancialReports,
    getUserPayments: exports.getUserPayments,
    getSellerPayouts: exports.getSellerPayouts
};
//# sourceMappingURL=paymentController.js.map
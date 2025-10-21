import { Request, Response } from 'express';
import { PaymentService } from '../services/paymentService';
import { asyncHandler } from '../middleware/errorHandler';
import '../types'; // Import type definitions
// Define payment methods enum
enum PaymentMethod {
  card = 'card',
  bank_transfer = 'bank_transfer',
  ussd = 'ussd',
  qr = 'qr',
  mobile_money = 'mobile_money',
  bank = 'bank'
}

// Initialize payment
export const initiatePayment = asyncHandler(async (req: Request, res: Response) => {
  const {
    orderId,
    serviceRequestId,
    amount,
    currency = 'NGN',
    method,
    description,
    escrow = false,
    metadata
  } = req.body;

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
  let sellerId: string | undefined;
  // TODO: Fetch sellerId based on orderId or serviceRequestId

  const result = await PaymentService.initiatePayment({
    userId: req.user!.id,
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
export const getPayment = asyncHandler(async (req: Request, res: Response) => {
  const { reference } = req.params;

  const payment = await PaymentService.getPaymentByReference(reference);

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
export const handleWebhook = asyncHandler(async (req: Request, res: Response) => {
  const { provider } = req.params;
  const payload = req.body;

  const success = await PaymentService.processWebhook(provider, payload);

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
export const releaseEscrow = asyncHandler(async (req: Request, res: Response) => {
  const { paymentId } = req.params;
  const userId = req.user!.id;

  // TODO: Add authorization checks (only customer, artisan, or admin can release)

  const success = await PaymentService.releaseEscrow(paymentId, userId);

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
export const processRefund = asyncHandler(async (req: Request, res: Response) => {
  const { paymentId } = req.params;
  const { amount, reason } = req.body;
  const userId = req.user!.id;

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

  const success = await PaymentService.processRefund(paymentId, amount, reason, userId);

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
export const getPaymentConfig = asyncHandler(async (req: Request, res: Response) => {
  const config = await PaymentService.getPaymentConfig();

  res.json({
    success: true,
    data: config
  });
});

// Calculate payment breakdown
export const calculateBreakdown = asyncHandler(async (req: Request, res: Response) => {
  const { amount, currency = 'NGN', sellerId, category, userType, escrow = false } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({
      success: false,
      error: 'Valid amount is required'
    });
  }

  const breakdown = await PaymentService.calculatePaymentBreakdown({
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
export const getSellerFinancials = asyncHandler(async (req: Request, res: Response) => {
  const { sellerId } = req.params;
  const userId = req.user!.id;

  // TODO: Check authorization - user must be the seller or admin

  const financials = await PaymentService.getSellerFinancials(sellerId);

  res.json({
    success: true,
    data: financials
  });
});

// Get financial reports (admin only)
export const getFinancialReports = asyncHandler(async (req: Request, res: Response) => {
  // TODO: Check admin authorization

  const { startDate, endDate, groupBy = 'day' } = req.query;

  const reports = await PaymentService.getFinancialReports({
    startDate: startDate as string,
    endDate: endDate as string,
    groupBy: groupBy as string
  });

  res.json({
    success: true,
    data: reports
  });
});

// Get user payments
export const getUserPayments = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { page = 1, limit = 20, status, method } = req.query;

  const payments = await PaymentService.getUserPayments(userId, {
    page: parseInt(page as string),
    limit: parseInt(limit as string),
    status: status as string,
    method: method as string
  });

  res.json({
    success: true,
    data: payments
  });
});

// Get seller payouts
export const getSellerPayouts = asyncHandler(async (req: Request, res: Response) => {
  const { sellerId } = req.params;
  const userId = req.user!.id;

  // TODO: Check authorization

  const { page = 1, limit = 20, status } = req.query;

  const payouts = await PaymentService.getSellerPayouts(sellerId, {
    page: parseInt(page as string),
    limit: parseInt(limit as string),
    status: status as string
  });

  res.json({
    success: true,
    data: payouts
  });
});

// Additional payment methods
export const calculatePayment = asyncHandler(async (req: Request, res: Response) => {
  const { amount, currency = 'NGN', method, sellerId, category, userType, escrow = false } = req.body;
  
  if (!amount || amount <= 0) {
    return res.status(400).json({
      success: false,
      error: 'Valid amount is required'
    });
  }
  
  // Use the existing calculateBreakdown logic
  const breakdown = await PaymentService.calculatePaymentBreakdown({
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

export const verifyPayment = asyncHandler(async (req: Request, res: Response) => {
  const { reference } = req.params;
  
  // This would integrate with payment provider to verify payment status
  const verification = await PaymentService.verifyPaymentStatus(reference);
  
  res.json({
    success: true,
    data: verification
  });
});

export const getPaymentHistory = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { page = 1, limit = 20, status, dateFrom, dateTo } = req.query;
  
  const history = await PaymentService.getPaymentHistory(userId, {
    page: parseInt(page as string),
    limit: parseInt(limit as string),
    status: status as any, // This will be handled in the service
    dateFrom: dateFrom ? new Date(dateFrom as string) : undefined,
    dateTo: dateTo ? new Date(dateTo as string) : undefined
  });
  
  res.json({
    success: true,
    data: history
  });
});

export const generateInvoice = asyncHandler(async (req: Request, res: Response) => {
  const { paymentId } = req.params;
  const userId = req.user!.id;
  
  // Generate invoice for the payment
  const invoice = await PaymentService.generateInvoice(paymentId);
  
  res.json({
    success: true,
    data: invoice
  });
});

// Export as object for easier importing
export const paymentController = {
  initiatePayment,
  getPayment,
  handleWebhook,
  releaseEscrow,
  processRefund,
  getPaymentConfig,
  calculateBreakdown,
  calculatePayment,
  verifyPayment,
  getPaymentHistory,
  generateInvoice,
  getSellerFinancials,
  getFinancialReports,
  getUserPayments,
  getSellerPayouts
};

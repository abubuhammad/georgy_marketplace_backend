import { prisma } from '../lib/prisma';
import { config } from '../config/config';
// Define missing enums locally
enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded'
}

enum PaymentMethod {
  CARD = 'card',
  BANK_TRANSFER = 'bank_transfer',
  USSD = 'ussd',
  QR = 'qr',
  MOBILE_MONEY = 'mobile_money',
  BANK = 'bank'
}

enum PayoutStatus {
  SCHEDULED = 'scheduled',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

enum EscrowStatus {
  HELD = 'held',
  RELEASED = 'released',
  DISPUTED = 'disputed'
}

enum TaxType {
  VAT = 'vat',
  SALES_TAX = 'sales_tax',
  SERVICE_TAX = 'service_tax'
}

enum InvoiceType {
  SALE = 'sale',
  SERVICE = 'service',
  REFUND = 'refund'
}

export interface PaymentCalculationInput {
  amount: number;
  currency: string;
  sellerId?: string;
  category?: string;
  userType?: string;
  escrow?: boolean;
}

export interface PaymentBreakdown {
  subtotal: number;
  taxes: Array<{
    type: string;
    name: string;
    rate: number;
    amount: number;
  }>;
  fees: Array<{
    type: string;
    name: string;
    rate?: number;
    amount: number;
  }>;
  discount: number;
  total: number;
  platformCut: number;
  sellerNet: number;
}

export interface PaymentInitRequest {
  userId: string;
  sellerId?: string;
  orderId?: string;
  serviceRequestId?: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  description?: string;
  escrow?: boolean;
  metadata?: Record<string, any>;
}

export interface PaymentInitResponse {
  success: boolean;
  payment?: {
    id: string;
    reference: string;
    amount: number;
    breakdown: PaymentBreakdown;
    redirectUrl?: string;
    instructions?: string;
    qrCode?: string;
  };
  error?: string;
}

export class PaymentService {
  // Calculate payment breakdown with taxes and fees
  static async calculatePaymentBreakdown(input: PaymentCalculationInput): Promise<PaymentBreakdown> {
    const { amount, currency, sellerId, category, userType, escrow = false } = input;
    
    // Get active tax rules
    const taxRules = await prisma.taxRule.findMany({
      where: {
        isActive: true
      }
    });

    // Get revenue share scheme
    const revenueScheme = await prisma.revenueShareScheme.findFirst({
      where: {
        isActive: true,
        ...(category ? { category } : {})
      },
      orderBy: [
        { createdAt: 'desc' }
      ]
    });

    const subtotal = amount;
    const taxes: PaymentBreakdown['taxes'] = [];
    const fees: PaymentBreakdown['fees'] = [];
    let totalTaxes = 0;
    let totalFees = 0;

    // Calculate taxes
    for (const rule of taxRules) {
      // Percentage-based tax
      const taxAmount = subtotal * Number(rule.rate);

      taxes.push({
        type: rule.type,
        name: rule.name,
        rate: Number(rule.rate) * 100, // Convert to percentage
        amount: taxAmount
      });

      totalTaxes += taxAmount;
    }

    // Calculate platform fees
    const platformFeeRate = revenueScheme ? Number(revenueScheme.platformPercentage) : 0.025; // Default 2.5%
    const paymentFeeRate = 0.015; // Default 1.5%

    const platformFee = subtotal * platformFeeRate;
    const paymentFee = subtotal * paymentFeeRate;

    fees.push({
      type: 'platform',
      name: 'Platform Fee',
      rate: platformFeeRate * 100,
      amount: platformFee
    });

    fees.push({
      type: 'payment',
      name: 'Payment Processing Fee',
      rate: paymentFeeRate * 100,
      amount: paymentFee
    });

    // Escrow fee (if applicable)
    if (escrow) {
      const escrowFee = subtotal * 0.01; // 1% escrow fee
      fees.push({
        type: 'escrow',
        name: 'Escrow Service Fee',
        rate: 1,
        amount: escrowFee
      });
      totalFees += escrowFee;
    }

    totalFees += platformFee + paymentFee;

    const total = subtotal + totalTaxes;
    const platformCut = totalFees + totalTaxes;
    const sellerNet = subtotal - totalFees;

    return {
      subtotal,
      taxes,
      fees,
      discount: 0,
      total,
      platformCut,
      sellerNet
    };
  }

  // Initialize payment
  static async initiatePayment(request: PaymentInitRequest): Promise<PaymentInitResponse> {
    try {
      // Calculate payment breakdown
      const breakdown = await this.calculatePaymentBreakdown({
        amount: request.amount,
        currency: request.currency,
        sellerId: request.sellerId,
        escrow: request.escrow
      });

      // Generate unique reference
      const reference = `GEO_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`.toUpperCase();

      // Create payment record
      const payment = await prisma.payment.create({
        data: {
          reference,
          userId: request.userId,
          sellerId: request.sellerId,
          orderId: request.orderId,
          serviceRequestId: request.serviceRequestId,
          amount: request.amount,
          currency: request.currency,
          status: PaymentStatus.PENDING,
          method: request.method,
          provider: this.getGatewayProvider(request.method),
          tax: breakdown.taxes.reduce((sum, tax) => sum + tax.amount, 0),
          platformCut: breakdown.platformCut,
          sellerNet: breakdown.sellerNet,
          description: request.description,
          escrow: request.escrow || false,
          escrowStatus: request.escrow ? EscrowStatus.HELD : null,
          metadata: JSON.stringify(request.metadata || {})
        }
      });

      // Generate payment instructions based on method
      const instructions = await this.generatePaymentInstructions(payment, request.method);

      return {
        success: true,
        payment: {
          id: payment.id,
          reference: payment.reference,
          amount: Number(payment.amount),
          breakdown,
          ...instructions
        }
      };

    } catch (error) {
      console.error('Payment initiation error:', error);
      return {
        success: false,
        error: 'Failed to initiate payment'
      };
    }
  }

  // Generate payment instructions based on method
  private static async generatePaymentInstructions(
    payment: any, 
    method: PaymentMethod
  ): Promise<{ redirectUrl?: string; instructions?: string; qrCode?: string }> {
    switch (method) {
      case PaymentMethod.CARD:
        // For Paystack integration
        return {
          redirectUrl: `${config.frontend.url}/payment/redirect/${payment.reference}`,
          instructions: 'You will be redirected to complete your card payment securely.'
        };

      case PaymentMethod.BANK_TRANSFER:
        return {
          instructions: `
            Transfer ₦${payment.amount} to:
            Bank: GTBank
            Account: 0123456789
            Account Name: Georgy Marketplace Escrow
            Reference: ${payment.reference}
            
            Payment will be confirmed automatically within 10 minutes.
          `
        };

      case PaymentMethod.MOBILE_MONEY:
        return {
          instructions: `
            Pay with your mobile money:
            Amount: ₦${payment.amount}
            Reference: ${payment.reference}
            
            Dial *737*1*${payment.amount}*${payment.reference}# or use your mobile banking app.
          `
        };


      case PaymentMethod.USSD:
        return {
          instructions: `
            Pay via USSD:
            GTBank: *737*1*${payment.amount}*${payment.reference}#
            Access Bank: *901*1*${payment.amount}*${payment.reference}#
            Zenith Bank: *966*1*${payment.amount}*${payment.reference}#
          `
        };

      default:
        return {
          instructions: 'Payment method not supported'
        };
    }
  }

  // Get gateway provider based on payment method
  private static getGatewayProvider(method: PaymentMethod): string {
    switch (method) {
      case PaymentMethod.CARD:
      case PaymentMethod.BANK_TRANSFER:
      case PaymentMethod.MOBILE_MONEY:
        return 'paystack';
      case PaymentMethod.USSD:
        return 'flutterwave';
      default:
        return 'unknown';
    }
  }

  // Process payment webhook
  static async processWebhook(provider: string, payload: any): Promise<boolean> {
    try {
      // Verify webhook signature (implementation depends on provider)
      if (!this.verifyWebhookSignature(provider, payload)) {
        console.error('Invalid webhook signature');
        return false;
      }

      const reference = payload.data?.reference;
      if (!reference) {
        console.error('No reference in webhook payload');
        return false;
      }

      // Find payment by reference
      const payment = await prisma.payment.findUnique({
        where: { reference }
      });

      if (!payment) {
        console.error('Payment not found:', reference);
        return false;
      }

      // Update payment status based on webhook event
      const status = this.mapWebhookStatus(payload.event, payload.data?.status);
      
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status,
          providerRef: payload.data?.id || payload.data?.transaction_id,
          paidAt: status === PaymentStatus.COMPLETED ? new Date() : null
        }
      });

      // If payment is successful and not escrow, schedule payout
      if (status === PaymentStatus.COMPLETED && !payment.escrow && payment.sellerId) {
        await this.schedulePayout(payment.sellerId, payment.id);
      }

      // Generate invoice
      if (status === PaymentStatus.COMPLETED) {
        await this.generateInvoice(payment.id);
      }

      return true;

    } catch (error) {
      console.error('Webhook processing error:', error);
      return false;
    }
  }

  // Verify webhook signature
  private static verifyWebhookSignature(provider: string, payload: any): boolean {
    // Implementation depends on the payment provider
    // For Paystack, verify HMAC signature
    // For now, return true for development
    return true;
  }

  // Map webhook status to internal status
  private static mapWebhookStatus(event: string, gatewayStatus: string): PaymentStatus {
    switch (event) {
      case 'charge.success':
        return PaymentStatus.COMPLETED;
      case 'charge.failed':
        return PaymentStatus.FAILED;
      case 'charge.pending':
        return PaymentStatus.PROCESSING;
      default:
        return PaymentStatus.PENDING;
    }
  }

  // Schedule payout for seller
  static async schedulePayout(sellerId: string, paymentId: string): Promise<void> {
    try {
      const payment = await prisma.payment.findUnique({
        where: { id: paymentId }
      });

      if (!payment) return;

      // Check if payout already exists
      const existingPayout = await prisma.payoutItem.findFirst({
        where: { paymentId }
      });

      if (existingPayout) return;

      // Calculate next payout date (e.g., T+1)
      const scheduledFor = new Date();
      scheduledFor.setDate(scheduledFor.getDate() + 1);

      // Find or create payout batch
      let payout = await prisma.payout.findFirst({
        where: {
          sellerId,
          status: PayoutStatus.SCHEDULED,
          scheduledAt: {
            gte: new Date(scheduledFor.toDateString()),
            lt: new Date(new Date(scheduledFor.toDateString()).getTime() + 24 * 60 * 60 * 1000)
          }
        }
      });

      if (!payout) {
        const batchId = `BATCH_${Date.now()}_${sellerId.substr(-4)}`;
        payout = await prisma.payout.create({
          data: {
            sellerId,
            totalAmount: 0,
            currency: payment.currency,
            status: PayoutStatus.SCHEDULED,
            scheduledAt: scheduledFor,
            provider: 'paystack',
            bankDetails: '{}'
          }
        });
      }

      // Add payment to payout
      await prisma.payoutItem.create({
        data: {
          payoutId: payout.id,
          paymentId: payment.id,
          amount: payment.sellerNet,
          commission: 0, // No additional payout fees
          net: payment.sellerNet
        }
      });

      // Update payout total
      await prisma.payout.update({
        where: { id: payout.id },
        data: {
          totalAmount: {
            increment: payment.sellerNet
          }
        }
      });

    } catch (error) {
      console.error('Payout scheduling error:', error);
    }
  }

  // Release escrow payment
  static async releaseEscrow(paymentId: string, releasedBy: string): Promise<boolean> {
    try {
      const payment = await prisma.payment.findUnique({
        where: { id: paymentId }
      });

      if (!payment || !payment.escrow || payment.escrowStatus !== EscrowStatus.HELD) {
        return false;
      }

      // Update payment to release escrow
      await prisma.payment.update({
        where: { id: paymentId },
        data: {
          escrowStatus: EscrowStatus.RELEASED
        }
      });

      // Schedule payout if seller exists
      if (payment.sellerId) {
        await this.schedulePayout(payment.sellerId, paymentId);
      }

      return true;

    } catch (error) {
      console.error('Escrow release error:', error);
      return false;
    }
  }

  // Verify payment status
  static async verifyPaymentStatus(reference: string): Promise<{ success: boolean; status: PaymentStatus; payment?: any }> {
    try {
      const payment = await prisma.payment.findUnique({
        where: { reference }
      });

      if (!payment) {
        return { success: false, status: PaymentStatus.FAILED };
      }

      return {
        success: true,
        status: payment.status as PaymentStatus,
        payment: {
          id: payment.id,
          reference: payment.reference,
          amount: Number(payment.amount),
          status: payment.status
        }
      };
    } catch (error) {
      console.error('Payment verification error:', error);
      return { success: false, status: PaymentStatus.FAILED };
    }
  }

  // Get payment history
  static async getPaymentHistory(userId: string, options: {
    page: number;
    limit: number;
    status?: PaymentStatus;
    dateFrom?: Date;
    dateTo?: Date;
  }): Promise<{ payments: any[]; totalCount: number }> {
    try {
      const where: any = { userId };
      
      if (options.status) {
        where.status = options.status;
      }
      
      if (options.dateFrom || options.dateTo) {
        where.createdAt = {};
        if (options.dateFrom) where.createdAt.gte = options.dateFrom;
        if (options.dateTo) where.createdAt.lte = options.dateTo;
      }

      const [payments, totalCount] = await Promise.all([
        prisma.payment.findMany({
          where,
          skip: (options.page - 1) * options.limit,
          take: options.limit,
          orderBy: { createdAt: 'desc' }
        }),
        prisma.payment.count({ where })
      ]);

      return {
        payments: payments.map(payment => ({
          id: payment.id,
          reference: payment.reference,
          amount: Number(payment.amount),
          status: payment.status,
          method: payment.method,
          description: payment.description,
          createdAt: payment.createdAt,
          paidAt: payment.paidAt
        })),
        totalCount
      };
    } catch (error) {
      console.error('Payment history error:', error);
      return { payments: [], totalCount: 0 };
    }
  }

  // Generate invoice
  static async generateInvoice(paymentId: string): Promise<void> {
    try {
      const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
        include: {
          user: true
        }
      });

      if (!payment) return;

      // Generate invoice number
      const invoiceNumber = `INV-${new Date().getFullYear()}-${String(Date.now()).substr(-6)}`;

      await prisma.invoice.create({
        data: {
          paymentId: payment.id,
          invoiceNumber: invoiceNumber,
          type: InvoiceType.SALE,
          amount: Number(payment.amount),
          tax: Number(payment.tax),
          status: 'issued',
          details: JSON.stringify({
            paymentReference: payment.reference,
            issuedAt: new Date()
          })
        }
      });

      // TODO: Generate PDF and send email

    } catch (error) {
      console.error('Invoice generation error:', error);
    }
  }

  // Process refund
  static async processRefund(
    paymentId: string, 
    amount: number, 
    reason: string, 
    processedBy: string
  ): Promise<boolean> {
    try {
      const payment = await prisma.payment.findUnique({
        where: { id: paymentId }
      });

      if (!payment || payment.status !== PaymentStatus.COMPLETED) {
        return false;
      }

      const refundReference = `REF_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`.toUpperCase();

      // Create refund record
      await prisma.paymentRefund.create({
        data: {
          paymentId,
          amount,
          reason,
          status: 'processing',
          requestedBy: processedBy
        }
      });

      // TODO: Process actual refund with payment gateway

      // Update payment status if fully refunded
      const totalRefunded = await prisma.paymentRefund.aggregate({
        where: { paymentId },
        _sum: { amount: true }
      });

      const refundedAmount = Number(totalRefunded._sum.amount || 0);
      const paymentAmount = Number(payment.amount);

      if (refundedAmount >= paymentAmount) {
        await prisma.payment.update({
          where: { id: paymentId },
          data: { status: PaymentStatus.REFUNDED }
        });
      } else if (refundedAmount > 0) {
        await prisma.payment.update({
          where: { id: paymentId },
          data: { status: PaymentStatus.PARTIALLY_REFUNDED }
        });
      }

      return true;

    } catch (error) {
      console.error('Refund processing error:', error);
      return false;
    }
  }

  // Get payment by reference
  static async getPaymentByReference(reference: string): Promise<any> {
    try {
      return await prisma.payment.findUnique({
        where: { reference },
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, email: true }
          },
          refunds: true,
          invoices: true
        }
      });
    } catch (error) {
      console.error('Error fetching payment:', error);
      return null;
    }
  }

  // Get seller financials
  static async getSellerFinancials(sellerId: string): Promise<any> {
    try {
      const [payments, payouts] = await Promise.all([
        prisma.payment.findMany({
          where: {
            sellerId,
            status: PaymentStatus.COMPLETED
          },
          include: {
            refunds: true
          },
          orderBy: { createdAt: 'desc' }
        }),
        prisma.payout.findMany({
          where: { sellerId },
          include: {
            items: true
          },
          orderBy: { createdAt: 'desc' }
        })
      ]);

      const totalSales = payments.reduce((sum, payment) => sum + Number(payment.amount), 0);
      const totalFees = payments.reduce((sum, payment) => sum + Number(payment.platformCut), 0);
      const totalRefunded = payments.reduce((sum, payment) => {
        const refundAmount = payment.refunds.reduce((refSum, refund) => refSum + Number(refund.amount), 0);
        return sum + refundAmount;
      }, 0);

      const netEarnings = payments.reduce((sum, payment) => sum + Number(payment.sellerNet), 0);
      const pendingPayouts = payouts
        .filter(payout => payout.status === PayoutStatus.SCHEDULED)
        .reduce((sum, payout) => sum + Number(payout.totalAmount), 0);

      return {
        sellerId,
        summary: {
          totalSales,
          platformFees: totalFees,
          refundsIssued: totalRefunded,
          netEarnings,
          pendingPayouts,
          completedPayouts: payouts.filter(p => p.status === PayoutStatus.COMPLETED).length,
          totalTransactions: payments.length
        },
        recentPayments: payments.slice(0, 10),
        recentPayouts: payouts.slice(0, 10)
      };
    } catch (error) {
      console.error('Error fetching seller financials:', error);
      return null;
    }
  }

  // Get financial reports
  static async getFinancialReports(params: any): Promise<any> {
    try {
      const { startDate, endDate, groupBy } = params;
      
      const whereClause: any = {};
      if (startDate) whereClause.createdAt = { gte: new Date(startDate) };
      if (endDate) {
        whereClause.createdAt = { 
          ...whereClause.createdAt,
          lte: new Date(endDate) 
        };
      }

      const [payments, refunds] = await Promise.all([
        prisma.payment.findMany({
          where: {
            ...whereClause,
            status: PaymentStatus.COMPLETED
          },
          include: {
            user: true
          }
        }),
        prisma.paymentRefund.findMany({
          where: {
            ...whereClause,
            status: 'completed'
          }
        })
      ]);

      const totalRevenue = payments.reduce((sum, payment) => sum + Number(payment.amount), 0);
      const platformRevenue = payments.reduce((sum, payment) => sum + Number(payment.platformCut), 0);
      const sellerRevenue = payments.reduce((sum, payment) => sum + Number(payment.sellerNet), 0);
      const refundsIssued = refunds.reduce((sum, refund) => sum + Number(refund.amount), 0);

      // Group by payment method
      const byPaymentMethod = payments.reduce((acc, payment) => {
        const method = payment.method;
        if (!acc[method]) {
          acc[method] = { revenue: 0, count: 0 };
        }
        acc[method].revenue += Number(payment.amount);
        acc[method].count += 1;
        return acc;
      }, {} as Record<string, any>);

      return {
        period: { start: startDate, end: endDate },
        metrics: {
          totalRevenue,
          platformRevenue,
          sellerRevenue,
          refundsIssued,
          totalTransactions: payments.length,
          averageTransactionValue: totalRevenue / payments.length || 0
        },
        breakdown: {
          byPaymentMethod: Object.entries(byPaymentMethod).map(([method, data]) => ({
            method,
            ...data
          }))
        }
      };
    } catch (error) {
      console.error('Error generating financial reports:', error);
      return null;
    }
  }

  // Get user payments
  static async getUserPayments(userId: string, params: any): Promise<any> {
    try {
      const { page, limit, status, method } = params;
      const skip = (page - 1) * limit;

      const whereClause: any = { userId };
      if (status) whereClause.status = status;
      if (method) whereClause.method = method;

      const [payments, total] = await Promise.all([
        prisma.payment.findMany({
          where: whereClause,
          include: {
            refunds: true,
            invoices: true
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit
        }),
        prisma.payment.count({ where: whereClause })
      ]);

      return {
        payments,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error fetching user payments:', error);
      return null;
    }
  }

  // Get seller payouts
  static async getSellerPayouts(sellerId: string, params: any): Promise<any> {
    try {
      const { page, limit, status } = params;
      const skip = (page - 1) * limit;

      const whereClause: any = { sellerId };
      if (status) whereClause.status = status;

      const [payouts, total] = await Promise.all([
        prisma.payout.findMany({
          where: whereClause,
          include: {
            items: true
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit
        }),
        prisma.payout.count({ where: whereClause })
      ]);

      return {
        payouts,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error fetching seller payouts:', error);
      return null;
    }
  }

  // Get payment configuration
  static async getPaymentConfig(): Promise<any> {
    const [taxRules, revenueSchemes] = await Promise.all([
      prisma.taxRule.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.revenueShareScheme.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' }
      })
    ]);

    return {
      taxRules,
      revenueSchemes,
      paymentMethods: [
        {
          method: 'CARD',
          name: 'Debit/Credit Card',
          description: 'Pay securely with your debit or credit card',
          enabled: true,
          fees: { percentage: 1.5, fixed: 0, currency: 'NGN' },
          limits: { min: 100, max: 5000000, currency: 'NGN' }
        },
        {
          method: 'BANK_TRANSFER',
          name: 'Bank Transfer',
          description: 'Transfer directly from your bank account',
          enabled: true,
          fees: { percentage: 0.5, fixed: 50, currency: 'NGN' },
          limits: { min: 100, max: 10000000, currency: 'NGN' }
        },
        {
          method: 'MOBILE_MONEY',
          name: 'Mobile Money',
          description: 'Pay with your mobile wallet',
          enabled: true,
          fees: { percentage: 1.0, fixed: 0, currency: 'NGN' },
          limits: { min: 100, max: 200000, currency: 'NGN' }
        },
      ],
      currencies: [
        { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', decimals: 2, enabled: true }
      ]
    };
  }
}

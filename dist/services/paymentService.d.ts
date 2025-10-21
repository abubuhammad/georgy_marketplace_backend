declare enum PaymentStatus {
    PENDING = "pending",
    PROCESSING = "processing",
    COMPLETED = "completed",
    FAILED = "failed",
    REFUNDED = "refunded",
    PARTIALLY_REFUNDED = "partially_refunded"
}
declare enum PaymentMethod {
    CARD = "card",
    BANK_TRANSFER = "bank_transfer",
    USSD = "ussd",
    QR = "qr",
    MOBILE_MONEY = "mobile_money",
    BANK = "bank"
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
export declare class PaymentService {
    static calculatePaymentBreakdown(input: PaymentCalculationInput): Promise<PaymentBreakdown>;
    static initiatePayment(request: PaymentInitRequest): Promise<PaymentInitResponse>;
    private static generatePaymentInstructions;
    private static getGatewayProvider;
    static processWebhook(provider: string, payload: any): Promise<boolean>;
    private static verifyWebhookSignature;
    private static mapWebhookStatus;
    static schedulePayout(sellerId: string, paymentId: string): Promise<void>;
    static releaseEscrow(paymentId: string, releasedBy: string): Promise<boolean>;
    static verifyPaymentStatus(reference: string): Promise<{
        success: boolean;
        status: PaymentStatus;
        payment?: any;
    }>;
    static getPaymentHistory(userId: string, options: {
        page: number;
        limit: number;
        status?: PaymentStatus;
        dateFrom?: Date;
        dateTo?: Date;
    }): Promise<{
        payments: any[];
        totalCount: number;
    }>;
    static generateInvoice(paymentId: string): Promise<void>;
    static processRefund(paymentId: string, amount: number, reason: string, processedBy: string): Promise<boolean>;
    static getPaymentByReference(reference: string): Promise<any>;
    static getSellerFinancials(sellerId: string): Promise<any>;
    static getFinancialReports(params: any): Promise<any>;
    static getUserPayments(userId: string, params: any): Promise<any>;
    static getSellerPayouts(sellerId: string, params: any): Promise<any>;
    static getPaymentConfig(): Promise<any>;
}
export {};
//# sourceMappingURL=paymentService.d.ts.map
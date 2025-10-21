interface PaystackInitializeData {
    amount: number;
    email: string;
    reference: string;
    callback_url?: string;
    metadata?: any;
}
export declare class PaystackService {
    private apiKey;
    private baseURL;
    constructor();
    initializePayment(data: PaystackInitializeData): Promise<any>;
    verifyPayment(reference: string): Promise<{
        success: boolean;
        data: any;
    }>;
    createTransferRecipient(data: {
        type: string;
        name: string;
        account_number: string;
        bank_code: string;
        currency?: string;
    }): Promise<any>;
    initiateTransfer(data: {
        source: string;
        amount: number;
        recipient: string;
        reason?: string;
        reference?: string;
    }): Promise<any>;
    getBanks(): Promise<any>;
    verifyAccountNumber(data: {
        account_number: string;
        bank_code: string;
    }): Promise<any>;
}
export {};
//# sourceMappingURL=paystack.service.d.ts.map
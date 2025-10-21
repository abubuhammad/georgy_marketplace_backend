interface FlutterwaveInitializeData {
    amount: number;
    currency: string;
    tx_ref: string;
    redirect_url?: string;
    customer?: {
        email: string;
        name?: string;
        phonenumber?: string;
    };
    meta?: any;
}
export declare class FlutterwaveService {
    private apiKey;
    private baseURL;
    constructor();
    initializePayment(data: FlutterwaveInitializeData): Promise<any>;
    verifyPayment(reference: string): Promise<{
        success: boolean;
        data: any;
    }>;
    createTransferBeneficiary(data: {
        account_bank: string;
        account_number: string;
        beneficiary_name: string;
    }): Promise<any>;
    initiateTransfer(data: {
        account_bank: string;
        account_number: string;
        amount: number;
        narration?: string;
        currency: string;
        reference?: string;
        beneficiary_name?: string;
    }): Promise<any>;
    getBanks(country?: string): Promise<any>;
    verifyAccountNumber(data: {
        account_number: string;
        account_bank: string;
    }): Promise<any>;
}
export {};
//# sourceMappingURL=flutterwave.service.d.ts.map
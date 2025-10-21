"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaystackService = void 0;
const axios_1 = __importDefault(require("axios"));
class PaystackService {
    constructor() {
        this.apiKey = process.env.PAYSTACK_SECRET_KEY || '';
        this.baseURL = 'https://api.paystack.co';
        if (!this.apiKey) {
            console.warn('Paystack API key not configured. Payment processing may fail.');
        }
    }
    async initializePayment(data) {
        try {
            const response = await axios_1.default.post(`${this.baseURL}/transaction/initialize`, data, {
                headers: {
                    Authorization: `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        }
        catch (error) {
            console.error('Paystack initialization error:', error);
            throw new Error('Failed to initialize Paystack payment');
        }
    }
    async verifyPayment(reference) {
        try {
            const response = await axios_1.default.get(`${this.baseURL}/transaction/verify/${reference}`, {
                headers: {
                    Authorization: `Bearer ${this.apiKey}`
                }
            });
            const result = response.data;
            return {
                success: result.status && result.data.status === 'success',
                data: result.data
            };
        }
        catch (error) {
            console.error('Paystack verification error:', error);
            return {
                success: false,
                data: { error: 'Verification failed' }
            };
        }
    }
    async createTransferRecipient(data) {
        try {
            const response = await axios_1.default.post(`${this.baseURL}/transferrecipient`, data, {
                headers: {
                    Authorization: `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        }
        catch (error) {
            console.error('Paystack transfer recipient error:', error);
            throw new Error('Failed to create transfer recipient');
        }
    }
    async initiateTransfer(data) {
        try {
            const response = await axios_1.default.post(`${this.baseURL}/transfer`, data, {
                headers: {
                    Authorization: `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        }
        catch (error) {
            console.error('Paystack transfer error:', error);
            throw new Error('Failed to initiate transfer');
        }
    }
    async getBanks() {
        try {
            const response = await axios_1.default.get(`${this.baseURL}/bank`, {
                headers: {
                    Authorization: `Bearer ${this.apiKey}`
                }
            });
            return response.data;
        }
        catch (error) {
            console.error('Paystack get banks error:', error);
            throw new Error('Failed to get bank list');
        }
    }
    async verifyAccountNumber(data) {
        try {
            const response = await axios_1.default.get(`${this.baseURL}/bank/resolve?account_number=${data.account_number}&bank_code=${data.bank_code}`, {
                headers: {
                    Authorization: `Bearer ${this.apiKey}`
                }
            });
            return response.data;
        }
        catch (error) {
            console.error('Paystack account verification error:', error);
            throw new Error('Failed to verify account number');
        }
    }
}
exports.PaystackService = PaystackService;
//# sourceMappingURL=paystack.service.js.map
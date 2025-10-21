"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlutterwaveService = void 0;
const axios_1 = __importDefault(require("axios"));
class FlutterwaveService {
    constructor() {
        this.apiKey = process.env.FLUTTERWAVE_SECRET_KEY || '';
        this.baseURL = 'https://api.flutterwave.com/v3';
        if (!this.apiKey) {
            console.warn('Flutterwave API key not configured. Payment processing may fail.');
        }
    }
    async initializePayment(data) {
        try {
            const response = await axios_1.default.post(`${this.baseURL}/payments`, data, {
                headers: {
                    Authorization: `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        }
        catch (error) {
            console.error('Flutterwave initialization error:', error);
            throw new Error('Failed to initialize Flutterwave payment');
        }
    }
    async verifyPayment(reference) {
        try {
            // First try to verify by transaction reference
            const response = await axios_1.default.get(`${this.baseURL}/transactions/verify_by_reference?tx_ref=${reference}`, {
                headers: {
                    Authorization: `Bearer ${this.apiKey}`
                }
            });
            const result = response.data;
            return {
                success: result.status === 'success' && result.data.status === 'successful',
                data: result.data
            };
        }
        catch (error) {
            console.error('Flutterwave verification error:', error);
            return {
                success: false,
                data: { error: 'Verification failed' }
            };
        }
    }
    async createTransferBeneficiary(data) {
        try {
            const response = await axios_1.default.post(`${this.baseURL}/beneficiaries`, data, {
                headers: {
                    Authorization: `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        }
        catch (error) {
            console.error('Flutterwave beneficiary creation error:', error);
            throw new Error('Failed to create transfer beneficiary');
        }
    }
    async initiateTransfer(data) {
        try {
            const response = await axios_1.default.post(`${this.baseURL}/transfers`, data, {
                headers: {
                    Authorization: `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        }
        catch (error) {
            console.error('Flutterwave transfer error:', error);
            throw new Error('Failed to initiate transfer');
        }
    }
    async getBanks(country = 'NG') {
        try {
            const response = await axios_1.default.get(`${this.baseURL}/banks/${country}`, {
                headers: {
                    Authorization: `Bearer ${this.apiKey}`
                }
            });
            return response.data;
        }
        catch (error) {
            console.error('Flutterwave get banks error:', error);
            throw new Error('Failed to get bank list');
        }
    }
    async verifyAccountNumber(data) {
        try {
            const response = await axios_1.default.post(`${this.baseURL}/accounts/resolve`, data, {
                headers: {
                    Authorization: `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        }
        catch (error) {
            console.error('Flutterwave account verification error:', error);
            throw new Error('Failed to verify account number');
        }
    }
}
exports.FlutterwaveService = FlutterwaveService;
//# sourceMappingURL=flutterwave.service.js.map
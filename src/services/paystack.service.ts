import axios from 'axios';

interface PaystackInitializeData {
  amount: number; // in kobo
  email: string;
  reference: string;
  callback_url?: string;
  metadata?: any;
}

interface PaystackResponse {
  status: boolean;
  message: string;
  data: any;
}

export class PaystackService {
  private apiKey: string;
  private baseURL: string;

  constructor() {
    this.apiKey = process.env.PAYSTACK_SECRET_KEY || '';
    this.baseURL = 'https://api.paystack.co';
    
    if (!this.apiKey) {
      console.warn('Paystack API key not configured. Payment processing may fail.');
    }
  }

  async initializePayment(data: PaystackInitializeData): Promise<any> {
    try {
      const response = await axios.post(
        `${this.baseURL}/transaction/initialize`,
        data,
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Paystack initialization error:', error);
      throw new Error('Failed to initialize Paystack payment');
    }
  }

  async verifyPayment(reference: string): Promise<{ success: boolean; data: any }> {
    try {
      const response = await axios.get(
        `${this.baseURL}/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`
          }
        }
      );

      const result = response.data as PaystackResponse;
      
      return {
        success: result.status && result.data.status === 'success',
        data: result.data
      };
    } catch (error) {
      console.error('Paystack verification error:', error);
      return {
        success: false,
        data: { error: 'Verification failed' }
      };
    }
  }

  async createTransferRecipient(data: {
    type: string;
    name: string;
    account_number: string;
    bank_code: string;
    currency?: string;
  }): Promise<any> {
    try {
      const response = await axios.post(
        `${this.baseURL}/transferrecipient`,
        data,
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Paystack transfer recipient error:', error);
      throw new Error('Failed to create transfer recipient');
    }
  }

  async initiateTransfer(data: {
    source: string;
    amount: number;
    recipient: string;
    reason?: string;
    reference?: string;
  }): Promise<any> {
    try {
      const response = await axios.post(
        `${this.baseURL}/transfer`,
        data,
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Paystack transfer error:', error);
      throw new Error('Failed to initiate transfer');
    }
  }

  async getBanks(): Promise<any> {
    try {
      const response = await axios.get(
        `${this.baseURL}/bank`,
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Paystack get banks error:', error);
      throw new Error('Failed to get bank list');
    }
  }

  async verifyAccountNumber(data: {
    account_number: string;
    bank_code: string;
  }): Promise<any> {
    try {
      const response = await axios.get(
        `${this.baseURL}/bank/resolve?account_number=${data.account_number}&bank_code=${data.bank_code}`,
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Paystack account verification error:', error);
      throw new Error('Failed to verify account number');
    }
  }
}

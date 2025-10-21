import axios from 'axios';

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

interface FlutterwaveResponse {
  status: string;
  message: string;
  data: any;
}

export class FlutterwaveService {
  private apiKey: string;
  private baseURL: string;

  constructor() {
    this.apiKey = process.env.FLUTTERWAVE_SECRET_KEY || '';
    this.baseURL = 'https://api.flutterwave.com/v3';
    
    if (!this.apiKey) {
      console.warn('Flutterwave API key not configured. Payment processing may fail.');
    }
  }

  async initializePayment(data: FlutterwaveInitializeData): Promise<any> {
    try {
      const response = await axios.post(
        `${this.baseURL}/payments`,
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
      console.error('Flutterwave initialization error:', error);
      throw new Error('Failed to initialize Flutterwave payment');
    }
  }

  async verifyPayment(reference: string): Promise<{ success: boolean; data: any }> {
    try {
      // First try to verify by transaction reference
      const response = await axios.get(
        `${this.baseURL}/transactions/verify_by_reference?tx_ref=${reference}`,
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`
          }
        }
      );

      const result = response.data as FlutterwaveResponse;
      
      return {
        success: result.status === 'success' && result.data.status === 'successful',
        data: result.data
      };
    } catch (error) {
      console.error('Flutterwave verification error:', error);
      return {
        success: false,
        data: { error: 'Verification failed' }
      };
    }
  }

  async createTransferBeneficiary(data: {
    account_bank: string;
    account_number: string;
    beneficiary_name: string;
  }): Promise<any> {
    try {
      const response = await axios.post(
        `${this.baseURL}/beneficiaries`,
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
      console.error('Flutterwave beneficiary creation error:', error);
      throw new Error('Failed to create transfer beneficiary');
    }
  }

  async initiateTransfer(data: {
    account_bank: string;
    account_number: string;
    amount: number;
    narration?: string;
    currency: string;
    reference?: string;
    beneficiary_name?: string;
  }): Promise<any> {
    try {
      const response = await axios.post(
        `${this.baseURL}/transfers`,
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
      console.error('Flutterwave transfer error:', error);
      throw new Error('Failed to initiate transfer');
    }
  }

  async getBanks(country: string = 'NG'): Promise<any> {
    try {
      const response = await axios.get(
        `${this.baseURL}/banks/${country}`,
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Flutterwave get banks error:', error);
      throw new Error('Failed to get bank list');
    }
  }

  async verifyAccountNumber(data: {
    account_number: string;
    account_bank: string;
  }): Promise<any> {
    try {
      const response = await axios.post(
        `${this.baseURL}/accounts/resolve`,
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
      console.error('Flutterwave account verification error:', error);
      throw new Error('Failed to verify account number');
    }
  }
}

import axios from 'axios';

interface PaystackInitializeData {
  amount: number; // in kobo
  email: string;
  reference: string;
  callback_url?: string;
  metadata?: any;
  subaccount?: string; // Subaccount code for split payment
  bearer?: 'account' | 'subaccount'; // Who bears Paystack fees
  transaction_charge?: number; // Platform flat fee in kobo (optional)
  split_code?: string; // For multi-split transactions
}

interface SubaccountData {
  business_name: string;
  settlement_bank: string; // Bank code
  account_number: string;
  percentage_charge: number; // Platform commission percentage
  primary_contact_email?: string;
  primary_contact_phone?: string;
  metadata?: any;
}

interface SplitData {
  name: string;
  type: 'percentage' | 'flat';
  currency: string;
  subaccounts: Array<{
    subaccount: string; // Subaccount code
    share: number; // Percentage or flat amount
  }>;
  bearer_type: 'subaccount' | 'account' | 'all-proportional' | 'all';
  bearer_subaccount?: string;
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

  // ==================== SUBACCOUNT METHODS ====================

  async createSubaccount(data: SubaccountData): Promise<any> {
    try {
      const response = await axios.post(
        `${this.baseURL}/subaccount`,
        data,
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Paystack create subaccount error:', error.response?.data || error);
      throw new Error(error.response?.data?.message || 'Failed to create subaccount');
    }
  }

  async getSubaccount(idOrCode: string): Promise<any> {
    try {
      const response = await axios.get(
        `${this.baseURL}/subaccount/${idOrCode}`,
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`
          }
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Paystack get subaccount error:', error.response?.data || error);
      throw new Error('Failed to get subaccount');
    }
  }

  async updateSubaccount(idOrCode: string, data: Partial<SubaccountData>): Promise<any> {
    try {
      const response = await axios.put(
        `${this.baseURL}/subaccount/${idOrCode}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Paystack update subaccount error:', error.response?.data || error);
      throw new Error('Failed to update subaccount');
    }
  }

  async listSubaccounts(perPage: number = 50, page: number = 1): Promise<any> {
    try {
      const response = await axios.get(
        `${this.baseURL}/subaccount?perPage=${perPage}&page=${page}`,
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`
          }
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Paystack list subaccounts error:', error.response?.data || error);
      throw new Error('Failed to list subaccounts');
    }
  }

  // ==================== SPLIT PAYMENT METHODS ====================

  async createSplit(data: SplitData): Promise<any> {
    try {
      const response = await axios.post(
        `${this.baseURL}/split`,
        data,
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Paystack create split error:', error.response?.data || error);
      throw new Error(error.response?.data?.message || 'Failed to create split');
    }
  }

  async getSplit(splitId: string): Promise<any> {
    try {
      const response = await axios.get(
        `${this.baseURL}/split/${splitId}`,
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`
          }
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Paystack get split error:', error.response?.data || error);
      throw new Error('Failed to get split');
    }
  }

  async updateSplit(splitId: string, data: { name?: string; active?: boolean; bearer_type?: string; bearer_subaccount?: string }): Promise<any> {
    try {
      const response = await axios.put(
        `${this.baseURL}/split/${splitId}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Paystack update split error:', error.response?.data || error);
      throw new Error('Failed to update split');
    }
  }

  async addSubaccountToSplit(splitId: string, subaccount: string, share: number): Promise<any> {
    try {
      const response = await axios.post(
        `${this.baseURL}/split/${splitId}/subaccount/add`,
        { subaccount, share },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Paystack add subaccount to split error:', error.response?.data || error);
      throw new Error('Failed to add subaccount to split');
    }
  }

  async removeSubaccountFromSplit(splitId: string, subaccount: string): Promise<any> {
    try {
      const response = await axios.post(
        `${this.baseURL}/split/${splitId}/subaccount/remove`,
        { subaccount },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Paystack remove subaccount from split error:', error.response?.data || error);
      throw new Error('Failed to remove subaccount from split');
    }
  }

  // ==================== SPLIT PAYMENT INITIALIZATION ====================

  async initializeSplitPayment(data: PaystackInitializeData & { subaccount?: string; split_code?: string }): Promise<any> {
    try {
      const payload: any = {
        amount: data.amount,
        email: data.email,
        reference: data.reference,
        callback_url: data.callback_url,
        metadata: data.metadata
      };

      // For single seller order - use subaccount
      if (data.subaccount) {
        payload.subaccount = data.subaccount;
        payload.bearer = data.bearer || 'account'; // Platform bears Paystack fees
      }

      // For multi-seller order - use split_code
      if (data.split_code) {
        payload.split_code = data.split_code;
      }

      // Optional transaction charge (platform flat fee)
      if (data.transaction_charge) {
        payload.transaction_charge = data.transaction_charge;
      }

      const response = await axios.post(
        `${this.baseURL}/transaction/initialize`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Paystack split payment initialization error:', error.response?.data || error);
      throw new Error(error.response?.data?.message || 'Failed to initialize split payment');
    }
  }

  // ==================== WEBHOOK VERIFICATION ====================

  verifyWebhookSignature(payload: string, signature: string): boolean {
    const crypto = require('crypto');
    const webhookSecret = process.env.PAYSTACK_WEBHOOK_SECRET;
    
    if (!webhookSecret) {
      console.warn('PAYSTACK_WEBHOOK_SECRET not configured');
      return false;
    }

    const hash = crypto
      .createHmac('sha512', webhookSecret)
      .update(payload)
      .digest('hex');

    return hash === signature;
  }
}

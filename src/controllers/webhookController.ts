import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { PaystackService } from '../services/paystack.service';
import crypto from 'crypto';

const prisma = new PrismaClient();
const paystackService = new PaystackService();

// Verify Paystack webhook signature
const verifyPaystackSignature = (payload: string, signature: string): boolean => {
  const webhookSecret = process.env.PAYSTACK_WEBHOOK_SECRET;
  
  if (!webhookSecret) {
    console.warn('PAYSTACK_WEBHOOK_SECRET not configured - skipping signature verification');
    return true; // Allow in development, but log warning
  }

  const hash = crypto
    .createHmac('sha512', webhookSecret)
    .update(payload)
    .digest('hex');

  return hash === signature;
};

// Handle Paystack webhook events
export const handlePaystackWebhook = async (req: Request, res: Response) => {
  try {
    const signature = req.headers['x-paystack-signature'] as string;
    const payload = JSON.stringify(req.body);

    // Verify signature
    if (!verifyPaystackSignature(payload, signature)) {
      console.error('Invalid Paystack webhook signature');
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const event = req.body;
    const eventType = event.event;
    const data = event.data;

    console.log(`Paystack webhook received: ${eventType}`);

    // Handle different event types
    switch (eventType) {
      case 'charge.success':
        await handleChargeSuccess(data);
        break;

      case 'transfer.success':
        await handleTransferSuccess(data);
        break;

      case 'transfer.failed':
        await handleTransferFailed(data);
        break;

      case 'refund.processed':
        await handleRefundProcessed(data);
        break;

      default:
        console.log(`Unhandled Paystack event: ${eventType}`);
    }

    // Always respond with 200 to acknowledge receipt
    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Paystack webhook error:', error);
    // Still return 200 to prevent retries for processing errors
    res.status(200).json({ received: true, error: 'Processing error' });
  }
};

// Handle successful payment
async function handleChargeSuccess(data: any) {
  const { reference, amount, customer, metadata, subaccount, split } = data;

  try {
    // Check if payment already processed (idempotency)
    const existingPayment = await prisma.payment.findUnique({
      where: { reference }
    });

    if (existingPayment && existingPayment.status === 'completed') {
      console.log(`Payment ${reference} already processed`);
      return;
    }

    // Convert amount from kobo to naira
    const amountInNaira = amount / 100;
    const platformFeePercent = metadata?.platformFeePercent || 10;
    
    // Calculate platform cut and seller net
    const platformCut = Math.round((amountInNaira * platformFeePercent) / 100 * 100) / 100;
    const sellerNet = Math.round((amountInNaira - platformCut) * 100) / 100;

    // Create or update payment record
    const payment = await prisma.payment.upsert({
      where: { reference },
      update: {
        status: 'completed',
        amount: amountInNaira,
        platformCut,
        sellerNet,
        paidAt: new Date(),
        paymentChannel: data.channel,
        gatewayResponse: data.gateway_response
      },
      create: {
        reference,
        userId: metadata?.userId || 'unknown',
        sellerId: metadata?.sellerId,
        amount: amountInNaira,
        currency: data.currency || 'NGN',
        status: 'completed',
        method: data.channel,
        platformCut,
        sellerNet,
        paidAt: new Date(),
        paymentChannel: data.channel,
        gatewayResponse: data.gateway_response,
        metadata: JSON.stringify(metadata)
      }
    });

    // Update order status if orderId is provided
    if (metadata?.orderId) {
      await prisma.order.update({
        where: { id: metadata.orderId },
        data: {
          status: 'paid',
          paymentStatus: 'completed',
          paymentId: payment.id
        }
      }).catch(err => {
        console.warn(`Failed to update order ${metadata.orderId}:`, err);
      });
    }

    // If split payment, log the split details
    if (split) {
      console.log(`Split payment processed: ${JSON.stringify(split)}`);
    }

    if (subaccount) {
      console.log(`Subaccount payment processed: ${subaccount.subaccount_code}`);
    }

    console.log(`Payment ${reference} completed successfully`);
  } catch (error) {
    console.error(`Error processing charge.success for ${reference}:`, error);
    throw error;
  }
}

// Handle successful transfer (payout to seller)
async function handleTransferSuccess(data: any) {
  const { reference, amount, recipient } = data;

  try {
    await prisma.payout.updateMany({
      where: { reference },
      data: {
        status: 'completed',
        completedAt: new Date()
      }
    });

    console.log(`Transfer ${reference} completed successfully`);
  } catch (error) {
    console.error(`Error processing transfer.success for ${reference}:`, error);
    throw error;
  }
}

// Handle failed transfer
async function handleTransferFailed(data: any) {
  const { reference, reason } = data;

  try {
    await prisma.payout.updateMany({
      where: { reference },
      data: {
        status: 'failed',
        failureReason: reason
      }
    });

    console.log(`Transfer ${reference} failed: ${reason}`);
  } catch (error) {
    console.error(`Error processing transfer.failed for ${reference}:`, error);
    throw error;
  }
}

// Handle processed refund
async function handleRefundProcessed(data: any) {
  const { transaction_reference, amount, status } = data;

  try {
    // Update refund record
    await prisma.refund.updateMany({
      where: { paymentReference: transaction_reference },
      data: {
        status: status === 'processed' ? 'completed' : 'failed',
        processedAt: new Date()
      }
    });

    console.log(`Refund for ${transaction_reference} processed`);
  } catch (error) {
    console.error(`Error processing refund for ${transaction_reference}:`, error);
    throw error;
  }
}

export const webhookController = {
  handlePaystackWebhook
};

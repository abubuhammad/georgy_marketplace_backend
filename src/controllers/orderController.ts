import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

// Create Order
export const createOrder = async (req: AuthRequest, res: Response) => {
  try {
    const buyerId = req.user?.id;
    if (!buyerId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const {
      productId,
      quantity = 1,
      shippingAddress,
      paymentMethod,
      deliveryOption = 'standard'
    } = req.body;

    // Get product details
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        seller: {
          select: { id: true, firstName: true, lastName: true }
        }
      }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (product.status !== 'active') {
      return res.status(400).json({ error: 'Product is not available' });
    }

    const totalAmount = product.price * quantity;

    // Create order
    const order = await prisma.order.create({
      data: {
        productId,
        buyerId,
        sellerId: product.sellerId,
        quantity,
        totalAmount,
        status: 'pending',
        paymentStatus: 'pending',
        paymentMethod,
        shippingAddress,
        expectedDeliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
      },
      include: {
        product: {
          select: {
            title: true,
            price: true,
            images: true
          }
        },
        buyer: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        }
      }
    });

    // Calculate commission and create payment record
    const commissionScheme = await prisma.revenueShareScheme.findFirst({
      where: {
        category: product.category,
        isActive: true
      }
    }) || await prisma.revenueShareScheme.findFirst({
      where: {
        category: 'default',
        isActive: true
      }
    });

    const platformCut = totalAmount * (commissionScheme?.platformPercentage || 0.05);
    const sellerNet = totalAmount - platformCut;

    await prisma.payment.create({
      data: {
        reference: `ORDER_${order.id}_${Date.now()}`,
        userId: buyerId,
        sellerId: product.sellerId,
        orderId: order.id,
        amount: totalAmount,
        method: paymentMethod,
        status: 'pending',
        provider: 'pending', // Will be set when payment is processed
        platformCut,
        sellerNet,
        description: `Payment for ${product.title}`
      }
    });

    res.status(201).json(order);
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
};

// Get Orders (for buyer)
export const getBuyerOrders = async (req: AuthRequest, res: Response) => {
  try {
    const buyerId = req.user?.id;
    const { page = 1, limit = 20, status, search } = req.query;

    const where: any = { buyerId };

    if (status && status !== 'all') {
      where.status = status;
    }

    if (search) {
      where.product = {
        title: { contains: search as string }
      };
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        product: {
          select: {
            title: true,
            price: true,
            images: true,
            category: true
          }
        },
        seller: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        },
        shipments: {
          select: {
            trackingNumber: true,
            status: true,
            estimatedDelivery: true,
            deliveredAt: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit)
    });

    const totalCount = await prisma.order.count({ where });

    res.json({
      orders,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: totalCount,
        pages: Math.ceil(totalCount / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get buyer orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

// Get Order Details
export const getOrderDetails = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        product: {
          include: {
            seller: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
                phone: true
              }
            }
          }
        },
        buyer: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        },
        shipments: {
          include: {
            agent: {
              select: {
                userId: true,
                phoneNumber: true,
                vehicleType: true
              }
            }
          }
        },
        refunds: true,
        disputes: true
      }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check authorization
    const isAuthorized = 
      userRole === 'admin' ||
      order.buyerId === userId ||
      order.sellerId === userId ||
      (userRole === 'delivery_agent' && order.shipments.some(s => s.agent?.userId === userId));

    if (!isAuthorized) {
      return res.status(403).json({ error: 'Not authorized to view this order' });
    }

    res.json(order);
  } catch (error) {
    console.error('Get order details error:', error);
    res.status(500).json({ error: 'Failed to fetch order details' });
  }
};

// Update Order Status (for sellers)
export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    // Get order and verify authorization
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        product: true,
        buyer: {
          select: { firstName: true, lastName: true, email: true }
        }
      }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check authorization (seller or admin can update)
    if (userRole !== 'admin' && order.sellerId !== userId) {
      return res.status(403).json({ error: 'Not authorized to update this order' });
    }

    // Validate status transitions
    const validTransitions: Record<string, string[]> = {
      'pending': ['confirmed', 'cancelled'],
      'confirmed': ['shipped', 'cancelled'],
      'shipped': ['delivered', 'cancelled'],
      'delivered': [],
      'cancelled': []
    };

    if (!validTransitions[order.status]?.includes(status)) {
      return res.status(400).json({ 
        error: `Invalid status transition from ${order.status} to ${status}` 
      });
    }

    // Update order
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status,
        updatedAt: new Date(),
        deliveryDate: status === 'delivered' ? new Date() : undefined
      },
      include: {
        product: {
          select: { title: true, images: true }
        },
        buyer: {
          select: { firstName: true, lastName: true, email: true }
        }
      }
    });

    // Create shipment if order is shipped
    if (status === 'shipped' && !order.shipments?.length) {
      await createShipmentForOrder(order.id, order.shippingAddress);
    }

    // Update payment status if delivered
    if (status === 'delivered') {
      await prisma.payment.updateMany({
        where: { orderId: order.id },
        data: { 
          status: 'completed',
          paidAt: new Date()
        }
      });
    }

    // TODO: Send notification to buyer
    // await notificationService.sendOrderStatusUpdate(updatedOrder);

    res.json(updatedOrder);
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
};

// Cancel Order
export const cancelOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        product: true
      }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check authorization (buyer, seller, or admin can cancel)
    const isAuthorized = 
      userRole === 'admin' ||
      order.buyerId === userId ||
      order.sellerId === userId;

    if (!isAuthorized) {
      return res.status(403).json({ error: 'Not authorized to cancel this order' });
    }

    // Check if order can be cancelled
    if (!['pending', 'confirmed'].includes(order.status)) {
      return res.status(400).json({ error: 'Order cannot be cancelled at this stage' });
    }

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status: 'cancelled',
        updatedAt: new Date()
      }
    });

    // Cancel payment if exists
    await prisma.payment.updateMany({
      where: { orderId: order.id },
      data: { 
        status: 'cancelled',
        failureReason: reason
      }
    });

    // TODO: Process refund if payment was already made
    // TODO: Send cancellation notification

    res.json(updatedOrder);
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ error: 'Failed to cancel order' });
  }
};

// Request Refund
export const requestRefund = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { reason, description, amount } = req.body;
    const buyerId = req.user?.id;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        product: true,
        refunds: true
      }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check if buyer owns this order
    if (order.buyerId !== buyerId) {
      return res.status(403).json({ error: 'Not authorized to request refund for this order' });
    }

    // Check if order is eligible for refund
    if (!['delivered'].includes(order.status)) {
      return res.status(400).json({ error: 'Order is not eligible for refund' });
    }

    // Check if refund already exists
    const existingRefund = order.refunds?.find(r => r.status !== 'rejected');
    if (existingRefund) {
      return res.status(400).json({ error: 'Refund request already exists' });
    }

    // Create refund request
    const refund = await prisma.refund.create({
      data: {
        orderId: order.id,
        reason,
        description,
        amount: amount ? Number(amount) : order.totalAmount,
        status: 'pending',
        requestedBy: buyerId!
      },
      include: {
        order: {
          include: {
            product: {
              select: { title: true, images: true }
            }
          }
        }
      }
    });

    res.status(201).json(refund);
  } catch (error) {
    console.error('Request refund error:', error);
    res.status(500).json({ error: 'Failed to request refund' });
  }
};

// Track Order
export const trackOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        product: {
          select: { title: true, images: true }
        },
        shipments: {
          include: {
            agent: {
              select: {
                phoneNumber: true,
                vehicleType: true,
                currentLocation: true
              }
            }
          }
        }
      }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check authorization
    const isAuthorized = 
      userRole === 'admin' ||
      order.buyerId === userId ||
      order.sellerId === userId;

    if (!isAuthorized) {
      return res.status(403).json({ error: 'Not authorized to track this order' });
    }

    // Get tracking events
    const trackingEvents = [];
    
    // Add order events
    trackingEvents.push({
      status: 'Order Placed',
      timestamp: order.createdAt,
      description: 'Your order has been placed successfully'
    });

    if (order.status === 'confirmed') {
      trackingEvents.push({
        status: 'Order Confirmed',
        timestamp: order.updatedAt,
        description: 'Seller has confirmed your order'
      });
    }

    if (order.status === 'shipped' && order.shipments.length > 0) {
      const shipment = order.shipments[0];
      trackingEvents.push({
        status: 'Order Shipped',
        timestamp: shipment.assignedAt,
        description: `Your order has been shipped. Tracking: ${shipment.trackingNumber}`
      });

      if (shipment.pickedUpAt) {
        trackingEvents.push({
          status: 'Package Picked Up',
          timestamp: shipment.pickedUpAt,
          description: 'Package has been picked up by delivery agent'
        });
      }

      if (shipment.status === 'in_transit') {
        trackingEvents.push({
          status: 'In Transit',
          timestamp: shipment.updatedAt,
          description: 'Your package is on the way'
        });
      }
    }

    if (order.status === 'delivered') {
      trackingEvents.push({
        status: 'Delivered',
        timestamp: order.deliveryDate,
        description: 'Your order has been delivered successfully'
      });
    }

    res.json({
      order: {
        id: order.id,
        status: order.status,
        totalAmount: order.totalAmount,
        expectedDeliveryDate: order.expectedDeliveryDate,
        deliveryDate: order.deliveryDate,
        product: order.product
      },
      shipments: order.shipments,
      trackingEvents: trackingEvents.sort((a, b) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      )
    });
  } catch (error) {
    console.error('Track order error:', error);
    res.status(500).json({ error: 'Failed to track order' });
  }
};

// Helper function to create shipment
async function createShipmentForOrder(orderId: string, shippingAddress: string) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { product: true }
    });

    if (!order) return;

    // Find appropriate delivery zone
    const zone = await prisma.deliveryZone.findFirst({
      where: { isActive: true }
    });

    // Generate tracking number
    const trackingNumber = `TRK${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

    await prisma.shipment.create({
      data: {
        orderId,
        trackingNumber,
        status: 'pending',
        shippingOption: 'standard',
        estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
        pickupAddress: 'Seller Location', // TODO: Get from seller profile
        deliveryAddress: shippingAddress,
        recipientName: 'Recipient Name', // TODO: Extract from order
        recipientPhone: 'Recipient Phone', // TODO: Extract from order
        packageDetails: JSON.stringify({
          productTitle: order.product.title,
          quantity: order.quantity,
          weight: 1.0 // TODO: Get from product
        }),
        deliveryFee: zone?.baseFee || 1000,
        zoneId: zone?.id
      }
    });
  } catch (error) {
    console.error('Create shipment error:', error);
  }
}
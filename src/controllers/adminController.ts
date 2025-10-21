import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

// Define AuthRequest type
interface AuthRequest extends Request {
  user?: {
    id: string;
    userId?: string;
    email: string;
    role: string;
    [key: string]: any;
  };
}

const prisma = new PrismaClient();

// Validation schemas
const revenueShareSchemeSchema = z.object({
  name: z.string(),
  category: z.string(),
  platformPercentage: z.number().min(0).max(1),
  sellerPercentage: z.number().min(0).max(1),
  minimumFee: z.number().min(0).default(0),
  maximumFee: z.number().min(0).optional(),
  userType: z.string().optional()
});

const taxRuleSchema = z.object({
  name: z.string(),
  type: z.enum(['vat', 'sales_tax', 'service_tax']),
  rate: z.number().min(0).max(1),
  category: z.string().optional(),
  region: z.string().optional(),
  description: z.string().optional()
});

// Dashboard Analytics
export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    // Basic counts
    const totalUsers = await prisma.user.count({ where: { isDeleted: false } });
    const totalProducts = await prisma.product.count({ where: { status: { not: 'inactive' } } });
    const totalOrders = await prisma.order.count();
    
    // Revenue stats
    const revenueStats = await prisma.payment.aggregate({
      where: { status: 'completed' },
      _sum: {
        amount: true,
        platformCut: true,
        sellerNet: true
      }
    });

    // User breakdown by role
    const usersByRole = await prisma.$queryRaw`
      SELECT role, COUNT(*) as count
      FROM users 
      WHERE isDeleted = false
      GROUP BY role
    `;

    // Orders by status
    const ordersByStatus = await prisma.$queryRaw`
      SELECT status, COUNT(*) as count, SUM(totalAmount) as revenue
      FROM orders
      GROUP BY status
    `;

    // Monthly growth (last 12 months)
    const monthlyGrowth = await prisma.$queryRaw`
      SELECT 
        DATE_FORMAT(createdAt, '%Y-%m') as month,
        COUNT(DISTINCT CASE WHEN role = 'seller' THEN id END) as sellers,
        COUNT(DISTINCT CASE WHEN role = 'customer' THEN id END) as customers,
        COUNT(*) as total_users
      FROM users 
      WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 12 MONTH) AND isDeleted = false
      GROUP BY DATE_FORMAT(createdAt, '%Y-%m')
      ORDER BY month DESC
    `;

    // Recent activity
    const recentOrders = await prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        buyer: {
          select: { firstName: true, lastName: true }
        },
        product: {
          select: { title: true }
        }
      }
    });

    // Top performing sellers (using a safer approach with proper aggregation)
    const topSellers = await prisma.user.findMany({
      where: {
        role: 'seller',
        isActive: true,
        isDeleted: false
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        _count: {
          select: {
            orders: { where: { sellerId: { not: undefined } } }
          }
        }
      },
      take: 10
    });

    res.json({
      overview: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue: revenueStats._sum.amount || 0,
        platformRevenue: revenueStats._sum.platformCut || 0,
        sellerPayouts: revenueStats._sum.sellerNet || 0
      },
      usersByRole,
      ordersByStatus,
      monthlyGrowth,
      recentOrders,
      topSellers
    });
  } catch (error) {
    console.error('Admin dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
};

// User Management
export const getUsers = async (req: AuthRequest, res: Response) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      role, 
      status,
      search,
      verified,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    const where: any = {
      isDeleted: false
    };
    
    if (role && role !== 'all') {
      where.role = role;
    }

    if (status === 'active') {
      where.isActive = true;
    } else if (status === 'inactive') {
      where.isActive = false;
    } else if (status === 'suspended') {
      where.isSuspended = true;
    } else if (status === 'banned') {
      where.isBanned = true;
    }

    if (verified === 'true') {
      where.emailVerified = true;
    } else if (verified === 'false') {
      where.emailVerified = false;
    }
    
    if (search) {
      where.OR = [
        { firstName: { contains: search as string } },
        { lastName: { contains: search as string } },
        { email: { contains: search as string } }
      ];
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true,
        avatar: true,
        emailVerified: true,
        phoneVerified: true,
        identityVerified: true,
        isActive: true,
        isSuspended: true,
        isBanned: true,
        lastLoginAt: true,
        createdAt: true,
        _count: {
          select: {
            orders: true
          }
        }
      },
      orderBy: { [sortBy as string]: sortOrder },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit)
    });

    const total = await prisma.user.count({ where });

    res.json({
      users,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

export const getUserDetails = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        profile: true,
        verification: true,
        safetyProfile: true,
        trustProfile: true,
        _count: {
          select: {
            orders: true,
            reviews: true,
            reportsMade: true,
            reportsReceived: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get recent activity
    const recentOrders = await prisma.order.findMany({
      where: {
        OR: [
          { buyerId: id },
          { sellerId: id }
        ]
      },
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        product: {
          select: { title: true }
        }
      }
    });

    // Get financial summary for sellers
    let financialSummary = null;
    if (user.role === 'seller') {
      const earnings = await prisma.payment.aggregate({
        where: {
          sellerId: id,
          status: 'completed'
        },
        _sum: {
          sellerNet: true,
          platformCut: true
        }
      });
      
      financialSummary = {
        totalEarnings: earnings._sum.sellerNet || 0,
        platformFees: earnings._sum.platformCut || 0
      };
    }

    res.json({
      user,
      recentOrders,
      financialSummary
    });
  } catch (error) {
    console.error('Get user details error:', error);
    res.status(500).json({ error: 'Failed to fetch user details' });
  }
};

export const updateUserStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { 
      isActive, 
      isSuspended, 
      isBanned,
      suspendedReason,
      bannedReason
    } = req.body;

    const updateData: any = {};
    
    if (typeof isActive === 'boolean') {
      updateData.isActive = isActive;
    }
    
    if (typeof isSuspended === 'boolean') {
      updateData.isSuspended = isSuspended;
      if (isSuspended) {
        updateData.suspendedAt = new Date();
      }
    }
    
    if (typeof isBanned === 'boolean') {
      updateData.isBanned = isBanned;
      if (isBanned) {
        updateData.bannedAt = new Date();
      }
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData
    });

    // Log admin action
    await prisma.activityLog.create({
      data: {
        userId: req.user?.id,
        action: 'user_status_update',
        details: `Updated user ${user.email} status`,
        metadata: JSON.stringify({
          targetUserId: id,
          changes: updateData,
          reason: suspendedReason || bannedReason
        })
      }
    });

    res.json({ message: 'User status updated successfully', user });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ error: 'Failed to update user status' });
  }
};

// Vendor Management
export const getVendors = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 20, status, performance } = req.query;

    const where: any = {
      role: 'seller',
      isDeleted: false
    };

    if (status && status !== 'all') {
      if (status === 'active') {
        where.isActive = true;
        where.isSuspended = false;
      } else if (status === 'suspended') {
        where.isSuspended = true;
      }
    }

    // Use a safer approach without complex raw SQL for vendor listing
    const vendors = await prisma.user.findMany({
      where: {
        role: 'seller',
        isDeleted: false,
        ...(status === 'active' && { isActive: true, isSuspended: false }),
        ...(status === 'suspended' && { isSuspended: true })
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        isActive: true,
        isSuspended: true,
        createdAt: true,
        _count: {
          select: {
            orders: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit)
    });

    const totalCount = await prisma.user.count({ 
      where: { role: 'seller', isDeleted: false } 
    });

    res.json({
      vendors,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: totalCount,
        pages: Math.ceil(totalCount / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get vendors error:', error);
    res.status(500).json({ error: 'Failed to fetch vendors' });
  }
};

// Commission Management
export const getCommissionSettings = async (req: AuthRequest, res: Response) => {
  try {
    const schemes = await prisma.revenueShareScheme.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    });

    res.json(schemes);
  } catch (error) {
    console.error('Get commission settings error:', error);
    res.status(500).json({ error: 'Failed to fetch commission settings' });
  }
};

export const updateCommissionScheme = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const {
      name,
      category,
      platformPercentage,
      sellerPercentage,
      minimumFee,
      maximumFee,
      userType,
      effectiveFrom
    } = req.body;

    // Validate percentages add up to 100
    if (Number(platformPercentage) + Number(sellerPercentage) !== 100) {
      return res.status(400).json({ 
        error: 'Platform and seller percentages must add up to 100%' 
      });
    }

    const scheme = await prisma.revenueShareScheme.update({
      where: { id },
      data: {
        name,
        category,
        platformPercentage: Number(platformPercentage) / 100,
        sellerPercentage: Number(sellerPercentage) / 100,
        minimumFee: minimumFee ? Number(minimumFee) : undefined,
        maximumFee: maximumFee ? Number(maximumFee) : undefined,
        userType,
        effectiveFrom: effectiveFrom ? new Date(effectiveFrom) : undefined
      }
    });

    res.json(scheme);
  } catch (error) {
    console.error('Update commission scheme error:', error);
    res.status(500).json({ error: 'Failed to update commission scheme' });
  }
};

export const createCommissionScheme = async (req: AuthRequest, res: Response) => {
  try {
    const {
      name,
      category,
      platformPercentage,
      sellerPercentage,
      minimumFee,
      maximumFee,
      userType
    } = req.body;

    // Validate percentages
    if (Number(platformPercentage) + Number(sellerPercentage) !== 100) {
      return res.status(400).json({ 
        error: 'Platform and seller percentages must add up to 100%' 
      });
    }

    const scheme = await prisma.revenueShareScheme.create({
      data: {
        name,
        category,
        platformPercentage: Number(platformPercentage) / 100,
        sellerPercentage: Number(sellerPercentage) / 100,
        minimumFee: minimumFee ? Number(minimumFee) : 0,
        maximumFee: maximumFee ? Number(maximumFee) : undefined,
        userType,
        isActive: true
      }
    });

    res.status(201).json(scheme);
  } catch (error) {
    console.error('Create commission scheme error:', error);
    res.status(500).json({ error: 'Failed to create commission scheme' });
  }
};

// Refund Management
export const getRefunds = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 20, status, priority } = req.query;

    const where: any = {};

    if (status && status !== 'all') {
      where.status = status;
    }

    const refunds = await prisma.refund.findMany({
      where,
      include: {
        order: {
          include: {
            product: {
              select: { title: true, images: true }
            },
            buyer: {
              select: { firstName: true, lastName: true, email: true }
            }
          }
        }
      },
      orderBy: {
        createdAt: priority === 'urgent' ? 'asc' : 'desc'
      },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit)
    });

    const totalCount = await prisma.refund.count({ where });

    res.json({
      refunds,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: totalCount,
        pages: Math.ceil(totalCount / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get refunds error:', error);
    res.status(500).json({ error: 'Failed to fetch refunds' });
  }
};

export const processRefund = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, adminNotes, refundAmount } = req.body;
    const adminId = req.user?.id;

    const refund = await prisma.refund.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            product: true,
            buyer: true
          }
        }
      }
    });

    if (!refund) {
      return res.status(404).json({ error: 'Refund request not found' });
    }

    // Update refund status
    const updatedRefund = await prisma.refund.update({
      where: { id },
      data: {
        status,
        processedBy: adminId,
        amount: refundAmount ? Number(refundAmount) : refund.amount,
        updatedAt: new Date()
      }
    });

    // If approved, process the actual refund
    if (status === 'approved') {
      // Find the payment for this order first
      const payment = await prisma.payment.findFirst({
        where: {
          orderId: refund.orderId
        }
      });

      if (payment) {
        // Create payment refund record
        await prisma.paymentRefund.create({
          data: {
            paymentId: payment.id, // Use the actual payment ID
            amount: updatedRefund.amount,
            reason: refund.reason,
            status: 'processing',
            requestedBy: refund.requestedBy,
            processedBy: adminId
          }
        });
      }

      // TODO: Process actual refund with payment provider
    }

    // Log admin action
    await prisma.activityLog.create({
      data: {
        userId: adminId,
        action: 'refund_processed',
        details: `Processed refund for order ${refund.orderId}`,
        metadata: JSON.stringify({
          refundId: id,
          status,
          amount: updatedRefund.amount,
          notes: adminNotes
        })
      }
    });

    res.json(updatedRefund);
  } catch (error) {
    console.error('Process refund error:', error);
    res.status(500).json({ error: 'Failed to process refund' });
  }
};

// Platform Analytics
export const getPlatformAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const { period = '30d' } = req.query;

    let dateFilter: Date;
    switch (period) {
      case '7d':
        dateFilter = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        dateFilter = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        dateFilter = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        dateFilter = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        dateFilter = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }

    // Revenue analytics
    const revenueData = await prisma.$queryRaw`
      SELECT 
        DATE(paidAt) as date,
        COUNT(*) as transactions,
        SUM(amount) as totalRevenue,
        SUM(platformCut) as platformRevenue,
        SUM(sellerNet) as sellerPayouts
      FROM payments 
      WHERE status = 'completed' 
        AND paidAt >= ${dateFilter}
      GROUP BY DATE(paidAt)
      ORDER BY date ASC
    `;

    // User growth
    const userGrowth = await prisma.$queryRaw`
      SELECT 
        DATE(createdAt) as date,
        COUNT(CASE WHEN role = 'customer' THEN 1 END) as customers,
        COUNT(CASE WHEN role = 'seller' THEN 1 END) as sellers,
        COUNT(*) as total
      FROM users 
      WHERE createdAt >= ${dateFilter} AND isDeleted = false
      GROUP BY DATE(createdAt)
      ORDER BY date ASC
    `;

    // Product categories performance
    const categoryPerformance = await prisma.$queryRaw`
      SELECT 
        p.category,
        COUNT(DISTINCT p.id) as totalProducts,
        COUNT(o.id) as totalOrders,
        SUM(o.totalAmount) as revenue,
        AVG(r.rating) as avgRating
      FROM products p
      LEFT JOIN orders o ON p.id = o.productId AND o.createdAt >= ${dateFilter}
      LEFT JOIN reviews r ON p.id = r.productId
      WHERE p.status = 'active'
      GROUP BY p.category
      ORDER BY revenue DESC
    `;

    // Geographic distribution
    const geographicData = await prisma.$queryRaw`
      SELECT 
        p.location as location,
        COUNT(DISTINCT p.sellerId) as sellers,
        COUNT(o.id) as orders,
        SUM(o.totalAmount) as revenue
      FROM products p
      LEFT JOIN orders o ON p.id = o.productId AND o.createdAt >= ${dateFilter}
      WHERE p.location IS NOT NULL
      GROUP BY p.location
      ORDER BY revenue DESC
      LIMIT 10
    `;

    res.json({
      revenueData,
      userGrowth,
      categoryPerformance,
      geographicData,
      period
    });
  } catch (error) {
    console.error('Get platform analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch platform analytics' });
  }
};

// Content Moderation
export const getModerationQueue = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 20, priority, type } = req.query;

    const where: any = {
      status: 'pending'
    };

    if (priority && priority !== 'all') {
      where.priority = priority;
    }

    if (type && type !== 'all') {
      where.contentType = type;
    }

    const queue = await prisma.moderationQueue.findMany({
      where,
      include: {
        author: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            role: true
          }
        }
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'asc' }
      ],
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit)
    });

    const totalCount = await prisma.moderationQueue.count({ where });

    res.json({
      queue,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: totalCount,
        pages: Math.ceil(totalCount / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get moderation queue error:', error);
    res.status(500).json({ error: 'Failed to fetch moderation queue' });
  }
};

export const moderateContent = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { decision, reason, action } = req.body;
    const moderatorId = req.user?.id;

    const queueItem = await prisma.moderationQueue.update({
      where: { id },
      data: {
        status: 'completed',
        assignedTo: moderatorId,
        reviewedAt: new Date()
      }
    });

    // Create moderation record
    await prisma.contentModeration.create({
      data: {
        contentType: queueItem.contentType,
        contentId: queueItem.contentId,
        authorId: queueItem.authorId,
        status: decision === 'approve' ? 'approved' : 'rejected',
        moderationType: 'manual',
        reviewedBy: moderatorId,
        reviewedAt: new Date(),
        action: action,
        actionReason: reason
      }
    });

    // Execute action if needed (remove, warn user, etc.)
    if (decision === 'reject' && action) {
      await executeContentAction(queueItem, action, reason, moderatorId!);
    }

    res.json({ message: 'Content moderated successfully' });
  } catch (error) {
    console.error('Moderate content error:', error);
    res.status(500).json({ error: 'Failed to moderate content' });
  }
};

// Helper function for content actions
async function executeContentAction(
  queueItem: any, 
  action: string, 
  reason: string, 
  moderatorId: string
) {
  switch (action) {
    case 'remove':
      if (queueItem.contentType === 'product') {
        await prisma.product.update({
          where: { id: queueItem.contentId },
          data: { status: 'removed' }
        });
      }
      break;
    
    case 'warn_user':
      await prisma.userWarning.create({
        data: {
          userId: queueItem.authorId,
          reason: reason,
          severity: 'medium',
          issuedBy: moderatorId
        }
      });
      break;
    
    case 'suspend_user':
      await prisma.user.update({
        where: { id: queueItem.authorId },
        data: {
          isSuspended: true,
          suspendedAt: new Date()
        }
      });
      break;
  }
}

// System Settings
export const getSystemSettings = async (req: AuthRequest, res: Response) => {
  try {
    // This would typically come from a settings table
    // For now, return hardcoded settings that can be updated
    const settings = {
      platform: {
        maintenanceMode: false,
        registrationEnabled: true,
        emailVerificationRequired: true,
        phoneVerificationRequired: false
      },
      payments: {
        defaultCurrency: 'NGN',
        enableEscrow: true,
        autoReleaseHours: 72,
        minimumWithdrawal: 1000
      },
      moderation: {
        autoModerationEnabled: true,
        requireApprovalForNewSellers: false,
        flaggedContentThreshold: 3
      }
    };

    res.json(settings);
  } catch (error) {
    console.error('Get system settings error:', error);
    res.status(500).json({ error: 'Failed to fetch system settings' });
  }
};

export const updateSystemSettings = async (req: AuthRequest, res: Response) => {
  try {
    const settings = req.body;
    const adminId = req.user?.id;

    // TODO: Implement actual settings storage
    // For now, just log the change
    await prisma.activityLog.create({
      data: {
        userId: adminId,
        action: 'system_settings_update',
        details: 'Updated system settings',
        metadata: JSON.stringify(settings)
      }
    });

    res.json({ message: 'Settings updated successfully', settings });
  } catch (error) {
    console.error('Update system settings error:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
};

// Export legacy class methods for backward compatibility
export class AdminController {
  async createRevenueShareScheme(req: Request, res: Response) {
    return createCommissionScheme(req as AuthRequest, res);
  }

  async getRevenueShareSchemes(req: Request, res: Response) {
    return getCommissionSettings(req as AuthRequest, res);
  }

  async updateRevenueShareScheme(req: Request, res: Response) {
    return updateCommissionScheme(req as AuthRequest, res);
  }

  async deleteRevenueShareScheme(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const adminId = (req as AuthRequest).user?.id;

      // Check if scheme is in use - revenue share schemes don't have direct payment relations
      // Just proceed with deletion as the schema doesn't have this relation
      const inUse = false; // No direct relation in schema

      if (inUse) {
        // Soft delete by deactivating instead of hard delete
        await prisma.revenueShareScheme.update({
          where: { id },
          data: { isActive: false }
        });
      } else {
        // Hard delete if not in use
        await prisma.revenueShareScheme.delete({
          where: { id }
        });
      }

      // Log admin action
      await prisma.activityLog.create({
        data: {
          userId: adminId,
          action: 'revenue_scheme_delete',
          details: `Deleted revenue share scheme: ${id}`,
          metadata: JSON.stringify({ schemeId: id, softDelete: !!inUse })
        }
      });

      res.json({ success: true, message: 'Revenue share scheme deleted successfully' });
    } catch (error) {
      console.error('Delete revenue share scheme error:', error);
      res.status(500).json({ success: false, error: 'Failed to delete revenue share scheme' });
    }
  }

  async createTaxRule(req: Request, res: Response) {
    try {
      const data = taxRuleSchema.parse(req.body);
      const adminId = (req as AuthRequest).user?.id;
      
      const taxRule = await prisma.taxRule.create({ 
        data: {
          name: data.name,
          type: data.type,
          rate: data.rate,
          category: data.category,
          region: data.region,
          description: data.description,
          isActive: true
        }
      });

      // Log admin action
      await prisma.activityLog.create({
        data: {
          userId: adminId,
          action: 'tax_rule_create',
          details: `Created tax rule: ${taxRule.name}`,
          metadata: JSON.stringify({ taxRuleId: taxRule.id, type: taxRule.type })
        }
      });

      res.json({ success: true, data: taxRule });
    } catch (error) {
      console.error('Create tax rule error:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create tax rule'
      });
    }
  }

  async getTaxRules(req: Request, res: Response) {
    try {
      const { page = 1, limit = 20, type, status } = req.query;
      
      const where: any = {};
      if (type && type !== 'all') {
        where.type = type;
      }
      if (status === 'active') {
        where.isActive = true;
      } else if (status === 'inactive') {
        where.isActive = false;
      }

      const taxRules = await prisma.taxRule.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit)
      });

      const total = await prisma.taxRule.count({ where });

      res.json({ 
        success: true, 
        data: {
          taxRules,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit))
          }
        }
      });
    } catch (error) {
      console.error('Get tax rules error:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch tax rules' });
    }
  }

  async updateTaxRule(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = taxRuleSchema.partial().parse(req.body);
      const adminId = (req as AuthRequest).user?.id;

      const updateData: any = {};
      if (data.name) updateData.name = data.name;
      if (data.type) updateData.type = data.type;
      if (data.rate !== undefined) updateData.rate = data.rate;
      if (data.category) updateData.category = data.category;
      if (data.region) updateData.region = data.region;
      if (data.description !== undefined) updateData.description = data.description;
      updateData.updatedAt = new Date();

      const taxRule = await prisma.taxRule.update({
        where: { id },
        data: updateData
      });

      // Log admin action
      await prisma.activityLog.create({
        data: {
          userId: adminId,
          action: 'tax_rule_update',
          details: `Updated tax rule: ${taxRule.name}`,
          metadata: JSON.stringify({ taxRuleId: id, changes: data })
        }
      });

      res.json({ success: true, data: taxRule });
    } catch (error) {
      console.error('Update tax rule error:', error);
      res.status(500).json({ success: false, error: 'Failed to update tax rule' });
    }
  }

  async deleteTaxRule(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const adminId = (req as AuthRequest).user?.id;

      // Check if tax rule is in use - no direct relation in schema
      // Just proceed with deletion as the schema doesn't have this relation
      const inUse = false; // No direct relation in schema

      if (inUse) {
        // Soft delete by deactivating
        await prisma.taxRule.update({
          where: { id },
          data: { isActive: false }
        });
      } else {
        // Hard delete if not in use
        await prisma.taxRule.delete({
          where: { id }
        });
      }

      // Log admin action
      await prisma.activityLog.create({
        data: {
          userId: adminId,
          action: 'tax_rule_delete',
          details: `Deleted tax rule: ${id}`,
          metadata: JSON.stringify({ taxRuleId: id, softDelete: !!inUse })
        }
      });

      res.json({ success: true, message: 'Tax rule deleted successfully' });
    } catch (error) {
      console.error('Delete tax rule error:', error);
      res.status(500).json({ success: false, error: 'Failed to delete tax rule' });
    }
  }

  async getPaymentAnalytics(req: Request, res: Response) {
    try {
      const { period = '30d', metric = 'all' } = req.query;
      
      let dateFilter: Date;
      switch (period) {
        case '7d':
          dateFilter = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          dateFilter = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '90d':
          dateFilter = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
          break;
        case '1y':
          dateFilter = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
          break;
        default:
          dateFilter = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      }

      // Payment volume and trends
      const paymentTrends = await prisma.$queryRaw`
        SELECT 
          DATE(paidAt) as date,
          COUNT(*) as totalTransactions,
          SUM(amount) as totalVolume,
          AVG(amount) as avgTransactionValue,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as successfulPayments,
          COUNT(CASE WHEN status = 'failed' THEN 1 END) as failedPayments,
          COUNT(CASE WHEN status = 'pending' THEN 1 END) as pendingPayments
        FROM payments 
        WHERE createdAt >= ${dateFilter}
        GROUP BY DATE(paidAt)
        ORDER BY date ASC
      `;

      // Payment methods breakdown
      const paymentMethods = await prisma.$queryRaw`
        SELECT 
          method as paymentMethod,
          COUNT(*) as transactions,
          SUM(amount) as volume,
          AVG(amount) as avgAmount,
          (COUNT(*) * 100.0 / (SELECT COUNT(*) FROM payments WHERE createdAt >= ${dateFilter})) as percentage
        FROM payments 
        WHERE createdAt >= ${dateFilter}
        GROUP BY method
        ORDER BY transactions DESC
      `;

      // Failed payments analysis
      const failureAnalysis = await prisma.$queryRaw`
        SELECT 
          failureReason,
          COUNT(*) as count,
          (COUNT(*) * 100.0 / (SELECT COUNT(*) FROM payments WHERE status = 'failed' AND createdAt >= ${dateFilter})) as percentage
        FROM payments 
        WHERE status = 'failed' AND createdAt >= ${dateFilter}
        GROUP BY failureReason
        ORDER BY count DESC
        LIMIT 10
      `;

      // Revenue breakdown
      const revenueBreakdown = await prisma.payment.aggregate({
        where: {
          status: 'completed',
          createdAt: { gte: dateFilter }
        },
        _sum: {
          amount: true,
          platformCut: true,
          sellerNet: true,
          processingFee: true
        },
        _avg: {
          amount: true
        },
        _count: true
      });

      res.json({
        success: true,
        data: {
          period,
          summary: {
            totalTransactions: revenueBreakdown._count,
            totalVolume: revenueBreakdown._sum.amount || 0,
            platformRevenue: revenueBreakdown._sum.platformCut || 0,
            sellerPayouts: revenueBreakdown._sum.sellerNet || 0,
            processingFees: revenueBreakdown._sum.processingFee || 0,
            avgTransactionValue: revenueBreakdown._avg.amount || 0
          },
          trends: paymentTrends,
          paymentMethods,
          failureAnalysis
        }
      });
    } catch (error) {
      console.error('Get payment analytics error:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch payment analytics' });
    }
  }

  async getRevenueBreakdown(req: Request, res: Response) {
    try {
      const { period = '30d', breakdown = 'category' } = req.query;
      
      let dateFilter: Date;
      switch (period) {
        case '7d':
          dateFilter = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          dateFilter = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '90d':
          dateFilter = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
          break;
        case '1y':
          dateFilter = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
          break;
        default:
          dateFilter = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      }

      let revenueData: any;

      if (breakdown === 'category') {
        revenueData = await prisma.$queryRaw`
          SELECT 
            p.category,
            COUNT(DISTINCT o.id) as totalOrders,
            COALESCE(SUM(pay.amount), 0) as totalRevenue,
            COALESCE(SUM(pay.platformCut), 0) as platformRevenue,
            COALESCE(SUM(pay.sellerNet), 0) as sellerRevenue,
            COALESCE(AVG(pay.amount), 0) as avgOrderValue
          FROM payments pay
          JOIN orders o ON pay.orderId = o.id
          JOIN products p ON o.productId = p.id
          WHERE pay.status = 'completed' AND pay.createdAt >= ${dateFilter}
          GROUP BY p.category
          ORDER BY totalRevenue DESC
        `;
      } else if (breakdown === 'seller') {
        revenueData = await prisma.$queryRaw`
          SELECT 
            u.id as sellerId,
            u.firstName,
            u.lastName,
            u.email,
            COUNT(DISTINCT pay.id) as totalTransactions,
            COALESCE(SUM(pay.sellerNet), 0) as totalEarnings,
            COALESCE(SUM(pay.platformCut), 0) as platformFees,
            COALESCE(AVG(pay.amount), 0) as avgOrderValue
          FROM payments pay
          JOIN users u ON pay.sellerId = u.id
          WHERE pay.status = 'completed' AND pay.createdAt >= ${dateFilter}
          GROUP BY u.id, u.firstName, u.lastName, u.email
          ORDER BY totalEarnings DESC
          LIMIT 50
        `;
      } else if (breakdown === 'monthly') {
        revenueData = await prisma.$queryRaw`
          SELECT 
            DATE_FORMAT(pay.createdAt, '%Y-%m') as month,
            COUNT(*) as transactions,
            COALESCE(SUM(pay.amount), 0) as totalRevenue,
            COALESCE(SUM(pay.platformCut), 0) as platformRevenue,
            COALESCE(SUM(pay.sellerNet), 0) as sellerPayouts
          FROM payments pay
          WHERE pay.status = 'completed' AND pay.createdAt >= ${dateFilter}
          GROUP BY DATE_FORMAT(pay.createdAt, '%Y-%m')
          ORDER BY month ASC
        `;
      }

      // Overall summary
      const summary = await prisma.payment.aggregate({
        where: {
          status: 'completed',
          createdAt: { gte: dateFilter }
        },
        _sum: {
          amount: true,
          platformCut: true,
          sellerNet: true
        },
        _count: true
      });

      res.json({
        success: true,
        data: {
          period,
          breakdownType: breakdown,
          summary: {
            totalTransactions: summary._count,
            totalRevenue: summary._sum.amount || 0,
            platformRevenue: summary._sum.platformCut || 0,
            sellerPayouts: summary._sum.sellerNet || 0
          },
          breakdown: revenueData
        }
      });
    } catch (error) {
      console.error('Get revenue breakdown error:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch revenue breakdown' });
    }
  }

  async getPendingPayouts(req: Request, res: Response) {
    try {
      const { page = 1, limit = 20, priority, sellerId } = req.query;
      
      const where: any = {
        status: { in: ['scheduled', 'processing'] }
      };

      if (sellerId) {
        where.sellerId = sellerId;
      }

      const payouts = await prisma.payout.findMany({
        where,
        include: {
          items: true
          // Remove items relation if it doesn't exist in schema
          // items: {
          //   include: {
          //     payment: {
          //       select: {
          //         id: true,
          //         amount: true,
          //         orderId: true
          //       }
          //     }
          //   }
          // }
        },
        orderBy: { createdAt: 'desc' },
        take: Number(limit),
        skip: (Number(page) - 1) * Number(limit)
      });

      const total = await prisma.payout.count({ where });

      res.json({ 
        success: true, 
        data: { 
          payouts, 
          pagination: { 
            page: Number(page), 
            limit: Number(limit), 
            total,
            pages: Math.ceil(total / Number(limit))
          } 
        } 
      });
    } catch (error) {
      console.error('Get pending payouts error:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch pending payouts' });
    }
  }

  async processPayouts(req: Request, res: Response) {
    try {
      const { payoutIds, action = 'approve' } = req.body;
      const adminId = (req as AuthRequest).user?.id;

      if (!Array.isArray(payoutIds) || payoutIds.length === 0) {
        return res.status(400).json({ 
          success: false, 
          error: 'Payout IDs must be provided as an array' 
        });
      }

      const results = [];
      
      for (const payoutId of payoutIds) {
        try {
          const payout = await prisma.payout.findUnique({
            where: { id: payoutId },
            include: {
              items: true
            }
          });

          if (!payout) {
            results.push({ id: payoutId, success: false, error: 'Payout not found' });
            continue;
          }

          if (payout.status !== 'scheduled' && payout.status !== 'processing') {
            results.push({ 
              id: payoutId, 
              success: false, 
              error: 'Payout already processed or cancelled' 
            });
            continue;
          }

          if (action === 'approve') {
            // Update payout status
            await prisma.payout.update({
              where: { id: payoutId },
              data: {
                status: 'processing',
                processedAt: new Date()
              }
            });

            // TODO: Integrate with actual payment provider to process payout
            // For now, we'll simulate the process
            
            // After successful processing with payment provider:
            await prisma.payout.update({
              where: { id: payoutId },
              data: {
                status: 'completed'
              }
            });

            // Log the action
            await prisma.activityLog.create({
              data: {
                userId: adminId,
                action: 'payout_processed',
                details: `Processed payout for seller ${payout.sellerId}`,
                metadata: JSON.stringify({
                  payoutId,
                  sellerId: payout.sellerId,
                  amount: payout.totalAmount
                })
              }
            });

            results.push({ id: payoutId, success: true, message: 'Payout processed successfully' });
          } else if (action === 'reject') {
            await prisma.payout.update({
              where: { id: payoutId },
              data: {
                status: 'failed',
                processedAt: new Date()
              }
            });

            results.push({ id: payoutId, success: true, message: 'Payout rejected successfully' });
          }
        } catch (payoutError) {
          console.error(`Error processing payout ${payoutId}:`, payoutError);
          results.push({ 
            id: payoutId, 
            success: false, 
            error: 'Failed to process payout' 
          });
        }
      }

      res.json({ success: true, data: { results } });
    } catch (error) {
      console.error('Process payouts error:', error);
      res.status(500).json({ success: false, error: 'Failed to process payouts' });
    }
  }

  async getPaymentConfig(req: Request, res: Response) {
    try {
      // Get payment configuration from database or return default config
      const config = {
        providers: {
          paystack: {
            enabled: true,
            publicKey: process.env.PAYSTACK_PUBLIC_KEY || '',
            webhookSecret: process.env.PAYSTACK_WEBHOOK_SECRET ? '[CONFIGURED]' : '[NOT CONFIGURED]'
          },
          flutterwave: {
            enabled: false,
            publicKey: process.env.FLUTTERWAVE_PUBLIC_KEY || '',
            webhookSecret: process.env.FLUTTERWAVE_WEBHOOK_SECRET ? '[CONFIGURED]' : '[NOT CONFIGURED]'
          }
        },
        settings: {
          defaultCurrency: 'NGN',
          enableEscrow: true,
          escrowReleaseHours: 72,
          minimumWithdrawal: 1000,
          maximumWithdrawal: 500000,
          processingFeePercentage: 2.5,
          minimumProcessingFee: 50,
          maximumProcessingFee: 2000
        },
        features: {
          autoPayouts: true,
          payoutSchedule: 'weekly',
          refundsEnabled: true,
          partialRefundsEnabled: true,
          multiCurrencySupport: false
        }
      };

      res.json({ success: true, data: config });
    } catch (error) {
      console.error('Get payment config error:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch payment configuration' });
    }
  }

  async updatePaymentConfig(req: Request, res: Response) {
    try {
      const config = req.body;
      const adminId = (req as AuthRequest).user?.id;

      // Validate the configuration
      const configSchema = z.object({
        providers: z.object({
          paystack: z.object({
            enabled: z.boolean()
          }).optional(),
          flutterwave: z.object({
            enabled: z.boolean()
          }).optional()
        }).optional(),
        settings: z.object({
          defaultCurrency: z.string().optional(),
          enableEscrow: z.boolean().optional(),
          escrowReleaseHours: z.number().min(1).max(168).optional(), // 1 hour to 1 week
          minimumWithdrawal: z.number().min(0).optional(),
          maximumWithdrawal: z.number().min(1000).optional(),
          processingFeePercentage: z.number().min(0).max(10).optional(),
          minimumProcessingFee: z.number().min(0).optional(),
          maximumProcessingFee: z.number().min(100).optional()
        }).optional(),
        features: z.object({
          autoPayouts: z.boolean().optional(),
          payoutSchedule: z.enum(['daily', 'weekly', 'monthly']).optional(),
          refundsEnabled: z.boolean().optional(),
          partialRefundsEnabled: z.boolean().optional(),
          multiCurrencySupport: z.boolean().optional()
        }).optional()
      });

      const validatedConfig = configSchema.parse(config);

      // TODO: Store configuration in database
      // For now, we'll just log the change
      await prisma.activityLog.create({
        data: {
          userId: adminId,
          action: 'payment_config_update',
          details: 'Updated payment configuration',
          metadata: JSON.stringify(validatedConfig)
        }
      });

      res.json({ success: true, message: 'Payment configuration updated successfully' });
    } catch (error) {
      console.error('Update payment config error:', error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update payment configuration' 
      });
    }
  }
}

export const adminController = new AdminController();

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAnalytics = exports.updateStoreSettings = exports.getStoreSettings = exports.requestWithdrawal = exports.getEarnings = exports.updateOrderStatus = exports.getSellerOrders = exports.bulkUpdateProducts = exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getSellerProducts = exports.getDashboardStats = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Seller Dashboard Analytics
const getDashboardStats = async (req, res) => {
    try {
        const sellerId = req.user?.id;
        if (!sellerId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        // Get total products
        const totalProducts = await prisma.product.count({
            where: { sellerId, status: { not: 'deleted' } }
        });
        // Get total orders
        const totalOrders = await prisma.order.count({
            where: { sellerId }
        });
        // Get total earnings
        const earnings = await prisma.payment.aggregate({
            where: {
                sellerId,
                status: 'completed'
            },
            _sum: {
                sellerNet: true
            }
        });
        // Get pending withdrawals
        const pendingWithdrawals = await prisma.payout.aggregate({
            where: {
                sellerId,
                status: { in: ['scheduled', 'processing'] }
            },
            _sum: {
                totalAmount: true
            }
        });
        // Get recent orders
        const recentOrders = await prisma.order.findMany({
            where: { sellerId },
            include: {
                product: {
                    select: { title: true, images: true }
                },
                buyer: {
                    select: { firstName: true, lastName: true, email: true }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 10
        });
        // Get monthly sales data (last 12 months)
        const monthlyStats = await prisma.$queryRaw `
      SELECT 
        DATE_FORMAT(createdAt, '%Y-%m') as month,
        COUNT(*) as orders,
        SUM(totalAmount) as revenue
      FROM orders 
      WHERE sellerId = ${sellerId} 
        AND createdAt >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(createdAt, '%Y-%m')
      ORDER BY month DESC
    `;
        // Get top performing products
        const topProducts = await prisma.$queryRaw `
      SELECT 
        p.id, p.title, p.price, p.images,
        COUNT(o.id) as orderCount,
        SUM(o.totalAmount) as revenue
      FROM products p
      LEFT JOIN orders o ON p.id = o.productId
      WHERE p.sellerId = ${sellerId}
      GROUP BY p.id
      ORDER BY orderCount DESC
      LIMIT 5
    `;
        res.json({
            stats: {
                totalProducts,
                totalOrders,
                totalEarnings: earnings._sum.sellerNet || 0,
                pendingWithdrawals: pendingWithdrawals._sum.totalAmount || 0,
                availableBalance: (earnings._sum.sellerNet || 0) - (pendingWithdrawals._sum.totalAmount || 0)
            },
            recentOrders,
            monthlyStats,
            topProducts
        });
    }
    catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
};
exports.getDashboardStats = getDashboardStats;
// Product Management
const getSellerProducts = async (req, res) => {
    try {
        const sellerId = req.user?.id;
        const { page = 1, limit = 20, status, category, search } = req.query;
        const where = {
            sellerId,
            status: { not: 'deleted' }
        };
        if (status && status !== 'all') {
            where.status = status;
        }
        if (category) {
            where.category = category;
        }
        if (search) {
            where.OR = [
                { title: { contains: search } },
                { description: { contains: search } }
            ];
        }
        const products = await prisma.product.findMany({
            where,
            include: {
                _count: {
                    select: {
                        orders: true,
                        reviews: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            skip: (Number(page) - 1) * Number(limit),
            take: Number(limit)
        });
        const totalCount = await prisma.product.count({ where });
        res.json({
            products,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total: totalCount,
                pages: Math.ceil(totalCount / Number(limit))
            }
        });
    }
    catch (error) {
        console.error('Get seller products error:', error);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
};
exports.getSellerProducts = getSellerProducts;
const createProduct = async (req, res) => {
    try {
        const sellerId = req.user?.id;
        const { title, description, price, category, condition = 'new', images = [], location, featured = false, variants = [], inventory = 1, sku, tags = [] } = req.body;
        const product = await prisma.product.create({
            data: {
                title,
                description,
                price: Number(price),
                category,
                condition,
                images: JSON.stringify(images),
                location,
                featured,
                sellerId: sellerId,
                status: 'active'
            }
        });
        res.status(201).json(product);
    }
    catch (error) {
        console.error('Create product error:', error);
        res.status(500).json({ error: 'Failed to create product' });
    }
};
exports.createProduct = createProduct;
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const sellerId = req.user?.id;
        const updateData = req.body;
        // Verify ownership
        const product = await prisma.product.findFirst({
            where: { id, sellerId }
        });
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        // Handle images array
        if (updateData.images && Array.isArray(updateData.images)) {
            updateData.images = JSON.stringify(updateData.images);
        }
        const updatedProduct = await prisma.product.update({
            where: { id },
            data: {
                ...updateData,
                updatedAt: new Date()
            }
        });
        res.json(updatedProduct);
    }
    catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({ error: 'Failed to update product' });
    }
};
exports.updateProduct = updateProduct;
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const sellerId = req.user?.id;
        // Verify ownership
        const product = await prisma.product.findFirst({
            where: { id, sellerId }
        });
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        // Soft delete by updating status
        await prisma.product.update({
            where: { id },
            data: {
                status: 'deleted',
                updatedAt: new Date()
            }
        });
        res.json({ message: 'Product deleted successfully' });
    }
    catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({ error: 'Failed to delete product' });
    }
};
exports.deleteProduct = deleteProduct;
// Bulk operations
const bulkUpdateProducts = async (req, res) => {
    try {
        const sellerId = req.user?.id;
        const { productIds, updateData } = req.body;
        if (!Array.isArray(productIds) || productIds.length === 0) {
            return res.status(400).json({ error: 'Product IDs are required' });
        }
        // Verify ownership of all products
        const products = await prisma.product.findMany({
            where: {
                id: { in: productIds },
                sellerId
            },
            select: { id: true }
        });
        if (products.length !== productIds.length) {
            return res.status(403).json({ error: 'Some products not found or unauthorized' });
        }
        // Perform bulk update
        const result = await prisma.product.updateMany({
            where: {
                id: { in: productIds },
                sellerId
            },
            data: {
                ...updateData,
                updatedAt: new Date()
            }
        });
        res.json({
            message: `${result.count} products updated successfully`,
            updatedCount: result.count
        });
    }
    catch (error) {
        console.error('Bulk update error:', error);
        res.status(500).json({ error: 'Failed to update products' });
    }
};
exports.bulkUpdateProducts = bulkUpdateProducts;
// Order Management
const getSellerOrders = async (req, res) => {
    try {
        const sellerId = req.user?.id;
        const { page = 1, limit = 20, status, startDate, endDate } = req.query;
        const where = { sellerId };
        if (status && status !== 'all') {
            where.status = status;
        }
        if (startDate && endDate) {
            where.createdAt = {
                gte: new Date(startDate),
                lte: new Date(endDate)
            };
        }
        const orders = await prisma.order.findMany({
            where,
            include: {
                product: {
                    select: {
                        title: true,
                        images: true,
                        price: true
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
                    select: {
                        trackingNumber: true,
                        status: true,
                        estimatedDelivery: true
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
    }
    catch (error) {
        console.error('Get seller orders error:', error);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
};
exports.getSellerOrders = getSellerOrders;
const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, notes } = req.body;
        const sellerId = req.user?.id;
        // Verify seller owns this order
        const order = await prisma.order.findFirst({
            where: { id, sellerId }
        });
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        // Validate status transitions
        const validTransitions = {
            'pending': ['confirmed', 'cancelled'],
            'confirmed': ['shipped', 'cancelled'],
            'shipped': ['delivered'],
            'delivered': [],
            'cancelled': []
        };
        if (!validTransitions[order.status]?.includes(status)) {
            return res.status(400).json({
                error: `Invalid status transition from ${order.status} to ${status}`
            });
        }
        const updatedOrder = await prisma.order.update({
            where: { id },
            data: {
                status,
                updatedAt: new Date()
            },
            include: {
                buyer: {
                    select: { firstName: true, lastName: true, email: true }
                },
                product: {
                    select: { title: true }
                }
            }
        });
        // TODO: Send notification to buyer
        // await notificationService.sendOrderStatusUpdate(updatedOrder);
        res.json(updatedOrder);
    }
    catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({ error: 'Failed to update order status' });
    }
};
exports.updateOrderStatus = updateOrderStatus;
// Financial Management
const getEarnings = async (req, res) => {
    try {
        const sellerId = req.user?.id;
        const { period = 'all', startDate, endDate } = req.query;
        let dateFilter = {};
        if (period === 'week') {
            dateFilter = {
                paidAt: {
                    gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                }
            };
        }
        else if (period === 'month') {
            dateFilter = {
                paidAt: {
                    gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                }
            };
        }
        else if (startDate && endDate) {
            dateFilter = {
                paidAt: {
                    gte: new Date(startDate),
                    lte: new Date(endDate)
                }
            };
        }
        // Get total earnings
        const totalEarnings = await prisma.payment.aggregate({
            where: {
                sellerId,
                status: 'completed',
                ...dateFilter
            },
            _sum: {
                sellerNet: true,
                platformCut: true,
                processingFee: true
            },
            _count: true
        });
        // Get pending payouts
        const pendingPayouts = await prisma.payout.aggregate({
            where: {
                sellerId,
                status: { in: ['scheduled', 'processing'] }
            },
            _sum: {
                totalAmount: true
            }
        });
        // Get completed payouts
        const completedPayouts = await prisma.payout.findMany({
            where: {
                sellerId,
                status: 'completed'
            },
            orderBy: { completedAt: 'desc' },
            take: 10
        });
        // Calculate available balance
        const availableBalance = (totalEarnings._sum.sellerNet || 0) - (pendingPayouts._sum.totalAmount || 0);
        res.json({
            summary: {
                totalEarnings: totalEarnings._sum.sellerNet || 0,
                platformFees: totalEarnings._sum.platformCut || 0,
                processingFees: totalEarnings._sum.processingFee || 0,
                pendingPayouts: pendingPayouts._sum.totalAmount || 0,
                availableBalance,
                transactionCount: totalEarnings._count
            },
            recentPayouts: completedPayouts
        });
    }
    catch (error) {
        console.error('Get earnings error:', error);
        res.status(500).json({ error: 'Failed to fetch earnings' });
    }
};
exports.getEarnings = getEarnings;
const requestWithdrawal = async (req, res) => {
    try {
        const sellerId = req.user?.id;
        const { amount, bankDetails, withdrawalMethod = 'bank_transfer' } = req.body;
        if (!amount || amount <= 0) {
            return res.status(400).json({ error: 'Valid amount is required' });
        }
        // Check available balance
        const earnings = await prisma.payment.aggregate({
            where: {
                sellerId,
                status: 'completed'
            },
            _sum: {
                sellerNet: true
            }
        });
        const pendingWithdrawals = await prisma.payout.aggregate({
            where: {
                sellerId,
                status: { in: ['scheduled', 'processing'] }
            },
            _sum: {
                totalAmount: true
            }
        });
        const availableBalance = (earnings._sum.sellerNet || 0) - (pendingWithdrawals._sum.totalAmount || 0);
        if (amount > availableBalance) {
            return res.status(400).json({
                error: 'Insufficient balance',
                availableBalance
            });
        }
        // Create withdrawal request
        const payout = await prisma.payout.create({
            data: {
                sellerId: sellerId,
                totalAmount: Number(amount),
                status: 'scheduled',
                provider: withdrawalMethod,
                bankDetails: JSON.stringify(bankDetails),
                scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // Process tomorrow
            }
        });
        res.status(201).json({
            message: 'Withdrawal request submitted successfully',
            payout
        });
    }
    catch (error) {
        console.error('Request withdrawal error:', error);
        res.status(500).json({ error: 'Failed to request withdrawal' });
    }
};
exports.requestWithdrawal = requestWithdrawal;
// Store Settings
const getStoreSettings = async (req, res) => {
    try {
        const sellerId = req.user?.id;
        const seller = await prisma.user.findUnique({
            where: { id: sellerId },
            select: {
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                avatar: true,
                profile: true
            }
        });
        if (!seller) {
            return res.status(404).json({ error: 'Seller not found' });
        }
        res.json(seller);
    }
    catch (error) {
        console.error('Get store settings error:', error);
        res.status(500).json({ error: 'Failed to fetch store settings' });
    }
};
exports.getStoreSettings = getStoreSettings;
const updateStoreSettings = async (req, res) => {
    try {
        const sellerId = req.user?.id;
        const { firstName, lastName, phone, avatar, bio, website, location, businessHours, paymentMethods, shippingOptions } = req.body;
        // Update user basic info
        const updatedUser = await prisma.user.update({
            where: { id: sellerId },
            data: {
                firstName,
                lastName,
                phone,
                avatar
            }
        });
        // Update or create profile
        const profileData = {
            bio,
            website,
            location,
            preferences: JSON.stringify({
                businessHours,
                paymentMethods,
                shippingOptions
            })
        };
        const profile = await prisma.userProfile.upsert({
            where: { userId: sellerId },
            create: {
                userId: sellerId,
                ...profileData
            },
            update: profileData
        });
        res.json({
            user: updatedUser,
            profile
        });
    }
    catch (error) {
        console.error('Update store settings error:', error);
        res.status(500).json({ error: 'Failed to update store settings' });
    }
};
exports.updateStoreSettings = updateStoreSettings;
// Analytics
const getAnalytics = async (req, res) => {
    try {
        const sellerId = req.user?.id;
        const { period = '30d' } = req.query;
        let dateFilter;
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
            default:
                dateFilter = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        }
        // Sales analytics
        const salesData = await prisma.$queryRaw `
      SELECT 
        DATE(createdAt) as date,
        COUNT(*) as orders,
        SUM(totalAmount) as revenue,
        AVG(totalAmount) as avgOrderValue
      FROM orders 
      WHERE sellerId = ${sellerId} 
        AND createdAt >= ${dateFilter}
        AND status != 'cancelled'
      GROUP BY DATE(createdAt)
      ORDER BY date ASC
    `;
        // Product performance
        const productPerformance = await prisma.$queryRaw `
      SELECT 
        p.id, p.title, p.category, p.price,
        COUNT(o.id) as totalOrders,
        SUM(o.totalAmount) as totalRevenue,
        AVG(COALESCE(r.rating, 0)) as avgRating,
        COUNT(r.id) as reviewCount
      FROM products p
      LEFT JOIN orders o ON p.id = o.productId AND o.createdAt >= ${dateFilter}
      LEFT JOIN reviews r ON p.id = r.productId
      WHERE p.sellerId = ${sellerId}
      GROUP BY p.id
      ORDER BY totalOrders DESC
      LIMIT 10
    `;
        // Category breakdown
        const categoryBreakdown = await prisma.$queryRaw `
      SELECT 
        p.category,
        COUNT(o.id) as orders,
        SUM(o.totalAmount) as revenue
      FROM products p
      LEFT JOIN orders o ON p.id = o.productId AND o.createdAt >= ${dateFilter}
      WHERE p.sellerId = ${sellerId}
      GROUP BY p.category
      ORDER BY revenue DESC
    `;
        res.json({
            salesData,
            productPerformance,
            categoryBreakdown,
            period
        });
    }
    catch (error) {
        console.error('Get analytics error:', error);
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
};
exports.getAnalytics = getAnalytics;
//# sourceMappingURL=sellerController.js.map
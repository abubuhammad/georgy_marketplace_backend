"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSellerProducts = exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getProductById = exports.getProducts = void 0;
const express_validator_1 = require("express-validator");
const prisma_1 = require("../lib/prisma");
// Get all products with optional filters
const getProducts = async (req, res) => {
    try {
        const { search, category, minPrice, maxPrice, brand, condition, location, sortBy, page = 1, limit = 20 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        // Build where clause
        const whereClause = {
            isActive: true
        };
        if (search) {
            whereClause.OR = [
                { title: { contains: String(search), mode: 'insensitive' } },
                { productName: { contains: String(search), mode: 'insensitive' } },
                { description: { contains: String(search), mode: 'insensitive' } },
                { brand: { contains: String(search), mode: 'insensitive' } }
            ];
        }
        if (category) {
            whereClause.categoryId = String(category);
        }
        if (minPrice) {
            whereClause.price = { ...whereClause.price, gte: Number(minPrice) };
        }
        if (maxPrice) {
            whereClause.price = { ...whereClause.price, lte: Number(maxPrice) };
        }
        if (brand) {
            whereClause.brand = { equals: String(brand), mode: 'insensitive' };
        }
        if (condition) {
            whereClause.condition = String(condition);
        }
        // Build orderBy clause
        let orderBy = { createdAt: 'desc' };
        if (sortBy) {
            switch (sortBy) {
                case 'price_asc':
                    orderBy = { price: 'asc' };
                    break;
                case 'price_desc':
                    orderBy = { price: 'desc' };
                    break;
                case 'newest':
                    orderBy = { createdAt: 'desc' };
                    break;
                default:
                    break;
            }
        }
        const [products, total] = await Promise.all([
            prisma_1.prisma.product.findMany({
                where: whereClause,
                orderBy,
                skip,
                take: Number(limit),
                include: {
                    seller: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    firstName: true,
                                    lastName: true,
                                    email: true
                                }
                            }
                        }
                    }
                }
            }),
            prisma_1.prisma.product.count({ where: whereClause })
        ]);
        const pages = Math.ceil(total / Number(limit));
        res.json({
            success: true,
            data: {
                data: products,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total,
                    pages
                }
            }
        });
    }
    catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch products'
        });
    }
};
exports.getProducts = getProducts;
// Get single product by ID
const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await prisma_1.prisma.product.findUnique({
            where: { id },
            include: {
                seller: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                email: true
                            }
                        }
                    }
                }
            }
        });
        if (!product) {
            return res.status(404).json({
                success: false,
                error: 'Product not found'
            });
        }
        res.json({
            success: true,
            data: product
        });
    }
    catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch product'
        });
    }
};
exports.getProductById = getProductById;
// Create new product
const createProduct = async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'User not authenticated'
            });
        }
        const productData = req.body;
        // Find or verify seller profile
        let seller = await prisma_1.prisma.seller.findUnique({
            where: { userId }
        });
        if (!seller) {
            // Create seller profile if it doesn't exist
            seller = await prisma_1.prisma.seller.create({
                data: {
                    userId,
                    businessName: 'Default Business',
                    businessDescription: 'Default Description',
                    businessAddress: JSON.stringify({
                        street: '',
                        city: '',
                        state: '',
                        country: '',
                        postalCode: ''
                    })
                }
            });
        }
        // Prepare product data for database
        const productTitle = productData.title || productData.productName || 'Untitled Product';
        // Create the product with dynamic fields stored as JSON
        const newProduct = await prisma_1.prisma.product.create({
            data: {
                title: productTitle,
                productName: productData.productName,
                description: productData.description,
                price: productData.price,
                originalPrice: productData.originalPrice,
                categoryId: productData.categoryId,
                subcategoryId: productData.subcategoryId,
                brand: productData.brand,
                condition: productData.condition || 'new',
                sellerId: seller.id,
                images: JSON.stringify(productData.images || []),
                isNegotiable: productData.isNegotiable || false,
                // Location fields
                locationCity: productData.locationCity,
                locationState: productData.locationState,
                locationCountry: productData.locationCountry || 'Nigeria',
                location: productData.locationCity && productData.locationState
                    ? `${productData.locationCity}, ${productData.locationState}`
                    : undefined,
                // Store all category-specific fields as JSON in dynamicFields
                dynamicFields: JSON.stringify({
                    // Electronics fields
                    storage: productData.storage,
                    display: productData.display,
                    camera: productData.camera,
                    battery: productData.battery,
                    processor: productData.processor,
                    connectivity: productData.connectivity,
                    otherFeatures: productData.otherFeatures,
                    inBoxAccessories: productData.inBoxAccessories,
                    warranty: productData.warranty,
                    // Groceries fields
                    netWeight: productData.netWeight,
                    unit: productData.unit,
                    packagingType: productData.packagingType,
                    ingredients: productData.ingredients,
                    nutritionFacts: productData.nutritionFacts,
                    allergenInfo: productData.allergenInfo,
                    origin: productData.origin,
                    grade: productData.grade,
                    processingType: productData.processingType,
                    shelfLife: productData.shelfLife,
                    storageInstructions: productData.storageInstructions,
                    stockQuantity: productData.stockQuantity,
                    minimumOrderQuantity: productData.minimumOrderQuantity,
                    discountPrice: productData.discountPrice,
                    features: productData.features,
                    sku: productData.sku,
                    tags: productData.tags,
                    deliveryNotes: productData.deliveryNotes,
                    seasonalAvailability: productData.seasonalAvailability,
                    // Fashion fields
                    size: productData.size,
                    color: productData.color,
                    material: productData.material,
                    // Additional category field
                    category: productData.category
                }),
                isActive: true
            },
            include: {
                seller: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                email: true
                            }
                        }
                    }
                }
            }
        });
        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: newProduct
        });
    }
    catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create product'
        });
    }
};
exports.createProduct = createProduct;
// Update product
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        const updateData = req.body;
        // Verify product exists and belongs to user
        const existingProduct = await prisma_1.prisma.product.findFirst({
            where: {
                id,
                seller: {
                    userId
                }
            }
        });
        if (!existingProduct) {
            return res.status(404).json({
                success: false,
                error: 'Product not found or you do not have permission to update it'
            });
        }
        const productTitle = updateData.title || updateData.productName || existingProduct.title;
        const updatedProduct = await prisma_1.prisma.product.update({
            where: { id },
            data: {
                title: productTitle,
                productName: updateData.productName,
                description: updateData.description,
                price: updateData.price,
                originalPrice: updateData.originalPrice,
                brand: updateData.brand,
                condition: updateData.condition,
                images: updateData.images ? JSON.stringify(updateData.images) : undefined,
                isNegotiable: updateData.isNegotiable,
                // Update dynamic fields
                dynamicFields: (() => {
                    const existingFields = existingProduct.dynamicFields ?
                        JSON.parse(existingProduct.dynamicFields) : {};
                    const newDynamicFields = Object.fromEntries(Object.entries(updateData).filter(([key]) => ![
                        'title', 'productName', 'description', 'price', 'originalPrice',
                        'brand', 'condition', 'images', 'isNegotiable', 'categoryId', 'subcategoryId'
                    ].includes(key)));
                    return JSON.stringify({ ...existingFields, ...newDynamicFields });
                })()
            },
            include: {
                seller: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                email: true
                            }
                        }
                    }
                }
            }
        });
        res.json({
            success: true,
            message: 'Product updated successfully',
            data: updatedProduct
        });
    }
    catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update product'
        });
    }
};
exports.updateProduct = updateProduct;
// Delete product
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        // Verify product exists and belongs to user
        const existingProduct = await prisma_1.prisma.product.findFirst({
            where: {
                id,
                seller: {
                    userId
                }
            }
        });
        if (!existingProduct) {
            return res.status(404).json({
                success: false,
                error: 'Product not found or you do not have permission to delete it'
            });
        }
        await prisma_1.prisma.product.delete({
            where: { id }
        });
        res.json({
            success: true,
            message: 'Product deleted successfully'
        });
    }
    catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete product'
        });
    }
};
exports.deleteProduct = deleteProduct;
// Get products by seller
const getSellerProducts = async (req, res) => {
    try {
        const userId = req.user?.id;
        const products = await prisma_1.prisma.product.findMany({
            where: {
                seller: {
                    userId
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                seller: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                email: true
                            }
                        }
                    }
                }
            }
        });
        res.json({
            success: true,
            data: products
        });
    }
    catch (error) {
        console.error('Error fetching seller products:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch seller products'
        });
    }
};
exports.getSellerProducts = getSellerProducts;
//# sourceMappingURL=productController.js.map
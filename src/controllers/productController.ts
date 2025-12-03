import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { prisma } from '../lib/prisma';

// Interface for dynamic product data
interface CreateProductRequest {
  // Core fields present in all categories
  title?: string;
  productName?: string; // For groceries
  description: string;
  categoryId: string;
  subcategoryId?: string;
  price: number;
  originalPrice?: number;
  condition?: 'new' | 'used' | 'refurbished' | 'like-new' | 'excellent' | 'good' | 'fair';
  brand?: string;
  model?: string;
  locationCity?: string;
  locationState?: string;
  locationCountry?: string;
  isNegotiable?: boolean;
  images?: string[]; // Image URLs after upload
  
  // Electronics specific fields
  storage?: string;
  display?: string;
  camera?: string;
  battery?: string;
  processor?: string;
  connectivity?: string;
  otherFeatures?: string;
  inBoxAccessories?: string;
  warranty?: string;
  
  // Groceries specific fields
  netWeight?: string;
  unit?: string;
  packagingType?: string;
  ingredients?: string;
  nutritionFacts?: string;
  allergenInfo?: string;
  origin?: string;
  grade?: string;
  processingType?: string;
  shelfLife?: string;
  storageInstructions?: string;
  stockQuantity?: number;
  minimumOrderQuantity?: number;
  discountPrice?: number;
  features?: string;
  sku?: string;
  tags?: string;
  deliveryNotes?: string;
  seasonalAvailability?: string;
  
  // Fashion specific fields
  size?: string | string[];
  color?: string;
  material?: string;
  
  // Vehicle specific fields
  vehicleType?: string;
  make?: string;
  yearOfManufacture?: number;
  yearOfRegistration?: number;
  mileage?: number;
  engineCapacity?: string;
  transmissionType?: string;
  fuelType?: string;
  exteriorColor?: string;
  interiorFeatures?: string;
  bodyType?: string;
  numberOfOwners?: number;
  registrationStatus?: string;
  vehicleId?: string;
  location?: string;
  
  // Category field (can be subcategory for some categories)
  category?: string;
}

// Debug endpoint to check database status
export const getProductsDebug = async (req: Request, res: Response) => {
  try {
    const productCount = await prisma.product.count();
    const sellerCount = await prisma.seller.count();
    const userCount = await prisma.user.count();
    
    // Get sample products without any filters
    const sampleProducts = await prisma.product.findMany({
      take: 5,
      select: {
        id: true,
        title: true,
        price: true,
        isActive: true,
        sellerId: true,
        createdAt: true
      }
    });

    res.json({
      success: true,
      debug: {
        productCount,
        sellerCount,
        userCount,
        sampleProducts
      }
    });
  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({
      success: false,
      error: 'Debug query failed',
      details: (error as Error).message
    });
  }
};

// Get all products with optional filters
export const getProducts = async (req: Request, res: Response) => {
  try {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      brand,
      condition,
      location,
      sortBy,
      featured,
      page = 1,
      limit = 20
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    
    // Build where clause
    const whereClause: any = {
      isActive: true
    };

    // Filter for featured products
    if (featured === 'true') {
      whereClause.featured = true;
    }

    if (search) {
      whereClause.OR = [
        { title: { contains: String(search), mode: 'insensitive' } },
        { productName: { contains: String(search), mode: 'insensitive' } },
        { description: { contains: String(search), mode: 'insensitive' } },
        { brand: { contains: String(search), mode: 'insensitive' } }
      ];
    }

    if (category) {
      // Support filtering by both category ID and category slug
      // Products might have categoryId stored as either the actual ID or the slug
      console.log('🔍 Category filter received:', category);
      
      const categoryRecord = await prisma.category.findFirst({
        where: {
          OR: [
            { id: String(category) },
            { slug: String(category) }
          ]
        }
      });
      
      console.log('📂 Category record found:', categoryRecord ? { id: categoryRecord.id, slug: categoryRecord.slug, name: categoryRecord.name } : 'NOT FOUND');
      
      if (categoryRecord) {
        // Filter by BOTH the category ID AND the slug, since products may have either stored
        // Use 'in' operator to match either value
        whereClause.categoryId = {
          in: [categoryRecord.id, categoryRecord.slug]
        };
        console.log('✅ Filtering by categoryId IN:', [categoryRecord.id, categoryRecord.slug]);
      } else {
        // If no category found, still use the provided value (might be a direct ID)
        whereClause.categoryId = String(category);
        console.log('⚠️ Category not found in DB, using raw value:', category);
      }
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
    let orderBy: any = { createdAt: 'desc' };
    
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

    // Log for debugging
    console.log('🔍 Product query whereClause:', JSON.stringify(whereClause));

    // Get all products (seller include is optional - may be null if seller doesn't exist)
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: whereClause,
        orderBy,
        skip,
        take: Number(limit),
      }),
      prisma.product.count({ where: whereClause })
    ]);

    console.log(`📦 Found ${total} products in database`);

    const pages = Math.ceil(total / Number(limit));

    // Parse images and dynamicFields for each product
    const formattedProducts = products.map(product => {
      let parsedImages: string[] = [];
      let stockQuantity = 0;
      
      // Parse images from JSON string to array
      try {
        if (product.images) {
          parsedImages = typeof product.images === 'string' 
            ? JSON.parse(product.images) 
            : product.images;
        }
      } catch (e) {
        console.error('Error parsing images for product', product.id, e);
        parsedImages = [];
      }
      
      // Extract stockQuantity from dynamicFields
      try {
        if (product.dynamicFields) {
          const dynamicData = typeof product.dynamicFields === 'string'
            ? JSON.parse(product.dynamicFields)
            : product.dynamicFields;
          stockQuantity = parseInt(dynamicData.stockQuantity) || 0;
        }
      } catch (e) {
        console.error('Error parsing dynamicFields for product', product.id, e);
      }
      
      return {
        ...product,
        images: parsedImages,
        stockQuantity,
        inStock: stockQuantity > 0
      };
    });

    res.json({
      success: true,
      data: formattedProducts,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: pages
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch products'
    });
  }
};

// Get single product by ID
export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // First check if the product's seller exists
    const productBasic = await prisma.product.findUnique({
      where: { id },
      select: { sellerId: true }
    });

    if (!productBasic) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    // Check if seller exists
    const sellerExists = await prisma.seller.findUnique({
      where: { id: productBasic.sellerId }
    });

    if (!sellerExists) {
      return res.status(404).json({
        success: false,
        error: 'Product not available (seller not found)'
      });
    }

    const product = await prisma.product.findUnique({
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

    // Parse images and dynamicFields
    let parsedImages: string[] = [];
    let stockQuantity = 0;
    
    try {
      if (product.images) {
        parsedImages = typeof product.images === 'string' 
          ? JSON.parse(product.images) 
          : product.images;
      }
    } catch (e) {
      parsedImages = [];
    }
    
    try {
      if (product.dynamicFields) {
        const dynamicData = typeof product.dynamicFields === 'string'
          ? JSON.parse(product.dynamicFields)
          : product.dynamicFields;
        stockQuantity = parseInt(dynamicData.stockQuantity) || 0;
      }
    } catch (e) {
      // ignore
    }

    res.json({
      success: true,
      data: {
        ...product,
        images: parsedImages,
        stockQuantity,
        inStock: stockQuantity > 0
      }
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch product'
    });
  }
};

// Create new product
export const createProduct = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    const productData: CreateProductRequest = req.body;
    
    // Log incoming data for debugging
    console.log('📦 Creating product with data:', JSON.stringify(productData, null, 2));

    // Find or verify seller profile
    let seller = await prisma.seller.findUnique({
      where: { userId }
    });

    if (!seller) {
      // Create seller profile if it doesn't exist
      seller = await prisma.seller.create({
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
    // Look up category to get its slug for auto-title generation
    let categorySlug = productData.categoryId;
    try {
      const categoryRecord = await prisma.category.findFirst({
        where: {
          OR: [
            { id: productData.categoryId },
            { slug: productData.categoryId }
          ]
        }
      });
      if (categoryRecord) {
        categorySlug = categoryRecord.slug;
      }
    } catch (e) {
      // Ignore lookup errors, use categoryId as-is
    }
    
    // Generate title based on category type if not provided
    let productTitle = productData.title || productData.productName;
    
    if (!productTitle) {
      // For vehicles, generate title from make, model, and year
      if (categorySlug === 'vehicles') {
        const make = productData.make || '';
        const model = productData.model || '';
        const year = productData.yearOfManufacture || '';
        productTitle = [year, make, model].filter(Boolean).join(' ').trim() || 'Untitled Vehicle';
      } else {
        productTitle = 'Untitled Product';
      }
    }
    
    // Parse location if provided as combined string (e.g., "Lagos, Lagos State")
    let locationCity = productData.locationCity;
    let locationState = productData.locationState;
    let locationStr = productData.location;
    
    if (!locationCity && !locationState && productData.location) {
      // Parse combined location string
      const parts = productData.location.split(',').map((p: string) => p.trim());
      if (parts.length >= 2) {
        locationCity = parts[0];
        locationState = parts[1];
      } else {
        locationCity = productData.location;
      }
      locationStr = productData.location;
    } else if (locationCity && locationState) {
      locationStr = `${locationCity}, ${locationState}`;
    }
    
    // Ensure numeric fields are properly converted
    const price = typeof productData.price === 'string' ? parseFloat(productData.price) : productData.price;
    const originalPrice = productData.originalPrice 
      ? (typeof productData.originalPrice === 'string' ? parseFloat(productData.originalPrice) : productData.originalPrice)
      : undefined;
    
    // Create the product with dynamic fields stored as JSON
    const newProduct = await prisma.product.create({
      data: {
        title: productTitle,
        productName: productData.productName,
        description: productData.description || '',
        price: price,
        originalPrice: originalPrice,
        categoryId: productData.categoryId,
        subcategoryId: productData.subcategoryId,
        brand: productData.brand,
        condition: productData.condition || 'new',
        sellerId: seller.id,
        images: JSON.stringify(productData.images || []),
        isNegotiable: productData.isNegotiable || false,
        // Stock quantity from form (stored in dynamicFields but also track here for queries)
        viewCount: 0,
        
        // Location fields
        locationCity: locationCity,
        locationState: locationState,
        locationCountry: productData.locationCountry || 'Nigeria',
        location: locationStr,
        
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
          
          // Vehicle fields
          vehicleType: productData.vehicleType,
          make: productData.make,
          model: productData.model,
          yearOfManufacture: productData.yearOfManufacture,
          yearOfRegistration: productData.yearOfRegistration,
          mileage: productData.mileage,
          engineCapacity: productData.engineCapacity,
          transmissionType: productData.transmissionType,
          fuelType: productData.fuelType,
          exteriorColor: productData.exteriorColor,
          interiorFeatures: productData.interiorFeatures,
          bodyType: productData.bodyType,
          numberOfOwners: productData.numberOfOwners,
          registrationStatus: productData.registrationStatus,
          vehicleId: productData.vehicleId,
          location: productData.location,
          
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
  } catch (error: any) {
    console.error('Error creating product:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create product',
      details: error.message || String(error)
    });
  }
};

// Update product
export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;
    const updateData: Partial<CreateProductRequest> = req.body;

    // Verify product exists and belongs to user
    const existingProduct = await prisma.product.findFirst({
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

    const updatedProduct = await prisma.product.update({
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
          const newDynamicFields = Object.fromEntries(
            Object.entries(updateData).filter(([key]) => 
              ![
                'title', 'productName', 'description', 'price', 'originalPrice', 
                'brand', 'condition', 'images', 'isNegotiable', 'categoryId', 'subcategoryId'
              ].includes(key)
            )
          );
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
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update product'
    });
  }
};

// Delete product
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;

    // Verify product exists and belongs to user
    const existingProduct = await prisma.product.findFirst({
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

    await prisma.product.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete product'
    });
  }
};

// Get products by seller
export const getSellerProducts = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    const products = await prisma.product.findMany({
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

    // Parse dynamicFields to extract stockQuantity for each product
    const formattedProducts = products.map(product => {
      let parsedImages: string[] = [];
      let stockQuantity = 0;
      
      // Parse images
      try {
        if (product.images) {
          parsedImages = typeof product.images === 'string' 
            ? JSON.parse(product.images) 
            : product.images;
        }
      } catch (e) {
        parsedImages = [];
      }
      
      // Extract stockQuantity from dynamicFields
      try {
        if (product.dynamicFields) {
          const dynamicData = typeof product.dynamicFields === 'string'
            ? JSON.parse(product.dynamicFields)
            : product.dynamicFields;
          stockQuantity = parseInt(dynamicData.stockQuantity) || 0;
        }
      } catch (e) {
        console.error('Error parsing dynamicFields for product', product.id, e);
      }
      
      return {
        ...product,
        images: parsedImages,
        stockQuantity,
        inStock: stockQuantity > 0
      };
    });

    res.json({
      success: true,
      data: formattedProducts
    });
  } catch (error) {
    console.error('Error fetching seller products:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch seller products'
    });
  }
};

// Update product stock/inventory
export const updateProductStock = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;
    const { quantity, reason } = req.body;

    if (quantity === undefined || quantity < 0) {
      return res.status(400).json({
        success: false,
        error: 'Valid quantity is required'
      });
    }

    // Verify product exists and belongs to user
    const existingProduct = await prisma.product.findFirst({
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

    // Parse existing dynamicFields and update stockQuantity
    let dynamicFields: any = {};
    try {
      if (existingProduct.dynamicFields) {
        dynamicFields = typeof existingProduct.dynamicFields === 'string'
          ? JSON.parse(existingProduct.dynamicFields)
          : existingProduct.dynamicFields;
      }
    } catch (e) {
      dynamicFields = {};
    }

    dynamicFields.stockQuantity = quantity;

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        dynamicFields: JSON.stringify(dynamicFields)
      }
    });

    console.log(`📦 Stock updated for product ${id}: ${quantity} units. Reason: ${reason || 'No reason provided'}`);

    res.json({
      success: true,
      message: 'Stock updated successfully',
      data: {
        ...updatedProduct,
        stockQuantity: quantity,
        inStock: quantity > 0
      }
    });
  } catch (error) {
    console.error('Error updating product stock:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update product stock'
    });
  }
};

// Fix untitled products by generating titles from their data
export const fixUntitledProducts = async (req: Request, res: Response) => {
  try {
    // Find all products with "Untitled" in the title
    const untitledProducts = await prisma.product.findMany({
      where: {
        OR: [
          { title: { contains: 'Untitled', mode: 'insensitive' } },
          { title: null },
          { title: '' }
        ]
      }
    });

    console.log(`🔧 Found ${untitledProducts.length} untitled products to fix`);

    const results = { fixed: 0, skipped: 0, errors: [] as string[] };

    for (const product of untitledProducts) {
      try {
        let newTitle = '';
        
        // Parse dynamicFields
        let dynamicData: any = {};
        if (product.dynamicFields) {
          try {
            dynamicData = typeof product.dynamicFields === 'string'
              ? JSON.parse(product.dynamicFields)
              : product.dynamicFields;
          } catch (e) {
            dynamicData = {};
          }
        }

        // Look up category to determine type
        let categorySlug = product.categoryId;
        try {
          const categoryRecord = await prisma.category.findFirst({
            where: {
              OR: [
                { id: product.categoryId },
                { slug: product.categoryId }
              ]
            }
          });
          if (categoryRecord) {
            categorySlug = categoryRecord.slug;
          }
        } catch (e) {
          // Use categoryId as-is
        }

        // Generate title based on category
        if (categorySlug === 'vehicles') {
          const make = dynamicData.make || '';
          const model = dynamicData.model || '';
          const year = dynamicData.yearOfManufacture || '';
          newTitle = [year, make, model].filter(Boolean).join(' ').trim();
        } else if (categorySlug === 'groceries') {
          newTitle = product.productName || dynamicData.productName || '';
        } else if (categorySlug === 'electronics') {
          const brand = product.brand || dynamicData.brand || '';
          const model = dynamicData.model || '';
          newTitle = [brand, model].filter(Boolean).join(' ').trim();
        }

        // If we generated a new title, update the product
        if (newTitle && newTitle !== product.title) {
          await prisma.product.update({
            where: { id: product.id },
            data: { title: newTitle }
          });
          console.log(`✅ Fixed product ${product.id}: "${product.title}" → "${newTitle}"`);
          results.fixed++;
        } else {
          console.log(`⏭️ Skipped product ${product.id}: No better title available`);
          results.skipped++;
        }
      } catch (err: any) {
        results.errors.push(`${product.id}: ${err.message}`);
        console.error(`❌ Error fixing product ${product.id}:`, err);
      }
    }

    res.json({
      success: true,
      message: 'Untitled products fix completed',
      results
    });
  } catch (error) {
    console.error('Error fixing untitled products:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fix untitled products'
    });
  }
};
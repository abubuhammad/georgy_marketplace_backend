import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { prisma } from '../lib/prisma';

// Get all categories
export const getCategories = async (req: Request, res: Response) => {
  try {
    const { type, parentId } = req.query;

    const whereClause: any = {};

    if (type) {
      whereClause.metadata = {
        contains: `"type":"${type}"`
      };
    }

    if (parentId === 'null' || parentId === '') {
      whereClause.parentId = null;
    } else if (parentId) {
      whereClause.parentId = String(parentId);
    }

    const categories = await prisma.category.findMany({
      where: whereClause,
      orderBy: { name: 'asc' }
    });

    // Parse metadata JSON for each category
    const categoriesWithParsedMetadata = categories.map(cat => ({
      ...cat,
      metadata: cat.metadata ? JSON.parse(cat.metadata) : null
    }));

    res.json({
      success: true,
      data: categoriesWithParsedMetadata
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch categories'
    });
  }
};

// Get main/root categories (no parent)
export const getMainCategories = async (req: Request, res: Response) => {
  try {
    const { type } = req.query;

    const whereClause: any = {
      parentId: null
    };

    if (type) {
      whereClause.metadata = {
        contains: `"type":"${type}"`
      };
    }

    const categories = await prisma.category.findMany({
      where: whereClause,
      orderBy: { name: 'asc' }
    });

    const categoriesWithParsedMetadata = categories.map(cat => ({
      ...cat,
      metadata: cat.metadata ? JSON.parse(cat.metadata) : null
    }));

    res.json({
      success: true,
      data: categoriesWithParsedMetadata
    });
  } catch (error) {
    console.error('Error fetching main categories:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch main categories'
    });
  }
};

// Get category by ID
export const getCategoryById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const category = await prisma.category.findUnique({
      where: { id }
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    res.json({
      success: true,
      data: {
        ...category,
        metadata: category.metadata ? JSON.parse(category.metadata) : null
      }
    });
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch category'
    });
  }
};

// Get category by slug
export const getCategoryBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const category = await prisma.category.findUnique({
      where: { slug }
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    res.json({
      success: true,
      data: {
        ...category,
        metadata: category.metadata ? JSON.parse(category.metadata) : null
      }
    });
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch category'
    });
  }
};

// Get subcategories by parent ID
export const getSubcategories = async (req: Request, res: Response) => {
  try {
    const { parentId } = req.params;

    const categories = await prisma.category.findMany({
      where: { parentId },
      orderBy: { name: 'asc' }
    });

    const categoriesWithParsedMetadata = categories.map(cat => ({
      ...cat,
      metadata: cat.metadata ? JSON.parse(cat.metadata) : null
    }));

    res.json({
      success: true,
      data: categoriesWithParsedMetadata
    });
  } catch (error) {
    console.error('Error fetching subcategories:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch subcategories'
    });
  }
};

// Create category (Admin only)
export const createCategory = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { name, slug, description, parentId, icon, color, type } = req.body;

    // Check if slug already exists
    const existingCategory = await prisma.category.findUnique({
      where: { slug }
    });

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        error: 'Category with this slug already exists'
      });
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description,
        parentId: parentId || null,
        metadata: JSON.stringify({ icon, color, type: type || 'product' })
      }
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: {
        ...category,
        metadata: category.metadata ? JSON.parse(category.metadata) : null
      }
    });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create category'
    });
  }
};

// Update category (Admin only)
export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, slug, description, parentId, icon, color, type } = req.body;

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id }
    });

    if (!existingCategory) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    // Check if new slug conflicts with another category
    if (slug && slug !== existingCategory.slug) {
      const slugConflict = await prisma.category.findUnique({
        where: { slug }
      });

      if (slugConflict) {
        return res.status(400).json({
          success: false,
          error: 'Category with this slug already exists'
        });
      }
    }

    // Parse existing metadata
    const existingMetadata = existingCategory.metadata 
      ? JSON.parse(existingCategory.metadata) 
      : {};

    const category = await prisma.category.update({
      where: { id },
      data: {
        name: name || existingCategory.name,
        slug: slug || existingCategory.slug,
        description: description !== undefined ? description : existingCategory.description,
        parentId: parentId !== undefined ? (parentId || null) : existingCategory.parentId,
        metadata: JSON.stringify({
          ...existingMetadata,
          icon: icon !== undefined ? icon : existingMetadata.icon,
          color: color !== undefined ? color : existingMetadata.color,
          type: type !== undefined ? type : existingMetadata.type
        })
      }
    });

    res.json({
      success: true,
      message: 'Category updated successfully',
      data: {
        ...category,
        metadata: category.metadata ? JSON.parse(category.metadata) : null
      }
    });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update category'
    });
  }
};

// Delete category (Admin only)
export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id }
    });

    if (!existingCategory) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    // Check if category has subcategories
    const subcategories = await prisma.category.findMany({
      where: { parentId: id }
    });

    if (subcategories.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete category with subcategories. Delete subcategories first.'
      });
    }

    // Check if category has products
    const products = await prisma.product.findMany({
      where: { categoryId: id },
      take: 1
    });

    if (products.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete category with products. Move or delete products first.'
      });
    }

    await prisma.category.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete category'
    });
  }
};

// Seed default categories (one-time setup endpoint)
export const seedCategories = async (req: Request, res: Response) => {
  try {
    const productCategories = [
      { name: 'Electronics', slug: 'electronics', description: 'Phones, laptops, TVs, and other electronic devices', metadata: { icon: 'Smartphone', color: 'from-blue-500 to-purple-600', type: 'product' } },
      { name: 'Fashion', slug: 'fashion', description: 'Clothing, shoes, bags, and accessories', metadata: { icon: 'Shirt', color: 'from-pink-500 to-rose-600', type: 'product' } },
      { name: 'Home & Garden', slug: 'home-garden', description: 'Furniture, decor, and garden supplies', metadata: { icon: 'Home', color: 'from-green-500 to-emerald-600', type: 'product' } },
      { name: 'Vehicles', slug: 'vehicles', description: 'Cars, motorcycles, and vehicle parts', metadata: { icon: 'Car', color: 'from-orange-500 to-red-600', type: 'product' } },
      { name: 'Sports', slug: 'sports', description: 'Sports equipment and fitness gear', metadata: { icon: 'Activity', color: 'from-teal-500 to-cyan-600', type: 'product' } },
      { name: 'Books', slug: 'books', description: 'Books, magazines, and educational materials', metadata: { icon: 'Book', color: 'from-amber-500 to-yellow-600', type: 'product' } },
      { name: 'Groceries', slug: 'groceries', description: 'Food items, beverages, and household essentials', metadata: { icon: 'ShoppingCart', color: 'from-lime-500 to-green-600', type: 'product' } },
      { name: 'Health & Beauty', slug: 'health-beauty', description: 'Health products, cosmetics, and personal care', metadata: { icon: 'Heart', color: 'from-purple-500 to-indigo-600', type: 'product' } },
      { name: 'Services', slug: 'services', description: 'Professional and personal services', metadata: { icon: 'Briefcase', color: 'from-gray-500 to-slate-600', type: 'product' } }
    ];

    const propertyCategories = [
      { name: 'Residential', slug: 'residential', description: 'Houses, apartments, and residential properties', metadata: { icon: 'Home', color: 'from-emerald-500 to-teal-600', type: 'property' } },
      { name: 'Commercial', slug: 'commercial', description: 'Office spaces, shops, and commercial buildings', metadata: { icon: 'Building', color: 'from-blue-500 to-indigo-600', type: 'property' } },
      { name: 'Land & Plots', slug: 'land', description: 'Land for sale and development plots', metadata: { icon: 'MapPin', color: 'from-green-500 to-emerald-600', type: 'property' } },
      { name: 'Rentals', slug: 'rentals', description: 'Properties available for rent', metadata: { icon: 'Key', color: 'from-purple-500 to-violet-600', type: 'property' } }
    ];

    const allCategories = [...productCategories, ...propertyCategories];
    const results = { created: 0, updated: 0, errors: [] as string[] };

    for (const category of allCategories) {
      try {
        const existing = await prisma.category.findUnique({
          where: { slug: category.slug }
        });

        if (!existing) {
          await prisma.category.create({
            data: {
              name: category.name,
              slug: category.slug,
              description: category.description,
              metadata: JSON.stringify(category.metadata)
            }
          });
          results.created++;
          console.log(`✅ Created category: ${category.name}`);
        } else {
          await prisma.category.update({
            where: { slug: category.slug },
            data: {
              name: category.name,
              description: category.description,
              metadata: JSON.stringify(category.metadata)
            }
          });
          results.updated++;
          console.log(`🔄 Updated category: ${category.name}`);
        }
      } catch (err: any) {
        results.errors.push(`${category.name}: ${err.message}`);
        console.error(`❌ Error with category ${category.name}:`, err);
      }
    }

    res.json({
      success: true,
      message: 'Categories seeded successfully',
      results
    });
  } catch (error) {
    console.error('Error seeding categories:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to seed categories'
    });
  }
};

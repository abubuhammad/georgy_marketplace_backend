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

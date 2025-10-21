import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { prisma } from '../lib/prisma';

// Interface for property creation request
interface CreatePropertyRequest {
  title: string;
  description: string;
  type: 'sale' | 'lease' | 'rent';
  propertyType: 'house' | 'apartment' | 'commercial' | 'land';
  price: number;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  location: string;
  address: string;
  latitude?: number;
  longitude?: number;
  images?: string[];
  virtualTour?: string;
  amenities?: string[];
  agentId?: string;
}

// Get all properties with filters
export const getProperties = async (req: Request, res: Response) => {
  try {
    const {
      search,
      type,
      propertyType,
      minPrice,
      maxPrice,
      bedrooms,
      bathrooms,
      minArea,
      maxArea,
      location,
      sortBy,
      page = 1,
      limit = 20
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    
    // Build where clause
    const whereClause: any = {
      status: 'available'
    };

    if (search) {
      whereClause.OR = [
        { title: { contains: String(search), mode: 'insensitive' } },
        { description: { contains: String(search), mode: 'insensitive' } },
        { location: { contains: String(search), mode: 'insensitive' } },
        { address: { contains: String(search), mode: 'insensitive' } }
      ];
    }

    if (type) {
      whereClause.type = String(type);
    }

    if (propertyType) {
      whereClause.propertyType = String(propertyType);
    }

    if (minPrice) {
      whereClause.price = { ...whereClause.price, gte: Number(minPrice) };
    }

    if (maxPrice) {
      whereClause.price = { ...whereClause.price, lte: Number(maxPrice) };
    }

    if (bedrooms) {
      whereClause.bedrooms = { gte: Number(bedrooms) };
    }

    if (bathrooms) {
      whereClause.bathrooms = { gte: Number(bathrooms) };
    }

    if (minArea) {
      whereClause.area = { ...whereClause.area, gte: Number(minArea) };
    }

    if (maxArea) {
      whereClause.area = { ...whereClause.area, lte: Number(maxArea) };
    }

    if (location) {
      whereClause.location = { contains: String(location), mode: 'insensitive' };
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
        case 'area':
          orderBy = { area: 'desc' };
          break;
        default:
          break;
      }
    }

    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where: whereClause,
        orderBy,
        skip,
        take: Number(limit),
        include: {
          owner: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true
            }
          }
        }
      }),
      prisma.property.count({ where: whereClause })
    ]);

    const pages = Math.ceil(total / Number(limit));

    res.json({
      success: true,
      data: {
        data: properties,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages
        }
      }
    });
  } catch (error) {
    console.error('Error fetching properties:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch properties'
    });
  }
};

// Get single property by ID
export const getPropertyById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        },
        viewings: {
          orderBy: {
            scheduledAt: 'asc'
          }
        }
      }
    });

    if (!property) {
      return res.status(404).json({
        success: false,
        error: 'Property not found'
      });
    }

    res.json({
      success: true,
      data: property
    });
  } catch (error) {
    console.error('Error fetching property:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch property'
    });
  }
};

// Create new property listing
export const createProperty = async (req: Request, res: Response) => {
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

    const propertyData: CreatePropertyRequest = req.body;

    // Create the property
    const newProperty = await prisma.property.create({
      data: {
        title: propertyData.title,
        description: propertyData.description,
        type: propertyData.type,
        propertyType: propertyData.propertyType,
        price: propertyData.price,
        bedrooms: propertyData.bedrooms,
        bathrooms: propertyData.bathrooms,
        area: propertyData.area,
        location: propertyData.location,
        address: propertyData.address,
        latitude: propertyData.latitude,
        longitude: propertyData.longitude,
        images: JSON.stringify(propertyData.images || []),
        virtualTour: propertyData.virtualTour ? JSON.stringify({ url: propertyData.virtualTour }) : null,
        amenities: JSON.stringify(propertyData.amenities || []),
        ownerId: userId,
        agentId: propertyData.agentId,
        featured: false,
        status: 'available'
      },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Property created successfully',
      data: newProperty
    });
  } catch (error) {
    console.error('Error creating property:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create property'
    });
  }
};

// Update property
export const updateProperty = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;
    const updateData: Partial<CreatePropertyRequest> = req.body;

    // Verify property exists and belongs to user
    const existingProperty = await prisma.property.findFirst({
      where: {
        id,
        ownerId: userId
      }
    });

    if (!existingProperty) {
      return res.status(404).json({
        success: false,
        error: 'Property not found or you do not have permission to update it'
      });
    }

    const updatedProperty = await prisma.property.update({
      where: { id },
      data: {
        title: updateData.title,
        description: updateData.description,
        type: updateData.type,
        propertyType: updateData.propertyType,
        price: updateData.price,
        bedrooms: updateData.bedrooms,
        bathrooms: updateData.bathrooms,
        area: updateData.area,
        location: updateData.location,
        address: updateData.address,
        latitude: updateData.latitude,
        longitude: updateData.longitude,
        images: updateData.images ? JSON.stringify(updateData.images) : undefined,
        virtualTour: updateData.virtualTour ? JSON.stringify({ url: updateData.virtualTour }) : undefined,
        amenities: updateData.amenities ? JSON.stringify(updateData.amenities) : undefined,
        agentId: updateData.agentId,
        updatedAt: new Date()
      },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Property updated successfully',
      data: updatedProperty
    });
  } catch (error) {
    console.error('Error updating property:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update property'
    });
  }
};

// Delete property
export const deleteProperty = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;

    // Verify property exists and belongs to user
    const existingProperty = await prisma.property.findFirst({
      where: {
        id,
        ownerId: userId
      }
    });

    if (!existingProperty) {
      return res.status(404).json({
        success: false,
        error: 'Property not found or you do not have permission to delete it'
      });
    }

    await prisma.property.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Property deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting property:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete property'
    });
  }
};

// Get properties by owner/agent
export const getUserProperties = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    const properties = await prisma.property.findMany({
      where: {
        OR: [
          { ownerId: userId },
          { agentId: userId }
        ]
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: properties
    });
  } catch (error) {
    console.error('Error fetching user properties:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user properties'
    });
  }
};

// Schedule property viewing
export const scheduleViewing = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { scheduledAt, notes } = req.body;
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    // Check if property exists
    const property = await prisma.property.findUnique({
      where: { id }
    });

    if (!property) {
      return res.status(404).json({
        success: false,
        error: 'Property not found'
      });
    }

    const viewing = await prisma.propertyViewing.create({
      data: {
        propertyId: id,
        viewerId: userId,
        agentId: property.agentId,
        scheduledAt: new Date(scheduledAt),
        notes: notes || null,
        status: 'scheduled'
      }
    });

    res.status(201).json({
      success: true,
      message: 'Property viewing scheduled successfully',
      data: viewing
    });
  } catch (error) {
    console.error('Error scheduling viewing:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to schedule viewing'
    });
  }
};
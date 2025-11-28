import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

// Dashboard Analytics
export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    const realtorId = req.user?.id;
    if (!realtorId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get total properties
    const totalProperties = await prisma.property.count({
      where: { ownerId: realtorId }
    });

    // Get properties by status
    const availableProperties = await prisma.property.count({
      where: { ownerId: realtorId, status: 'available' }
    });

    const soldProperties = await prisma.property.count({
      where: { ownerId: realtorId, status: 'sold' }
    });

    const rentedProperties = await prisma.property.count({
      where: { ownerId: realtorId, status: 'rented' }
    });

    // Get total viewings
    const totalViewings = await prisma.propertyViewing.count({
      where: {
        property: {
          ownerId: realtorId
        }
      }
    });

    // Get pending viewings
    const pendingViewings = await prisma.propertyViewing.count({
      where: {
        property: {
          ownerId: realtorId
        },
        status: 'scheduled',
        scheduledAt: {
          gte: new Date()
        }
      }
    });

    // Get total property value
    const propertyValue = await prisma.property.aggregate({
      where: {
        ownerId: realtorId,
        status: { in: ['available', 'sold', 'rented'] }
      },
      _sum: {
        price: true
      }
    });

    // Get recent properties
    const recentProperties = await prisma.property.findMany({
      where: { ownerId: realtorId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        title: true,
        type: true,
        propertyType: true,
        price: true,
        location: true,
        images: true,
        status: true,
        createdAt: true,
        _count: {
          select: {
            viewings: true
          }
        }
      }
    });

    // Get monthly property stats (last 12 months)
    const monthlyStats = null as any;

    // Get upcoming viewings
    const upcomingViewings = await prisma.propertyViewing.findMany({
      where: {
        property: {
          ownerId: realtorId
        },
        status: 'scheduled',
        scheduledAt: {
          gte: new Date()
        }
      },
      include: {
        property: {
          select: {
            title: true,
            location: true,
            images: true
          }
        }
      },
      orderBy: { scheduledAt: 'asc' },
      take: 5
    });

    res.json({
      stats: {
        totalProperties,
        availableProperties,
        soldProperties,
        rentedProperties,
        totalViewings,
        pendingViewings,
        totalPropertyValue: propertyValue._sum.price || 0,
        avgPropertyValue: totalProperties > 0 ? Number(propertyValue._sum.price || 0) / totalProperties : 0
      },
      recentProperties,
      monthlyStats,
      upcomingViewings
    });
  } catch (error) {
    console.error('Realtor dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
};

// Property Management
export const getProperties = async (req: AuthRequest, res: Response) => {
  try {
    const realtorId = req.user?.id;
    const { 
      page = 1, 
      limit = 20, 
      status, 
      type, 
      propertyType, 
      search,
      minPrice,
      maxPrice,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const where: any = {
      ownerId: realtorId
    };

    if (status && status !== 'all') {
      where.status = status;
    }

    if (type && type !== 'all') {
      where.type = type;
    }

    if (propertyType && propertyType !== 'all') {
      where.propertyType = propertyType;
    }

    if (search) {
      where.OR = [
        { title: { contains: search as string } },
        { description: { contains: search as string } },
        { location: { contains: search as string } },
        { address: { contains: search as string } }
      ];
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = Number(minPrice);
      if (maxPrice) where.price.lte = Number(maxPrice);
    }

    const properties = await prisma.property.findMany({
      where,
      include: {
        _count: {
          select: {
            viewings: true
          }
        }
      },
      orderBy: { [sortBy as string]: sortOrder },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit)
    });

    const totalCount = await prisma.property.count({ where });

    res.json({
      properties,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: totalCount,
        pages: Math.ceil(totalCount / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get properties error:', error);
    res.status(500).json({ error: 'Failed to fetch properties' });
  }
};

export const createProperty = async (req: AuthRequest, res: Response) => {
  try {
    const realtorId = req.user?.id;
    const {
      title,
      description,
      type,
      propertyType,
      price,
      bedrooms,
      bathrooms,
      area,
      location,
      address,
      latitude,
      longitude,
      images = [],
      virtualTour,
      amenities = [],
      featured = false
    } = req.body;

    const property = await prisma.property.create({
      data: {
        title,
        description,
        type,
        propertyType,
        price: Number(price),
        bedrooms: bedrooms ? Number(bedrooms) : null,
        bathrooms: bathrooms ? Number(bathrooms) : null,
        area: area ? Number(area) : null,
        location,
        address,
        latitude: latitude ? Number(latitude) : null,
        longitude: longitude ? Number(longitude) : null,
        images: JSON.stringify(images),
        virtualTour: virtualTour ? JSON.stringify(virtualTour) : null,
        amenities: JSON.stringify(amenities),
        featured,
        ownerId: realtorId!,
        status: 'available'
      }
    });

    res.status(201).json(property);
  } catch (error) {
    console.error('Create property error:', error);
    res.status(500).json({ error: 'Failed to create property' });
  }
};

export const updateProperty = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const realtorId = req.user?.id;
    const updateData = req.body;

    // Verify ownership
    const property = await prisma.property.findFirst({
      where: { id, ownerId: realtorId }
    });

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    // Handle JSON fields
    if (updateData.images && Array.isArray(updateData.images)) {
      updateData.images = JSON.stringify(updateData.images);
    }
    if (updateData.amenities && Array.isArray(updateData.amenities)) {
      updateData.amenities = JSON.stringify(updateData.amenities);
    }
    if (updateData.virtualTour) {
      updateData.virtualTour = JSON.stringify(updateData.virtualTour);
    }

    // Handle numeric fields
    if (updateData.price) updateData.price = Number(updateData.price);
    if (updateData.bedrooms) updateData.bedrooms = Number(updateData.bedrooms);
    if (updateData.bathrooms) updateData.bathrooms = Number(updateData.bathrooms);
    if (updateData.area) updateData.area = Number(updateData.area);
    if (updateData.latitude) updateData.latitude = Number(updateData.latitude);
    if (updateData.longitude) updateData.longitude = Number(updateData.longitude);

    const updatedProperty = await prisma.property.update({
      where: { id },
      data: {
        ...updateData,
        updatedAt: new Date()
      }
    });

    res.json(updatedProperty);
  } catch (error) {
    console.error('Update property error:', error);
    res.status(500).json({ error: 'Failed to update property' });
  }
};

export const deleteProperty = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const realtorId = req.user?.id;

    // Verify ownership
    const property = await prisma.property.findFirst({
      where: { id, ownerId: realtorId }
    });

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    // Soft delete by updating status
    await prisma.property.update({
      where: { id },
      data: {
        status: 'deleted',
        updatedAt: new Date()
      }
    });

    res.json({ message: 'Property deleted successfully' });
  } catch (error) {
    console.error('Delete property error:', error);
    res.status(500).json({ error: 'Failed to delete property' });
  }
};

// Bulk operations
export const bulkUpdateProperties = async (req: AuthRequest, res: Response) => {
  try {
    const realtorId = req.user?.id;
    const { propertyIds, updateData } = req.body;

    if (!Array.isArray(propertyIds) || propertyIds.length === 0) {
      return res.status(400).json({ error: 'Property IDs are required' });
    }

    // Verify ownership of all properties
    const properties = await prisma.property.findMany({
      where: {
        id: { in: propertyIds },
        ownerId: realtorId
      },
      select: { id: true }
    });

    if (properties.length !== propertyIds.length) {
      return res.status(403).json({ error: 'Some properties not found or unauthorized' });
    }

    // Handle JSON fields in bulk update
    const processedUpdateData = { ...updateData };
    if (processedUpdateData.amenities && Array.isArray(processedUpdateData.amenities)) {
      processedUpdateData.amenities = JSON.stringify(processedUpdateData.amenities);
    }

    // Perform bulk update
    const result = await prisma.property.updateMany({
      where: {
        id: { in: propertyIds },
        ownerId: realtorId
      },
      data: {
        ...processedUpdateData,
        updatedAt: new Date()
      }
    });

    res.json({ 
      message: `${result.count} properties updated successfully`,
      updatedCount: result.count
    });
  } catch (error) {
    console.error('Bulk update error:', error);
    res.status(500).json({ error: 'Failed to update properties' });
  }
};

// Viewing Management
export const getViewings = async (req: AuthRequest, res: Response) => {
  try {
    const realtorId = req.user?.id;
    const { page = 1, limit = 20, status, upcoming } = req.query;

    const where: any = {
      property: {
        ownerId: realtorId
      }
    };

    if (status && status !== 'all') {
      where.status = status;
    }

    if (upcoming === 'true') {
      where.scheduledAt = {
        gte: new Date()
      };
    }

    const viewings = await prisma.propertyViewing.findMany({
      where,
      include: {
        property: {
          select: {
            id: true,
            title: true,
            location: true,
            address: true,
            images: true,
            price: true,
            type: true,
            propertyType: true
          }
        }
      },
      orderBy: { scheduledAt: 'asc' },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit)
    });

    const totalCount = await prisma.propertyViewing.count({ where });

    res.json({
      viewings,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: totalCount,
        pages: Math.ceil(totalCount / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get viewings error:', error);
    res.status(500).json({ error: 'Failed to fetch viewings' });
  }
};

export const scheduleViewing = async (req: AuthRequest, res: Response) => {
  try {
    const realtorId = req.user?.id;
    const {
      propertyId,
      viewerId,
      scheduledAt,
      notes
    } = req.body;

    // Verify property ownership
    const property = await prisma.property.findFirst({
      where: { id: propertyId, ownerId: realtorId }
    });

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    // Create viewing
    const viewing = await prisma.propertyViewing.create({
      data: {
        propertyId,
        viewerId,
        agentId: realtorId, // Realtor acts as agent
        scheduledAt: new Date(scheduledAt),
        notes: notes || null,
        status: 'scheduled'
      },
      include: {
        property: {
          select: {
            title: true,
            location: true,
            address: true
          }
        }
      }
    });

    // TODO: Send notification to viewer
    // await notificationService.sendViewingScheduled(viewing);

    res.status(201).json(viewing);
  } catch (error) {
    console.error('Schedule viewing error:', error);
    res.status(500).json({ error: 'Failed to schedule viewing' });
  }
};

export const updateViewingStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const realtorId = req.user?.id;

    // Verify viewing belongs to realtor's property
    const viewing = await prisma.propertyViewing.findFirst({
      where: {
        id,
        property: {
          ownerId: realtorId
        }
      },
      include: {
        property: {
          select: { title: true, ownerId: true }
        }
      }
    });

    if (!viewing) {
      return res.status(404).json({ error: 'Viewing not found' });
    }

    const updatedViewing = await prisma.propertyViewing.update({
      where: { id },
      data: {
        status,
        notes: notes || viewing.notes
      },
      include: {
        property: {
          select: {
            title: true,
            location: true
          }
        }
      }
    });

    res.json(updatedViewing);
  } catch (error) {
    console.error('Update viewing status error:', error);
    res.status(500).json({ error: 'Failed to update viewing status' });
  }
};

// Analytics
export const getAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const realtorId = req.user?.id;
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
      default:
        dateFilter = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }

    // Property performance analytics
    const propertyPerformance = null as any;

    // Viewing trends
    const viewingTrends = null as any;

    // Property type breakdown
    const propertyTypeBreakdown = null as any;

    // Location performance
    const locationPerformance = null as any;

    res.json({
      propertyPerformance,
      viewingTrends,
      propertyTypeBreakdown,
      locationPerformance,
      period
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
};

// Profile Management
export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const realtorId = req.user?.id;

    const profile = await prisma.user.findUnique({
      where: { id: realtorId },
      include: {
        profile: true
      }
    });

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json({
      user: {
        id: profile.id,
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        phone: profile.phone,
        avatar: profile.avatar,
        role: profile.role,
        emailVerified: profile.emailVerified,
        phoneVerified: profile.phoneVerified,
        identityVerified: profile.identityVerified
      },
      profile: profile.profile
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const realtorId = req.user?.id;
    const {
      firstName,
      lastName,
      phone,
      avatar,
      bio,
      website,
      location,
      specialization,
      licenseNumber,
      experience,
      languages,
      serviceAreas
    } = req.body;

    // Update user basic info
    const updatedUser = await prisma.user.update({
      where: { id: realtorId },
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
        specialization,
        licenseNumber,
        experience: experience ? Number(experience) : null,
        languages: languages || [],
        serviceAreas: serviceAreas || []
      })
    };

    const profile = await prisma.userProfile.upsert({
      where: { userId: realtorId },
      create: {
        userId: realtorId!,
        ...profileData
      },
      update: profileData
    });

    res.json({
      user: updatedUser,
      profile
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

// Client Management
export const getClients = async (req: AuthRequest, res: Response) => {
  try {
    const realtorId = req.user?.id;
    const { page = 1, limit = 20, search, type } = req.query;

    // Get clients who have scheduled viewings for realtor's properties
    const viewings = await prisma.propertyViewing.findMany({
      where: {
        property: {
          ownerId: realtorId
        }
      },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            type: true,
            price: true
          }
        }
      },
      distinct: ['viewerId'],
      orderBy: { scheduledAt: 'desc' }
    });

    // Get unique client IDs
    const clientIds = viewings.map(v => v.viewerId).filter(id => id);

    if (clientIds.length === 0) {
      return res.json({
        clients: [],
        pagination: {
          page: 1,
          limit: Number(limit),
          total: 0,
          pages: 0
        }
      });
    }

    const where: any = {
      id: { in: clientIds }
    };

    if (search) {
      where.OR = [
        { firstName: { contains: search as string } },
        { lastName: { contains: search as string } },
        { email: { contains: search as string } }
      ];
    }

    // Get client details with their viewing history
    const clients = await prisma.user.findMany({
      where,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        avatar: true,
        createdAt: true
      },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit)
    });

    // Enrich with viewing data
    const enrichedClients = await Promise.all(
      clients.map(async (client) => {
        const clientViewings = await prisma.propertyViewing.count({
          where: {
            viewerId: client.id,
            property: {
              ownerId: realtorId
            }
          }
        });

        const lastViewing = await prisma.propertyViewing.findFirst({
          where: {
            viewerId: client.id,
            property: {
              ownerId: realtorId
            }
          },
          include: {
            property: {
              select: { title: true }
            }
          },
          orderBy: { scheduledAt: 'desc' }
        });

        return {
          ...client,
          totalViewings: clientViewings,
          lastViewing: lastViewing ? {
            date: lastViewing.scheduledAt,
            property: lastViewing.property?.title,
            status: lastViewing.status
          } : null
        };
      })
    );

    const totalCount = await prisma.user.count({ where });

    res.json({
      clients: enrichedClients,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: totalCount,
        pages: Math.ceil(totalCount / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get clients error:', error);
    res.status(500).json({ error: 'Failed to fetch clients' });
  }
};

// Market Insights
export const getMarketInsights = async (req: AuthRequest, res: Response) => {
  try {
    const realtorId = req.user?.id;
    const { location, propertyType } = req.query;

    // Market trends for realtor's area/specialty
    const marketTrends = null as any;

    // Competition analysis
    const competitionAnalysis = null as any;

    // Price distribution
    const priceDistribution = null as any;

    res.json({
      marketTrends,
      competitionAnalysis,
      priceDistribution,
      filters: {
        location: location || 'All',
        propertyType: propertyType || 'All'
      }
    });
  } catch (error) {
    console.error('Get market insights error:', error);
    res.status(500).json({ error: 'Failed to fetch market insights' });
  }
};


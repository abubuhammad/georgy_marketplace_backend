import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

// ==================== ACCOUNT MODERATION ====================

// Get pending accounts awaiting approval
export const getPendingAccounts = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, role } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {
      accountStatus: 'pending',
      role: { not: 'customer' } // Customers don't need approval
    };

    if (role && role !== 'all') {
      where.role = String(role);
    }

    const [accounts, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          accountStatus: true,
          createdAt: true,
          emailVerified: true
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit)
      }),
      prisma.user.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        accounts,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get pending accounts error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch pending accounts'
    });
  }
};

// Approve account
export const approveAccount = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const adminId = (req as any).user?.id;

    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    if (user.accountStatus === 'active') {
      return res.status(400).json({
        success: false,
        error: 'Account is already approved'
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        accountStatus: 'active',
        accountApprovedAt: new Date(),
        accountApprovedBy: adminId,
        accountStatusReason: null
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        accountStatus: true
      }
    });

    // TODO: Send email/in-app notification to user

    res.json({
      success: true,
      message: 'Account approved successfully',
      data: updatedUser
    });
  } catch (error) {
    console.error('Approve account error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to approve account'
    });
  }
};

// Reject account
export const rejectAccount = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const adminId = (req as any).user?.id;

    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        accountStatus: 'rejected',
        accountStatusReason: reason || 'Account application rejected',
        accountApprovedBy: adminId
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        accountStatus: true,
        accountStatusReason: true
      }
    });

    // TODO: Send email/in-app notification to user with reason

    res.json({
      success: true,
      message: 'Account rejected',
      data: updatedUser
    });
  } catch (error) {
    console.error('Reject account error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reject account'
    });
  }
};

// Suspend account
export const suspendAccount = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        accountStatus: 'suspended',
        accountStatusReason: reason || 'Account suspended',
        isSuspended: true,
        suspendedAt: new Date()
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        accountStatus: true
      }
    });

    res.json({
      success: true,
      message: 'Account suspended',
      data: updatedUser
    });
  } catch (error) {
    console.error('Suspend account error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to suspend account'
    });
  }
};

// ==================== PROPERTY MODERATION ====================

// Get pending properties awaiting approval
export const getPendingProperties = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where: { status: 'pending' },
        include: {
          owner: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              role: true,
              accountStatus: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit)
      }),
      prisma.property.count({ where: { status: 'pending' } })
    ]);

    res.json({
      success: true,
      data: {
        properties,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get pending properties error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch pending properties'
    });
  }
};

// Approve property
export const approveProperty = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const adminId = (req as any).user?.id;

    const property = await prisma.property.findUnique({
      where: { id }
    });

    if (!property) {
      return res.status(404).json({
        success: false,
        error: 'Property not found'
      });
    }

    if (property.status === 'active') {
      return res.status(400).json({
        success: false,
        error: 'Property is already approved'
      });
    }

    const updatedProperty = await prisma.property.update({
      where: { id },
      data: {
        status: 'active',
        approvedAt: new Date(),
        approvedBy: adminId,
        statusReason: null
      },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    // TODO: Send notification to property owner

    res.json({
      success: true,
      message: 'Property approved and now visible',
      data: updatedProperty
    });
  } catch (error) {
    console.error('Approve property error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to approve property'
    });
  }
};

// Reject property
export const rejectProperty = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const adminId = (req as any).user?.id;

    const property = await prisma.property.findUnique({
      where: { id }
    });

    if (!property) {
      return res.status(404).json({
        success: false,
        error: 'Property not found'
      });
    }

    const updatedProperty = await prisma.property.update({
      where: { id },
      data: {
        status: 'rejected',
        statusReason: reason || 'Property listing rejected',
        approvedBy: adminId
      },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    // TODO: Send notification to property owner with reason

    res.json({
      success: true,
      message: 'Property rejected',
      data: updatedProperty
    });
  } catch (error) {
    console.error('Reject property error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reject property'
    });
  }
};

// Remove property (admin action)
export const removeProperty = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const adminId = (req as any).user?.id;

    const property = await prisma.property.findUnique({
      where: { id }
    });

    if (!property) {
      return res.status(404).json({
        success: false,
        error: 'Property not found'
      });
    }

    const updatedProperty = await prisma.property.update({
      where: { id },
      data: {
        status: 'removed',
        statusReason: reason || 'Removed by admin',
        approvedBy: adminId
      }
    });

    res.json({
      success: true,
      message: 'Property removed',
      data: updatedProperty
    });
  } catch (error) {
    console.error('Remove property error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove property'
    });
  }
};

// ==================== JOB MODERATION ====================

// Get pending jobs awaiting approval
export const getPendingJobs = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where: { status: 'pending' },
        include: {
          employer: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              role: true,
              accountStatus: true
            }
          },
          _count: {
            select: { applications: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit)
      }),
      prisma.job.count({ where: { status: 'pending' } })
    ]);

    res.json({
      success: true,
      data: {
        jobs,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get pending jobs error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch pending jobs'
    });
  }
};

// Approve job
export const approveJob = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const adminId = (req as any).user?.id;

    const job = await prisma.job.findUnique({
      where: { id }
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      });
    }

    if (job.status === 'active') {
      return res.status(400).json({
        success: false,
        error: 'Job is already approved'
      });
    }

    const updatedJob = await prisma.job.update({
      where: { id },
      data: {
        status: 'active',
        approvedAt: new Date(),
        approvedBy: adminId,
        statusReason: null
      },
      include: {
        employer: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    // TODO: Send notification to employer

    res.json({
      success: true,
      message: 'Job approved and now visible',
      data: updatedJob
    });
  } catch (error) {
    console.error('Approve job error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to approve job'
    });
  }
};

// Reject job
export const rejectJob = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const adminId = (req as any).user?.id;

    const job = await prisma.job.findUnique({
      where: { id }
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      });
    }

    const updatedJob = await prisma.job.update({
      where: { id },
      data: {
        status: 'rejected',
        statusReason: reason || 'Job listing rejected',
        approvedBy: adminId
      },
      include: {
        employer: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    // TODO: Send notification to employer with reason

    res.json({
      success: true,
      message: 'Job rejected',
      data: updatedJob
    });
  } catch (error) {
    console.error('Reject job error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reject job'
    });
  }
};

// Close job (admin action)
export const closeJob = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const job = await prisma.job.findUnique({
      where: { id }
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      });
    }

    const updatedJob = await prisma.job.update({
      where: { id },
      data: {
        status: 'closed',
        statusReason: reason || 'Closed by admin'
      }
    });

    res.json({
      success: true,
      message: 'Job closed',
      data: updatedJob
    });
  } catch (error) {
    console.error('Close job error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to close job'
    });
  }
};

// ==================== MODERATION STATS ====================

// Get moderation dashboard stats
export const getModerationStats = async (req: Request, res: Response) => {
  try {
    const [
      pendingAccounts,
      pendingProperties,
      pendingJobs,
      activeAccounts,
      activeProperties,
      activeJobs
    ] = await Promise.all([
      prisma.user.count({ where: { accountStatus: 'pending', role: { not: 'customer' } } }),
      prisma.property.count({ where: { status: 'pending' } }),
      prisma.job.count({ where: { status: 'pending' } }),
      prisma.user.count({ where: { accountStatus: 'active', role: { not: 'customer' } } }),
      prisma.property.count({ where: { status: 'active' } }),
      prisma.job.count({ where: { status: 'active' } })
    ]);

    res.json({
      success: true,
      data: {
        pending: {
          accounts: pendingAccounts,
          properties: pendingProperties,
          jobs: pendingJobs,
          total: pendingAccounts + pendingProperties + pendingJobs
        },
        active: {
          accounts: activeAccounts,
          properties: activeProperties,
          jobs: activeJobs
        }
      }
    });
  } catch (error) {
    console.error('Get moderation stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch moderation stats'
    });
  }
};

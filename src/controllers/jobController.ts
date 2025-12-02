import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { prisma } from '../lib/prisma';
import { JOB_PUBLISHER_ROLES } from '../middleware/accountStatus';

// Interface for job creation request
interface CreateJobRequest {
  title: string;
  description: string;
  companyName: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'remote';
  salaryMin?: number;
  salaryMax?: number;
  salaryType?: 'hourly' | 'monthly' | 'yearly';
  currency?: string;
  requirements: string;
  benefits?: string;
}

// Get all jobs with filters (public)
export const getJobs = async (req: Request, res: Response) => {
  try {
    const {
      search,
      type,
      location,
      minSalary,
      maxSalary,
      sortBy,
      page = 1,
      limit = 20
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    
    // Build where clause - only show active (approved) jobs to public
    const whereClause: any = {
      status: 'active'
    };

    if (search) {
      whereClause.OR = [
        { title: { contains: String(search), mode: 'insensitive' } },
        { description: { contains: String(search), mode: 'insensitive' } },
        { companyName: { contains: String(search), mode: 'insensitive' } },
        { location: { contains: String(search), mode: 'insensitive' } }
      ];
    }

    if (type) {
      whereClause.type = String(type);
    }

    if (location) {
      whereClause.location = { contains: String(location), mode: 'insensitive' };
    }

    if (minSalary) {
      whereClause.salaryMin = { gte: Number(minSalary) };
    }

    if (maxSalary) {
      whereClause.salaryMax = { lte: Number(maxSalary) };
    }

    // Build orderBy clause
    let orderBy: any = { createdAt: 'desc' };
    
    if (sortBy) {
      switch (sortBy) {
        case 'salary_asc':
          orderBy = { salaryMin: 'asc' };
          break;
        case 'salary_desc':
          orderBy = { salaryMax: 'desc' };
          break;
        case 'newest':
          orderBy = { createdAt: 'desc' };
          break;
        default:
          break;
      }
    }

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where: whereClause,
        orderBy,
        skip,
        take: Number(limit),
        include: {
          employer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          },
          _count: {
            select: { applications: true }
          }
        }
      }),
      prisma.job.count({ where: whereClause })
    ]);

    const pages = Math.ceil(total / Number(limit));

    res.json({
      success: true,
      data: {
        jobs,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages
        }
      }
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch jobs'
    });
  }
};

// Get single job by ID (public)
export const getJobById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        employer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        _count: {
          select: { applications: true }
        }
      }
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      });
    }

    // Only show active jobs to public, owner/admin can see all statuses
    const user = (req as any).user;
    if (job.status !== 'active' && (!user || (user.id !== job.employerId && user.role !== 'admin'))) {
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      });
    }

    res.json({
      success: true,
      data: job
    });
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch job'
    });
  }
};

// Create new job posting
// Only employers with accountStatus = 'active' can create
export const createJob = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const user = (req as any).user;
    if (!user?.id) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    // Check if user role is allowed to post jobs
    if (!JOB_PUBLISHER_ROLES.includes(user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Only employers can post job listings'
      });
    }

    // Check if account is approved (admin bypass)
    if (user.role !== 'admin' && user.accountStatus !== 'active') {
      return res.status(403).json({
        success: false,
        error: 'Your employer account must be approved by admin before you can post jobs',
        accountStatus: user.accountStatus
      });
    }

    const jobData: CreateJobRequest = req.body;

    // Create the job with status = 'pending' (requires admin approval)
    const newJob = await prisma.job.create({
      data: {
        title: jobData.title,
        description: jobData.description,
        companyName: jobData.companyName,
        location: jobData.location,
        type: jobData.type,
        salaryMin: jobData.salaryMin,
        salaryMax: jobData.salaryMax,
        salaryType: jobData.salaryType,
        currency: jobData.currency || 'NGN',
        requirements: jobData.requirements,
        benefits: jobData.benefits,
        employerId: user.id,
        featured: false,
        status: 'pending' // New jobs require admin approval
      },
      include: {
        employer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Job posted successfully. It will be visible after admin approval.',
      data: newJob
    });
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create job'
    });
  }
};

// Update job
export const updateJob = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = (req as any).user;
    const updateData: Partial<CreateJobRequest> = req.body;

    // Verify job exists and belongs to user (or user is admin)
    const existingJob = await prisma.job.findFirst({
      where: {
        id,
        ...(user.role !== 'admin' ? { employerId: user.id } : {})
      }
    });

    if (!existingJob) {
      return res.status(404).json({
        success: false,
        error: 'Job not found or you do not have permission to update it'
      });
    }

    const updatedJob = await prisma.job.update({
      where: { id },
      data: {
        title: updateData.title,
        description: updateData.description,
        companyName: updateData.companyName,
        location: updateData.location,
        type: updateData.type,
        salaryMin: updateData.salaryMin,
        salaryMax: updateData.salaryMax,
        salaryType: updateData.salaryType,
        requirements: updateData.requirements,
        benefits: updateData.benefits,
        updatedAt: new Date()
      },
      include: {
        employer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Job updated successfully',
      data: updatedJob
    });
  } catch (error) {
    console.error('Error updating job:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update job'
    });
  }
};

// Delete job
export const deleteJob = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = (req as any).user;

    // Verify job exists and belongs to user (or user is admin)
    const existingJob = await prisma.job.findFirst({
      where: {
        id,
        ...(user.role !== 'admin' ? { employerId: user.id } : {})
      }
    });

    if (!existingJob) {
      return res.status(404).json({
        success: false,
        error: 'Job not found or you do not have permission to delete it'
      });
    }

    await prisma.job.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Job deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete job'
    });
  }
};

// Get jobs by employer
export const getEmployerJobs = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    const jobs = await prisma.job.findMany({
      where: { employerId: user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { applications: true }
        }
      }
    });

    res.json({
      success: true,
      data: jobs
    });
  } catch (error) {
    console.error('Error fetching employer jobs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch employer jobs'
    });
  }
};

// Apply for a job
export const applyForJob = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { coverLetter, resume } = req.body;
    const user = (req as any).user;

    if (!user?.id) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    // Check if user has jobSeeker flag enabled
    if (!user.jobSeeker) {
      return res.status(403).json({
        success: false,
        error: 'Please enable job seeker mode in your profile to apply for jobs'
      });
    }

    // Check if job exists and is active
    const job = await prisma.job.findUnique({
      where: { id }
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      });
    }

    if (job.status !== 'active') {
      return res.status(400).json({
        success: false,
        error: 'This job is no longer accepting applications'
      });
    }

    // Check if user has already applied
    const existingApplication = await prisma.jobApplication.findFirst({
      where: {
        jobId: id,
        applicantId: user.id
      }
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        error: 'You have already applied for this job'
      });
    }

    // Create application
    const application = await prisma.jobApplication.create({
      data: {
        jobId: id,
        applicantId: user.id,
        coverLetter,
        resume,
        status: 'applied'
      },
      include: {
        job: {
          select: {
            title: true,
            companyName: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: application
    });
  } catch (error) {
    console.error('Error applying for job:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit application'
    });
  }
};

// Get user's job applications
export const getMyApplications = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    const applications = await prisma.jobApplication.findMany({
      where: { applicantId: user.id },
      orderBy: { appliedAt: 'desc' },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            companyName: true,
            location: true,
            type: true,
            status: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: applications
    });
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch applications'
    });
  }
};

// Get applications for a job (employer only)
export const getJobApplications = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = (req as any).user;

    // Verify job belongs to employer (or user is admin)
    const job = await prisma.job.findFirst({
      where: {
        id,
        ...(user.role !== 'admin' ? { employerId: user.id } : {})
      }
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Job not found or you do not have permission to view applications'
      });
    }

    const applications = await prisma.jobApplication.findMany({
      where: { jobId: id },
      orderBy: { appliedAt: 'desc' },
      include: {
        applicant: {
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
      data: applications
    });
  } catch (error) {
    console.error('Error fetching job applications:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch applications'
    });
  }
};

// Update application status (employer only)
export const updateApplicationStatus = async (req: Request, res: Response) => {
  try {
    const { id, applicationId } = req.params;
    const { status, notes } = req.body;
    const user = (req as any).user;

    // Verify job belongs to employer (or user is admin)
    const job = await prisma.job.findFirst({
      where: {
        id,
        ...(user.role !== 'admin' ? { employerId: user.id } : {})
      }
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Job not found or you do not have permission'
      });
    }

    const application = await prisma.jobApplication.update({
      where: { id: applicationId },
      data: {
        status,
        notes,
        updatedAt: new Date()
      },
      include: {
        applicant: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    // TODO: Send notification to applicant about status change

    res.json({
      success: true,
      message: 'Application status updated',
      data: application
    });
  } catch (error) {
    console.error('Error updating application:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update application'
    });
  }
};

// Toggle jobSeeker flag for current user
export const toggleJobSeekerMode = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { jobSeeker } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { jobSeeker: Boolean(jobSeeker) },
      select: {
        id: true,
        jobSeeker: true
      }
    });

    res.json({
      success: true,
      message: jobSeeker ? 'Job seeker mode enabled' : 'Job seeker mode disabled',
      data: updatedUser
    });
  } catch (error) {
    console.error('Error toggling job seeker mode:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update job seeker mode'
    });
  }
};

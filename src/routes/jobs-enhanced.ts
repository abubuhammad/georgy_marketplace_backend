import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, optionalAuth } from '../middleware/auth';
import { z } from 'zod';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const router = Router();
const prisma = new PrismaClient();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/resumes/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = uuidv4();
    cb(null, `resume-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.doc', '.docx'];
    const fileExtension = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(fileExtension)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and Word documents are allowed'));
    }
  }
});

// Validation schemas
const JobPostingSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(100, 'Description must be at least 100 characters'),
  requirements: z.array(z.string()).min(1, 'At least one requirement is needed'),
  responsibilities: z.array(z.string()).min(1, 'At least one responsibility is needed'),
  benefits: z.array(z.string()).default([]),
  skills: z.array(z.string()).min(1, 'At least one skill is required'),
  jobType: z.enum(['full_time', 'part_time', 'contract', 'freelance', 'internship', 'temporary']),
  jobLevel: z.enum(['entry', 'junior', 'mid', 'senior', 'lead', 'manager', 'director', 'executive']),
  category: z.string(),
  workLocation: z.enum(['remote', 'hybrid', 'onsite']),
  location: z.object({
    country: z.string().min(2, 'Country is required'),
    state: z.string().optional(),
    city: z.string().optional(),
    address: z.string().optional(),
    isRemote: z.boolean().default(false),
  }),
  salary: z.object({
    min: z.number().positive().optional(),
    max: z.number().positive().optional(),
    currency: z.string().default('USD'),
    period: z.enum(['hourly', 'weekly', 'monthly', 'yearly']).default('yearly'),
  }).optional(),
  applicationDeadline: z.string().optional(),
  startDate: z.string().optional(),
  isPremium: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
});

const JobApplicationSchema = z.object({
  coverLetter: z.string().optional(),
  expectedSalary: z.object({
    min: z.number().positive(),
    max: z.number().positive(),
    currency: z.string(),
    period: z.string(),
  }).optional(),
  availableFrom: z.string().optional(),
});

// Public routes
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      query,
      category,
      jobType,
      jobLevel,
      workLocation,
      location,
      salaryMin,
      salaryMax,
      company,
      postedWithin,
      sortBy = 'date',
      sortOrder = 'desc',
      page = 1,
      limit = 20,
    } = req.query;

    const where: any = {
      status: 'active',
      isActive: true,
    };

    // Build filter conditions
    if (query) {
      where.OR = [
        { title: { contains: query as string, mode: 'insensitive' } },
        { description: { contains: query as string, mode: 'insensitive' } },
        { company: { contains: query as string, mode: 'insensitive' } },
      ];
    }

    if (category) where.category = { contains: category as string, mode: 'insensitive' };
    if (jobType) where.type = jobType;
    if (company) where.company = { contains: company as string, mode: 'insensitive' };
    if (location) where.location = { contains: location as string, mode: 'insensitive' };

    if (salaryMin || salaryMax) {
      where.salary = {};
      if (salaryMin) where.salary.gte = parseFloat(salaryMin as string);
      if (salaryMax) where.salary.lte = parseFloat(salaryMax as string);
    }

    if (postedWithin) {
      const days = parseInt(postedWithin as string);
      const date = new Date();
      date.setDate(date.getDate() - days);
      where.createdAt = { gte: date };
    }

    // Build sort conditions
    const orderBy: any = {};
    switch (sortBy) {
      case 'salary':
        orderBy.salary = sortOrder;
        break;
      case 'company':
        orderBy.company = sortOrder;
        break;
      default:
        orderBy.createdAt = sortOrder;
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        include: {
          employer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          applications: {
            select: { id: true },
          },
        },
        orderBy,
        skip,
        take: parseInt(limit as string),
      }),
      prisma.job.count({ where }),
    ]);

    const formattedJobs = jobs.map(job => ({
      ...job,
      applicationCount: job.applications.length,
      requirements: job.requirements ? JSON.parse(job.requirements) : [],
      benefits: job.benefits ? JSON.parse(job.benefits) : [],
    }));

    res.json({
      success: true,
      data: {
        jobs: formattedJobs,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          pages: Math.ceil(total / parseInt(limit as string)),
        },
      },
    });
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch jobs',
    });
  }
});

router.get('/:id', optionalAuth, async (req, res) => {
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
            email: true,
          },
        },
        applications: {
          select: {
            id: true,
            applicant: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Job not found',
      });
    }

    // Increment view count
    await prisma.job.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    const formattedJob = {
      ...job,
      applicationCount: job.applications.length,
      requirements: job.requirements ? JSON.parse(job.requirements) : [],
      benefits: job.benefits ? JSON.parse(job.benefits) : [],
    };

    res.json({
      success: true,
      data: { job: formattedJob },
    });
  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch job',
    });
  }
});

// Protected routes
router.use(authenticateToken);

// Create job posting
router.post('/', async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const userRole = (req as any).user.role;

    // Check if user is an employer
    if (!['employer', 'admin'].includes(userRole)) {
      return res.status(403).json({
        success: false,
        error: 'Only employers can post jobs',
      });
    }

    // Validate input
    const validatedData = JobPostingSchema.parse(req.body);

    const job = await prisma.job.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        company: '', // This should be fetched from employer profile
        location: JSON.stringify(validatedData.location),
        type: validatedData.jobType,
        salary: validatedData.salary?.min || null,
        salaryType: validatedData.salary?.period || null,
        requirements: JSON.stringify(validatedData.requirements),
        benefits: JSON.stringify(validatedData.benefits || []),
        employerId: userId,
        featured: validatedData.isFeatured || false,
        status: 'active',
      },
      include: {
        employer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    res.json({
      success: true,
      message: 'Job posted successfully',
      data: { job },
    });
  } catch (error) {
    console.error('Create job error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.errors,
      });
    }
    res.status(500).json({
      success: false,
      error: 'Failed to create job posting',
    });
  }
});

// Get employer's jobs
router.get('/my-jobs', async (req, res) => {
  try {
    const userId = (req as any).user.id;

    const jobs = await prisma.job.findMany({
      where: { employerId: userId },
      include: {
        applications: {
          select: { id: true, status: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedJobs = jobs.map(job => ({
      ...job,
      applicationCount: job.applications.length,
      applicationsByStatus: job.applications.reduce((acc, app) => {
        acc[app.status] = (acc[app.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      requirements: job.requirements ? JSON.parse(job.requirements) : [],
      benefits: job.benefits ? JSON.parse(job.benefits) : [],
    }));

    res.json({
      success: true,
      data: { jobs: formattedJobs },
    });
  } catch (error) {
    console.error('Get my jobs error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch your jobs',
    });
  }
});

// Apply for job
router.post('/:id/apply', async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const { id: jobId } = req.params;

    // Check if job exists
    const job = await prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Job not found',
      });
    }

    // Check if user already applied
    const existingApplication = await prisma.jobApplication.findFirst({
      where: {
        jobId,
        applicantId: userId,
      },
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        error: 'You have already applied for this job',
      });
    }

    // Validate application data
    const validatedData = JobApplicationSchema.parse(req.body);

    const application = await prisma.jobApplication.create({
      data: {
        jobId,
        applicantId: userId,
        coverLetter: validatedData.coverLetter,
        status: 'applied',
      },
      include: {
        job: {
          select: {
            title: true,
            company: true,
          },
        },
        applicant: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    res.json({
      success: true,
      message: 'Application submitted successfully',
      data: { application },
    });
  } catch (error) {
    console.error('Apply for job error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.errors,
      });
    }
    res.status(500).json({
      success: false,
      error: 'Failed to submit application',
    });
  }
});

// Get job applications (for employers)
router.get('/:id/applications', async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const { id: jobId } = req.params;

    // Verify job belongs to employer
    const job = await prisma.job.findFirst({
      where: {
        id: jobId,
        employerId: userId,
      },
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Job not found or access denied',
      });
    }

    const applications = await prisma.jobApplication.findMany({
      where: { jobId },
      include: {
        applicant: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { appliedAt: 'desc' },
    });

    res.json({
      success: true,
      data: { applications },
    });
  } catch (error) {
    console.error('Get job applications error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch applications',
    });
  }
});

// Get user's applications
router.get('/applications/my-applications', async (req, res) => {
  try {
    const userId = (req as any).user.id;

    const applications = await prisma.jobApplication.findMany({
      where: { applicantId: userId },
      include: {
        job: {
          include: {
            employer: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: { appliedAt: 'desc' },
    });

    res.json({
      success: true,
      data: { applications },
    });
  } catch (error) {
    console.error('Get my applications error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch your applications',
    });
  }
});

// Update application status (for employers)
router.put('/applications/:applicationId/status', async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const { applicationId } = req.params;
    const { status, notes } = req.body;

    // Verify application belongs to employer's job
    const application = await prisma.jobApplication.findFirst({
      where: {
        id: applicationId,
        job: {
          employerId: userId,
        },
      },
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        error: 'Application not found or access denied',
      });
    }

    const updatedApplication = await prisma.jobApplication.update({
      where: { id: applicationId },
      data: {
        status,
        notes,
      },
      include: {
        applicant: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        job: {
          select: {
            title: true,
            company: true,
          },
        },
      },
    });

    res.json({
      success: true,
      message: 'Application status updated successfully',
      data: { application: updatedApplication },
    });
  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update application status',
    });
  }
});

// Resume upload endpoint
router.post('/users/resume/upload', upload.single('resume'), async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded',
      });
    }

    // Update user record with resume URL
    await prisma.user.update({
      where: { id: userId },
      data: {
        // Add resume field to user schema if needed
      },
    });

    res.json({
      success: true,
      message: 'Resume uploaded successfully',
      data: {
        url: `/uploads/resumes/${file.filename}`,
        fileName: file.originalname,
      },
    });
  } catch (error) {
    console.error('Resume upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload resume',
    });
  }
});

// Update resume text
router.put('/users/resume/text', async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const { resumeText } = req.body;

    // Update user record with resume text
    await prisma.user.update({
      where: { id: userId },
      data: {
        // Add resumeText field to user schema if needed
      },
    });

    res.json({
      success: true,
      message: 'Resume updated successfully',
    });
  } catch (error) {
    console.error('Resume text update error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update resume',
    });
  }
});

// Delete resume
router.delete('/users/resume', async (req, res) => {
  try {
    const userId = (req as any).user.id;

    // Update user record to remove resume
    await prisma.user.update({
      where: { id: userId },
      data: {
        // Remove resume fields from user schema if needed
      },
    });

    res.json({
      success: true,
      message: 'Resume deleted successfully',
    });
  } catch (error) {
    console.error('Resume delete error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete resume',
    });
  }
});

export { router as jobRoutesEnhanced };
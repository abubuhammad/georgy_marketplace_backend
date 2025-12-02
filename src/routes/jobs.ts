import { Router } from 'express';
import { authenticateToken, optionalAuth } from '../middleware/auth';
import { body } from 'express-validator';
import {
  getJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  getEmployerJobs,
  applyForJob,
  getMyApplications,
  getJobApplications,
  updateApplicationStatus,
  toggleJobSeekerMode
} from '../controllers/jobController';

const router = Router();

// Validation middleware for job creation
const validateJob = [
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('companyName').notEmpty().withMessage('Company name is required'),
  body('location').notEmpty().withMessage('Location is required'),
  body('type').isIn(['full-time', 'part-time', 'contract', 'remote']).withMessage('Valid job type is required'),
  body('requirements').notEmpty().withMessage('Requirements are required')
];

// Public routes
router.get('/', optionalAuth, getJobs);
router.get('/:id', optionalAuth, getJobById);

// Protected routes
router.use(authenticateToken);

// Job seeker routes
router.post('/toggle-job-seeker', toggleJobSeekerMode);
router.get('/my/applications', getMyApplications);
router.post('/:id/apply', applyForJob);

// Employer routes
router.get('/employer/listings', getEmployerJobs);
router.post('/', validateJob, createJob);
router.put('/:id', updateJob);
router.delete('/:id', deleteJob);
router.get('/:id/applications', getJobApplications);
router.put('/:id/applications/:applicationId', updateApplicationStatus);

export { router as jobRoutes };

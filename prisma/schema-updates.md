# Database Schema Updates Required

## Issues Identified

### 1. Job Model Missing Fields
The current Job model lacks several fields that the frontend expects:

**Missing fields:**
- `viewCount` (Int) - Track job view analytics
- `category` (String) - Job category for filtering
- `skills` (String @db.Text) - JSON array of required skills  
- `responsibilities` (String @db.Text) - JSON array of responsibilities
- `jobLevel` (String) - entry, junior, mid, senior, etc.
- `workLocation` (String) - remote, hybrid, onsite
- `applicationDeadline` (DateTime?)
- `startDate` (DateTime?)
- `isPremium` (Boolean @default(false))
- `isFeatured` (Boolean @default(false))
- `isActive` (Boolean @default(true))

### 2. User Model Missing Resume Fields
Need to add resume-related fields to User model:

**Missing fields:**
- `resumeUrl` (String?) - URL to uploaded resume file
- `resumeText` (String? @db.Text) - Text version of resume
- `resumeUpdatedAt` (DateTime?)

### 3. JobApplication Model Enhancements
Current model needs additional fields:

**Missing fields:**
- `expectedSalaryMin` (Decimal? @db.Decimal(10, 2))
- `expectedSalaryMax` (Decimal? @db.Decimal(10, 2))
- `expectedSalaryCurrency` (String?)
- `expectedSalaryPeriod` (String?)
- `availableFrom` (DateTime?)
- `documents` (String? @db.Text) - JSON array of document URLs

### 4. New Models Needed

#### EmployerProfile Model
```prisma
model EmployerProfile {
  id                String   @id @default(cuid())
  userId            String   @unique
  companyName       String
  companyDescription String  @db.Text
  companyWebsite    String?
  companySize       String   // startup, small, medium, large, enterprise
  industry          String
  companyLogo       String?
  establishedYear   Int?
  location          String   @db.Text // JSON object
  isVerified        Boolean  @default(false)
  verifiedAt        DateTime?
  totalJobs         Int      @default(0)
  activeJobs        Int      @default(0)
  totalHires        Int      @default(0)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@map("employer_profiles")
}
```

#### JobSeekerProfile Model
```prisma
model JobSeekerProfile {
  id                String   @id @default(cuid())
  userId            String   @unique
  title             String?
  summary           String?  @db.Text
  skills            String?  @db.Text // JSON array
  experience        String?  @db.Text // JSON array of work experience
  education         String?  @db.Text // JSON array of education
  certifications    String?  @db.Text // JSON array of certifications
  languages         String?  @db.Text // JSON array of languages
  portfolioUrl      String?
  linkedinUrl       String?
  githubUrl         String?
  expectedSalaryMin Decimal? @db.Decimal(10, 2)
  expectedSalaryMax Decimal? @db.Decimal(10, 2)
  salaryCurrency    String?
  salaryPeriod      String?
  availableFrom     DateTime?
  workPreference    String? // remote, hybrid, onsite
  isActivelyLooking Boolean  @default(true)
  location          String?  @db.Text // JSON object
  totalApplications Int      @default(0)
  totalInterviews   Int      @default(0)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@map("job_seeker_profiles")
}
```

### 5. Updated Job Model
```prisma
model Job {
  id                  String   @id @default(cuid())
  title               String
  description         String   @db.Text
  company             String
  location            String   @db.Text // JSON object
  type                String   // full_time, part_time, contract, remote, etc.
  jobLevel            String   // entry, junior, mid, senior, lead, manager, director, executive
  category            String   // technology, finance, healthcare, etc.
  workLocation        String   // remote, hybrid, onsite
  salary              Decimal? @db.Decimal(10, 2)
  salaryMax           Decimal? @db.Decimal(10, 2)
  salaryType          String?  // hourly, monthly, yearly
  salaryCurrency      String?  @default("USD")
  requirements        String   @db.Text // JSON array
  responsibilities    String?  @db.Text // JSON array
  benefits            String?  @db.Text // JSON array
  skills              String?  @db.Text // JSON array
  employerId          String
  viewCount           Int      @default(0)
  applicationCount    Int      @default(0)
  applicationDeadline DateTime?
  startDate           DateTime?
  isPremium           Boolean  @default(false)
  isFeatured          Boolean  @default(false)
  featured            Boolean  @default(false) // Keep for backward compatibility
  isActive            Boolean  @default(true)
  status              String   @default("active") // active, closed, draft, expired
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  employer     User             @relation(fields: [employerId], references: [id], onDelete: Cascade)
  applications JobApplication[]

  @@map("jobs")
}
```

### 6. Updated JobApplication Model
```prisma
model JobApplication {
  id                      String    @id @default(cuid())
  jobId                   String
  applicantId             String
  coverLetter             String?   @db.Text
  resume                  String?   // URL to resume file
  resumeText              String?   @db.Text
  expectedSalaryMin       Decimal?  @db.Decimal(10, 2)
  expectedSalaryMax       Decimal?  @db.Decimal(10, 2)
  expectedSalaryCurrency  String?
  expectedSalaryPeriod    String?
  availableFrom           DateTime?
  status                  String    @default("applied") // applied, screening, interviewing, offer, hired, rejected
  score                   Int?      @db.TinyInt
  notes                   String?   @db.Text
  rejectionReason         String?   @db.Text
  documents               String?   @db.Text // JSON array of document URLs
  appliedAt               DateTime  @default(now())
  updatedAt               DateTime  @updatedAt

  job       Job  @relation(fields: [jobId], references: [id], onDelete: Cascade)
  applicant User @relation(fields: [applicantId], references: [id], onDelete: Cascade)

  @@map("job_applications")
}
```

### 7. Updated User Model Relations
Add to User model:
```prisma
model User {
  // ... existing fields ...
  
  // Resume fields
  resumeUrl         String?
  resumeText        String?   @db.Text
  resumeUpdatedAt   DateTime?
  
  // ... existing relations ...
  
  // New relations
  employerProfile   EmployerProfile?
  jobSeekerProfile  JobSeekerProfile?
}
```

## Migration Strategy

1. **Create migration files** for each model update
2. **Backup existing data** before running migrations
3. **Run migrations in stages**:
   - Stage 1: Add new fields to existing models
   - Stage 2: Create new profile models
   - Stage 3: Migrate existing data to new structure
   - Stage 4: Update foreign key constraints

## Commands to Run

```bash
# Generate migration
npx prisma migrate dev --name "add-job-enhancements"

# Generate Prisma client
npx prisma generate

# Push to database (for development)
npx prisma db push
```

## Data Migration Scripts Needed

1. **Migrate existing job data** to include new fields with default values
2. **Create employer profiles** for existing users with employer role
3. **Create job seeker profiles** for existing users with job_seeker role
4. **Update job applications** with new fields structure
# Georgy Marketplace Backend API

A robust Node.js backend API for the Georgy Marketplace platform.

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js with TypeScript
- **Database**: MySQL with Prisma ORM
- **Authentication**: JWT tokens with bcrypt password hashing
- **Validation**: Joi schema validation
- **Security**: Helmet, CORS, Rate limiting

## Features

- ✅ **Authentication API**: Register, login, logout, password reset
- ✅ **JWT Middleware**: Token-based authentication with role-based access
- ✅ **Input Validation**: Comprehensive request validation
- ✅ **Error Handling**: Centralized error handling with proper HTTP status codes
- ✅ **Security**: Rate limiting, CORS, Helmet protection
- ✅ **Database**: Prisma ORM with MySQL
- 🚧 **Product Management**: CRUD operations for products
- 🚧 **Artisan Services**: Service requests and quotes
- 🚧 **Job Matching**: Job postings and applications
- 🚧 **Real Estate**: Property listings and viewings

## Quick Start

### Prerequisites

- Node.js 18+ 
- MySQL database running
- XAMPP or local MySQL server

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

3. **Set up database**
   ```bash
   npm run db:generate
   npm run db:push
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:5000`

### API Documentation

#### Health Check
- `GET /health` - Server health status

#### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile (requires auth)
- `PUT /api/auth/profile` - Update user profile (requires auth)
- `POST /api/auth/change-password` - Change password (requires auth)
- `POST /api/auth/request-password-reset` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token
- `POST /api/auth/refresh-token` - Refresh JWT token
- `POST /api/auth/logout` - User logout (requires auth)

#### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (requires auth)
- `PUT /api/products/:id` - Update product (requires auth)
- `DELETE /api/products/:id` - Delete product (requires auth)

#### Artisans
- `GET /api/artisans` - Get all artisans
- `POST /api/artisans/register` - Register as artisan (requires auth)
- `POST /api/artisans/service-requests` - Create service request (requires auth)
- `POST /api/artisans/quotes` - Submit quote (requires auth)

#### Jobs
- `GET /api/jobs` - Get all jobs
- `POST /api/jobs` - Create job posting (requires auth)
- `POST /api/jobs/:id/apply` - Apply for job (requires auth)

#### Real Estate
- `GET /api/real-estate/properties` - Get all properties
- `POST /api/real-estate/properties` - Create property listing (requires auth)
- `POST /api/real-estate/properties/:id/viewing` - Schedule viewing (requires auth)

#### Users (Admin only)
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get user by ID (admin only)
- `PUT /api/users/:id/verify` - Verify user (admin only)
- `DELETE /api/users/:id` - Delete user (admin only)

### Example Requests

#### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "Password123",
    "firstName": "John",
    "lastName": "Doe",
    "role": "customer"
  }'
```

#### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "Password123"
  }'
```

#### Get Profile (with JWT token)
```bash
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Development

### Scripts

- `npm run dev` - Start development server with auto-reload
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema changes to database
- `npm run db:studio` - Open Prisma Studio
- `npm run lint` - Run ESLint

### Project Structure

```
src/
├── config/          # Configuration files
├── controllers/     # Route controllers
├── middleware/      # Custom middleware
├── routes/          # API routes
├── utils/           # Utility functions
├── validation/      # Input validation schemas
└── server.ts        # Main server file
```

## Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Set production environment variables**

3. **Run database migrations**
   ```bash
   npm run db:migrate
   ```

4. **Start the server**
   ```bash
   npm start
   ```

## Contributing

1. Follow TypeScript best practices
2. Add proper error handling
3. Include input validation for new endpoints
4. Write clear commit messages
5. Test your changes thoroughly

## Security

- JWT tokens for authentication
- Password hashing with bcrypt
- Input validation with Joi
- Rate limiting to prevent abuse
- CORS and Helmet security headers
- Environment variables for sensitive data

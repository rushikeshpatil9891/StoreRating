# Store Rating System - Backend

This is the backend API for the Store Rating System built with Express.js and MySQL.

## Tech Stack
- **Framework**: Express.js
- **Database**: MySQL
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Configuration**
   - Copy `.env` file and update the database credentials
   - Set your MySQL database details
   - Generate a secure JWT secret

3. **Database Setup**
   - Make sure MySQL is running
   - Run the database initialization script:
   ```bash
   node config/init-db.js
   ```

4. **Start the Server**
   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get current user profile
- `PUT /api/auth/profile` - Update user profile

### Users (Admin Only)
- `GET /api/users` - Get all users with filters
- `GET /api/users/stats` - Get user statistics
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Stores
- `GET /api/stores` - Get all stores with search/filters
- `GET /api/stores/stats` - Get store statistics (Admin)
- `GET /api/stores/my-stores` - Get stores owned by current user (Store Owner)
- `GET /api/stores/:id` - Get store by ID
- `GET /api/stores/:id/details` - Get store with ratings (Store Owner)
- `POST /api/stores` - Create new store (Admin)
- `PUT /api/stores/:id` - Update store
- `DELETE /api/stores/:id` - Delete store (Admin)

### Ratings
- `POST /api/ratings` - Submit/update rating
- `GET /api/ratings/user/:store_id` - Get user's rating for a store
- `GET /api/ratings/store/:store_id` - Get all ratings for a store
- `GET /api/ratings/store/:store_id/stats` - Get rating stats for a store
- `GET /api/ratings/user` - Get all ratings by current user
- `DELETE /api/ratings/:store_id` - Delete user's rating for a store
- `GET /api/ratings/stats` - Get overall rating statistics (Admin)

### Dashboard
- `GET /api/dashboard` - Get dashboard based on user role
- `GET /api/dashboard/admin` - Admin dashboard
- `GET /api/dashboard/store-owner` - Store owner dashboard
- `GET /api/dashboard/user` - Normal user dashboard

### Health Check
- `GET /api/health` - Server health check

## User Roles & Permissions

### System Administrator
- Full access to all endpoints
- Can create/manage users and stores
- View comprehensive statistics and reports

### Store Owner
- Can view/update their own stores
- Can view ratings and statistics for their stores
- Limited access to user management

### Normal User
- Can register and login
- Can view stores and submit ratings
- Can update their own profile

## Form Validations

### User Registration
- **Name**: 20-60 characters
- **Address**: Max 400 characters
- **Password**: 8-16 characters, must include uppercase letter and special character
- **Email**: Valid email format

### Store Creation
- **Name**: Required
- **Email**: Required, unique
- **Address**: Optional

### Rating Submission
- **Rating**: 1-5 (integer)

## Database Schema

### Users Table
- id (Primary Key)
- name (VARCHAR 60)
- email (VARCHAR 255, Unique)
- password (VARCHAR 255, Hashed)
- address (TEXT)
- role (ENUM: admin, store_owner, normal_user)
- created_at, updated_at (TIMESTAMP)

### Stores Table
- id (Primary Key)
- name (VARCHAR 255)
- email (VARCHAR 255, Unique)
- address (TEXT)
- owner_id (Foreign Key to Users)
- created_at, updated_at (TIMESTAMP)

### Ratings Table
- id (Primary Key)
- user_id (Foreign Key to Users)
- store_id (Foreign Key to Stores)
- rating (INT 1-5)
- created_at, updated_at (TIMESTAMP)
- Unique constraint on (user_id, store_id)

## Project Structure
```
backend/
├── config/
│   ├── database.js      # Database connection
│   ├── init-db.js       # Database initialization
│   └── schema.sql       # Database schema
├── controllers/         # Business logic
│   ├── authController.js
│   ├── userController.js
│   ├── storeController.js
│   ├── ratingController.js
│   └── dashboardController.js
├── middleware/          # Authentication & validation
│   └── auth.js
├── models/             # Data models
│   ├── User.js
│   ├── Store.js
│   └── Rating.js
├── routes/             # API routes
│   ├── auth.js
│   ├── users.js
│   ├── stores.js
│   ├── ratings.js
│   └── dashboard.js
├── index.js            # Main server file
├── package.json
├── .env                # Environment variables
└── README.md
```

## Development Phases
✅ **Phase 1**: Project Setup and Database Schema
✅ **Phase 2**: Authentication System
✅ **Phase 3**: User Management
✅ **Phase 4**: Store Management
✅ **Phase 5**: Rating System
✅ **Phase 6**: Dashboards and Views

## Testing the API

You can test the API using tools like Postman or curl:

1. **Register a user**:
   ```bash
   curl -X POST http://localhost:5000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"name":"John Doe","email":"john@example.com","address":"123 Main St","password":"Password123!"}'
   ```

2. **Login**:
   ```bash
   curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"john@example.com","password":"Password123!"}'
   ```

3. **Use the token for authenticated requests**:
   ```bash
   curl -X GET http://localhost:5000/api/dashboard \
     -H "Authorization: Bearer YOUR_JWT_TOKEN"
   ```

## Security Features
- JWT token-based authentication
- Password hashing with bcrypt
- Role-based access control
- Input validation and sanitization
- SQL injection prevention
- CORS enabled

## Error Handling
The API returns appropriate HTTP status codes and error messages:
- 200: Success
- 201: Created
- 400: Bad Request (validation errors)
- 401: Unauthorized
- 403: Forbidden (insufficient permissions)
- 404: Not Found
- 500: Internal Server Error

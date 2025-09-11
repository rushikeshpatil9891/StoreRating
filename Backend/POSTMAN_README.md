# Store Rating System - Postman Collection

This Postman collection contains all API endpoints for testing the Store Rating System backend.

## 📋 **Collection Overview**

The collection is organized into the following folders:

### 🔍 **Health Check**
- Server health verification endpoint

### 🔐 **Authentication**
- User registration (Normal User & Store Owner)
- Login endpoints (Admin, Normal User)
- Profile management (Get/Update)

### 👥 **User Management (Admin Only)**
- Get all users with filtering and pagination
- User statistics
- Create, update, delete users
- Get user by ID

### 🏪 **Store Management**
- Get all stores with search and filters
- Store statistics (Admin)
- Create, update, delete stores (Admin)
- Get store by ID

### ⭐ **Rating System**
- Submit/update ratings (1-5 stars)
- Get user's rating for specific store
- Get all ratings for a store
- Get user's rating history
- Delete ratings
- Overall rating statistics (Admin)

### 📊 **Dashboard**
- Auto-detect dashboard based on user role
- Admin dashboard (statistics, recent activity)
- Store owner dashboard (store performance)
- Normal user dashboard (personal ratings, discovery)

## 🚀 **How to Use**

### **Step 1: Import Collection**
1. Open Postman
2. Click "Import" button
3. Select "File" tab
4. Choose `Store_Rating_API_Postman_Collection.json`
5. Click "Import"

### **Step 2: Set Environment Variables**
The collection uses these variables (automatically managed):
- `{{baseUrl}}` - API base URL (default: `http://localhost:5000/api`)
- `{{adminToken}}` - Admin JWT token
- `{{storeOwnerToken}}` - Store owner JWT token
- `{{userToken}}` - Normal user JWT token

### **Step 3: Start Testing**

#### **Initial Setup:**
1. **Start your backend server**: `npm run dev`
2. **Test health check**: Run "Server Health" request
3. **Login as Admin**: Use "Login as Admin" (email: admin@storerating.com, password: admin123)

#### **Testing Flow:**
1. **Register users**: Use registration endpoints
2. **Login**: Get JWT tokens (automatically saved)
3. **Create stores**: Use admin token to create stores
4. **Submit ratings**: Use user tokens to rate stores
5. **View dashboards**: Test different dashboard endpoints

## 🔑 **Default Credentials**

### **Admin User** (Pre-created in database)
- Email: `admin@storerating.com`
- Password: `admin123`

### **Test Users** (Create via API)
- Normal User: Register with any valid email
- Store Owner: Register with any valid email

## 📝 **Request Examples**

### **Registration:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "address": "123 Main Street, City, State 12345",
  "password": "Password123!"
}
```

### **Login:**
```json
{
  "email": "john@example.com",
  "password": "Password123!"
}
```

### **Submit Rating:**
```json
{
  "store_id": 1,
  "rating": 5
}
```

## 🔒 **Authentication Headers**

All protected endpoints require:
```
Authorization: Bearer {{token}}
```

Tokens are automatically saved after successful login/registration.

## 📊 **Response Examples**

### **Successful Registration:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "normal_user"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### **Dashboard Response (Admin):**
```json
{
  "statistics": {
    "total_users": 5,
    "total_stores": 3,
    "total_ratings": 12,
    "average_rating": 4.2,
    "users_by_role": {
      "admin": 1,
      "store_owner": 2,
      "normal_user": 2
    }
  },
  "recent_activity": {
    "users": [...],
    "stores": [...]
  },
  "top_rated_stores": [...]
}
```

## 🧪 **Testing Tips**

1. **Run requests in order**: Authentication → User Management → Store Management → Ratings → Dashboard
2. **Check response codes**: 200 (Success), 201 (Created), 400 (Bad Request), 401 (Unauthorized), 403 (Forbidden)
3. **Monitor tokens**: Tokens are automatically updated in collection variables
4. **Test error scenarios**: Try invalid data, missing authentication, insufficient permissions
5. **Use different roles**: Test the same endpoints with different user roles

## 📋 **API Validation Rules**

### **User Registration:**
- Name: 20-60 characters
- Address: Max 400 characters
- Password: 8-16 chars, 1 uppercase, 1 special character
- Email: Valid email format

### **Store Creation:**
- Name: Required
- Email: Required, unique
- Address: Optional

### **Rating Submission:**
- Rating: Integer 1-5
- Store must exist
- One rating per user per store

## 🆘 **Troubleshooting**

### **Connection Issues:**
- Ensure backend server is running on port 5000
- Check MySQL database connection
- Verify `.env` file configuration

### **Authentication Errors:**
- Login first to get JWT token
- Check token expiration (7 days default)
- Verify user role permissions

### **Database Errors:**
- Run `node config/init-db.js` to initialize database
- Check MySQL server status
- Verify database credentials in `.env`

## 📞 **Support**

If you encounter issues:
1. Check server logs in terminal
2. Verify request format and headers
3. Test with different user roles
4. Check database connectivity

Happy testing! 🚀

# Sampark Jyoti Backend API Documentation

## Overview
Sampark Jyoti is a comprehensive platform connecting employers to laborers, farmers to buyers, bridging unemployment and ensuring fair wages. This API supports multiple user roles with role-specific functionality.

## Base URL
```
http://localhost:5000
```

## Authentication
All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## User Roles
The system supports multiple roles for each user:
- **Labour**: Workers seeking employment
- **Employer**: Individuals/businesses offering work
- **Farmer**: Agricultural producers
- **Buyer**: Consumers, dealers, vendors purchasing agricultural products

Users can have multiple roles simultaneously, with one designated as the primary role.

---

## 🔐 Authentication Routes

### POST /api/auth/register
Register a new user with multiple roles.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "9876543210",
  "roles": ["labour", "farmer"],
  "primaryRole": "labour",
  "location": "Mumbai, Maharashtra",
  "languages": ["english", "hindi"],
  "preferredLanguage": "english",
  "labourProfile": {
    "workExperience": 5,
    "fieldOfWork": ["agriculture", "construction"],
    "minimumWage": 300,
    "availability": "full_time"
  },
  "farmerProfile": {
    "cropYield": [{
      "cropName": "Wheat",
      "quantity": 100,
      "unit": "kg",
      "harvestDate": "2024-01-15"
    }],
    "minimumSupportPrice": 250
  }
}
```

**Response:**
```json
{
  "status": "success",
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "roles": ["labour", "farmer"],
      "primaryRole": "labour",
      "location": "Mumbai, Maharashtra"
    },
    "token": "jwt_token_here"
  }
}
```

### POST /api/auth/login
User login.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### GET /api/auth/profile
Get current user profile (requires authentication).

### PUT /api/auth/roles
Update user roles (requires authentication).

### GET /api/auth/by-role/:role
Get users by specific role.

---

## 👥 User Management Routes

### GET /api/users
Get all users with filtering options.

**Query Parameters:**
- `roles`: Filter by roles (array or single role)
- `primaryRole`: Filter by primary role
- `location`: Filter by location
- `limit`: Results per page (default: 20)
- `page`: Page number (default: 1)

### GET /api/users/:id
Get user by ID.

### PUT /api/users/:id
Update user profile.

### GET /api/users/role/:role
Get users by specific role with detailed filtering.

**Query Parameters:**
- `location`: Filter by location
- `experience`: Filter by minimum experience
- `skills`: Filter by skills/crops/categories
- `limit`: Results per page
- `page`: Page number

### GET /api/users/search/advanced
Advanced search with multiple criteria.

**Query Parameters:**
- `roles`: Array of roles
- `location`: Location filter
- `skills`: Skills/crops/categories filter
- `experience`: Minimum experience
- `rating`: Minimum rating
- `languages`: Language preferences

---

## 🎯 Role-Specific Routes

### GET /api/roles/labour
Get all labour profiles with filtering.

**Query Parameters:**
- `location`: Location filter
- `fieldOfWork`: Array of work fields
- `experience`: Minimum experience
- `availability`: Availability type
- `languages`: Language preferences

### GET /api/roles/employer
Get all employer profiles with filtering.

**Query Parameters:**
- `location`: Location filter
- `typeOfWork`: Business/personal/both
- `experience`: Minimum experience
- `languages`: Language preferences

### GET /api/roles/farmer
Get all farmer profiles with filtering.

**Query Parameters:**
- `location`: Location filter
- `cropYield`: Array of crop names
- `farmingType`: Organic/conventional/etc.
- `organic`: Boolean filter
- `languages`: Language preferences

### GET /api/roles/buyer
Get all buyer profiles with filtering.

**Query Parameters:**
- `location`: Location filter
- `buyerType`: Consumer/dealer/vendor/etc.
- `preferredCategories`: Array of categories
- `languages`: Language preferences

### PUT /api/roles/labour/:userId
Update labour profile.

**Request Body:**
```json
{
  "workExperience": 7,
  "workLocation": "Pune, Maharashtra",
  "minimumWage": 350,
  "fieldOfWork": ["agriculture", "manufacturing"],
  "extraSkills": ["tractor operation", "irrigation"],
  "availability": "flexible"
}
```

### PUT /api/roles/employer/:userId
Update employer profile.

**Request Body:**
```json
{
  "workExperience": 10,
  "workLocation": "Mumbai, Maharashtra",
  "typeOfWork": "business",
  "businessDetails": {
    "businessName": "ABC Farms",
    "businessType": "Agriculture",
    "gstin": "GST123456789"
  },
  "typicalAmount": 500,
  "typicalDaysOfWork": 3,
  "skillsRequired": ["farming", "irrigation"]
}
```

### PUT /api/roles/farmer/:userId
Update farmer profile.

**Request Body:**
```json
{
  "cropYield": [{
    "cropName": "Rice",
    "quantity": 200,
    "unit": "kg",
    "harvestDate": "2024-02-01",
    "isOrganic": true
  }],
  "minimumSupportPrice": 300,
  "specialtyYield": ["Basmati Rice"],
  "farmingType": "organic",
  "landSize": 5,
  "landUnit": "acre"
}
```

### PUT /api/roles/buyer/:userId
Update buyer profile.

**Request Body:**
```json
{
  "buyerType": "dealer",
  "businessVerification": {
    "gstin": "GST987654321",
    "businessLicense": "LIC123456"
  },
  "preferredCategories": ["grains", "vegetables"],
  "typicalOrderSize": 100,
  "orderSizeUnit": "kg"
}
```

---

## 💼 Job Management Routes

### GET /api/jobs
Get all jobs with filtering.

**Query Parameters:**
- `category`: Job category
- `location`: Job location
- `salary`: Minimum salary
- `experience`: Experience level
- `employerType`: Business/personal/both
- `languageRequirements`: Array of languages

### GET /api/jobs/:id
Get job by ID.

### POST /api/jobs
Create new job (employer role required).

**Request Body:**
```json
{
  "title": "Farm Labour Required",
  "description": "Need experienced farm workers for wheat harvesting",
  "category": "agriculture",
  "location": "Pune, Maharashtra",
  "salary": 400,
  "experience": "experienced",
  "requirements": ["farming experience", "physical fitness"],
  "employer": "employer_user_id",
  "startDate": "2024-02-15",
  "duration": "seasonal",
  "workHours": "full_time",
  "benefits": ["food provided", "accommodation"],
  "languageRequirements": ["hindi", "marathi"],
  "jobRequirements": {
    "minimumAge": 18,
    "genderPreference": "any",
    "toolsProvided": true
  }
}
```

### PUT /api/jobs/:id
Update job.

### POST /api/jobs/:id/apply
Apply for job (labour role required).

**Request Body:**
```json
{
  "labourId": "labour_user_id",
  "coverLetter": "I have 5 years of farming experience...",
  "expectedSalary": 450
}
```

### GET /api/jobs/employer/:employerId
Get jobs by specific employer.

---

## 🌾 Agricultural Product Routes

### GET /api/farmers/products
Get all agricultural products.

### GET /api/farmers/products/:id
Get product by ID.

### POST /api/farmers/products
Create new product listing (farmer role required).

**Request Body:**
```json
{
  "name": "Organic Wheat",
  "description": "High-quality organic wheat from our farm",
  "category": "grains",
  "price": 280,
  "quantity": 500,
  "unit": "kg",
  "location": "Nashik, Maharashtra",
  "farmer": "farmer_user_id",
  "harvestDate": "2024-01-20",
  "organic": true,
  "farmerDetails": {
    "farmingType": "organic",
    "landSize": 10,
    "landUnit": "acre"
  },
  "pricing": {
    "minimumSupportPrice": 250,
    "marketPrice": 300,
    "isMSPGuaranteed": true
  },
  "cropDetails": {
    "variety": "Durum Wheat",
    "season": "rabi",
    "yieldPerAcre": 50,
    "yieldUnit": "kg"
  },
  "languageInfo": {
    "localName": "गेहूं",
    "localLanguage": "hindi",
    "descriptionLocal": "हमारे खेत से उच्च गुणवत्ता वाला जैविक गेहूं"
  }
}
```

---

## 🌐 Language Support

The API supports multiple Indian languages for vernacular communication:

**Supported Languages:**
- English (default)
- Hindi
- Marathi
- Gujarati
- Bengali
- Telugu
- Tamil
- Kannada
- Malayalam
- Punjabi
- Urdu

**Language Fields:**
- User language preferences
- Product local names and descriptions
- Job language requirements
- Communication preferences

---

## 📊 Data Models

### User Model
- **Basic Info**: name, email, phone, location
- **Roles**: Multiple roles with primary role designation
- **Language**: Preferred and supported languages
- **Role-specific Profiles**: Separate profiles for each role
- **Verification**: Document verification and business verification
- **Ratings**: User rating system

### Job Model
- **Job Details**: title, description, category, location
- **Compensation**: salary, salary type, benefits
- **Requirements**: experience, skills, physical requirements
- **Employer Info**: Employer profile integration
- **Language**: Language requirements for job
- **Applications**: Labour applications with snapshots

### Product Model
- **Product Info**: name, description, category, price
- **Agricultural Details**: harvest date, organic status, farming type
- **MSP Support**: Minimum Support Price integration
- **Crop Details**: variety, season, yield information
- **Language**: Local names and descriptions

---

## 🔍 Search and Filtering

### Advanced Search Features
- **Multi-role filtering**: Find users with specific role combinations
- **Location-based search**: Geographic proximity matching
- **Skill matching**: Cross-role skill compatibility
- **Language filtering**: Communication preference matching
- **Experience filtering**: Minimum experience requirements
- **Rating filtering**: Quality-based user selection

### Pagination
All list endpoints support pagination with:
- `limit`: Results per page (default: 20)
- `page`: Page number (default: 1)
- Total count and page information in responses

---

## 🚀 Getting Started

1. **Start the server:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Test the API:**
   ```bash
   curl http://localhost:5000/health
   ```

3. **Register a user:**
   ```bash
   curl -X POST http://localhost:5000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"name":"Test User","email":"test@example.com","password":"password123","phone":"9876543210","roles":["labour"],"primaryRole":"labour","location":"Mumbai"}'
   ```

---

## 📝 Error Handling

All API responses follow a consistent format:

**Success Response:**
```json
{
  "status": "success",
  "message": "Operation completed successfully",
  "data": { ... }
}
```

**Error Response:**
```json
{
  "status": "error",
  "message": "Error description",
  "error": "Detailed error information"
}
```

**HTTP Status Codes:**
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error

---

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs for password security
- **Role-based Access Control**: API endpoints protected by user roles
- **Input Validation**: Comprehensive request validation
- **CORS Support**: Cross-origin resource sharing configuration

---

## 📈 Performance Features

- **Database Indexing**: Optimized MongoDB queries
- **Pagination**: Efficient data retrieval
- **Population**: Related data loading
- **Virtual Fields**: Computed properties
- **Caching Ready**: Structure supports future caching implementation

---

## 🚧 Future Enhancements

- **Real-time Notifications**: WebSocket integration
- **File Upload**: Profile images and documents
- **Payment Integration**: Digital payment processing
- **Analytics Dashboard**: User and platform statistics
- **Mobile App API**: Optimized endpoints for mobile applications


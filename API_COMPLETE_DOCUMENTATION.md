# 🚀 Sampark Jyoti Backend API - Complete Documentation

## 🌟 **Enhanced Backend Features**

### ✨ **Security Enhancements**
- **Helmet.js** - Security headers protection
- **Rate Limiting** - Prevent abuse and spam
- **Input Validation** - Express-validator middleware
- **Input Sanitization** - XSS protection
- **CORS Configuration** - Proper cross-origin setup
- **Compression** - Gzip compression for better performance

### 🔐 **Authentication System**
- **JWT Tokens** - Secure authentication
- **Password Hashing** - bcrypt with salt
- **Token Expiration** - Automatic logout
- **Role-based Access** - Agent permissions

---

## 📡 **API Endpoints**

### 🔑 **Agent Authentication**

#### **POST** `/api/agents/register`
**Purpose**: Register new agent (simplified - email & password only)

**Request Body**:
```json
{
  "email": "agent@example.com",
  "password": "agent123"
}
```

**Response**:
```json
{
  "status": "success",
  "message": "Agent registered successfully",
  "data": {
    "agent": {
      "id": "...",
      "agentId": "AGT000001",
      "name": "agent",
      "email": "agent@example.com",
      "organization": "Sampark Jyoti",
      "territory": "General",
      "permissions": {...}
    },
    "token": "jwt_token_here"
  }
}
```

#### **POST** `/api/agents/login`
**Purpose**: Agent login

**Request Body**:
```json
{
  "email": "agent@example.com",
  "password": "agent123"
}
```

**Response**:
```json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "agent": {...},
    "token": "jwt_token_here"
  }
}
```

#### **GET** `/api/agents/profile`
**Purpose**: Get agent profile
**Headers**: `Authorization: Bearer <token>`

---

### 👥 **Worker Management**

#### **POST** `/api/agents/create-worker`
**Purpose**: Create worker profile (agent only)
**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "name": "Rajesh Kumar",
  "email": "rajesh@example.com",
  "phone": "9876543210",
  "location": "Mumbai, Maharashtra",
  "bio": "Experienced construction worker",
  "labourProfile": {
    "workExperience": 5,
    "minimumWage": 500,
    "fieldOfWork": ["construction", "manufacturing"],
    "extraSkills": ["driving", "welding"],
    "availability": "full_time"
  }
}
```

**Response**:
```json
{
  "status": "success",
  "message": "Worker profile created successfully",
  "data": {
    "worker": {
      "id": "...",
      "name": "Rajesh Kumar",
      "email": "rajesh@example.com",
      "tempPassword": "abc123xyz",
      "createdBy": "Agent Name"
    }
  }
}
```

#### **GET** `/api/agents/my-workers`
**Purpose**: Get workers created by agent
**Headers**: `Authorization: Bearer <token>`
**Query Parameters**: `?search=name&limit=20&page=1`

#### **GET** `/api/agents/dashboard`
**Purpose**: Get agent dashboard stats
**Headers**: `Authorization: Bearer <token>`

---

### 💰 **Market Price Management**

#### **POST** `/api/agents/update-price`
**Purpose**: Update market price (agent only)
**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "productName": "Tomato",
  "category": "vegetables",
  "currentPrice": 45.50,
  "unit": "kg",
  "market": "Crawford Market",
  "district": "Mumbai",
  "state": "Maharashtra",
  "quality": "premium",
  "description": "Fresh organic tomatoes",
  "stockQuantity": 100
}
```

**Response**:
```json
{
  "status": "success",
  "message": "Market price updated successfully",
  "data": {
    "marketPrice": {
      "id": "...",
      "productName": "Tomato",
      "currentPrice": "₹45.50/kg",
      "previousPrice": "₹42.00/kg",
      "priceChange": 3.50,
      "priceChangePercentage": "8.33",
      "trend": "up",
      "trendIcon": "↗️",
      "location": "Mumbai",
      "market": "Crawford Market",
      "updatedBy": "Agent Name",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  }
}
```

#### **GET** `/api/agents/my-prices`
**Purpose**: Get price updates by agent
**Headers**: `Authorization: Bearer <token>`
**Query Parameters**: `?category=vegetables&search=tomato&limit=20&page=1`

---

### 📊 **Market Prices (Public - for Mobile App)**

#### **GET** `/api/market-prices`
**Purpose**: Get all market prices (public endpoint)

**Query Parameters**:
- `category` - Filter by category
- `location` - Filter by location
- `district` - Filter by district
- `state` - Filter by state
- `search` - Search products
- `sortBy` - Sort field (default: createdAt)
- `sortOrder` - asc/desc (default: desc)
- `limit` - Results per page (default: 50)
- `page` - Page number (default: 1)

**Response**:
```json
{
  "status": "success",
  "data": {
    "prices": [
      {
        "id": "...",
        "productName": "Tomato",
        "category": "vegetables",
        "currentPrice": 45.50,
        "unit": "kg",
        "location": "Mumbai",
        "market": "Crawford Market",
        "trend": "up",
        "priceChangePercentage": 8.33,
        "updatedBy": {
          "name": "Agent Name",
          "location": "Mumbai",
          "organization": "Sampark Jyoti"
        },
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalPrices": 100,
      "limit": 20
    },
    "filters": {
      "categories": ["vegetables", "fruits", ...],
      "locations": ["Mumbai", "Delhi", ...]
    }
  }
}
```

#### **GET** `/api/market-prices/trending/all`
**Purpose**: Get trending prices (significant price changes)
**Query Parameters**: `?limit=20`

#### **GET** `/api/market-prices/latest/all`
**Purpose**: Get latest price updates
**Query Parameters**: `?limit=10`

#### **GET** `/api/market-prices/category/:category`
**Purpose**: Get prices by category
**Example**: `/api/market-prices/category/vegetables`

#### **GET** `/api/market-prices/history/:productName`
**Purpose**: Get price history for a product
**Example**: `/api/market-prices/history/Tomato?days=30&location=Mumbai`

#### **GET** `/api/market-prices/search/products`
**Purpose**: Search product names
**Query Parameters**: `?q=tomato&limit=10`

#### **GET** `/api/market-prices/stats/overview`
**Purpose**: Get market statistics overview

---

## 🛡️ **Security Features**

### **Rate Limiting**
- **General API**: 100 requests per 15 minutes
- **Auth Endpoints**: 5 attempts per 15 minutes
- **Automatic blocking** of excessive requests

### **Input Validation**
- **Email validation** with proper format checking
- **Password strength** minimum 6 characters
- **Data sanitization** to prevent XSS attacks
- **Type validation** for all input fields

### **Authentication**
- **JWT tokens** with expiration
- **Secure password hashing** with bcrypt
- **Role-based permissions** for agents
- **Token verification** on protected routes

### **Headers Security**
- **Helmet.js** for security headers
- **CORS protection** with origin validation
- **Content compression** for performance
- **Request size limits** to prevent abuse

---

## 🎯 **Agent Workflow**

### **1. Registration (Super Simple)**
```bash
POST /api/agents/register
{
  "email": "agent@example.com",
  "password": "agent123"
}
```
**Auto-generates**: Name, phone, location, organization, license, territory

### **2. Login**
```bash
POST /api/agents/login
{
  "email": "agent@example.com", 
  "password": "agent123"
}
```
**Returns**: JWT token + agent profile

### **3. Create Worker**
```bash
POST /api/agents/create-worker
Headers: Authorization: Bearer <token>
{
  "name": "Worker Name",
  "email": "worker@example.com",
  "phone": "9876543210",
  "location": "Mumbai",
  "labourProfile": {...}
}
```
**Returns**: Worker profile + temporary password

### **4. Update Market Price**
```bash
POST /api/agents/update-price
Headers: Authorization: Bearer <token>
{
  "productName": "Tomato",
  "category": "vegetables",
  "currentPrice": 45.50,
  "unit": "kg",
  "market": "Crawford Market",
  "district": "Mumbai",
  "state": "Maharashtra"
}
```
**Returns**: Price update with trend analysis

---

## 📱 **Mobile App Integration**

### **Market Prices in Mobile App**
The mobile app can access market prices through:

```javascript
// Get all market prices
const prices = await ApiService.getMarketPrices({
  category: 'vegetables',
  location: 'Mumbai'
});

// Get trending prices
const trending = await ApiService.getTrendingPrices(10);

// Get latest updates
const latest = await ApiService.getLatestPrices(10);
```

### **Real-time Updates**
- Prices updated by agents **instantly appear** in mobile app
- **Trending analysis** shows significant price changes
- **Location-based filtering** for relevant prices
- **Category organization** for easy browsing

---

## 🔧 **Backend Status**

### ✅ **Fully Functional Features**
- **Agent Registration** - Email & password only
- **Agent Authentication** - JWT-based security
- **Worker Creation** - Complete profile management
- **Market Price Updates** - Real-time price management
- **Data Validation** - Comprehensive input validation
- **Security Middleware** - Rate limiting, sanitization
- **Error Handling** - Professional error responses
- **Mobile Integration** - Public API endpoints

### 🚀 **Production Ready**
- **Security Headers** - Helmet.js protection
- **Rate Limiting** - Prevent abuse
- **Input Validation** - Express-validator
- **Error Logging** - Comprehensive logging
- **Performance** - Compression and optimization

---

## 🎯 **Quick Start**

### **1. Start Backend**
```bash
cd backend
npm start
```
**Backend runs on**: `http://localhost:5000`

### **2. Test Agent Registration**
```bash
curl -X POST http://localhost:5000/api/agents/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

### **3. Test Agent Login**
```bash
curl -X POST http://localhost:5000/api/agents/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

### **4. Access Market Prices**
```bash
curl http://localhost:5000/api/market-prices
```

---

## 🎉 **Backend is Now Fully Functional!**

**✅ Complete Features:**
- Agent registration (email & password only)
- Worker profile creation
- Market price updates
- Mobile app integration
- Security & validation
- Error handling
- Rate limiting

**🚀 Production Ready:**
- Professional error handling
- Comprehensive validation
- Security middleware
- Performance optimization
- Mobile-friendly APIs

**📱 Mobile Integration:**
- Market prices automatically sync
- Real-time updates from agents
- Trending analysis
- Beautiful data display

The backend is now enterprise-grade and ready for production use! 🎯✨







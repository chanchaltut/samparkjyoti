# Sampark Jyoti Backend Server 🌾

**"Bridging Dreams, Building Futures"**

A robust Node.js/Express backend server for the Sampark Jyoti platform, connecting employers with skilled laborers and farmers with direct buyers.

## 🚀 Features

### Core Functionality
- **User Authentication**: JWT-based authentication with bcrypt password hashing
- **User Management**: Complete CRUD operations for user profiles
- **Job Management**: Job posting, searching, and application system
- **Agricultural Marketplace**: Product listing and order management
- **Real-time Data**: MongoDB Atlas integration with optimized queries

### API Endpoints

#### Authentication (`/api/auth`)
- `POST /register` - User registration
- `POST /login` - User login
- `GET /profile` - Get current user profile

#### Users (`/api/users`)
- `GET /` - Get all users with filtering
- `GET /:id` - Get user by ID
- `PUT /:id` - Update user profile
- `DELETE /:id` - Delete user

#### Jobs (`/api/jobs`)
- `GET /` - Get all jobs with filtering
- `GET /:id` - Get job by ID
- `POST /` - Create new job
- `PUT /:id` - Update job
- `POST /:id/apply` - Apply for job
- `DELETE /:id` - Delete job

#### Farmers (`/api/farmers`)
- `GET /products` - Get all agricultural products
- `GET /products/:id` - Get product by ID
- `POST /products` - Create new product listing
- `PUT /products/:id` - Update product
- `POST /orders` - Place order for product
- `GET /orders/:userId` - Get orders for a user
- `PUT /orders/:id/status` - Update order status
- `DELETE /products/:id` - Delete product

## 🛠️ Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB Atlas
- **ORM**: Mongoose
- **Authentication**: JWT + bcryptjs
- **CORS**: Cross-origin resource sharing
- **Environment**: dotenv for configuration

## 📊 Database Models

### User Model
- Basic info (name, email, phone, location)
- User types (employer, laborer, farmer, buyer)
- Skills, experience, ratings
- Profile verification status

### Job Model
- Job details (title, description, category, location)
- Salary and experience requirements
- Application tracking
- Status management

### Product Model
- Agricultural product information
- Pricing and quantity
- Quality and organic status
- Delivery options

### Order Model
- Order details and status
- Delivery information
- Payment tracking
- Rating and reviews

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18
- MongoDB Atlas account
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb+srv://sam:sam@cluster0.jx031pw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
   JWT_SECRET=your-secret-key
   JWT_EXPIRE=7d
   ```

4. **Start the server**

   **Development mode:**
   ```bash
   npm run dev
   ```

   **Production mode:**
   ```bash
   npm start
   ```

## 🌐 API Base URL

- **Local**: `http://localhost:5000`
- **Production**: `https://your-domain.com`

## 📱 Frontend Integration

The backend is designed to work seamlessly with the React Native mobile app:

- **CORS enabled** for cross-origin requests
- **JWT authentication** for secure API access
- **RESTful API design** for easy integration
- **Real-time data** with MongoDB Atlas

## 🔒 Security Features

- **Password Hashing**: bcryptjs for secure password storage
- **JWT Tokens**: Secure authentication with expiration
- **Input Validation**: Mongoose schema validation
- **CORS Protection**: Controlled cross-origin access
- **Error Handling**: Comprehensive error management

## 📊 Database Indexing

Optimized MongoDB queries with strategic indexing:
- User queries (email, userType, location, skills)
- Job searches (category, location, salary, experience)
- Product filtering (category, location, price, organic)
- Order tracking (buyer, farmer, status, dates)

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Run with coverage
npm run test:coverage
```

## 📈 Performance

- **Database Indexing**: Optimized query performance
- **Connection Pooling**: Efficient MongoDB connections
- **Response Caching**: Strategic caching implementation
- **Rate Limiting**: API request throttling

## 🚀 Deployment

### Environment Variables
- `PORT`: Server port (default: 5000)
- `NODE_ENV`: Environment (development/production)
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: JWT signing secret
- `JWT_EXPIRE`: Token expiration time

### Production Considerations
- Use strong JWT secrets
- Enable HTTPS
- Implement rate limiting
- Add request logging
- Monitor database performance

## 🤝 Contributing

This project is designed to make a positive social impact. Contributions are welcome to help improve the platform and reach more communities in need.

## 📄 License

This project is licensed under the ISC License.

## 🌍 Social Impact

Sampark Jyoti backend powers:
- **Economic Empowerment**: Creating sustainable employment opportunities
- **Rural Development**: Reducing urban migration through local opportunities
- **Agricultural Growth**: Modernizing farming through technology
- **Community Building**: Strengthening local economies and social bonds

---

*"Empowering rural communities, one connection at a time"* 🌾✨

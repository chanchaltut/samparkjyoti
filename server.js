const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');

// Load environment variables
dotenv.config();

const app = express();

// Trust proxy for rate limiting
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    status: 'error',
    message: 'Too many requests from this IP, please try again later.'
  }
});

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 5 : 50, // More lenient in development
  message: {
    status: 'error',
    message: 'Too many login attempts, please try again later.'
  }
});

// Apply rate limiting
app.use('/api/agents/register', authLimiter);
app.use('/api/agents/login', authLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// General middleware
// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'https://your-frontend-domain.com', 
      'https://samparkjyoti.onrender.com',
      'https://sampark-jyoti-client.vercel.app',
      'https://sampark-jyoti-client.netlify.app',
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
      'http://localhost:3000/',
      'http://localhost:3001/',
      'http://127.0.0.1:3000/',
      'http://127.0.0.1:3001/'
    ];
    
    if (process.env.NODE_ENV !== 'production' || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(limiter);

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://sam:sam@cluster0.jx031pw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB successfully!');
    console.log('🌐 Database: Cluster0');
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  });

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: '🚀 Sampark Jyoti Backend API is running!',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      jobs: '/api/jobs',
      roles: '/api/roles',
      agents: '/api/agents',
      marketPrices: '/api/market-prices',
      vendors: '/api/vendors',
      admin: '/api/admin',
      singleAdmin: '/api/single-admin',
      labour: '/api/labour'
    }
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'success',
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

// API Routes with error handling
try {
  app.use('/api/auth', require('./routes/auth'));
  app.use('/api/users', require('./routes/users'));
  app.use('/api/jobs', require('./routes/jobs'));
  app.use('/api/roles', require('./routes/roles'));
  app.use('/api/admin', require('./routes/admin'));
  app.use('/api/agents', require('./routes/agents'));
  app.use('/api/market-prices', require('./routes/marketPrices'));
  app.use('/api/vendors', require('./routes/vendors'));
  app.use('/api/single-admin', require('./routes/singleAdmin'));
  app.use('/api/labour', require('./routes/labourSelfRegistration'));
  console.log('✅ All API routes loaded successfully');
} catch (error) {
  console.error('❌ Error loading API routes:', error);
  process.exit(1);
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    status: 'error',
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found',
    requestedUrl: req.originalUrl
  });
});

// Start server
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📱 Sampark Jyoti Backend API ready!`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 Network access: http://10.45.229.208:${PORT}/health`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/`);
  console.log(`\n📋 Available Endpoints:`);
  console.log(`   • Auth: /api/auth`);
  console.log(`   • Users: /api/users`);
  console.log(`   • Jobs: /api/jobs`);
  console.log(`   • Agents: /api/agents`);
  console.log(`   • Market Prices: /api/market-prices`);
  console.log(`   • Vendors: /api/vendors`);
  console.log(`   • Labour: /api/labour`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Process terminated');
    process.exit(0);
  });
});

module.exports = app;

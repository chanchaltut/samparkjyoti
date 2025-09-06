const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
      farmers: '/api/farmers',
      roles: '/api/roles'
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

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/farmers', require('./routes/farmers'));
app.use('/api/roles', require('./routes/roles'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/agents', require('./routes/agents'));
app.use('/api/market-prices', require('./routes/marketPrices'));

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
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📱 Sampark Jyoti Backend API ready!`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 Network access: http://10.45.229.208:${PORT}/health`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/`);
});

module.exports = app;

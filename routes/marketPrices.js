const express = require('express');
const MarketPrice = require('../models/MarketPrice');
const router = express.Router();

// Get all market prices (public endpoint for mobile app)
router.get('/', async (req, res) => {
  try {
    const {
      category,
      location,
      district,
      state,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      limit = 50,
      page = 1
    } = req.query;

    let filter = { 
      isAvailable: true,
      validUntil: { $gte: new Date() }
    };
    
    // Apply filters
    if (category) filter.category = category;
    if (location) filter.location = { $regex: location, $options: 'i' };
    if (district) filter.district = { $regex: district, $options: 'i' };
    if (state) filter.state = { $regex: state, $options: 'i' };
    
    if (search) {
      filter.$or = [
        { productName: { $regex: search, $options: 'i' } },
        { market: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const prices = await MarketPrice.find(filter)
      .populate('updatedBy', 'name location organization')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .sort(sortOptions);

    const total = await MarketPrice.countDocuments(filter);

    // Get categories for filtering
    const categories = await MarketPrice.distinct('category', { isAvailable: true });
    
    // Get locations for filtering
    const locations = await MarketPrice.distinct('location', { isAvailable: true });

    res.json({
      status: 'success',
      data: {
        prices,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalPrices: total,
          limit: parseInt(limit)
        },
        filters: {
          categories,
          locations
        }
      }
    });

  } catch (error) {
    console.error('Get market prices error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get market prices',
      error: error.message
    });
  }
});

// Get price by ID
router.get('/:id', async (req, res) => {
  try {
    const price = await MarketPrice.findById(req.params.id)
      .populate('updatedBy', 'name location organization phone')
      .populate('verifiedBy', 'name');

    if (!price) {
      return res.status(404).json({
        status: 'error',
        message: 'Price not found'
      });
    }

    res.json({
      status: 'success',
      data: { price }
    });

  } catch (error) {
    console.error('Get price error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get price details',
      error: error.message
    });
  }
});

// Get trending prices (prices with significant changes)
router.get('/trending/all', async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    const trendingPrices = await MarketPrice.find({
      isAvailable: true,
      validUntil: { $gte: new Date() },
      $or: [
        { priceChangePercentage: { $gte: 5 } },
        { priceChangePercentage: { $lte: -5 } }
      ]
    })
    .populate('updatedBy', 'name location')
    .sort({ priceChangePercentage: -1 })
    .limit(parseInt(limit));

    res.json({
      status: 'success',
      data: { trendingPrices }
    });

  } catch (error) {
    console.error('Get trending prices error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get trending prices',
      error: error.message
    });
  }
});

// Get price history for a product
router.get('/history/:productName', async (req, res) => {
  try {
    const { productName } = req.params;
    const { location, days = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    let filter = {
      productName: { $regex: productName, $options: 'i' },
      createdAt: { $gte: startDate }
    };

    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }

    const priceHistory = await MarketPrice.find(filter)
      .select('currentPrice location market createdAt updatedBy')
      .populate('updatedBy', 'name')
      .sort({ createdAt: 1 });

    // Calculate average price
    const avgPrice = priceHistory.length > 0 
      ? priceHistory.reduce((sum, price) => sum + price.currentPrice, 0) / priceHistory.length
      : 0;

    // Get min and max prices
    const prices = priceHistory.map(p => p.currentPrice);
    const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
    const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

    res.json({
      status: 'success',
      data: {
        productName,
        priceHistory,
        analytics: {
          averagePrice: avgPrice.toFixed(2),
          minPrice,
          maxPrice,
          totalEntries: priceHistory.length,
          dateRange: {
            from: startDate,
            to: new Date()
          }
        }
      }
    });

  } catch (error) {
    console.error('Get price history error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get price history',
      error: error.message
    });
  }
});

// Get prices by category
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const { location, limit = 20, page = 1 } = req.query;

    let filter = {
      category,
      isAvailable: true,
      validUntil: { $gte: new Date() }
    };

    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }

    const prices = await MarketPrice.find(filter)
      .populate('updatedBy', 'name location')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await MarketPrice.countDocuments(filter);

    res.json({
      status: 'success',
      data: {
        category,
        prices,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalPrices: total,
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Get prices by category error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get prices by category',
      error: error.message
    });
  }
});

// Get latest prices (most recent updates)
router.get('/latest/all', async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const latestPrices = await MarketPrice.find({
      isAvailable: true,
      validUntil: { $gte: new Date() }
    })
    .populate('updatedBy', 'name location')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit));

    res.json({
      status: 'success',
      data: { latestPrices }
    });

  } catch (error) {
    console.error('Get latest prices error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get latest prices',
      error: error.message
    });
  }
});

// Search products
router.get('/search/products', async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q) {
      return res.status(400).json({
        status: 'error',
        message: 'Search query is required'
      });
    }

    const products = await MarketPrice.distinct('productName', {
      productName: { $regex: q, $options: 'i' },
      isAvailable: true
    });

    res.json({
      status: 'success',
      data: { 
        products: products.slice(0, parseInt(limit)),
        total: products.length
      }
    });

  } catch (error) {
    console.error('Search products error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to search products',
      error: error.message
    });
  }
});

// Get market statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const totalPrices = await MarketPrice.countDocuments({ isAvailable: true });
    const totalProducts = await MarketPrice.distinct('productName', { isAvailable: true });
    const totalMarkets = await MarketPrice.distinct('market', { isAvailable: true });
    const totalLocations = await MarketPrice.distinct('location', { isAvailable: true });

    // Get today's updates
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayUpdates = await MarketPrice.countDocuments({
      createdAt: { $gte: today },
      isAvailable: true
    });

    // Get category-wise count
    const categoryStats = await MarketPrice.aggregate([
      { $match: { isAvailable: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      status: 'success',
      data: {
        overview: {
          totalPriceEntries: totalPrices,
          totalProducts: totalProducts.length,
          totalMarkets: totalMarkets.length,
          totalLocations: totalLocations.length,
          todayUpdates
        },
        categoryStats
      }
    });

  } catch (error) {
    console.error('Get market stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get market statistics',
      error: error.message
    });
  }
});

module.exports = router;






















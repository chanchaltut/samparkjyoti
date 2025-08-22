const express = require('express');
const Product = require('../models/Product');
const Order = require('../models/Order');
const router = express.Router();

// Get all agricultural products
router.get('/products', async (req, res) => {
  try {
    const { 
      category, 
      location, 
      price, 
      farmer, 
      limit = 20, 
      page = 1 
    } = req.query;
    
    let filter = {};
    if (category) filter.category = category;
    if (location) filter.location = { $regex: location, $options: 'i' };
    if (price) filter.price = { $lte: parseInt(price) };
    if (farmer) filter.farmer = farmer;

    const products = await Product.find(filter)
      .populate('farmer', 'name email phone location')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Product.countDocuments(filter);

    res.json({
      status: 'success',
      data: {
        products,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalProducts: total,
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch products',
      error: error.message
    });
  }
});

// Get product by ID
router.get('/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('farmer', 'name email phone location bio');
    
    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found'
      });
    }

    res.json({
      status: 'success',
      data: { product }
    });

  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch product',
      error: error.message
    });
  }
});

// Create new product listing
router.post('/products', async (req, res) => {
  try {
    const { 
      name, 
      description, 
      category, 
      price, 
      quantity, 
      unit, 
      location, 
      farmer,
      harvestDate,
      organic
    } = req.body;

    const product = new Product({
      name,
      description,
      category,
      price,
      quantity,
      unit,
      location,
      farmer,
      harvestDate,
      organic
    });

    await product.save();

    res.status(201).json({
      status: 'success',
      message: 'Product listed successfully',
      data: { product }
    });

  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create product listing',
      error: error.message
    });
  }
});

// Update product
router.put('/products/:id', async (req, res) => {
  try {
    const { 
      name, 
      description, 
      category, 
      price, 
      quantity, 
      unit, 
      location, 
      harvestDate,
      organic,
      status
    } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (category) updateData.category = category;
    if (price) updateData.price = price;
    if (quantity) updateData.quantity = quantity;
    if (unit) updateData.unit = unit;
    if (location) updateData.location = location;
    if (harvestDate) updateData.harvestDate = harvestDate;
    if (organic !== undefined) updateData.organic = organic;
    if (status) updateData.status = status;

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found'
      });
    }

    res.json({
      status: 'success',
      message: 'Product updated successfully',
      data: { product }
    });

  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update product',
      error: error.message
    });
  }
});

// Place order for product
router.post('/orders', async (req, res) => {
  try {
    const { 
      buyer, 
      product, 
      quantity, 
      deliveryAddress, 
      expectedDelivery,
      specialInstructions
    } = req.body;
    
    const order = new Order({
      buyer,
      product,
      quantity,
      deliveryAddress,
      expectedDelivery,
      specialInstructions,
      status: 'pending'
    });

    await order.save();

    res.status(201).json({
      status: 'success',
      message: 'Order placed successfully',
      data: { order }
    });

  } catch (error) {
    console.error('Place order error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to place order',
      error: error.message
    });
  }
});

// Get orders for a user
router.get('/orders/:userId', async (req, res) => {
  try {
    const { userType, limit = 20, page = 1 } = req.query;
    
    let filter = {};
    if (userType === 'buyer') {
      filter.buyer = req.params.userId;
    } else if (userType === 'farmer') {
      filter.farmer = req.params.userId;
    }

    const orders = await Order.find(filter)
      .populate('buyer', 'name email phone')
      .populate('product', 'name price unit farmer')
      .populate('product.farmer', 'name email phone location')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Order.countDocuments(filter);

    res.json({
      status: 'success',
      data: {
        orders,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalOrders: total,
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch orders',
      error: error.message
    });
  }
});

// Update order status
router.put('/orders/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({
        status: 'error',
        message: 'Order not found'
      });
    }

    res.json({
      status: 'success',
      message: 'Order status updated successfully',
      data: { order }
    });

  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update order status',
      error: error.message
    });
  }
});

// Delete product
router.delete('/products/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found'
      });
    }

    res.json({
      status: 'success',
      message: 'Product deleted successfully'
    });

  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete product',
      error: error.message
    });
  }
});

module.exports = router;

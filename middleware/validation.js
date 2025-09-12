const { body, validationResult } = require('express-validator');

// Validation middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Agent registration validation
const validateAgentRegistration = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  handleValidationErrors
];

// Agent login validation
const validateAgentLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

// Worker creation validation
const validateWorkerCreation = [
  body('name')
    .notEmpty()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('phone')
    .isMobilePhone('en-IN')
    .withMessage('Please provide a valid Indian phone number'),
  body('location')
    .notEmpty()
    .trim()
    .withMessage('Location is required'),
  handleValidationErrors
];

// Market price validation
const validateMarketPrice = [
  body('productName')
    .notEmpty()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Product name must be between 2 and 100 characters'),
  body('category')
    .isIn(['grains', 'vegetables', 'fruits', 'dairy', 'poultry', 'fish', 'spices', 'pulses', 'oilseeds', 'other'])
    .withMessage('Invalid category'),
  body('currentPrice')
    .isFloat({ min: 0 })
    .withMessage('Current price must be a positive number'),
  body('unit')
    .isIn(['kg', 'quintal', 'ton', 'dozen', 'piece', 'litre', 'gram'])
    .withMessage('Invalid unit'),
  body('market')
    .notEmpty()
    .trim()
    .withMessage('Market name is required'),
  body('district')
    .notEmpty()
    .trim()
    .withMessage('District is required'),
  body('state')
    .notEmpty()
    .trim()
    .withMessage('State is required'),
  handleValidationErrors
];

// Sanitize input middleware
const sanitizeInput = (req, res, next) => {
  // Remove any potentially harmful characters
  const sanitize = (obj) => {
    for (let key in obj) {
      if (typeof obj[key] === 'string') {
        obj[key] = obj[key].replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
        obj[key] = obj[key].replace(/[<>]/g, '');
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitize(obj[key]);
      }
    }
  };
  
  if (req.body) sanitize(req.body);
  if (req.query) sanitize(req.query);
  if (req.params) sanitize(req.params);
  
  next();
};

module.exports = {
  validateAgentRegistration,
  validateAgentLogin,
  validateWorkerCreation,
  validateMarketPrice,
  sanitizeInput,
  handleValidationErrors
};







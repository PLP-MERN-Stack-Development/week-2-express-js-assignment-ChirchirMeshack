// server.js - Starter Express server for Week 2 assignment

// Import required modules
const express = require('express');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');
const cors = require('cors');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all routes
app.use(cors());

// Load Swagger specification
const swaggerDocument = YAML.load(path.join(__dirname, 'swagger.yaml'));


//Logger middleware
const loggerMiddleware = (req,res,next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
}

// const authMiddleware = (req,res,next) =>{
//   const apiKey = req.headers['x-api-key'];
  
//   if (!apiKey) {
//     return next(new AuthenticationError('API key is required'));
//   }
  
//   // In a real app, you would validate the API key against a database
//   if (apiKey !== 'your-secret-api-key-123') {
//     return next(new AuthenticationError('Invalid API key'));
//   }
  
//   next();
// }

// Validation middleware for product creation/update
const validateProduct = (req, res, next) => {
  const { name, description, price, category, inStock } = req.body;
  
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return next(new ValidationError('Name is required and cannot be blank'));
  }
  
  if (!description || typeof description !== 'string' || description.trim().length === 0) {
    return next(new ValidationError('Description is required and cannot be blank'));
  }
  
  if (typeof price !== 'number' || price <= 0) {
    return next(new ValidationError('Price is required '));
  }
  
  if (!category || typeof category !== 'string' || category.trim().length === 0) {
    return next(new ValidationError('Category is required and cannot be blank'));
  }
  
  if (typeof inStock !== 'boolean') {
    return next(new ValidationError('inStock must be a boolean value'));
  }
  
  next();
};

// Global error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(statusCode).json({
    error: {
      name: err.name || 'Error',
      message: message,
      statusCode: statusCode
    }
  });
};

// Async error wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Middleware setup
app.use(bodyParser.json());
app.use(express.json());
app.use(loggerMiddleware);


// Sample in-memory products database
let products = [
  {
    id: '1',
    name: 'Laptop',
    description: 'High-performance laptop with 16GB RAM',
    price: 1200,
    category: 'electronics',
    inStock: true
  },
  {
    id: '2',
    name: 'Smartphone',
    description: 'Latest model with 128GB storage',
    price: 800,
    category: 'electronics',
    inStock: true
  },
  {
    id: '3',
    name: 'Coffee Maker',
    description: 'Programmable coffee maker with timer',
    price: 50,
    category: 'kitchen',
    inStock: false
  }
];

// Custom Error Classes
class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NotFoundError';
    this.statusCode = 404;
  }
}

class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
    this.statusCode = 400;
  }
}

class AuthenticationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AuthenticationError';
    this.statusCode = 401;
  }
}

// Swagger UI setup
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Products API Documentation',
  customfavIcon: '/favicon.ico',
  swaggerOptions: {
    docExpansion: 'list',
    filter: true,
    showRequestHeaders: true,
    tryItOutEnabled: true
  }
}));

// Serve Swagger JSON
app.get('/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerDocument);
});

// Create a router for product routes
const productsRouter = express.Router();

// Root route
app.get('/', (req, res) => {
  res.send('Welcome to the Product API! Go to /api/products to see all products.');
});

// Use the products router for all /api/products routes
app.use('/api/products', productsRouter);

// GET /api/products - List all products with filtering and pagination
productsRouter.get('/', asyncHandler(async (req, res) => {
  const { category, page = 1, limit = 10, search } = req.query;
  let filteredProducts = [...products];
  
  // Filter by category
  if (category) {
    filteredProducts = filteredProducts.filter(product => 
      product.category.toLowerCase() === category.toLowerCase()
    );
  }
  
  // Search by name
  if (search) {
    filteredProducts = filteredProducts.filter(product =>
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.description.toLowerCase().includes(search.toLowerCase())
    );
  }
  
  // Pagination
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const startIndex = (pageNum - 1) * limitNum;
  const endIndex = pageNum * limitNum;
  
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
  
  res.json({
    products: paginatedProducts,
    pagination: {
      currentPage: pageNum,
      totalPages: Math.ceil(filteredProducts.length / limitNum),
      totalItems: filteredProducts.length,
      itemsPerPage: limitNum
    }
  });
}));

// GET /api/products/search - Search products by name
productsRouter.get('/search', asyncHandler(async (req, res) => {
  const { q } = req.query;
  
  if (!q) {
    throw new ValidationError('Serach Products,brands & categories');
  }
  
  const searchResults = products.filter(product =>
    product.name.toLowerCase().includes(q.toLowerCase()) ||
    product.description.toLowerCase().includes(q.toLowerCase())
  );
  
  res.json({
    query: q,
    results: searchResults,
    count: searchResults.length
  });
}));

// GET /api/products/stats - Get product statistics
productsRouter.get('/stats', asyncHandler(async (req, res) => {
  const stats = {
    totalProducts: products.length,
    inStock: products.filter(p => p.inStock).length,
    outOfStock: products.filter(p => !p.inStock).length,
    categories: {},
    averagePrice: 0,
    priceRange: {
      min: 0,
      max: 0
    }
  };
  
  if (products.length > 0) {
    // Category counts
    products.forEach(product => {
      stats.categories[product.category] = (stats.categories[product.category] || 0) + 1;
    });
    
    // Price statistics
    const prices = products.map(p => p.price);
    stats.averagePrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    stats.priceRange.min = Math.min(...prices);
    stats.priceRange.max = Math.max(...prices);
  }
  
  res.json(stats);
}));

// GET /api/products/:id - Get a specific product by ID
productsRouter.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const product = products.find(p => p.id === id);
  
  if (!product) {
    throw new NotFoundError(`Product with ID ${id} not found`);
  }
  
  res.json(product);
}));

// POST /api/products - Create a new product (requires authentication) Add authMiddleware to props
productsRouter.post('/',  validateProduct, asyncHandler(async (req, res) => {
  const { name, description, price, category, inStock } = req.body;
  
  const newProduct = {
    id: uuidv4(),
    name: name.trim(),
    description: description.trim(),
    price,
    category: category.trim(),
    inStock
  };
  
  products.push(newProduct);
  
  res.status(201).json(newProduct);
}));

// PUT /api/products/:id - Update an existing product (requires authentication) Add authMiddleware to props
productsRouter.put('/:id', validateProduct, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description, price, category, inStock } = req.body;
  
  const productIndex = products.findIndex(p => p.id === id);
  
  if (productIndex === -1) {
    throw new NotFoundError(`Product with ID ${id} not found`);
  }
  
  products[productIndex] = {
    ...products[productIndex],
    name: name.trim(),
    description: description.trim(),
    price,
    category: category.trim(),
    inStock
  };
  
  res.json(products[productIndex]);
}));

// DELETE /api/products/:id - Delete a product (requires authentication) Add authMiddleware to props
productsRouter.delete('/:id',  asyncHandler(async (req, res) => {
  const { id } = req.params;
  const productIndex = products.findIndex(p => p.id === id);
  
  if (productIndex === -1) {
    throw new NotFoundError(`Product with ID ${id} not found`);
  }
  
  const deletedProduct = products.splice(productIndex, 1)[0];
  
  res.json({ message: 'Product deleted successfully', product: deletedProduct });
}));

// 404 handler for undefined routes
app.use((req, res, next) => {
  next(new NotFoundError(`Route ${req.originalUrl} not found`));
});

// Apply error handling middleware (must be last)
app.use(errorHandler);

// TODO: Implement custom middleware for:
// - Request logging
// - Authentication
// - Error handling

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📖 API Documentation: http://localhost:${PORT}/api-docs`);
  console.log(`📄 Swagger JSON: http://localhost:${PORT}/swagger.json`);
  // console.log(`🔑 API Key required for POST, PUT, DELETE operations: your-secret-api-key-123`);
  console.log(`\n📋 Available endpoints:`);
  console.log(`   GET  /                    - Welcome message`);
  console.log(`   GET  /api/products        - List all products`);
  console.log(`   GET  /api/products/search - Search products`);
  console.log(`   GET  /api/products/stats  - Get product statistics`);
  console.log(`   GET  /api/products/:id    - Get product by ID`);
  console.log(`   POST /api/products        - Create new product (auth required)`);
  console.log(`   PUT  /api/products/:id    - Update product (auth required)`);
  console.log(`   DELETE /api/products/:id  - Delete product (auth required)`);
});
// Export the app for testing purposes
module.exports = app;
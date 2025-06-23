# Express.js RESTful API - Products Management

A complete RESTful API built with Express.js that implements CRUD operations, middleware, error handling, and advanced features for managing products.

## 🚀 Features

- **RESTful API** with full CRUD operations
- **Custom Middleware** for logging, authentication, and validation
- **Error Handling** with custom error classes and proper HTTP status codes
- **Advanced Features** including filtering, pagination, search, and statistics
<!-- - **Authentication** using API key validation -->
- **Input Validation** for all product operations
- **Interactive API Documentation** with Swagger UI

## 📋 Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn package manager

## 🛠️ Installation & Setup

1. **Install dependencies:**

   ```bash
   npm install express uuid
   ```

2. **Start the server:**

   ```bash
   # Development mode with auto-restart
   npm run dev

   # Production mode
   npm start
   ```

3. **Server will start on:** `http://localhost:3000`

## 📖 API Documentation

### Interactive Swagger UI

Visit `http://localhost:3000/api-docs` to access the interactive API documentation with Swagger UI.

Features:

- **Try it out**: Test API endpoints directly from the browser
- **Request/Response Examples**: See example requests and responses
<!-- - **Authentication**: Configure API key for protected endpoints -->
- **Schema Validation**: View detailed request/response schemas
- **Filtering**: Search and filter endpoints

### Swagger JSON

Access the raw OpenAPI specification at `http://localhost:3000/swagger.json`

<!-- ## 🔑 Authentication

Most endpoints require an API key in the request headers:

```
x-api-key: your-secret-api-key-123
```

**Note**: You can configure the API key in the Swagger UI by clicking the "Authorize" button at the top of the documentation page. -->

## 📚 API Endpoints

### Base URL: `http://localhost:3000`

### 1. Root Endpoint

- **GET** `/`
- **Description:** Welcome message
- **Authentication:** Not required
- **Response:**
  ```json
  {
    "message": "Hello World! Welcome to the Products API"
  }
  ```

### 2. Get All Products

- **GET** `/api/products`
- **Description:** Retrieve all products with optional filtering and pagination
<!-- - **Authentication:** Not required -->
- **Query Parameters:**
  - `category` (optional): Filter by category
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Items per page (default: 10)
  - `search` (optional): Search in name and description

**Example Request:**

```
GET /api/products?category=Electronics&page=1&limit=5
```

**Example Response:**

```json
{
  "products": [
    {
      "id": "1",
      "name": "Laptop",
      "description": "High-performance laptop for work and gaming",
      "price": 999.99,
      "category": "Electronics",
      "inStock": true
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalItems": 1,
    "itemsPerPage": 5
  }
}
```

### 3. Get Product by ID

- **GET** `/api/products/:id`
- **Description:** Retrieve a specific product by its ID
<!-- - **Authentication:** Not required -->

**Example Request:**

```
GET /api/products/1
```

**Example Response:**

```json
{
  "id": "1",
  "name": "Laptop",
  "description": "High-performance laptop for work and gaming",
  "price": 999.99,
  "category": "Electronics",
  "inStock": true
}
```

### 4. Create Product

- **POST** `/api/products`
- **Description:** Create a new product
<!-- - **Authentication:** Required (API key) -->
- **Body:**
  ```json
  {
    "name": "New Product",
    "description": "Product description",
    "price": 99.99,
    "category": "Electronics",
    "inStock": true
  }
  ```

**Example Request:**

```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-secret-api-key-123" \
  -d '{
    "name": "Smartphone",
    "description": "Latest smartphone with advanced features",
    "price": 699.99,
    "category": "Electronics",
    "inStock": true
  }'
```

**Example Response:**

```json
{
  "id": "generated-uuid",
  "name": "Smartphone",
  "description": "Latest smartphone with advanced features",
  "price": 699.99,
  "category": "Electronics",
  "inStock": true
}
```

### 5. Update Product

- **PUT** `/api/products/:id`
- **Description:** Update an existing product
<!-- - **Authentication:** Required (API key) -->
- **Body:** Same as POST

**Example Request:**

```bash
curl -X PUT http://localhost:3000/api/products/1 \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-secret-api-key-123" \
  -d '{
    "name": "Updated Laptop",
    "description": "Updated description",
    "price": 1099.99,
    "category": "Electronics",
    "inStock": false
  }'
```

### 6. Delete Product

- **DELETE** `/api/products/:id`
- **Description:** Delete a product
<!-- - **Authentication:** Required (API key) -->

**Example Request:**

```bash
curl -X DELETE http://localhost:3000/api/products/1 \
  -H "x-api-key: your-secret-api-key-123"
```

**Example Response:**

```json
{
  "message": "Product deleted successfully",
  "product": {
    "id": "1",
    "name": "Laptop",
    "description": "High-performance laptop for work and gaming",
    "price": 999.99,
    "category": "Electronics",
    "inStock": true
  }
}
```

### 7. Search Products

- **GET** `/api/products/search?q=search_term`
- **Description:** Search products by name or description
<!-- - **Authentication:** Not required -->
- **Query Parameters:**
  - `q` (required): Search query

**Example Request:**

```
GET /api/products/search?q=laptop
```

**Example Response:**

```json
{
  "query": "laptop",
  "results": [
    {
      "id": "1",
      "name": "Laptop",
      "description": "High-performance laptop for work and gaming",
      "price": 999.99,
      "category": "Electronics",
      "inStock": true
    }
  ],
  "count": 1
}
```

### 8. Product Statistics

- **GET** `/api/products/stats`
- **Description:** Get comprehensive product statistics
<!-- - **Authentication:** Not required -->

**Example Request:**

```
GET /api/products/stats
```

**Example Response:**

```json
{
  "totalProducts": 3,
  "inStock": 2,
  "outOfStock": 1,
  "categories": {
    "Electronics": 1,
    "Home & Kitchen": 1,
    "Sports": 1
  },
  "averagePrice": 406.66,
  "priceRange": {
    "min": 89.99,
    "max": 999.99
  }
}
```

## 🔧 Middleware

### 1. Logger Middleware

- Logs all requests with timestamp, method, and URL
- Applied to all routes

<!-- ### 2. Authentication Middleware

- Validates API key in request headers
- Required for POST, PUT, DELETE operations -->

### 2. Validation Middleware

- Validates product data for creation and updates
- Ensures all required fields are present and of correct types

### 3. Error Handling Middleware

- Global error handler with proper HTTP status codes
- Custom error classes for different error types

## 🚨 Error Handling

The API uses custom error classes with appropriate HTTP status codes:

- **400 Bad Request:** Validation errors
- **401 Unauthorized:** Authentication errors
- **404 Not Found:** Resource not found
- **500 Internal Server Error:** Server errors

**Error Response Format:**

```json
{
  "error": {
    "name": "ValidationError",
    "message": "Name is required and must be a non-empty string",
    "statusCode": 400
  }
}
```

## 🧪 Testing

You can test the API using:

1. **Swagger UI** - Interactive documentation at `/api-docs`
2. **Postman** - Import the provided collection
3. **cURL** - Use the examples above
4. **Browser** - For GET requests
5. **Thunder Client** - VS Code extension

## 📁 Project Structure

```
assignment/
├── server.js          # Main server file
├── package.json       # Dependencies and scripts
├── README.md         # This documentation
└── env.example       # Environment variables template
```

## 🔄 Environment Variables

Create a `.env` file for environment-specific configuration:

```env
PORT=3000
NODE_ENV=development
```

## 🚀 Deployment

To deploy this API:

1. Set environment variables
2. Install production dependencies: `npm install --production`
3. Start the server: `npm start`

## 📝 Notes

- Data is stored in memory (resets on server restart)
- In production, use a proper database
- API key should be stored securely in environment variables
- Consider rate limiting for production use
- Swagger documentation is automatically generated from the OpenAPI specification

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

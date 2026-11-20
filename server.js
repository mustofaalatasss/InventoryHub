const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ==========================================
// Middleware & Integration Fixes (Activity 2)
// ==========================================
// Enable CORS for cross-origin frontend-backend integration
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser with standard JSON handling
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'public')));

// Simple in-memory cache for performance optimization (Activity 4)
const cache = {
  data: null,
  timestamp: 0,
  TTL: 15000 // 15 seconds cache
};

const invalidateCache = () => {
  cache.data = null;
  cache.timestamp = 0;
};

// In-memory mock database for Inventory items
let inventory = [
  { id: 1, name: "Wireless Mechanical Keyboard", category: "Electronics", quantity: 45, price: 89.99, status: "In Stock" },
  { id: 2, name: "Ergonomic Office Chair", category: "Furniture", quantity: 12, price: 199.50, status: "In Stock" },
  { id: 3, name: "27-inch 4K Monitor", category: "Electronics", quantity: 5, price: 349.00, status: "Low Stock" },
  { id: 4, name: "USB-C Multi-port Hub", category: "Accessories", quantity: 0, price: 29.99, status: "Out of Stock" },
  { id: 5, name: "Noise Cancelling Headphones", category: "Audio", quantity: 28, price: 149.99, status: "In Stock" },
  { id: 6, name: "Adjustable Standing Desk", category: "Furniture", quantity: 8, price: 299.00, status: "Low Stock" },
  { id: 7, name: "Webcam 1080p HD", category: "Accessories", quantity: 50, price: 49.99, status: "In Stock" },
  { id: 8, name: "Aluminum Laptop Stand", category: "Accessories", quantity: 35, price: 39.99, status: "In Stock" }
];

// Helper for unified JSON response structure (Activity 3)
const sendSuccess = (res, statusCode, data, message = "Success", meta = null) => {
  return res.status(statusCode).json({
    status: "success",
    statusCode,
    message,
    data,
    meta: meta || { count: Array.isArray(data) ? data.length : 1 },
    timestamp: new Date().toISOString()
  });
};

const sendError = (res, statusCode, message, errors = null) => {
  return res.status(statusCode).json({
    status: "error",
    statusCode,
    message,
    errors,
    timestamp: new Date().toISOString()
  });
};

// ==========================================
// REST API Endpoints (Activity 1 & 3 & 4)
// ==========================================

// GET /api/inventory - Retrieve items with search, filter, and pagination (Activity 4 Optimization)
app.get('/api/inventory', (req, res) => {
  try {
    const { search = '', category = '', page = 1, limit = 10 } = req.query;

    let results = inventory;

    // Filter by search query
    if (search) {
      const query = search.toLowerCase();
      results = results.filter(item => 
        item.name.toLowerCase().includes(query) || 
        item.category.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (category && category !== 'All') {
      results = results.filter(item => item.category.toLowerCase() === category.toLowerCase());
    }

    // Pagination calculations
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const totalRecords = results.length;
    const totalPages = Math.ceil(totalRecords / limitNum);
    const startIndex = (pageNum - 1) * limitNum;
    const paginatedResults = results.slice(startIndex, startIndex + limitNum);

    const meta = {
      total: totalRecords,
      page: pageNum,
      limit: limitNum,
      totalPages,
      hasNext: pageNum < totalPages,
      hasPrev: pageNum > 1
    };

    return sendSuccess(res, 200, paginatedResults, "Inventory fetched successfully", meta);
  } catch (error) {
    return sendError(res, 500, "Failed to retrieve inventory items", error.message);
  }
});

// GET /api/inventory/:id - Single item retrieval
app.get('/api/inventory/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const item = inventory.find(i => i.id === id);

  if (!item) {
    return sendError(res, 404, `Item with ID ${id} not found`);
  }

  return sendSuccess(res, 200, item, "Item retrieved successfully");
});

// POST /api/inventory - Create a new item (with validation)
app.post('/api/inventory', (req, res) => {
  const { name, category, quantity, price } = req.body;

  // Validation
  const errors = [];
  if (!name || typeof name !== 'string' || name.trim() === '') errors.push("Valid name is required.");
  if (!category) errors.push("Category is required.");
  if (quantity === undefined || isNaN(quantity) || quantity < 0) errors.push("Valid non-negative quantity is required.");
  if (price === undefined || isNaN(price) || price <= 0) errors.push("Valid price greater than 0 is required.");

  if (errors.length > 0) {
    return sendError(res, 400, "Validation failed", errors);
  }

  const qty = parseInt(quantity, 10);
  let status = "In Stock";
  if (qty === 0) status = "Out of Stock";
  else if (qty < 10) status = "Low Stock";

  const newItem = {
    id: inventory.length > 0 ? Math.max(...inventory.map(i => i.id)) + 1 : 1,
    name: name.trim(),
    category: category.trim(),
    quantity: qty,
    price: parseFloat(price),
    status
  };

  inventory.push(newItem);
  invalidateCache();

  return sendSuccess(res, 201, newItem, "Item successfully added to inventory");
});

// PUT /api/inventory/:id - Update item
app.put('/api/inventory/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const itemIndex = inventory.findIndex(i => i.id === id);

  if (itemIndex === -1) {
    return sendError(res, 404, `Item with ID ${id} not found`);
  }

  const { name, category, quantity, price } = req.body;

  if (quantity !== undefined && (isNaN(quantity) || quantity < 0)) {
    return sendError(res, 400, "Quantity must be a non-negative number.");
  }
  if (price !== undefined && (isNaN(price) || price <= 0)) {
    return sendError(res, 400, "Price must be greater than 0.");
  }

  const updatedQty = quantity !== undefined ? parseInt(quantity, 10) : inventory[itemIndex].quantity;
  let updatedStatus = "In Stock";
  if (updatedQty === 0) updatedStatus = "Out of Stock";
  else if (updatedQty < 10) updatedStatus = "Low Stock";

  inventory[itemIndex] = {
    ...inventory[itemIndex],
    name: name ? name.trim() : inventory[itemIndex].name,
    category: category ? category.trim() : inventory[itemIndex].category,
    quantity: updatedQty,
    price: price !== undefined ? parseFloat(price) : inventory[itemIndex].price,
    status: updatedStatus
  };

  invalidateCache();
  return sendSuccess(res, 200, inventory[itemIndex], "Item updated successfully");
});

// DELETE /api/inventory/:id - Delete item
app.delete('/api/inventory/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const itemIndex = inventory.findIndex(i => i.id === id);

  if (itemIndex === -1) {
    return sendError(res, 404, `Item with ID ${id} not found`);
  }

  const deletedItem = inventory.splice(itemIndex, 1)[0];
  invalidateCache();

  return sendSuccess(res, 200, deletedItem, "Item removed from inventory");
});

// 404 Fallback Route
app.use((req, res) => {
  sendError(res, 404, "Endpoint or resource not found");
});

// Start Server
app.listen(PORT, () => {
  console.log(`InventoryHub Server is running at http://localhost:${PORT}`);
});

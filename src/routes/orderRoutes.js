// Import required modules
const express = require('express');
const router = express.Router();
const {
  getOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder
} = require('../controllers/order.controller');
const {
  validateOrder,
  validateOrderStatus
} = require('../middleware/validation.middleware');

// Define routes for order operations

// GET /api/orders - Get all orders
router.get('/', getOrders);

// GET /api/orders/:id - Get a single order by ID
router.get('/:id', getOrderById);

// POST /api/orders - Create a new order
router.post('/', createOrder);

// PUT /api/orders/:id - Update an existing order
router.put('/:id', updateOrder);

// PATCH /api/orders/:id/status - Update order status
router.patch('/:id/status', updateOrder);

// DELETE /api/orders/:id - Delete an order
router.delete('/:id', deleteOrder);

module.exports = router; 

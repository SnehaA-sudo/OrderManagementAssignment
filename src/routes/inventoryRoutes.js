const express = require('express');
const {
  getInventory,
  getInventoryItem,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  getInventorySummary,
  getLowStockItems,
} = require('../controllers/inventory.controller');
const {
  validateInventoryItem,
  validateInventoryUpdate,
} = require('../middleware/validation.middleware');

const router = express.Router();

// Get all inventory items
router.get('/', getInventory);

// Get inventory item by ID
router.get('/:id', getInventoryItem);

// Create new inventory item
router.post('/', validateInventoryItem, createInventoryItem);

// Update inventory item
router.patch('/:id', validateInventoryUpdate, updateInventoryItem);

// Delete inventory item
router.delete('/:id', deleteInventoryItem);

// Get inventory analytics summary
router.get('/analytics/summary', getInventorySummary);

// Get low stock items
router.get('/analytics/low-stock', getLowStockItems);

module.exports = router; 

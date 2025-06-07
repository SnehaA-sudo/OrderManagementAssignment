const Inventory = require('../models/Inventory');
const logger = require('../utils/logger');
const InventoryService = require('../services/inventoryService');

// Get all inventory items
const getInventory = async (req, res) => {
  try {
    const inventoryItems = await Inventory.findAll();
    res.json(inventoryItems);
  } catch (error) {
    logger.error('Error fetching inventory items:', error);
    res.status(500).json({ error: 'Failed to fetch inventory items' });
  }
};

// Get inventory item by ID
const getInventoryItem = async (req, res) => {
  try {
    const inventoryItem = await Inventory.findByPk(req.params.id);
    if (!inventoryItem) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }
    res.json(inventoryItem);
  } catch (error) {
    logger.error('Error fetching inventory item:', error);
    res.status(500).json({ error: 'Failed to fetch inventory item' });
  }
};

// Create new inventory item
const createInventoryItem = async (req, res) => {
  try {
    const inventoryItem = await Inventory.create(req.body);
    res.status(201).json(inventoryItem);
  } catch (error) {
    logger.error('Error creating inventory item:', error);
    res.status(500).json({ error: 'Failed to create inventory item' });
  }
};

// Update inventory item
const updateInventoryItem = async (req, res) => {
  try {
    const inventoryItem = await Inventory.findByPk(req.params.id);
    if (!inventoryItem) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }

    await inventoryItem.update(req.body);
    res.json(inventoryItem);
  } catch (error) {
    logger.error('Error updating inventory item:', error);
    res.status(500).json({ error: 'Failed to update inventory item' });
  }
};

// Delete inventory item
const deleteInventoryItem = async (req, res) => {
  try {
    const inventoryItem = await Inventory.findByPk(req.params.id);
    if (!inventoryItem) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }

    await inventoryItem.destroy();
    res.status(204).send();
  } catch (error) {
    logger.error('Error deleting inventory item:', error);
    res.status(500).json({ error: 'Failed to delete inventory item' });
  }
};

// Get inventory analytics summary
const getInventorySummary = async (req, res) => {
  try {
    logger.info('Getting inventory summary');
    const summary = await InventoryService.getInventorySummary();
    res.json({
      message: 'Inventory summary retrieved successfully',
      summary: summary
    });
  } catch (error) {
    logger.error('Error getting inventory summary:', error);
    res.status(500).json({ error: 'Failed to get inventory summary' });
  }
};

// Check and get low stock items
const getLowStockItems = async (req, res) => {
  try {
    logger.info('Getting low stock items');
    const lowStockItems = await InventoryService.checkLowStockItems();
    res.json({
      message: 'Low stock items retrieved successfully',
      count: lowStockItems.length,
      items: lowStockItems
    });
  } catch (error) {
    logger.error('Error getting low stock items:', error);
    res.status(500).json({ error: 'Failed to get low stock items' });
  }
};

module.exports = {
  getInventory,
  getInventoryItem,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  getInventorySummary,
  getLowStockItems,
}; 

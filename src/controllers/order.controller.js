const Order = require('../models/Order');
const Inventory = require('../models/Inventory');
const logger = require('../utils/logger');
const InventoryService = require('../services/inventoryService');
const EventService = require('../services/eventService');

// Note: Inventory management is now handled by InventoryService

// Create a new order
const createOrder = async (req, res) => {
  try {
    logger.info('Creating new order with data:', req.body);

    // Step 1: Check if all items are available in stock
    const stockCheck = await InventoryService.checkStockAvailability(req.body.items);
    
    if (!stockCheck.available) {
      // If items are not available, return error
      logger.warn('Order creation failed due to stock availability:', stockCheck.message);
      return res.status(400).json({ 
        error: 'Insufficient stock',
        message: stockCheck.message,
        unavailableItem: stockCheck.unavailableItem,
        availableQuantity: stockCheck.availableQuantity
      });
    }

    // Step 2: Create the order in database
    const order = await Order.create(req.body);
    logger.info(`Order created successfully with ID: ${order.id}`);

    // Step 3: Deduct inventory for the order
    try {
      await InventoryService.deductInventoryForOrder(order.items);
      logger.info(`Inventory deducted successfully for order ${order.id}`);
    } catch (inventoryError) {
      // If inventory deduction fails, we need to delete the order
      logger.error('Failed to deduct inventory, deleting order:', inventoryError);
      await order.destroy();
      return res.status(400).json({ 
        error: 'Failed to process inventory',
        message: inventoryError.message 
      });
    }

    // Step 4: Send events about the new order
    try {
      await EventService.sendOrderPlacementEvent(order);
      logger.info(`Events sent successfully for order ${order.id}`);
    } catch (eventError) {
      // Event failure shouldn't break the order creation
      logger.error('Failed to send order events (order still created):', eventError);
    }

    // Step 5: Return the created order
    res.status(201).json({
      message: 'Order created successfully',
      order: order
    });

  } catch (error) {
    logger.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
};

// Get all orders
const getOrders = async (req, res) => {
  try {
    const orders = await Order.findAll();
    res.json(orders);
  } catch (error) {
    logger.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

// Get order by ID
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    logger.error('Error fetching order:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
};

// Update order
const updateOrder = async (req, res) => {
  try {
    logger.info(`Updating order ${req.params.id} with data:`, req.body);

    // Step 1: Find the order
    const order = await Order.findByPk(req.params.id);
    if (!order) {
      logger.warn(`Order not found: ${req.params.id}`);
      return res.status(404).json({ error: 'Order not found' });
    }

    // Step 2: Store the old status for comparison
    const oldStatus = order.status;
    const newStatus = req.body.status || oldStatus;

    // Step 3: Handle inventory restoration for cancelled orders
    if (newStatus === 'CANCELLED' && oldStatus !== 'CANCELLED') {
      try {
        // Restore inventory when order is cancelled
        await InventoryService.restoreInventoryForOrder(order.items);
        logger.info(`Inventory restored for cancelled order ${order.id}`);
      } catch (inventoryError) {
        logger.error('Failed to restore inventory for cancelled order:', inventoryError);
        return res.status(500).json({ 
          error: 'Failed to restore inventory',
          message: inventoryError.message 
        });
      }
    }

    // Step 4: Update the order
    await order.update(req.body);
    logger.info(`Order ${order.id} updated successfully. Status: ${oldStatus} -> ${newStatus}`);

    // Step 5: Send events if status changed
    if (oldStatus !== newStatus) {
      try {
        await EventService.sendOrderStatusChangeEvent(oldStatus, newStatus, order);
        logger.info(`Status change events sent for order ${order.id}`);
      } catch (eventError) {
        // Event failure shouldn't break the order update
        logger.error('Failed to send status change events (order still updated):', eventError);
      }
    }

    // Step 6: Return the updated order
    res.json({
      message: 'Order updated successfully',
      order: order,
      statusChanged: oldStatus !== newStatus,
      oldStatus: oldStatus,
      newStatus: newStatus
    });

  } catch (error) {
    logger.error('Error updating order:', error);
    res.status(500).json({ error: 'Failed to update order' });
  }
};

// Delete order
const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    await order.destroy();
    res.status(204).send();
  } catch (error) {
    logger.error('Error deleting order:', error);
    res.status(500).json({ error: 'Failed to delete order' });
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
}; 

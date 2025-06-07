// Inventory Service - This handles all inventory operations
// Like checking stock, reducing stock when orders are placed, etc.

const Inventory = require('../models/Inventory');
const EventService = require('./eventService');
const logger = require('../utils/logger');

// Class to handle all inventory operations
class InventoryService {

  // Function to check if we have enough stock for an order
  static async checkStockAvailability(orderItems) {
    try {
      logger.info('Checking stock availability for order items');
      
      // Go through each item in the order
      for (const item of orderItems) {
        // Find this item in our inventory
        const inventoryItem = await Inventory.findOne({
          where: { itemName: item.name }
        });

        // If item doesn't exist in inventory
        if (!inventoryItem) {
          logger.warn(`Item not found in inventory: ${item.name}`);
          return {
            available: false,
            message: `Item "${item.name}" is not available in inventory`,
            unavailableItem: item.name
          };
        }

        // If we don't have enough stock
        if (inventoryItem.quantity < item.quantity) {
          logger.warn(`Insufficient stock for ${item.name}. Required: ${item.quantity}, Available: ${inventoryItem.quantity}`);
          return {
            available: false,
            message: `Insufficient stock for "${item.name}". Required: ${item.quantity}, Available: ${inventoryItem.quantity}`,
            unavailableItem: item.name,
            availableQuantity: inventoryItem.quantity
          };
        }
      }

      // If we get here, all items are available
      logger.info('All items are available in stock');
      return {
        available: true,
        message: 'All items are available'
      };

    } catch (error) {
      logger.error('Error checking stock availability:', error);
      throw new Error('Failed to check stock availability');
    }
  }

  // Function to reduce inventory when an order is placed
  static async deductInventoryForOrder(orderItems) {
    try {
      logger.info('Deducting inventory for order');
      
      // Keep track of items we've updated (in case we need to rollback)
      const updatedItems = [];

      // Go through each item in the order
      for (const item of orderItems) {
        // Find the inventory item
        const inventoryItem = await Inventory.findOne({
          where: { itemName: item.name }
        });

        if (!inventoryItem) {
          // If item not found, rollback previous changes
          await this.rollbackInventoryChanges(updatedItems);
          throw new Error(`Item "${item.name}" not found in inventory`);
        }

        // Check if we have enough stock
        if (inventoryItem.quantity < item.quantity) {
          // If not enough stock, rollback previous changes
          await this.rollbackInventoryChanges(updatedItems);
          throw new Error(`Insufficient stock for "${item.name}"`);
        }

        // Save original quantity for potential rollback
        const originalQuantity = inventoryItem.quantity;
        
        // Calculate new quantity
        const newQuantity = inventoryItem.quantity - item.quantity;
        
        // Update the inventory
        await inventoryItem.update({ quantity: newQuantity });
        
        // Keep track of this change
        updatedItems.push({
          item: inventoryItem,
          originalQuantity: originalQuantity,
          newQuantity: newQuantity,
          deductedAmount: item.quantity
        });

        logger.info(`Deducted ${item.quantity} units of ${item.name}. New quantity: ${newQuantity}`);

        // Check if quantity is now below threshold
        if (newQuantity <= inventoryItem.threshold) {
          logger.warn(`Low stock alert for ${item.name}: ${newQuantity} units remaining (threshold: ${inventoryItem.threshold})`);
          
          // Send alert event
          await EventService.sendInventoryAlert(inventoryItem);
        }
      }

      logger.info('Successfully deducted inventory for all order items');
      return updatedItems;

    } catch (error) {
      logger.error('Error deducting inventory:', error);
      throw error;
    }
  }

  // Function to restore inventory when an order is cancelled
  static async restoreInventoryForOrder(orderItems) {
    try {
      logger.info('Restoring inventory for cancelled order');

      // Go through each item in the order
      for (const item of orderItems) {
        // Find the inventory item
        const inventoryItem = await Inventory.findOne({
          where: { itemName: item.name }
        });

        if (inventoryItem) {
          // Add the quantity back
          const newQuantity = inventoryItem.quantity + item.quantity;
          
          // Update the inventory
          await inventoryItem.update({ quantity: newQuantity });
          
          logger.info(`Restored ${item.quantity} units of ${item.name}. New quantity: ${newQuantity}`);
        } else {
          logger.warn(`Item ${item.name} not found in inventory during restoration`);
        }
      }

      logger.info('Successfully restored inventory for all order items');

    } catch (error) {
      logger.error('Error restoring inventory:', error);
      throw error;
    }
  }

  // Helper function to rollback inventory changes if something goes wrong
  static async rollbackInventoryChanges(updatedItems) {
    try {
      logger.warn('Rolling back inventory changes');

      // Go through each item we updated and restore original quantity
      for (const update of updatedItems) {
        await update.item.update({ quantity: update.originalQuantity });
        logger.info(`Rolled back ${update.item.itemName} to quantity: ${update.originalQuantity}`);
      }

      logger.info('Successfully rolled back all inventory changes');

    } catch (error) {
      logger.error('Error during rollback:', error);
      // This is bad - we couldn't rollback, so log it for manual intervention
      logger.error('CRITICAL: Failed to rollback inventory changes. Manual intervention required.');
    }
  }

  // Function to check all inventory items and send alerts for low stock
  static async checkLowStockItems() {
    try {
      logger.info('Checking for low stock items');

      // Find all items where quantity is at or below threshold
      const lowStockItems = await Inventory.findAll({
        where: {
          quantity: {
            [require('sequelize').Op.lte]: require('sequelize').col('threshold')
          }
        }
      });

      // Send alerts for each low stock item
      for (const item of lowStockItems) {
        await EventService.sendInventoryAlert(item);
      }

      logger.info(`Found ${lowStockItems.length} low stock items`);
      return lowStockItems;

    } catch (error) {
      logger.error('Error checking low stock items:', error);
      throw error;
    }
  }

  // Function to get inventory summary (useful for analytics)
  static async getInventorySummary() {
    try {
      // Get total number of different items
      const totalItems = await Inventory.count();
      
      // Get items with low stock
      const lowStockCount = await Inventory.count({
        where: {
          quantity: {
            [require('sequelize').Op.lte]: require('sequelize').col('threshold')
          }
        }
      });

      // Get items with zero stock
      const outOfStockCount = await Inventory.count({
        where: { quantity: 0 }
      });

      const summary = {
        totalItems,
        lowStockCount,
        outOfStockCount,
        healthyStockCount: totalItems - lowStockCount
      };

      logger.info('Inventory summary generated:', summary);
      return summary;

    } catch (error) {
      logger.error('Error generating inventory summary:', error);
      throw error;
    }
  }
}

// Export the InventoryService so other files can use it
module.exports = InventoryService; 

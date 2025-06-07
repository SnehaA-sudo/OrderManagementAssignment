// Event Service - This file helps us send events (messages) to other parts of our system
// Think of events like announcements: "Order was placed!", "Inventory is low!", etc.

const { sendMessage, TOPICS } = require('../config/kafka');
const logger = require('../utils/logger');

// Class to handle all our event sending
// A class is like a blueprint that contains related functions
class EventService {
  
  // Function to send an order event (when something happens to an order)
  static async sendOrderEvent(eventType, orderData) {
    try {
      // Create a message with all the important information
      const event = {
        id: orderData.id,                    // Which order this is about
        type: eventType,                     // What happened (created, updated, etc.)
        orderId: orderData.id,               // Order ID again for easy access
        customerId: orderData.customerId,    // Who placed the order
        status: orderData.status,            // Current order status
        totalAmount: orderData.totalAmount,  // How much the order costs
        items: orderData.items,              // What was ordered
        timestamp: new Date().toISOString(), // When this event happened
        source: 'order-service'              // Which service sent this event
      };

      // Send the event to the order events topic
      await sendMessage(TOPICS.ORDER_EVENTS, event);
      
      logger.info(`Order event sent: ${eventType} for order ${orderData.id}`);
    } catch (error) {
      // If something goes wrong, log the error but don't break the main operation
      logger.error(`Failed to send order event ${eventType}:`, error);
      // Note: We don't throw the error here because we don't want 
      // a messaging failure to break the main order operation
    }
  }

  // Function to send an inventory alert (when inventory is running low)
  static async sendInventoryAlert(inventoryItem) {
    try {
      // Create an alert message
      const alert = {
        id: inventoryItem.id,                // Which inventory item
        itemName: inventoryItem.itemName,    // Name of the item
        currentQuantity: inventoryItem.quantity, // How many we have left
        threshold: inventoryItem.threshold,  // Minimum we should have
        category: inventoryItem.category,    // What type of item
        alertLevel: 'LOW_STOCK',             // Type of alert
        timestamp: new Date().toISOString(), // When this alert was created
        source: 'inventory-service'          // Which service sent this
      };

      // Send the alert to the inventory alerts topic
      await sendMessage(TOPICS.INVENTORY_ALERTS, alert);
      
      logger.warn(`Inventory alert sent for ${inventoryItem.itemName}: ${inventoryItem.quantity} remaining`);
    } catch (error) {
      logger.error('Failed to send inventory alert:', error);
    }
  }

  // Function to send analytics events (for tracking and reporting)
  static async sendAnalyticsEvent(eventType, data) {
    try {
      // Create an analytics event
      const analyticsEvent = {
        type: eventType,                     // What kind of analytics event
        data: data,                          // The actual data to track
        timestamp: new Date().toISOString(), // When this happened
        source: 'order-management-system'    // Where this came from
      };

      // Send to analytics topic
      await sendMessage(TOPICS.ANALYTICS, analyticsEvent);
      
      logger.info(`Analytics event sent: ${eventType}`);
    } catch (error) {
      logger.error(`Failed to send analytics event ${eventType}:`, error);
    }
  }

  // Helper function to send order status change events
  // This is called whenever an order status changes
  static async sendOrderStatusChangeEvent(oldStatus, newStatus, orderData) {
    try {
      // Send the order event
      await this.sendOrderEvent('ORDER_STATUS_CHANGED', orderData);
      
      // Also send analytics data about this status change
      await this.sendAnalyticsEvent('ORDER_STATUS_CHANGE', {
        orderId: orderData.id,
        oldStatus: oldStatus,
        newStatus: newStatus,
        customerId: orderData.customerId,
        orderValue: orderData.totalAmount
      });
      
    } catch (error) {
      logger.error('Failed to send order status change events:', error);
    }
  }

  // Helper function to send order placement events
  // This is called when a new order is created
  static async sendOrderPlacementEvent(orderData) {
    try {
      // Send order event
      await this.sendOrderEvent('ORDER_PLACED', orderData);
      
      // Send analytics event about the new order
      await this.sendAnalyticsEvent('NEW_ORDER', {
        orderId: orderData.id,
        customerId: orderData.customerId,
        orderValue: orderData.totalAmount,
        itemCount: orderData.items.length,
        category: 'order_placement'
      });
      
    } catch (error) {
      logger.error('Failed to send order placement events:', error);
    }
  }
}

// Export the EventService so other files can use it
module.exports = EventService; 

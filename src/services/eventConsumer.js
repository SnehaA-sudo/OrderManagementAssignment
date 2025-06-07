// Event Consumer Service - This listens to events and processes them
const { consumer, TOPICS } = require('../config/kafka');
const logger = require('../utils/logger');

class EventConsumer {
  static async startConsumer() {
    try {
      logger.info('Starting event consumer...');
      await consumer.subscribe({ topics: Object.values(TOPICS), fromBeginning: false });
      
      await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          try {
            const eventData = JSON.parse(message.value.toString());
            logger.info(`Received event from topic ${topic}:`, eventData);

            switch (topic) {
              case TOPICS.ORDER_EVENTS:
                await this.handleOrderEvent(eventData);
                break;
              case TOPICS.INVENTORY_ALERTS:
                await this.handleInventoryAlert(eventData);
                break;
              case TOPICS.ANALYTICS:
                await this.handleAnalyticsEvent(eventData);
                break;
              default:
                logger.warn(`Unknown topic: ${topic}`);
            }
          } catch (error) {
            logger.error(`Error processing message from topic ${topic}:`, error);
          }
        },
      });

      logger.info('Event consumer started successfully');
    } catch (error) {
      logger.error('Failed to start event consumer:', error);
      throw error;
    }
  }

  static async handleOrderEvent(eventData) {
    try {
      logger.info(`Processing order event: ${eventData.type} for order ${eventData.orderId}`);
      
      switch (eventData.type) {
        case 'ORDER_PLACED':
          logger.info(`New order notification sent for order ${eventData.orderId}`);
          break;
        case 'ORDER_STATUS_CHANGED':
          logger.info(`Status change notification for order ${eventData.orderId}: ${eventData.status}`);
          break;
      }
    } catch (error) {
      logger.error('Error handling order event:', error);
    }
  }

  static async handleInventoryAlert(alertData) {
    try {
      logger.warn(`LOW STOCK ALERT: ${alertData.itemName} - ${alertData.currentQuantity} remaining`);
    } catch (error) {
      logger.error('Error handling inventory alert:', error);
    }
  }

  static async handleAnalyticsEvent(analyticsData) {
    try {
      logger.info(`Analytics event processed: ${analyticsData.type}`);
    } catch (error) {
      logger.error('Error handling analytics event:', error);
    }
  }

  static async stopConsumer() {
    try {
      await consumer.disconnect();
      logger.info('Event consumer stopped');
    } catch (error) {
      logger.error('Error stopping consumer:', error);
    }
  }
}

module.exports = EventConsumer; 

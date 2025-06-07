// Kafka Configuration File
// This file sets up our connection to Kafka (a messaging system)
// Think of Kafka like a post office - it helps different parts of our app talk to each other

const { Kafka } = require('kafkajs');
const logger = require('../utils/logger');

// Create a Kafka client - this is our connection to the Kafka server
const kafka = new Kafka({
  clientId: 'order-management-app', // A name for our app
  brokers: [process.env.KAFKA_BROKER || 'localhost:9092'], // Where to find Kafka
  retry: {
    initialRetryTime: 100,
    retries: 8
  }
});

// Create a producer - this SENDS messages to Kafka topics
// Think of it like putting letters in a mailbox
const producer = kafka.producer();

// Create a consumer - this RECEIVES messages from Kafka topics  
// Think of it like checking your mailbox for new letters
const consumer = kafka.consumer({ 
  groupId: 'order-management-group' // A group name for our consumers
});

// List of topics (like different mailboxes for different types of messages)
const TOPICS = {
  ORDER_EVENTS: 'order-events',           // For order status changes
  INVENTORY_ALERTS: 'inventory-alerts',   // For low inventory warnings
  ANALYTICS: 'analytics-events'           // For tracking data
};

// Function to connect our producer (start sending capability)
const connectProducer = async () => {
  try {
    await producer.connect();
    logger.info('Kafka producer connected successfully');
  } catch (error) {
    logger.error('Failed to connect Kafka producer:', error);
    throw error;
  }
};

// Function to connect our consumer (start receiving capability)
const connectConsumer = async () => {
  try {
    await consumer.connect();
    logger.info('Kafka consumer connected successfully');
  } catch (error) {
    logger.error('Failed to connect Kafka consumer:', error);
    throw error;
  }
};

// Function to send a message to a topic
const sendMessage = async (topic, message) => {
  try {
    // Send the message to the specified topic
    await producer.send({
      topic: topic,
      messages: [
        {
          key: message.id || 'default', // A unique key for the message
          value: JSON.stringify(message), // Convert our message to text
          timestamp: Date.now() // When we sent this message
        }
      ]
    });
    
    logger.info(`Message sent to topic ${topic}:`, message);
  } catch (error) {
    logger.error(`Failed to send message to topic ${topic}:`, error);
    throw error;
  }
};

// Function to gracefully disconnect everything
const disconnect = async () => {
  try {
    await producer.disconnect();
    await consumer.disconnect();
    logger.info('Kafka connections closed successfully');
  } catch (error) {
    logger.error('Error disconnecting from Kafka:', error);
  }
};

// Export everything so other files can use it
module.exports = {
  kafka,
  producer,
  consumer,
  TOPICS,
  connectProducer,
  connectConsumer,
  sendMessage,
  disconnect
}; 

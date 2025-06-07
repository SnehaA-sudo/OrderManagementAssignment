// Import required modules
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize, testConnection } = require('./config/database');
const orderRoutes = require('./routes/orderRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const { connectProducer, connectConsumer } = require('./config/kafka');
const EventConsumer = require('./services/eventConsumer');

// Create an Express application
const app = express();

// Middleware
// Enable CORS (Cross-Origin Resource Sharing)
app.use(cors());
// Parse JSON request bodies
app.use(express.json());

// Routes
// All order-related routes will be prefixed with /api/orders
app.use('/api/orders', orderRoutes);
// All inventory-related routes will be prefixed with /api/inventory
app.use('/api/inventory', inventoryRoutes);

// Basic error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start the server
const PORT = process.env.PORT || 3000;

// Test database connection and start server
async function startServer() {
  try {
    // Step 1: Test database connection
    console.log('Connecting to database...');
    await testConnection();
    
    // Step 2: Connect to Kafka (for sending events)
    console.log('Connecting to Kafka producer...');
    await connectProducer();
    
    // Step 3: Connect Kafka consumer (for receiving events)
    console.log('Connecting to Kafka consumer...');
    await connectConsumer();
    
    // Step 4: Start event consumer (listening for events)
    console.log('Starting event consumer...');
    await EventConsumer.startConsumer();
    
    // Step 5: Start the web server
    console.log('Starting web server...');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Order Management System is ready!`);
      console.log(`Event-driven architecture is active`);
      console.log(`Inventory management is enabled`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();

// Graceful shutdown handling
process.on('SIGINT', async () => {
  console.log('Received SIGINT, shutting down gracefully...');
  
  try {
    // Stop event consumer
    await EventConsumer.stopConsumer();
    
    // Disconnect from Kafka
    const { disconnect } = require('./config/kafka');
    await disconnect();
    
    console.log('Shutdown complete');
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
});

process.on('SIGTERM', async () => {
  console.log('Received SIGTERM, shutting down gracefully...');
  
  try {
    // Stop event consumer
    await EventConsumer.stopConsumer();
    
    // Disconnect from Kafka
    const { disconnect } = require('./config/kafka');
    await disconnect();
    
    console.log('Shutdown complete');
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
}); 

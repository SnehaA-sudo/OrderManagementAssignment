// Import required modules
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// Define the Order model
const Order = sequelize.define('Order', {
  // Each order has a unique UUID
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  // Customer ID (UUID reference)
  customerId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  // Status of the order with proper enum values
  status: {
    type: DataTypes.ENUM('PENDING', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'),
    defaultValue: 'PENDING'
  },
  // Total amount of the order
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  // List of items in the order
  items: {
    type: DataTypes.JSONB,
    allowNull: false
  },
  // Delivery address as JSON object
  deliveryAddress: {
    type: DataTypes.JSONB,
    allowNull: false
  }
}, {
  // Table name in the database
  tableName: 'orders',
  // Add timestamps (createdAt, updatedAt)
  timestamps: true
});

module.exports = Order; 

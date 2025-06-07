const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface) => {
    // Create Orders table
    await queryInterface.createTable('orders', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      customerId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM('PENDING', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'),
        defaultValue: 'PENDING',
      },
      totalAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      items: {
        type: DataTypes.JSONB,
        allowNull: false,
      },
      deliveryAddress: {
        type: DataTypes.JSONB,
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    });

    // Create indexes for Orders table
    await queryInterface.addIndex('orders', ['customerId']);
    await queryInterface.addIndex('orders', ['status']);
    await queryInterface.addIndex('orders', ['createdAt']);

    // Create Inventory table
    await queryInterface.createTable('inventory', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      itemName: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      threshold: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 10,
      },
      unit: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      category: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    });

    // Create indexes for Inventory table
    await queryInterface.addIndex('inventory', ['itemName']);
    await queryInterface.addIndex('inventory', ['category']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('orders');
    await queryInterface.dropTable('inventory');
  },
}; 

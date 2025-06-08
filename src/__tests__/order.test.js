const request = require('supertest');
const app = require('../index');
const { sequelize } = require('../config/database');

// Before all tests, sync the database
beforeAll(async () => {
  await sequelize.sync({ force: true });
});

// After all tests, close the database connection
afterAll(async () => {
  await sequelize.close();
});

describe('Order API', () => {
  let orderId;

  // Test creating a new order
  test('POST /api/orders - Create a new order', async () => {
    const orderData = {
      customerName: 'John Doe',
      items: [
        {
          productId: 1,
          quantity: 2,
          price: 29.99
        }
      ],
      totalAmount: 59.98
    };

    const response = await request(app)
      .post('/api/orders')
      .send(orderData)
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.customerName).toBe(orderData.customerName);
    expect(response.body.totalAmount).toBe(orderData.totalAmount);
    
    orderId = response.body.id;
  });

  // Test getting all orders
  test('GET /api/orders - Get all orders', async () => {
    const response = await request(app)
      .get('/api/orders')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });

  // Test getting a specific order
  test('GET /api/orders/:id - Get order by ID', async () => {
    const response = await request(app)
      .get(`/api/orders/${orderId}`)
      .expect(200);

    expect(response.body).toHaveProperty('id', orderId);
  });

  // Test updating an order
  test('PUT /api/orders/:id - Update order', async () => {
    const updateData = {
      customerName: 'Jane Doe',
      totalAmount: 69.98
    };

    const response = await request(app)
      .put(`/api/orders/${orderId}`)
      .send(updateData)
      .expect(200);

    expect(response.body.customerName).toBe(updateData.customerName);
    expect(response.body.totalAmount).toBe(updateData.totalAmount);
  });

  // Test deleting an order
  test('DELETE /api/orders/:id - Delete order', async () => {
    await request(app)
      .delete(`/api/orders/${orderId}`)
      .expect(200);

    // Verify the order is deleted
    const response = await request(app)
      .get(`/api/orders/${orderId}`)
      .expect(404);
  });
}); 
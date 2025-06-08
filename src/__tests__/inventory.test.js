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

describe('Inventory API', () => {
  let productId;

  // Test creating a new product
  test('POST /api/inventory - Create a new product', async () => {
    const productData = {
      name: 'Test Product',
      description: 'A test product',
      price: 29.99,
      quantity: 100,
      category: 'Test Category'
    };

    const response = await request(app)
      .post('/api/inventory')
      .send(productData)
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.name).toBe(productData.name);
    expect(response.body.quantity).toBe(productData.quantity);
    
    productId = response.body.id;
  });

  // Test getting all products
  test('GET /api/inventory - Get all products', async () => {
    const response = await request(app)
      .get('/api/inventory')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });

  // Test getting a specific product
  test('GET /api/inventory/:id - Get product by ID', async () => {
    const response = await request(app)
      .get(`/api/inventory/${productId}`)
      .expect(200);

    expect(response.body).toHaveProperty('id', productId);
  });

  // Test updating a product
  test('PUT /api/inventory/:id - Update product', async () => {
    const updateData = {
      name: 'Updated Product',
      quantity: 150
    };

    const response = await request(app)
      .put(`/api/inventory/${productId}`)
      .send(updateData)
      .expect(200);

    expect(response.body.name).toBe(updateData.name);
    expect(response.body.quantity).toBe(updateData.quantity);
  });

  // Test updating product quantity
  test('PATCH /api/inventory/:id/quantity - Update product quantity', async () => {
    const quantityData = {
      quantity: 200
    };

    const response = await request(app)
      .patch(`/api/inventory/${productId}/quantity`)
      .send(quantityData)
      .expect(200);

    expect(response.body.quantity).toBe(quantityData.quantity);
  });

  // Test deleting a product
  test('DELETE /api/inventory/:id - Delete product', async () => {
    await request(app)
      .delete(`/api/inventory/${productId}`)
      .expect(200);

    // Verify the product is deleted
    const response = await request(app)
      .get(`/api/inventory/${productId}`)
      .expect(404);
  });
}); 
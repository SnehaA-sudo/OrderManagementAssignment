# Order Management System

## Quick Start

### **Prerequisites**

- Docker & Docker Compose
- Git

### **1. Clone & Start**

```bash
git clone <repository-url>
cd OrderManagementAssignment
docker-compose up --build
```

### **2. Verify System Health**

```bash
# Check all services are running
docker-compose ps

# Test API health
curl http://localhost:3000/api/orders
curl http://localhost:3000/api/inventory
```

### **3. Initialize Sample Data**

```bash
# Create inventory items
curl -X POST http://localhost:3000/api/inventory \
  -H "Content-Type: application/json" \
  -d '{
    "itemName": "Pizza Margherita",
    "quantity": 100,
    "threshold": 10,
    "unit": "pieces",
    "price": 12.99,
    "category": "Food"
  }'
```

##  API Documentation

### **Order Management APIs**

#### **Create Order**

```http
POST /api/orders
Content-Type: application/json

{
  "customerId": "550e8400-e29b-41d4-a716-446655440000",
  "items": [
    {
      "name": "Pizza Margherita",
      "quantity": 2,
      "price": 12.99
    }
  ],
  "totalAmount": 25.98,
  "deliveryAddress": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  },
  "status": "PENDING"
}
```

#### **Update Order Status**

```http
PUT /api/orders/{orderId}
Content-Type: application/json

{
  "status": "PREPARING"
}
```

#### **Get Orders**

```http
GET /api/orders              # Get all orders
GET /api/orders/{orderId}    # Get specific order
```

### **Inventory Management APIs**

#### **Create Inventory Item**

```http
POST /api/inventory
Content-Type: application/json

{
  "itemName": "Pizza Margherita",
  "quantity": 100,
  "threshold": 10,
  "unit": "pieces",
  "price": 12.99,
  "category": "Food"
}
```

#### **Get Inventory Analytics**

```http
GET /api/inventory/analytics/summary     # Inventory overview
GET /api/inventory/analytics/low-stock   # Low stock items
```

## Event System

### **Event Topics**

- `order-events`: Order creation, status changes
- `inventory-alerts`: Low stock warnings
- `analytics-events`: Business intelligence data

### **Event Schemas**

#### **Order Event**

```json
{
  "id": "order-uuid",
  "type": "ORDER_PLACED",
  "orderId": "order-uuid",
  "customerId": "customer-uuid",
  "status": "PENDING",
  "totalAmount": 25.98,
  "items": [...],
  "timestamp": "2023-06-04T19:24:43.455Z",
  "source": "order-service"
}
```

#### **Inventory Alert**

```json
{
  "id": "item-uuid",
  "itemName": "Pizza Margherita",
  "currentQuantity": 5,
  "threshold": 10,
  "alertLevel": "LOW_STOCK",
  "timestamp": "2023-06-04T19:25:31.833Z",
  "source": "inventory-service"
}
```





# 🏗️ System Architecture Overview

## 📐 High-Level Architecture

The Order Management System follows an **Event-Driven Microservices Architecture** designed for high performance, scalability, and reliability in food delivery operations.

## 🔄 System Flow Diagrams

### **Order Placement Flow**

```
Customer Request → API Gateway → Order Service
                                     ↓
                              Inventory Check
                                     ↓
                          Stock Available? ──No──→ Return Error
                                     ↓ Yes
                              Create Order Record
                                     ↓
                             Deduct Inventory
                                     ↓
                            Publish Order Event
                                     ↓
                           Return Success Response
                                     ↓
                          Event Consumer Processes
                              ↓           ↓
                        Analytics    Notifications
```

### **Inventory Management Flow**

```
Order Created ──→ Check Stock ──→ Deduct Inventory ──→ Check Threshold
                                                              ↓
                                                    Below Threshold?
                                                              ↓ Yes
                                                   Publish Alert Event
                                                              ↓
                                                   Consumer Processes
                                                              ↓
                                                Send Notifications
                                                 (Email, Slack, etc.)
```

### **Event-Driven Communication**

```
┌─────────────────┐     Events     ┌─────────────────┐
│  Order Service  │ ──────────────→ │  Kafka Broker   │
└─────────────────┘                 └─────────────────┘
                                            │
                    ┌───────────────────────┼───────────────────────┐
                    ↓                       ↓                       ↓
        ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
        │Analytics Service│    │Notification Svc │    │Inventory Service│
        └─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🏭 Component Architecture

### **Order Management Service**

```
┌─────────────────────────────────────────┐
│           Order Management              │
├─────────────────────────────────────────┤
│ Controllers/                            │
│ ├── order.controller.js                 │
│ ├── inventory.controller.js             │
│                                         │
│ Services/                               │
│ ├── inventoryService.js                 │
│ ├── eventService.js                     │
│ ├── eventConsumer.js                    │
│                                         │
│ Models/                                 │
│ ├── Order.js                           │
│ ├── Inventory.js                       │
│                                         │
│ Config/                                 │
│ ├── database.js                        │
│ ├── kafka.js                           │
└─────────────────────────────────────────┘
```

## 🗄️ Database Design

### **Tables Schema**

#### **Orders Table**

```sql
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customerId UUID NOT NULL,
    status ENUM('PENDING', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED') DEFAULT 'PENDING',
    totalAmount DECIMAL(10,2) NOT NULL,
    items JSONB NOT NULL,
    deliveryAddress JSONB NOT NULL,
    createdAt TIMESTAMP WITH TIME ZONE NOT NULL,
    updatedAt TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Indexes for performance
CREATE INDEX idx_orders_customer_id ON orders(customerId);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(createdAt);
```

#### **Inventory Table**

```sql
CREATE TABLE inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    itemName VARCHAR(255) UNIQUE NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0,
    threshold INTEGER NOT NULL DEFAULT 10,
    unit VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    category VARCHAR(255) NOT NULL,
    createdAt TIMESTAMP WITH TIME ZONE NOT NULL,
    updatedAt TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Indexes for performance
CREATE INDEX idx_inventory_item_name ON inventory(itemName);
CREATE INDEX idx_inventory_category ON inventory(category);
CREATE INDEX idx_inventory_low_stock ON inventory(quantity, threshold);
```

## 📨 Event System Architecture

### **Kafka Topics Structure**

```
order-events
└── Events: ORDER_PLACED, ORDER_STATUS_CHANGED

inventory-alerts
└── Events: LOW_STOCK, OUT_OF_STOCK

analytics-events
└── Events: NEW_ORDER, ORDER_STATUS_CHANGE, INVENTORY_UPDATE
```

### **Event Processing Pattern**

```
Producer Pattern:
Service → Event Creation → Kafka Producer → Topic

Consumer Pattern:
Topic → Kafka Consumer → Event Processing → Business Logic
```






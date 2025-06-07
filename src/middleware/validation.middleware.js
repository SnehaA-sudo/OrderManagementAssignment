const Joi = require('joi');

// Order validation schemas
const orderSchema = Joi.object({
  customerId: Joi.string().uuid().required(),
  items: Joi.array().items(
    Joi.object({
      id: Joi.string().uuid().required(),
      quantity: Joi.number().integer().min(1).required(),
    })
  ).min(1).required(),
  deliveryAddress: Joi.object({
    street: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    zipCode: Joi.string().required(),
    country: Joi.string().required(),
  }).required(),
});

const orderStatusSchema = Joi.object({
  status: Joi.string().valid('PENDING', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED').required(),
});
// Inventory validation schemas
const inventoryItemSchema = Joi.object({
  itemName: Joi.string().required(),
  quantity: Joi.number().integer().min(0).required(),
  threshold: Joi.number().integer().min(0).required(),
  unit: Joi.string().required(),
  price: Joi.number().precision(2).min(0).required(),
  category: Joi.string().required(),
});

const inventoryUpdateSchema = Joi.object({
  quantity: Joi.number().integer().min(0),
  threshold: Joi.number().integer().min(0),
  price: Joi.number().precision(2).min(0),
}).min(1);

// Validation middleware
const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      status: 'error',
      message: error.details[0].message,
    });
  }
  next();
};

module.exports = {
  validateOrder: validate(orderSchema),
  validateOrderStatus: validate(orderStatusSchema),
  validateInventoryItem: validate(inventoryItemSchema),
  validateInventoryUpdate: validate(inventoryUpdateSchema),
}; 
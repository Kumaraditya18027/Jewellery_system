const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

const ordersFile = path.join(__dirname, '../models/orders.json');
const cartFile = path.join(__dirname, '../models/cart.json');

// Helper function to generate tracking number
const generateTrackingNumber = () => {
  return 'TRK' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
};

// Get orders for user
router.get('/:userId', (req, res) => {
  fs.readFile(ordersFile, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Failed to read orders' });
    const orders = JSON.parse(data);
    const userOrders = orders.filter(o => o.userId === req.params.userId);
    res.json(userOrders);
  });
});

// Place order
router.post('/:userId', (req, res) => {
  const { shippingAddress, phone, receiverName, email } = req.body;
  if (!shippingAddress || !phone || !receiverName || !email) {
    return res.status(400).json({ error: 'All fields are required: shippingAddress, phone, receiverName, email' });
  }

  fs.readFile(cartFile, 'utf8', (err, cartData) => {
    if (err) return res.status(500).json({ error: 'Failed to read cart' });
    const carts = JSON.parse(cartData);
    const cart = carts[req.params.userId];
    if (!cart || cart.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    const total = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const newOrder = {
      id: uuidv4(),
      userId: req.params.userId,
      items: cart,
      total,
      shippingAddress,
      phone,
      receiverName,
      email,
      status: 'Pending',
      date: new Date().toISOString(),
      trackingNumber: generateTrackingNumber(),
      estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
    };

    fs.readFile(ordersFile, 'utf8', (err, ordersData) => {
      if (err) return res.status(500).json({ error: 'Failed to read orders' });
      let orders = JSON.parse(ordersData);
      orders.push(newOrder);
      fs.writeFile(ordersFile, JSON.stringify(orders, null, 2), (err) => {
        if (err) return res.status(500).json({ error: 'Failed to save order' });
        // Clear cart after order
        carts[req.params.userId] = [];
        fs.writeFile(cartFile, JSON.stringify(carts, null, 2), (err) => {
          if (err) return res.status(500).json({ error: 'Failed to clear cart' });
          res.json({ message: 'Order placed successfully', order: newOrder });
        });
      });
    });
  });
});

// Update order status (for admin/simulation purposes)
router.put('/:orderId/status', (req, res) => {
  const { status } = req.body;
  if (!status) return res.status(400).json({ error: 'Status is required' });

  fs.readFile(ordersFile, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Failed to read orders' });
    let orders = JSON.parse(data);
    const order = orders.find(o => o.id === req.params.orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    order.status = status;
    if (status === 'Shipped' && !order.trackingNumber) {
      order.trackingNumber = generateTrackingNumber();
    }

    fs.writeFile(ordersFile, JSON.stringify(orders, null, 2), (err) => {
      if (err) return res.status(500).json({ error: 'Failed to update order' });
      res.json({ message: 'Order status updated', order });
    });
  });
});

// Get order by ID
router.get('/order/:orderId', (req, res) => {
  fs.readFile(ordersFile, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Failed to read orders' });
    const orders = JSON.parse(data);
    const order = orders.find(o => o.id === req.params.orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  });
});

module.exports = router;

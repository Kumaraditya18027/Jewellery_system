const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const cartFile = path.join(__dirname, '../models/cart.json');
const productsFile = path.join(__dirname, '../models/products.json');

// Get cart for user
router.get('/:userId', (req, res) => {
  fs.readFile(cartFile, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Failed to read cart' });
    const carts = JSON.parse(data);
    const cart = carts[req.params.userId] || [];
    res.json(cart);
  });
});

// Add to cart
router.post('/:userId', (req, res) => {
  const { productId, quantity } = req.body;
  if (!productId || !quantity) {
    return res.status(400).json({ error: 'Product ID and quantity are required' });
  }

  fs.readFile(productsFile, 'utf8', (err, productsData) => {
    if (err) return res.status(500).json({ error: 'Failed to read products' });
    const products = JSON.parse(productsData);
    const product = products.find(p => p.id === productId);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    fs.readFile(cartFile, 'utf8', (err, cartData) => {
      if (err) return res.status(500).json({ error: 'Failed to read cart' });
      let carts = JSON.parse(cartData);
      if (!carts[req.params.userId]) carts[req.params.userId] = [];
      const cart = carts[req.params.userId];
      const existingItem = cart.find(item => item.productId === productId);
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.push({ productId, quantity, product });
      }
      fs.writeFile(cartFile, JSON.stringify(carts, null, 2), (err) => {
        if (err) return res.status(500).json({ error: 'Failed to save cart' });
        res.json({ message: 'Added to cart' });
      });
    });
  });
});

// Update cart item
router.put('/:userId/:productId', (req, res) => {
  const { quantity } = req.body;
  if (!quantity) return res.status(400).json({ error: 'Quantity is required' });

  fs.readFile(cartFile, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Failed to read cart' });
    let carts = JSON.parse(data);
    const cart = carts[req.params.userId];
    if (!cart) return res.status(404).json({ error: 'Cart not found' });
    const item = cart.find(item => item.productId === req.params.productId);
    if (!item) return res.status(404).json({ error: 'Item not in cart' });
    item.quantity = quantity;
    fs.writeFile(cartFile, JSON.stringify(carts, null, 2), (err) => {
      if (err) return res.status(500).json({ error: 'Failed to save cart' });
      res.json({ message: 'Cart updated' });
    });
  });
});

// Remove from cart
router.delete('/:userId/:productId', (req, res) => {
  fs.readFile(cartFile, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Failed to read cart' });
    let carts = JSON.parse(data);
    const cart = carts[req.params.userId];
    if (!cart) return res.status(404).json({ error: 'Cart not found' });
    carts[req.params.userId] = cart.filter(item => item.productId !== req.params.productId);
    fs.writeFile(cartFile, JSON.stringify(carts, null, 2), (err) => {
      if (err) return res.status(500).json({ error: 'Failed to save cart' });
      res.json({ message: 'Removed from cart' });
    });
  });
});

module.exports = router;

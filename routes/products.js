const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const productsFile = path.join(__dirname, '../models/products.json');

// Get all products
router.get('/', (req, res) => {
  fs.readFile(productsFile, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Failed to read products' });
    let products = JSON.parse(data);

    // Apply search filter
    const search = req.query.search;
    if (search) {
      products = products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Apply category filter
    const category = req.query.category;
    if (category) {
      products = products.filter(p => p.category === category);
    }

    res.json(products);
  });
});

// Get product by ID
router.get('/:id', (req, res) => {
  fs.readFile(productsFile, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Failed to read products' });
    const products = JSON.parse(data);
    const product = products.find(p => p.id === req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  });
});

module.exports = router;

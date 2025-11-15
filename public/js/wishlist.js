const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const wishlistFile = path.join(__dirname, '../models/wishlist.json');

// Helper function to read wishlist
const readWishlist = () => {
  try {
    const data = fs.readFileSync(wishlistFile, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return {};
  }
};

// Helper function to write wishlist
const writeWishlist = (data) => {
  fs.writeFileSync(wishlistFile, JSON.stringify(data, null, 2));
};

// Get wishlist for a user
router.get('/:userId', (req, res) => {
  const { userId } = req.params;
  const wishlist = readWishlist();
  res.json(wishlist[userId] || []);
});

// Add item to wishlist
router.post('/:userId', (req, res) => {
  const { userId } = req.params;
  const { productId } = req.body;
  const wishlist = readWishlist();

  if (!wishlist[userId]) {
    wishlist[userId] = [];
  }

  if (!wishlist[userId].includes(productId)) {
    wishlist[userId].push(productId);
    writeWishlist(wishlist);
  }

  res.json({ success: true, message: 'Added to wishlist' });
});

// Remove item from wishlist
router.delete('/:userId/:productId', (req, res) => {
  const { userId, productId } = req.params;
  const wishlist = readWishlist();

  if (wishlist[userId]) {
    wishlist[userId] = wishlist[userId].filter(id => id !== productId);
    writeWishlist(wishlist);
  }

  res.json({ success: true, message: 'Removed from wishlist' });
});

module.exports = router;

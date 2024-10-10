// src/models/Menu.js

const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  price: {
    type: Number,
    required: true,
  },
  imageUrl: {
    type: String, // Field to store the image path
  },
});

const menuSchema = new mongoose.Schema({
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true,
  },
  items: [menuItemSchema],  // Array of menu items
}, {
  timestamps: true,
});

const Menu = mongoose.model('Menu', menuSchema);

module.exports = Menu;

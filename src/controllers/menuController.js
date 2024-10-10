require('dotenv').config(); // Ensure this is called in the entry point

const asyncHandler = require('express-async-handler');
const AWS = require('aws-sdk');
const uuid = require('uuid').v4;
const Menu = require('../models/Menu');
const Restaurant = require('../models/Restaurant');

// Check for required environment variables after loading dotenv
const { AWS_S3_BUCKET_NAME, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION } = process.env;

if (!AWS_S3_BUCKET_NAME || !AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY || !AWS_REGION) {
  throw new Error('Missing one or more required AWS environment variables');
}

// The rest of your code remains the same


// AWS S3 setup
const s3 = new AWS.S3({
  accessKeyId: AWS_ACCESS_KEY_ID,
  secretAccessKey: AWS_SECRET_ACCESS_KEY,
  region: AWS_REGION,
});

// Helper function to upload image to S3
const uploadImageToS3 = async (file) => {
  const params = {
    Bucket: AWS_S3_BUCKET_NAME,
    Key: `${uuid()}-${file.originalname}`,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  try {
    const data = await s3.upload(params).promise();
    return data.Location; // Return the URL of the uploaded image
  } catch (error) {
    console.error('Error uploading to S3:', error);
    throw new Error('S3 upload failed');
  }
};

// @desc    Add a new menu item
// @route   POST /api/restaurants/:restaurantId/menu
// @access  Private (Restaurant Owner)
const addMenuItem = asyncHandler(async (req, res) => {
  const { name, description, price } = req.body;
  const restaurantId = req.params.restaurantId;
  let imageUrl = null;

  if (!name || !price) {
    res.status(400);
    throw new Error('Menu item name and price are required');
  }

  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant || restaurant.owner.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to add menu items to this restaurant');
  }

  let menu = await Menu.findOne({ restaurant: restaurantId });
  if (!menu) {
    menu = new Menu({ restaurant: restaurantId, items: [] });
  }

  if (req.file) {
    try {
      imageUrl = await uploadImageToS3(req.file);
    } catch (error) {
      res.status(500);
      throw new Error('Image upload failed');
    }
  }

  const newItem = { name, description, price, imageUrl };
  menu.items.push(newItem);
  await menu.save();

  res.status(201).json(menu);
});

// @desc    Update a menu item
// @route   PUT /api/restaurants/:restaurantId/menu/:itemId
// @access  Private (Restaurant Owner)
const updateMenuItem = asyncHandler(async (req, res) => {
  const { name, description, price } = req.body;
  const { restaurantId, itemId } = req.params;
  let imageUrl = null;

  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant || restaurant.owner.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to update menu items for this restaurant');
  }

  const menu = await Menu.findOne({ restaurant: restaurantId });
  if (!menu) {
    res.status(404);
    throw new Error('Menu not found');
  }

  const item = menu.items.id(itemId);
  if (!item) {
    res.status(404);
    throw new Error('Menu item not found');
  }

  if (req.file) {
    try {
      imageUrl = await uploadImageToS3(req.file);
    } catch (error) {
      res.status(500);
      throw new Error('Image upload failed');
    }
  }

  item.name = name || item.name;
  item.description = description || item.description;
  item.price = price || item.price;
  item.imageUrl = imageUrl || item.imageUrl;

  await menu.save();
  res.json(menu);
});

// @desc    Remove a menu item
// @route   DELETE /api/restaurants/:restaurantId/menu/:itemId
// @access  Private (Restaurant Owner)
const removeMenuItem = asyncHandler(async (req, res) => {
  const { restaurantId, itemId } = req.params;

  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant || restaurant.owner.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to delete menu items from this restaurant');
  }

  const menu = await Menu.findOne({ restaurant: restaurantId });
  if (!menu) {
    res.status(404);
    throw new Error('Menu not found');
  }

  menu.items = menu.items.filter(item => item._id.toString() !== itemId);
  await menu.save();

  res.json({ message: 'Menu item removed' });
});

// @desc    Get menu by restaurant ID
// @route   GET /api/menu/:restaurantId
// @access  Private (Authenticated Users)
const getMenuByRestaurant = asyncHandler(async (req, res) => {
  const menu = await Menu.findOne({ restaurant: req.params.restaurantId });
  if (!menu) {
    return res.status(200).json({ items: [] }); // Always return an array for items
  }
  res.json({ items: menu.items });
});


module.exports = {
  addMenuItem,
  updateMenuItem,
  removeMenuItem,
  getMenuByRestaurant,
};

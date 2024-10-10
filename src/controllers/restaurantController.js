// src/controllers/restaurantController.js

const asyncHandler = require('express-async-handler');
const Restaurant = require('../models/Restaurant');

// @desc    Create a new restaurant
// @route   POST /api/restaurants
// @access  Private (Restaurant Owner)
const createRestaurant = asyncHandler(async (req, res) => {
  const { name, address, phoneNumber, email, description } = req.body;

  // Log request body for debugging
  console.log("Creating restaurant with data:", req.body);

  const restaurantExists = await Restaurant.findOne({ email });

  if (restaurantExists) {
    res.status(400); 
    throw new Error('Restaurant already exists');
  }

  const restaurant = await Restaurant.create({
    name,
    address,
    phoneNumber,
    email,
    description,
    owner: req.user._id,  // Assuming the user is the restaurant owner
  });

  res.status(201).json(restaurant);
});

// @desc    Get a list of all restaurants
// @route   GET /api/restaurants
// @access  Public
const getRestaurants = asyncHandler(async (req, res) => {
  // Log that the request was received
  console.log("Fetching all restaurants");

  const restaurants = await Restaurant.find({});

  res.json(restaurants);
});

// @desc    Get a restaurant by ID
// @route   GET /api/restaurants/:id
// @access  Public
const getRestaurantById = asyncHandler(async (req, res) => {
  const restaurantId = req.params.id;

  // Find the restaurant by ID and populate the menu field
  const restaurant = await Restaurant.findById(restaurantId).populate({
    path: 'menu',
    populate: {
      path: 'items',
    }
  });

  if (!restaurant) {
    res.status(404);
    throw new Error('Restaurant not found');
  }

  res.json(restaurant);
});

// @desc    Update a restaurant
// @route   PUT /api/restaurants/:id
// @access  Private (Restaurant Owner)
const updateRestaurant = asyncHandler(async (req, res) => {
  const restaurantId = req.params.id;
  
  // Log the restaurant ID being updated
  console.log(`Updating restaurant with ID: ${restaurantId}`);

  const { name, address, phoneNumber, email, description } = req.body;

  const restaurant = await Restaurant.findById(restaurantId);

  if (restaurant) {
    restaurant.name = name || restaurant.name;
    restaurant.address = address || restaurant.address;
    restaurant.phoneNumber = phoneNumber || restaurant.phoneNumber;
    restaurant.email = email || restaurant.email;
    restaurant.description = description || restaurant.description;

    const updatedRestaurant = await restaurant.save();

    res.json(updatedRestaurant);
  } else {
    res.status(404);
    throw new Error('Restaurant not found');
  }
});

// @desc    Delete a restaurant
// @route   DELETE /api/restaurants/:id
// @access  Private (Restaurant Owner)
const deleteRestaurant = asyncHandler(async (req, res) => {
  const restaurantId = req.params.id;

  // Log the restaurant ID being deleted
  console.log(`Deleting restaurant with ID: ${restaurantId}`);

  // Find the restaurant by ID
  const restaurant = await Restaurant.findById(restaurantId);

  if (!restaurant) {
    res.status(404);
    throw new Error('Restaurant not found');
  }

  // Check if the logged-in user is the owner of the restaurant
  if (restaurant.owner.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to delete this restaurant');
  }

  // Delete the restaurant using deleteOne or findByIdAndDelete
  await Restaurant.findByIdAndDelete(restaurantId);

  res.json({ message: 'Restaurant removed' });
});


// Export the controller functions
const getMyRestaurants = asyncHandler(async (req, res) => {
  const restaurants = await Restaurant.find({ owner: req.user._id })
    .populate({
      path: 'menu',
      populate: {
        path: 'items',
      }
    });
  
  res.json(restaurants);
});
// Export the controller functions
module.exports = {
  createRestaurant,
  getRestaurants,
  getRestaurantById,
  updateRestaurant,
  deleteRestaurant,
  getMyRestaurants  // Ensure this is included in the exports
};
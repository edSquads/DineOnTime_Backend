const express = require('express');
const router = express.Router();
const {
  createRestaurant,
  getRestaurants,
  getRestaurantById,
  updateRestaurant,
  deleteRestaurant,
  getMyRestaurants  // Import the getMyRestaurants function
} = require('../controllers/restaurantController');
const { protect, restaurantOwner } = require('../middleware/authMiddleware');

// Specific route for fetching restaurants owned by the logged-in user
router.route('/myrestaurants')
  .get(protect, getMyRestaurants);

// General route for getting all restaurants or creating a new one
router.route('/')
  .get(getRestaurants)
  .post(protect, restaurantOwner, createRestaurant);

// Route for specific restaurant operations (get by ID, update, delete)
router.route('/:id')
  .get(getRestaurantById)
  .put(protect, restaurantOwner, updateRestaurant)
  .delete(protect, restaurantOwner, deleteRestaurant);

module.exports = router;

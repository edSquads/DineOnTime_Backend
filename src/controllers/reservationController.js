// src/controllers/reservationController.js

const asyncHandler = require('express-async-handler');
const Reservation = require('../models/Reservation');
const Restaurant = require('../models/Restaurant');
const Menu = require('../models/Menu');

// @desc    Create a new reservation
// @route   POST /api/reservations
// @access  Private (Authenticated Users)
const createReservation = asyncHandler(async (req, res) => {
  const { restaurantId, menuIds, date, time, numberOfGuests, specialRequests } = req.body;

  const restaurant = await Restaurant.findById(restaurantId);

  if (!restaurant) {
    res.status(404);
    throw new Error('Restaurant not found');
  }

  // Fetch the menu items using the provided menuIds
  const menuItems = await Menu.findOne(
    { restaurant: restaurantId },
    { items: { $elemMatch: { _id: { $in: menuIds } } } }
  );

  if (!menuItems || menuItems.items.length === 0) {
    res.status(400);
    throw new Error('No valid menu items found');
  }

  // Map the found menu items to their IDs
  const validMenuIds = menuItems.items.map(item => item._id.toString());

  // Ensure that the validMenuIds match the ones passed in
  const selectedMenuIds = menuIds.filter(id => validMenuIds.includes(id.toString()));

  if (selectedMenuIds.length === 0) {
    res.status(400);
    throw new Error('None of the provided menu items are valid');
  }

  let reservation = await Reservation.create({
    user: req.user._id,
    restaurant: restaurantId,
    menu: selectedMenuIds,
    date,
    time,
    numberOfGuests,
    specialRequests,
  });

  // Manually populate the `menu` field
  const populatedMenuItems = menuItems.items.filter(item => selectedMenuIds.includes(item._id.toString()));

  // Populate the `restaurant` field manually as well
  const populatedReservation = {
    ...reservation._doc,
    restaurant: {
      _id: restaurant._id,
      name: restaurant.name,
      address: restaurant.address,
      phoneNumber: restaurant.phoneNumber,
      email: restaurant.email,
      description: restaurant.description,
    },
    menu: populatedMenuItems,
  };

  res.status(201).json(populatedReservation);
});



// @desc    Get all reservations for a user
// @route   GET /api/reservations/myreservations
// @access  Private (Authenticated Users)
const getMyReservations = asyncHandler(async (req, res) => {
  const reservations = await Reservation.find({ user: req.user._id })
    .populate('restaurant', 'name address phoneNumber email description')
    .populate({
      path: 'menu',
      model: 'Menu',  // Ensure this is set to 'Menu'
      select: 'items',
    });

  res.json(reservations);
});

// @desc    Update reservation status
// @route   PUT /api/reservations/:id/status
// @access  Private (Restaurant Owner)
const updateReservationStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const reservation = await Reservation.findById(req.params.id).populate('restaurant');

  if (!reservation) {
    res.status(404);
    throw new Error('Reservation not found');
  }

  if (reservation.restaurant.owner.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to update this reservation');
  }

  reservation.status = status;
  await reservation.save();

  res.json(reservation);
});

// @desc    Get all reservations for a restaurant
// @route   GET /api/restaurants/:restaurantId/reservations
// @access  Private (Restaurant Owner)
const getRestaurantReservations = asyncHandler(async (req, res) => {
  const restaurant = await Restaurant.findById(req.params.restaurantId);

  if (!restaurant) {
    res.status(404);
    throw new Error('Restaurant not found');
  }

  if (restaurant.owner.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to view these reservations');
  }

  const reservations = await Reservation.find({ restaurant: req.params.restaurantId })
    .populate('menu');  // Populating menu items

  res.json(reservations);
});

module.exports = {
  createReservation,
  getMyReservations,
  updateReservationStatus,
  getRestaurantReservations,
};

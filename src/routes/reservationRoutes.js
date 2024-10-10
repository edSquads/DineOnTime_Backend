// src/routes/reservationRoutes.js

const express = require('express');
const router = express.Router();
const {
  createReservation,
  getMyReservations,
  updateReservationStatus,
  getRestaurantReservations,
} = require('../controllers/reservationController');
const { protect, restaurantOwner } = require('../middleware/authMiddleware');

// Define the routes
router.route('/')
  .post(protect, createReservation); // POST /api/reservations

router.route('/myreservations')
  .get(protect, getMyReservations); // GET /api/reservations/myreservations

router.route('/:id/status')
  .put(protect, restaurantOwner, updateReservationStatus); // PUT /api/reservations/:id/status

router.route('/restaurant/:restaurantId')
  .get(protect, restaurantOwner, getRestaurantReservations); // GET /api/restaurants/:restaurantId/reservations

module.exports = router;

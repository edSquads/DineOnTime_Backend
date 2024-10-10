const express = require('express');
const multer = require('multer');
const router = express.Router();
const {
  addMenuItem,
  updateMenuItem,
  removeMenuItem,
  getMenuByRestaurant,
} = require('../controllers/menuController');
const { protect, restaurantOwner } = require('../middleware/authMiddleware');

// Multer configuration for handling file uploads (In-memory storage for S3)
const storage = multer.memoryStorage(); // Use memory storage for uploading to S3
const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 }, // 5 MB size limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, JPG, and PNG files are allowed'), false);
    }
  },
});

// Route to add a new menu item with optional image upload
router.post(
  '/:restaurantId/menu',
  protect,
  restaurantOwner,
  upload.single('image'), // Multer middleware for file handling
  addMenuItem
);

router
  .route('/:restaurantId/menu/:itemId')
  .put(protect, restaurantOwner, upload.single('image'), updateMenuItem) // Multer for updating the image
  .delete(protect, restaurantOwner, removeMenuItem);

router.route('/:restaurantId/menu').get(protect, getMenuByRestaurant);

module.exports = router;

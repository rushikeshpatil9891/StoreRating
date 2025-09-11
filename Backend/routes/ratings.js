const express = require('express');
const router = express.Router();
const RatingController = require('../controllers/ratingController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Submit or update a rating
router.post('/', authenticateToken, RatingController.submitRating);

// Get user's rating for a specific store
router.get('/user/:store_id', authenticateToken, RatingController.getUserRatingForStore);

// Get all ratings for a store
router.get('/store/:store_id', authenticateToken, RatingController.getStoreRatings);

// Get rating statistics for a store (store owners and admin)
router.get('/store/:store_id/stats', authenticateToken, RatingController.getStoreRatingStats);

// Get all ratings by current user
router.get('/user', authenticateToken, RatingController.getUserRatings);

// Delete user's rating for a store
router.delete('/:store_id', authenticateToken, RatingController.deleteRating);

// Get overall rating statistics (Admin only)
router.get('/stats', authenticateToken, authorizeRoles('admin'), RatingController.getOverallStats);

module.exports = router;

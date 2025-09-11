const Rating = require('../models/Rating');
const Store = require('../models/Store');

class RatingController {
  // Submit or update a rating
  static async submitRating(req, res) {
    try {
      const { store_id, rating } = req.body;
      const userId = req.user.id;

      // Validate rating value
      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({
          error: 'Rating must be between 1 and 5'
        });
      }

      // Check if store exists
      const store = await Store.findById(store_id);
      if (!store) {
        return res.status(404).json({
          error: 'Store not found'
        });
      }

      // Submit or update rating
      await Rating.upsert(userId, store_id, rating);

      // Get updated store stats
      const stats = await Rating.getStoreStats(store_id);

      res.json({
        message: 'Rating submitted successfully',
        rating: {
          store_id,
          rating,
          user_id: userId
        },
        store_stats: stats
      });

    } catch (error) {
      console.error('Submit rating error:', error);
      res.status(500).json({
        error: 'Internal server error during rating submission'
      });
    }
  }

  // Get user's rating for a specific store
  static async getUserRatingForStore(req, res) {
    try {
      const { store_id } = req.params;
      const userId = req.user.id;

      const rating = await Rating.findByUserAndStore(userId, store_id);

      if (!rating) {
        return res.json({
          rating: null,
          message: 'No rating found for this store'
        });
      }

      res.json({ rating });
    } catch (error) {
      console.error('Get user rating error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get all ratings for a store
  static async getStoreRatings(req, res) {
    try {
      const { store_id } = req.params;
      const {
        sortBy = 'created_at',
        sortOrder = 'desc',
        limit,
        offset
      } = req.query;

      // Check if store exists
      const store = await Store.findById(store_id);
      if (!store) {
        return res.status(404).json({
          error: 'Store not found'
        });
      }

      const filters = {
        sortBy,
        sortOrder
      };

      // Only add limit/offset if they are provided and valid
      const limitNum = limit ? parseInt(limit) : null;
      const offsetNum = offset ? parseInt(offset) : null;

      if (limitNum && !isNaN(limitNum) && limitNum > 0) {
        filters.limit = limitNum;
      }

      if (offsetNum && !isNaN(offsetNum) && offsetNum >= 0) {
        filters.offset = offsetNum;
      }

      const ratings = await Rating.findByStore(store_id, filters);
      const stats = await Rating.getStoreStats(store_id);
      const distribution = await Rating.getRatingDistribution(store_id);

      res.json({
        store: {
          id: store.id,
          name: store.name,
          average_rating: stats.average_rating || 0,
          total_ratings: stats.total_ratings || 0
        },
        ratings,
        statistics: {
          ...stats,
          distribution
        },
        pagination: {
          limit: filters.limit,
          offset: filters.offset
        }
      });
    } catch (error) {
      console.error('Get store ratings error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get all ratings by current user
  static async getUserRatings(req, res) {
    try {
      const userId = req.user.id;
      const {
        sortBy = 'created_at',
        sortOrder = 'desc',
        limit,
        offset
      } = req.query;

      const filters = {
        sortBy,
        sortOrder
      };

      // Only add limit/offset if they are provided and valid
      const limitNum = limit ? parseInt(limit) : null;
      const offsetNum = offset ? parseInt(offset) : null;

      if (limitNum && !isNaN(limitNum) && limitNum > 0) {
        filters.limit = limitNum;
      }

      if (offsetNum && !isNaN(offsetNum) && offsetNum >= 0) {
        filters.offset = offsetNum;
      }

      const ratings = await Rating.findByUser(userId, filters);

      res.json({
        ratings,
        pagination: {
          limit: filters.limit,
          offset: filters.offset
        }
      });
    } catch (error) {
      console.error('Get user ratings error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Delete user's rating for a store
  static async deleteRating(req, res) {
    try {
      const { store_id } = req.params;
      const userId = req.user.id;

      const deleted = await Rating.delete(userId, store_id);

      if (!deleted) {
        return res.status(404).json({
          error: 'Rating not found'
        });
      }

      res.json({ message: 'Rating deleted successfully' });
    } catch (error) {
      console.error('Delete rating error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get rating statistics for a store (for store owners)
  static async getStoreRatingStats(req, res) {
    try {
      const { store_id } = req.params;
      const requestingUser = req.user;

      // Check if store exists and user owns it
      const store = await Store.findById(store_id);
      if (!store) {
        return res.status(404).json({
          error: 'Store not found'
        });
      }

      if (requestingUser.role !== 'admin' && store.owner_id != requestingUser.id) {
        return res.status(403).json({
          error: 'You can only view statistics for your own stores'
        });
      }

      const stats = await Rating.getStoreStats(store_id);
      const distribution = await Rating.getRatingDistribution(store_id);

      res.json({
        store: {
          id: store.id,
          name: store.name
        },
        statistics: {
          ...stats,
          distribution
        }
      });
    } catch (error) {
      console.error('Get store rating stats error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get overall rating statistics (Admin only)
  static async getOverallStats(req, res) {
    try {
      const stats = await Rating.getOverallStats();
      res.json({ statistics: stats });
    } catch (error) {
      console.error('Get overall stats error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = RatingController;

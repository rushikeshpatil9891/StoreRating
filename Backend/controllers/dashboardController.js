const User = require('../models/User');
const Store = require('../models/Store');
const Rating = require('../models/Rating');

class DashboardController {
  // Admin Dashboard
  static async getAdminDashboard(req, res) {
    try {
      // Get user statistics
      const userStats = await User.getCountByRole();

      // Get store statistics
      const storeStats = await Store.getStats();

      // Get rating statistics
      const ratingStats = await Rating.getOverallStats();

      // Get recent users
      const recentUsers = await User.findAll({
        sortBy: 'created_at',
        sortOrder: 'desc',
        limit: 5
      });

      // Get recent stores
      const recentStores = await Store.findAll({
        sortBy: 'created_at',
        sortOrder: 'desc',
        limit: 5
      });

      // Get top rated stores
      const topRatedStores = await Store.findAll({
        sortBy: 'average_rating',
        sortOrder: 'desc',
        limit: 5
      });

      const dashboard = {
        statistics: {
          total_users: userStats.reduce((sum, stat) => sum + stat.count, 0),
          total_stores: storeStats.total_stores,
          total_ratings: ratingStats.total_ratings,
          average_rating: ratingStats.average_rating || 0,
          users_by_role: userStats.reduce((acc, stat) => {
            acc[stat.role] = stat.count;
            return acc;
          }, {})
        },
        recent_activity: {
          users: recentUsers,
          stores: recentStores
        },
        top_rated_stores: topRatedStores
      };

      res.json(dashboard);
    } catch (error) {
      console.error('Get admin dashboard error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Store Owner Dashboard
  static async getStoreOwnerDashboard(req, res) {
    try {
      const ownerId = req.user.id;

      // Get stores owned by this user
      const stores = await Store.findByOwner(ownerId);

      // Get detailed information for each store
      const storesWithDetails = await Promise.all(
        stores.map(async (store) => {
          const stats = await Rating.getStoreStats(store.id);
          const distribution = await Rating.getRatingDistribution(store.id);

          // Get recent ratings
          const recentRatings = await Rating.findByStore(store.id, {
            sortBy: 'created_at',
            sortOrder: 'desc',
            limit: 5
          });

          return {
            ...store,
            statistics: {
              ...stats,
              distribution
            },
            recent_ratings: recentRatings
          };
        })
      );

      // Calculate overall statistics for all stores
      const totalRatings = storesWithDetails.reduce((sum, store) => sum + store.total_ratings, 0);
      const averageRating = storesWithDetails.length > 0
        ? storesWithDetails.reduce((sum, store) => sum + (store.average_rating || 0), 0) / storesWithDetails.length
        : 0;

      const dashboard = {
        overview: {
          total_stores: storesWithDetails.length,
          total_ratings: totalRatings,
          average_rating: averageRating
        },
        stores: storesWithDetails
      };

      res.json(dashboard);
    } catch (error) {
      console.error('Get store owner dashboard error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Normal User Dashboard
  static async getUserDashboard(req, res) {
    try {
      const userId = req.user.id;

      // Get user's ratings
      const userRatings = await Rating.findByUser(userId, {
        sortBy: 'created_at',
        sortOrder: 'desc',
        limit: 10,
        offset: 0
      });

      // Get stores with user's ratings
      const storesWithUserRating = await Promise.all(
        userRatings.map(async (rating) => {
          const store = await Store.findById(rating.store_id);
          return {
            ...store,
            user_rating: rating.rating,
            rated_at: rating.created_at
          };
        })
      );

      // Get popular stores (for discovery)
      const popularStores = await Store.findAll({
        sortBy: 'average_rating',
        sortOrder: 'desc',
        limit: 5
      });

      // Filter out stores already rated by user
      const ratedStoreIds = userRatings.map(r => r.store_id);
      const unratedPopularStores = popularStores.filter(store =>
        !ratedStoreIds.includes(store.id)
      );

      const dashboard = {
        my_ratings: {
          total_ratings: userRatings.length,
          ratings: storesWithUserRating
        },
        discover: {
          popular_stores: unratedPopularStores
        }
      };

      res.json(dashboard);
    } catch (error) {
      console.error('Get user dashboard error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get dashboard based on user role
  static async getDashboard(req, res) {
    const userRole = req.user.role;

    switch (userRole) {
      case 'admin':
        return DashboardController.getAdminDashboard(req, res);
      case 'store_owner':
        return DashboardController.getStoreOwnerDashboard(req, res);
      case 'normal_user':
        return DashboardController.getUserDashboard(req, res);
      default:
        return res.status(400).json({ error: 'Invalid user role' });
    }
  }
}

module.exports = DashboardController;

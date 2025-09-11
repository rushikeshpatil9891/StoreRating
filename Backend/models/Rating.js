const { execute } = require('../config/database');

class Rating {
  // Create a new rating or update existing one
  static async upsert(userId, storeId, rating) {
    const query = `
      INSERT INTO ratings (user_id, store_id, rating)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE
        rating = VALUES(rating),
        updated_at = CURRENT_TIMESTAMP
    `;

    const result = await execute(query, [userId, storeId, rating]);
    return result.insertId || result.affectedRows;
  }

  // Find rating by user and store
  static async findByUserAndStore(userId, storeId) {
    const query = 'SELECT * FROM ratings WHERE user_id = ? AND store_id = ?';
    const ratings = await execute(query, [userId, storeId]);
    return ratings[0];
  }

  // Get all ratings for a store
  static async findByStore(storeId, filters = {}) {
    let query = `
      SELECT r.*,
             u.name as user_name,
             u.email as user_email
      FROM ratings r
      JOIN users u ON r.user_id = u.id
      WHERE r.store_id = ?
    `;

    const params = [storeId];

    // Sorting - validate column names to prevent SQL injection
    const allowedSortColumns = ['id', 'rating', 'comment', 'created_at', 'updated_at'];
    const sortBy = allowedSortColumns.includes(filters.sortBy) ? filters.sortBy : 'created_at';
    const sortOrder = filters.sortOrder === 'asc' ? 'ASC' : 'DESC';
    query += ` ORDER BY r.\`${sortBy}\` ${sortOrder}`;

    // Pagination - only add if valid numbers
    if (filters.limit && typeof filters.limit === 'number' && filters.limit > 0) {
      if (filters.offset && typeof filters.offset === 'number' && filters.offset >= 0) {
        query += ` LIMIT ${filters.limit} OFFSET ${filters.offset}`;
      } else {
        query += ` LIMIT ${filters.limit}`;
      }
    } else if (filters.offset && typeof filters.offset === 'number' && filters.offset >= 0) {
      // If only offset is provided, we need to provide a large limit
      query += ` LIMIT 18446744073709551615 OFFSET ${filters.offset}`;
    }

    const ratings = await execute(query, params);
    return ratings;
  }

  // Get all ratings by a user
  static async findByUser(userId, filters = {}) {
    let query = `
      SELECT r.*,
             s.name as store_name,
             s.email as store_email,
             s.address as store_address
      FROM ratings r
      JOIN stores s ON r.store_id = s.id
      WHERE r.user_id = ?
    `;

    const params = [userId];

    // Sorting - validate column names to prevent SQL injection
    const allowedSortColumns = ['id', 'rating', 'comment', 'created_at', 'updated_at'];
    const sortBy = allowedSortColumns.includes(filters.sortBy) ? filters.sortBy : 'created_at';
    const sortOrder = filters.sortOrder === 'asc' ? 'ASC' : 'DESC';
    query += ` ORDER BY r.\`${sortBy}\` ${sortOrder}`;

    // Pagination - only add if valid numbers
    if (filters.limit && typeof filters.limit === 'number' && filters.limit > 0) {
      if (filters.offset && typeof filters.offset === 'number' && filters.offset >= 0) {
        query += ` LIMIT ${filters.limit} OFFSET ${filters.offset}`;
      } else {
        query += ` LIMIT ${filters.limit}`;
      }
    } else if (filters.offset && typeof filters.offset === 'number' && filters.offset >= 0) {
      // If only offset is provided, we need to provide a large limit
      query += ` LIMIT 18446744073709551615 OFFSET ${filters.offset}`;
    }

    const ratings = await execute(query, params);
    return ratings;
  }

  // Delete rating
  static async delete(userId, storeId) {
    const query = 'DELETE FROM ratings WHERE user_id = ? AND store_id = ?';
    const result = await execute(query, [userId, storeId]);
    return result.affectedRows > 0;
  }

  // Get rating statistics for a store
  static async getStoreStats(storeId) {
    const query = `
      SELECT
        COUNT(*) as total_ratings,
        AVG(rating) as average_rating,
        MIN(rating) as min_rating,
        MAX(rating) as max_rating
      FROM ratings
      WHERE store_id = ?
    `;
    const stats = await execute(query, [storeId]);
    return stats[0];
  }

  // Get rating distribution for a store (count of each rating 1-5)
  static async getRatingDistribution(storeId) {
    const query = `
      SELECT rating, COUNT(*) as count
      FROM ratings
      WHERE store_id = ?
      GROUP BY rating
      ORDER BY rating
    `;
    const distribution = await execute(query, [storeId]);

    // Format as object with ratings 1-5
    const formatted = {};
    for (let i = 1; i <= 5; i++) {
      formatted[i] = 0;
    }

    distribution.forEach(item => {
      formatted[item.rating] = item.count;
    });

    return formatted;
  }

  // Get overall rating statistics
  static async getOverallStats() {
    const query = `
      SELECT
        COUNT(*) as total_ratings,
        AVG(rating) as average_rating
      FROM ratings
    `;
    const stats = await execute(query);
    return stats[0];
  }
}

module.exports = Rating;

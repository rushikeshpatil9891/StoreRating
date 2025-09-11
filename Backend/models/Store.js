const { execute } = require('../config/database');

class Store {
  // Create a new store
  static async create(storeData) {
    const { name, email, address, owner_id } = storeData;

    const query = `
      INSERT INTO stores (name, email, address, owner_id)
      VALUES (?, ?, ?, ?)
    `;

    const result = await execute(query, [name, email, address, owner_id]);
    return result.insertId;
  }

  // Find store by ID
  static async findById(id) {
    const query = `
      SELECT s.*, u.name as owner_name, u.email as owner_email
      FROM stores s
      LEFT JOIN users u ON s.owner_id = u.id
      WHERE s.id = ?
    `;
    const stores = await execute(query, [id]);
    return stores[0];
  }

  // Find store by email
  static async findByEmail(email) {
    const query = 'SELECT * FROM stores WHERE email = ?';
    const stores = await execute(query, [email]);
    return stores[0];
  }

  // Get all stores with optional filters and average rating
  static async findAll(filters = {}) {
    let query = `
      SELECT s.*,
             u.name as owner_name,
             u.email as owner_email,
             COALESCE(AVG(r.rating), 0) as average_rating,
             COUNT(r.id) as total_ratings
      FROM stores s
      LEFT JOIN users u ON s.owner_id = u.id
      LEFT JOIN ratings r ON s.id = r.store_id
      WHERE 1=1
    `;

    const params = [];
    const groupBy = ' GROUP BY s.id, u.id, u.name, u.email';

    if (filters.owner_id) {
      query += ' AND s.owner_id = ?';
      params.push(filters.owner_id);
    }

    if (filters.name) {
      query += ' AND s.name LIKE ?';
      params.push(`%${filters.name}%`);
    }

    if (filters.email) {
      query += ' AND s.email LIKE ?';
      params.push(`%${filters.email}%`);
    }

    if (filters.address) {
      query += ' AND s.address LIKE ?';
      params.push(`%${filters.address}%`);
    }

    query += groupBy;

    // Sorting - validate column names to prevent SQL injection
    const allowedSortColumns = ['id', 'name', 'category', 'location', 'address', 'created_at', 'average_rating'];
    const sortBy = allowedSortColumns.includes(filters.sortBy) ? filters.sortBy : 'created_at';
    const sortOrder = filters.sortOrder === 'asc' ? 'ASC' : 'DESC';

    // Handle sorting by average_rating
    if (sortBy === 'average_rating') {
      query += ` ORDER BY average_rating ${sortOrder}`;
    } else {
      query += ` ORDER BY s.\`${sortBy}\` ${sortOrder}`;
    }

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

    const stores = await execute(query, params);
    return stores;
  }

  // Update store
  static async update(id, updateData) {
    const { name, email, address, owner_id } = updateData;

    let query = 'UPDATE stores SET';
    const params = [];
    const updates = [];

    if (name) {
      updates.push(' name = ?');
      params.push(name);
    }

    if (email) {
      updates.push(' email = ?');
      params.push(email);
    }

    if (address !== undefined) {
      updates.push(' address = ?');
      params.push(address);
    }

    if (owner_id !== undefined) {
      updates.push(' owner_id = ?');
      params.push(owner_id);
    }

    if (updates.length === 0) {
      throw new Error('No fields to update');
    }

    query += updates.join(',') + ' WHERE id = ?';
    params.push(id);

    await execute(query, params);
    return true;
  }

  // Delete store
  static async delete(id) {
    const query = 'DELETE FROM stores WHERE id = ?';
    await execute(query, [id]);
    return true;
  }

  // Get stores owned by a specific user
  static async findByOwner(ownerId) {
    const query = `
      SELECT s.*,
             COALESCE(AVG(r.rating), 0) as average_rating,
             COUNT(r.id) as total_ratings
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      WHERE s.owner_id = ?
      GROUP BY s.id
    `;
    const stores = await execute(query, [ownerId]);
    return stores;
  }

  // Get store statistics
  static async getStats() {
    const query = 'SELECT COUNT(*) as total_stores FROM stores';
    const result = await execute(query);
    return {
      total_stores: result[0].total_stores
    };
  }

  // Get store with its ratings
  static async getStoreWithRatings(storeId) {
    // Get store details
    const store = await this.findById(storeId);
    if (!store) return null;

    // Get all ratings for this store
    const ratingsQuery = `
      SELECT r.*,
             u.name as user_name,
             u.email as user_email
      FROM ratings r
      JOIN users u ON r.user_id = u.id
      WHERE r.store_id = ?
      ORDER BY r.created_at DESC
    `;
    const ratings = await execute(ratingsQuery, [storeId]);

    return {
      ...store,
      ratings,
      average_rating: ratings.length > 0
        ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
        : 0,
      total_ratings: ratings.length
    };
  }
}

module.exports = Store;

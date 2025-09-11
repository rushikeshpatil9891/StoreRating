const { execute } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  // Create a new user
  static async create(userData) {
    const { name, email, address, password, role = 'normal_user' } = userData;

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const query = `
      INSERT INTO users (name, email, address, password, role)
      VALUES (?, ?, ?, ?, ?)
    `;

    const result = await execute(query, [name, email, address, hashedPassword, role]);
    return result.insertId;
  }

  // Find user by email
  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = ?';
    const users = await execute(query, [email]);
    return users[0];
  }

  // Find user by ID
  static async findById(id) {
    const query = 'SELECT id, name, email, address, role, created_at FROM users WHERE id = ?';
    const users = await execute(query, [id]);
    return users[0];
  }

  // Get all users with optional filters
  static async findAll(filters = {}) {
    let query = 'SELECT id, name, email, address, role, created_at FROM users WHERE 1=1';
    const params = [];

    if (filters.role) {
      query += ' AND role = ?';
      params.push(filters.role);
    }

    if (filters.name) {
      query += ' AND name LIKE ?';
      params.push(`%${filters.name}%`);
    }

    if (filters.email) {
      query += ' AND email LIKE ?';
      params.push(`%${filters.email}%`);
    }

    // Sorting - validate column names to prevent SQL injection
    const allowedSortColumns = ['id', 'name', 'email', 'role', 'created_at'];
    const sortBy = allowedSortColumns.includes(filters.sortBy) ? filters.sortBy : 'created_at';
    const sortOrder = filters.sortOrder === 'asc' ? 'ASC' : 'DESC';
    query += ` ORDER BY \`${sortBy}\` ${sortOrder}`;

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

    const users = await execute(query, params);
    return users;
  }

  // Update user
  static async update(id, updateData) {
    const { name, email, address, password } = updateData;

    let query = 'UPDATE users SET';
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

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updates.push(' password = ?');
      params.push(hashedPassword);
    }

    if (updates.length === 0) {
      throw new Error('No fields to update');
    }

    query += updates.join(',') + ' WHERE id = ?';
    params.push(id);

    await execute(query, params);
    return true;
  }

  // Delete user
  static async delete(id) {
    const query = 'DELETE FROM users WHERE id = ?';
    await execute(query, [id]);
    return true;
  }

  // Get user count by role
  static async getCountByRole() {
    const query = 'SELECT role, COUNT(*) as count FROM users GROUP BY role';
    const result = await execute(query);
    return result;
  }

  // Verify password
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}

module.exports = User;

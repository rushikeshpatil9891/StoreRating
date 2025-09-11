const User = require('../models/User');

class UserController {
  // Get all users (Admin only)
  static async getAllUsers(req, res) {
    try {
      const {
        role,
        name,
        email,
        sortBy = 'created_at',
        sortOrder = 'desc',
        limit = 10,
        offset = 0
      } = req.query;

      const filters = {
        role,
        name,
        email,
        sortBy,
        sortOrder
      };

      // Only add limit/offset if they are valid numbers
      if (limit && !isNaN(parseInt(limit))) {
        filters.limit = parseInt(limit);
      }

      if (offset && !isNaN(parseInt(offset))) {
        filters.offset = parseInt(offset);
      }

      const users = await User.findAll(filters);

      res.json({
        users,
        pagination: {
          limit: filters.limit || null,
          offset: filters.offset || 0
        }
      });
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get user by ID
  static async getUserById(req, res) {
    try {
      const { id } = req.params;
      const user = await User.findById(id);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({ user });
    } catch (error) {
      console.error('Get user by ID error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Create new user (Admin only)
  static async createUser(req, res) {
    try {
      const { name, email, address, password, role = 'normal_user' } = req.body;

      // Validate role
      const validRoles = ['admin', 'store_owner', 'normal_user'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({
          error: 'Invalid role. Must be one of: admin, store_owner, normal_user'
        });
      }

      // Check if user already exists
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({
          error: 'User with this email already exists'
        });
      }

      // Create new user
      const userId = await User.create({
        name,
        email,
        address,
        password,
        role
      });

      // Get the created user (without password)
      const newUser = await User.findById(userId);

      res.status(201).json({
        message: 'User created successfully',
        user: newUser
      });

    } catch (error) {
      console.error('Create user error:', error);
      res.status(500).json({
        error: 'Internal server error during user creation'
      });
    }
  }

  // Update user
  static async updateUser(req, res) {
    try {
      const { id } = req.params;
      const { name, email, address, role } = req.body;
      const requestingUser = req.user;

      // Users can only update their own profile unless they're admin
      if (requestingUser.role !== 'admin' && requestingUser.id != id) {
        return res.status(403).json({
          error: 'You can only update your own profile'
        });
      }

      // Prepare update data
      const updateData = {};
      if (name) updateData.name = name;
      if (email) updateData.email = email;
      if (address !== undefined) updateData.address = address;

      // Only admin can change roles
      if (role && requestingUser.role === 'admin') {
        const validRoles = ['admin', 'store_owner', 'normal_user'];
        if (!validRoles.includes(role)) {
          return res.status(400).json({
            error: 'Invalid role. Must be one of: admin, store_owner, normal_user'
          });
        }
        updateData.role = role;
      }

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
      }

      await User.update(id, updateData);

      // Get updated user
      const updatedUser = await User.findById(id);

      res.json({
        message: 'User updated successfully',
        user: updatedUser
      });
    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Delete user (Admin only)
  static async deleteUser(req, res) {
    try {
      const { id } = req.params;

      // Check if user exists
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Prevent deleting admin users
      if (user.role === 'admin') {
        return res.status(403).json({
          error: 'Cannot delete admin users'
        });
      }

      await User.delete(id);

      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get user statistics (Admin only)
  static async getUserStats(req, res) {
    try {
      const stats = await User.getCountByRole();

      // Format the stats
      const formattedStats = {
        total_users: stats.reduce((sum, stat) => sum + stat.count, 0),
        by_role: stats.reduce((acc, stat) => {
          acc[stat.role] = stat.count;
          return acc;
        }, {})
      };

      res.json({ stats: formattedStats });
    } catch (error) {
      console.error('Get user stats error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = UserController;

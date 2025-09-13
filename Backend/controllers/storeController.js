const Store = require('../models/Store');

class StoreController {
  // Get all stores
  static async getAllStores(req, res) {
    try {
      const {
        name,
        email,
        address,
        sortBy = 'created_at',
        sortOrder = 'desc',
        limit,
        offset
      } = req.query;

      const filters = {
        name,
        email,
        address,
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

      const stores = await Store.findAll(filters);

      res.json({
        stores,
        pagination: {
          limit: filters.limit || null,
          offset: filters.offset || 0
        }
      });
    } catch (error) {
      console.error('Get stores error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get store by ID
  static async getStoreById(req, res) {
    try {
      const { id } = req.params;
      const store = await Store.findById(id);

      if (!store) {
        return res.status(404).json({ error: 'Store not found' });
      }

      res.json({ store });
    } catch (error) {
      console.error('Get store by ID error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get stores owned by current user (for store owners)
  static async getMyStores(req, res) {
    try {
      const ownerId = req.user.id;
      const stores = await Store.findByOwner(ownerId);

      res.json({ stores });
    } catch (error) {
      console.error('Get my stores error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get stores by owner ID (Admin only)
  static async getStoresByOwnerId(req, res) {
    try {
      const { ownerId } = req.params;
      const stores = await Store.findByOwner(ownerId);

      res.json({ stores });
    } catch (error) {
      console.error('Get stores by owner ID error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Create new store (Admin only)
  static async createStore(req, res) {
    try {
      const { name, email, address, owner_id } = req.body;

      // Validate required fields
      if (!name || !email) {
        return res.status(400).json({
          error: 'Name and email are required'
        });
      }

      // Check if store with this email already exists
      const existingStore = await Store.findByEmail(email);
      if (existingStore) {
        return res.status(400).json({
          error: 'Store with this email already exists'
        });
      }

      // Create new store
      const storeId = await Store.create({
        name,
        email,
        address,
        owner_id
      });

      // Get the created store
      const newStore = await Store.findById(storeId);

      res.status(201).json({
        message: 'Store created successfully',
        store: newStore
      });

    } catch (error) {
      console.error('Create store error:', error);
      res.status(500).json({
        error: 'Internal server error during store creation'
      });
    }
  }

  // Update store
  static async updateStore(req, res) {
    try {
      const { id } = req.params;
      const { name, email, address, owner_id } = req.body;
      const requestingUser = req.user;

      // Check if store exists
      const existingStore = await Store.findById(id);
      if (!existingStore) {
        return res.status(404).json({ error: 'Store not found' });
      }

      // Check permissions: Admin can update any store, store owner can only update their own stores
      if (requestingUser.role !== 'admin' && existingStore.owner_id != requestingUser.id) {
        return res.status(403).json({
          error: 'You can only update your own stores'
        });
      }

      // Prepare update data
      const updateData = {};
      if (name) updateData.name = name;
      if (email) updateData.email = email;
      if (address !== undefined) updateData.address = address;

      // Only admin can change owner
      if (owner_id !== undefined && requestingUser.role === 'admin') {
        updateData.owner_id = owner_id;
      }

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
      }

      await Store.update(id, updateData);

      // Get updated store
      const updatedStore = await Store.findById(id);

      res.json({
        message: 'Store updated successfully',
        store: updatedStore
      });
    } catch (error) {
      console.error('Update store error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Delete store (Admin only)
  static async deleteStore(req, res) {
    try {
      const { id } = req.params;

      // Check if store exists
      const store = await Store.findById(id);
      if (!store) {
        return res.status(404).json({ error: 'Store not found' });
      }

      await Store.delete(id);

      res.json({ message: 'Store deleted successfully' });
    } catch (error) {
      console.error('Delete store error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get store statistics (Admin only)
  static async getStoreStats(req, res) {
    try {
      const stats = await Store.getStats();
      res.json({ stats });
    } catch (error) {
      console.error('Get store stats error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get store with ratings (for store owners to see their store details)
  static async getStoreWithRatings(req, res) {
    try {
      const { id } = req.params;
      const requestingUser = req.user;

      const store = await Store.getStoreWithRatings(id);

      if (!store) {
        return res.status(404).json({ error: 'Store not found' });
      }

      // Check permissions: Admin can view any store, store owner can only view their own stores
      if (requestingUser.role !== 'admin' && store.owner_id != requestingUser.id) {
        return res.status(403).json({
          error: 'You can only view your own stores'
        });
      }

      res.json({ store });
    } catch (error) {
      console.error('Get store with ratings error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = StoreController;

const express = require('express');
const router = express.Router();
const StoreController = require('../controllers/storeController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Get all stores (public for normal users, filtered for others)
router.get('/', authenticateToken, StoreController.getAllStores);

// Get store statistics (Admin only)
router.get('/stats', authenticateToken, authorizeRoles('admin'), StoreController.getStoreStats);

// Get stores owned by current user (Store owners)
router.get('/my-stores', authenticateToken, authorizeRoles('store_owner'), StoreController.getMyStores);

// Get stores by owner ID (Admin only)
router.get('/owner/:ownerId', authenticateToken, authorizeRoles('admin'), StoreController.getStoresByOwnerId);

// Get store by ID
router.get('/:id', authenticateToken, StoreController.getStoreById);

// Get store with ratings (for store owners to see detailed view)
router.get('/:id/details', authenticateToken, StoreController.getStoreWithRatings);

// Create new store (Admin only)
router.post('/', authenticateToken, authorizeRoles('admin'), StoreController.createStore);

// Update store
router.put('/:id', authenticateToken, StoreController.updateStore);

// Delete store (Admin only)
router.delete('/:id', authenticateToken, authorizeRoles('admin'), StoreController.deleteStore);

module.exports = router;

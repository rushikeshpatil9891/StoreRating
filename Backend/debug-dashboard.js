require('dotenv').config();

const User = require('./models/User');
const Store = require('./models/Store');
const Rating = require('./models/Rating');

async function debugDashboard() {
  try {
    console.log('Testing User.getCountByRole()...');
    const userStats = await User.getCountByRole();
    console.log('User stats:', userStats);

    console.log('Testing Store.getStats()...');
    const storeStats = await Store.getStats();
    console.log('Store stats:', storeStats);

    console.log('Testing Rating.getOverallStats()...');
    const ratingStats = await Rating.getOverallStats();
    console.log('Rating stats:', ratingStats);

    console.log('Testing User.findAll()...');
    const userFilters = {
      sortBy: 'created_at',
      sortOrder: 'desc',
      limit: 5
    };
    console.log('User filters:', userFilters);

    // Let's manually build the query to debug
    let query = 'SELECT id, name, email, address, role, created_at FROM users WHERE 1=1';
    const params = [];
    const sortBy = 'created_at';
    const sortOrder = 'DESC';
    query += ` ORDER BY \`${sortBy}\` ${sortOrder}`;
    query += ' LIMIT ?';
    params.push(5);

    console.log('Manual query:', query);
    console.log('Manual params:', params);

    const recentUsers = await User.findAll(userFilters);
    console.log('Recent users:', recentUsers);

    console.log('Testing Store.findAll()...');
    const recentStores = await Store.findAll({
      sortBy: 'created_at',
      sortOrder: 'desc',
      limit: 5
    });
    console.log('Recent stores:', recentStores);

    console.log('Testing Store.findAll() with average_rating...');
    const topRatedStores = await Store.findAll({
      sortBy: 'average_rating',
      sortOrder: 'desc',
      limit: 5
    });
    console.log('Top rated stores:', topRatedStores);

  } catch (error) {
    console.error('Error:', error);
  }
}

debugDashboard();

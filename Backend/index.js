const dotenv = require('dotenv');

// Load environment variables FIRST
const result = dotenv.config({ path: __dirname + '/.env' });
if (result.error) {
  console.error('Error loading .env file:', result.error);
} else {
  console.log('Environment variables loaded successfully');
}

const express = require('express');
const cors = require('cors');
const { startSelfPinging } = require('./controllers/healthController');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
console.log('Middleware configured');

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/stores', require('./routes/stores'));
app.use('/api/ratings', require('./routes/ratings'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/activities', require('./routes/activityLogs'));
app.use('/api/health', require('./routes/health'));
console.log('Routes configured');

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Health check available at http://localhost:${PORT}/api/health`);

  // Start self-pinging to keep free instance awake
  startSelfPinging(PORT);
});

module.exports = app;

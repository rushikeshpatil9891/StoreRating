const db = require('../config/database');
const http = require('http');
const https = require('https');

const checkHealth = async (req, res) => {
  try {
    // Test database connection
    await db.execute('SELECT 1');
    res.json({
      status: 'OK',
      message: 'Server and database are running',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({
      status: 'ERROR',
      message: 'Database connection failed',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
};

// Self-pinging function to keep free instance awake
const startSelfPinging = (port) => {
  const selfPing = () => {
    const isProduction = process.env.NODE_ENV === 'production' || process.env.SELF_PING_HOST;
    const pingHost = process.env.SELF_PING_HOST || 'localhost';
    const useHttps = isProduction || pingHost.includes('render.com');

    const options = {
      hostname: pingHost,
      port: useHttps ? 443 : port,
      path: '/api/health',
      method: 'GET',
      timeout: 10000 // 10 second timeout
    };

    const client = useHttps ? https : http;
    const req = client.request(options, (res) => {
      console.log(`Self-ping: Health check response - ${res.statusCode} at ${new Date().toISOString()}`);
    });

    req.on('error', (err) => {
      console.error('Self-ping error:', err.message);
    });

    req.on('timeout', () => {
      console.error('Self-ping timeout');
      req.destroy();
    });

    req.end();
  };

  // Ping every 3 minutes (180,000 milliseconds) to keep the instance awake
  setInterval(selfPing, 180000);
  console.log('Self-pinging enabled - health check will be called every 3 minutes');

  // Initial ping after 30 seconds
  setTimeout(selfPing, 30000);
};

module.exports = {
  checkHealth,
  startSelfPinging
};
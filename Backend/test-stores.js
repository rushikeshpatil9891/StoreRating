const http = require('http');
const jwt = require('jsonwebtoken');

async function testStoresEndpoint() {
  try {
    // Generate admin token
    const token = jwt.sign({ id: 1, role: 'admin' }, 'your-secret-key');

    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/stores',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };

    return new Promise((resolve, reject) => {
      const req = http.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            console.log('Stores endpoint working!');
            console.log('Status:', res.statusCode);
            console.log('Response:', response);
            resolve(response);
          } catch (parseError) {
            console.log('Raw response:', data);
            resolve(data);
          }
        });
      });

      req.on('error', (error) => {
        console.log('Error testing stores endpoint:', error.message);
        reject(error);
      });

      req.end();
    });
  } catch (error) {
    console.log('Error generating token or setting up request:', error.message);
  }
}

testStoresEndpoint();

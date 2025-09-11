const bcrypt = require('bcryptjs');

// Generate correct hash for admin123
async function generateAdminHash() {
  const saltRounds = 10;
  const hash = await bcrypt.hash('admin123', saltRounds);
  console.log('Correct hash for admin123:', hash);

  // Test the hash
  const isValid = await bcrypt.compare('admin123', hash);
  console.log('Verification test:', isValid);
}

generateAdminHash();

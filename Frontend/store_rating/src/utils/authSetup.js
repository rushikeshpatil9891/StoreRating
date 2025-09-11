// Authentication setup utility
const setupAuth = () => {
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJwZ0BnbWFpbC5jb20iLCJyb2xlIjoibm9ybWFsX3VzZXIiLCJpYXQiOjE3NTc2MTA2ODcsImV4cCI6MTc1ODIxNTQ4N30.pwgNVpNPdMGMMuPIncVt2caLY8kkJFnCe9bARELh1KI';

  const userData = {
    id: 2,
    email: "pg@gmail.com",
    role: "normal_user",
    name: "Jisoo Lisa Jenni Rose"
  };

  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(userData));

  console.log('✅ Authentication token and user data set successfully!');
  console.log('🔄 Refreshing page...');

  setTimeout(() => {
    window.location.reload();
  }, 1000);
};

// Auto-run if this script is loaded
if (typeof window !== 'undefined') {
  setupAuth();
}

export default setupAuth;

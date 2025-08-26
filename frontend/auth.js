// Handle Authentication Modal Toggle
document.getElementById('login-btn')?.addEventListener('click', () => {
  document.getElementById('auth-modal').classList.remove('hidden');
  document.getElementById('login-form').classList.remove('hidden');
  document.getElementById('register-form').classList.add('hidden');
});

document.getElementById('register-btn')?.addEventListener('click', () => {
  document.getElementById('auth-modal').classList.remove('hidden');
  document.getElementById('register-form').classList.remove('hidden');
  document.getElementById('login-form').classList.add('hidden');
});

// Switch Between Login and Register
document.getElementById('switch-to-register')?.addEventListener('click', () => {
  document.getElementById('login-form').classList.add('hidden');
  document.getElementById('register-form').classList.remove('hidden');
});

document.getElementById('switch-to-login')?.addEventListener('click', () => {
  document.getElementById('register-form').classList.add('hidden');
  document.getElementById('login-form').classList.remove('hidden');
});

// Login Handler
document.getElementById('submit-login')?.addEventListener('click', async () => {
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  try {
      const response = await axios.post('http://localhost:5001/api/auth/login', { email, password });
      
      // Store token in localStorage
      localStorage.setItem('token', response.data.token);
      
      // Redirect to movies page
      window.location.href = 'movies.html';
  } catch (error) {
      alert(error.response?.data?.message || 'Login failed');
  }
});

// Register Handler
document.getElementById('submit-register')?.addEventListener('click', async () => {
  const username = document.getElementById('register-username').value;
  const email = document.getElementById('register-email').value;
  const password = document.getElementById('register-password').value;

  try {
      const response = await axios.post('http://localhost:5001/api/auth/register', { 
          username, 
          email, 
          password 
      });
      
      localStorage.setItem('token', response.data.token);
      window.location.href = 'movies.html';
  } catch (error) {
      alert(error.response?.data?.message || 'Registration failed');
  }
});

// Optional: Close Modal on Background Click
document.getElementById('auth-modal')?.addEventListener('click', (e) => {
  if (e.target === e.currentTarget) {
      e.currentTarget.classList.add('hidden');
  }
});
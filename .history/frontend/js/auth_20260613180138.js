const API_URL = 'http://localhost:5000/api';

// Show error message
const showError = (msg) => {
  const el = document.getElementById('errorMsg');
  el.textContent = msg;
  el.style.display = 'block';
  document.getElementById('successMsg').style.display = 'none';
};

// Show success message
const showSuccess = (msg) => {
  const el = document.getElementById('successMsg');
  el.textContent = msg;
  el.style.display = 'block';
  document.getElementById('errorMsg').style.display = 'none';
};

// REGISTER function
const register = async () => {
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  if (!name || !email || !password) {
    showError('Please fill in all fields');
    return;
  }

  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      showError(data.message);
      return;
    }

    showSuccess('Account created! Redirecting to login...');
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 1500);

  } catch (error) {
    showError('Something went wrong. Please try again.');
  }
};

// LOGIN function
const login = async () => {
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  if (!email || !password) {
    showError('Please fill in all fields');
    return;
  }

  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      showError(data.message);
      return;
    }

    // Save token and user info
    localStorage.setItem('token', data.data.token);
    localStorage.setItem('user', JSON.stringify(data.data.user));

    // Redirect to dashboard
    window.location.href = 'dashboard.html';

  } catch (error) {
    showError('Something went wrong. Please try again.');
  }
};

// Check if already logged in
if (window.location.pathname.includes('login') || 
    window.location.pathname.includes('register')) {
  if (localStorage.getItem('token')) {
    window.location.href = 'dashboard.html';
  }
}
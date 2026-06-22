const API_URL = 'http://localhost:5000/api';

const getToken = () => localStorage.getItem('token');

const setButtonLoading = (btnId, loading, text) => {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  btn.disabled = loading;
  btn.textContent = loading ? 'Please wait...' : text;
};

const showError = (msg) => {
  const errEl = document.getElementById('errorMsg');
  const okEl = document.getElementById('successMsg');
  errEl.textContent = msg;
  errEl.style.display = 'flex';
  okEl.style.display = 'none';
};

const showSuccess = (msg) => {
  const errEl = document.getElementById('errorMsg');
  const okEl = document.getElementById('successMsg');
  okEl.textContent = msg;
  okEl.style.display = 'flex';
  errEl.style.display = 'none';
};

const register = async () => {
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  if (!name || !email || !password) {
    showError('Please fill in all fields');
    return;
  }

  setButtonLoading('registerBtn', true);

  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      showError(data.message);
      setButtonLoading('registerBtn', false, 'Create Account');
      return;
    }

    showSuccess('Account created! Redirecting to login...');
    setTimeout(() => {
      window.location.href = '/frontend/pages/login.html';
    }, 1300);

  } catch (error) {
    showError('Something went wrong. Please try again.');
    setButtonLoading('registerBtn', false, 'Create Account');
  }
};

const login = async () => {
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  if (!email || !password) {
    showError('Please fill in all fields');
    return;
  }

  setButtonLoading('loginBtn', true);

  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      showError(data.message);
      setButtonLoading('loginBtn', false, 'Login');
      return;
    }

    localStorage.setItem('token', data.data.token);
    localStorage.setItem('user', JSON.stringify(data.data.user));
    window.location.href = '/frontend/pages/dashboard.html';

  } catch (error) {
    showError('Something went wrong. Please try again.');
    setButtonLoading('loginBtn', false, 'Login');
  }
};

if (window.location.pathname.includes('login') ||
    window.location.pathname.includes('register')) {
  //if (getToken()) {
    //window.location.href = '/frontend/pages/dashboard.html';
  //}
}
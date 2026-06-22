const API_URL = 'https://expense-splitter-ccis.onrender.com/api';

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

  if (errEl) {
    errEl.textContent = msg;
    errEl.style.display = 'flex';
  }

  if (okEl) {
    okEl.style.display = 'none';
  }
};

const showSuccess = (msg) => {
  const errEl = document.getElementById('errorMsg');
  const okEl = document.getElementById('successMsg');

  if (okEl) {
    okEl.textContent = msg;
    okEl.style.display = 'flex';
  }

  if (errEl) {
    errEl.style.display = 'none';
  }
};

const register = async () => {
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  if (!name || !email || !password) {
    showError('Please fill in all fields');
    return;
  }

  setButtonLoading('registerBtn', true, 'Create Account');

  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name,
        email,
        password
      })
    });

    const data = await response.json();

    if (!response.ok) {
      showError(data.message || 'Registration failed');
      setButtonLoading('registerBtn', false, 'Create Account');
      return;
    }

    showSuccess('Account created! Redirecting to login...');

    setTimeout(() => {
      window.location.href = './login.html';
    }, 1500);

  } catch (error) {
    console.error(error);
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

  setButtonLoading('loginBtn', true, 'Login');

  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        password
      })
    });

    const data = await response.json();

    if (!response.ok) {
      showError(data.message || 'Login failed');
      setButtonLoading('loginBtn', false, 'Login');
      return;
    }

    localStorage.setItem('token', data.data.token);
    localStorage.setItem('user', JSON.stringify(data.data.user));

    window.location.href = './dashboard.html';

  } catch (error) {
    console.error(error);
    showError('Something went wrong. Please try again.');
    setButtonLoading('loginBtn', false, 'Login');
  }
};

// Optional auto-login redirect
if (
  window.location.pathname.includes('login') ||
  window.location.pathname.includes('register')
) {
  // const token = getToken();
  // if (token) {
  //   window.location.href = './dashboard.html';
  // }
}
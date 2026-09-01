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
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        email: email,
        password: password
      })
    });

    const text = await response.text();

    let data;

    try {
      data = JSON.parse(text);
    } catch {
      console.error('Server returned:', text);
      showError('Invalid server response');
      setButtonLoading('loginBtn', false, 'Login');
      return;
    }

    console.log('LOGIN STATUS:', response.status);
    console.log('LOGIN RESPONSE:', data);

    if (!response.ok) {
      showError(data.message || 'Invalid email or password');
      setButtonLoading('loginBtn', false, 'Login');
      return;
    }

    if (!data.data || !data.data.token) {
      showError('Login succeeded but token was not received');
      setButtonLoading('loginBtn', false, 'Login');
      return;
    }

    localStorage.setItem('token', data.data.token);
    localStorage.setItem('user', JSON.stringify(data.data.user));

    window.location.href = './dashboard.html';

  } catch (error) {
    console.error('LOGIN ERROR:', error);
    showError('Unable to connect to server');
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

// FORGOT PASSWORD
const forgotPassword = async () => {
  const email = document.getElementById('forgotEmail').value.trim();

  if (!email) {
    showError('Please enter your email');
    return;
  }

  const btn = document.getElementById('forgotBtn');

  btn.disabled = true;
  btn.textContent = 'Sending...';

  try {
    const response = await fetch(`${API_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email })
    });

    const data = await response.json();

    if (!response.ok) {
      showError(data.message || 'Unable to send reset link');
      btn.disabled = false;
      btn.textContent = 'Send Reset Link';
      return;
    }

    showSuccess(
      'Reset link sent! Please check your email.'
    );

    btn.disabled = false;
    btn.textContent = 'Send Reset Link';

  } catch (error) {
    console.error('FORGOT PASSWORD ERROR:', error);

    showError('Unable to connect to server');

    btn.disabled = false;
    btn.textContent = 'Send Reset Link';
  }
};

// RESET PASSWORD
const resetPassword = async () => {
  const newPassword =
    document.getElementById('newPassword').value;

  const confirmPassword =
    document.getElementById('confirmPassword').value;

  if (!newPassword || !confirmPassword) {
    showError('Please fill in both password fields');
    return;
  }

  if (newPassword.length < 6) {
    showError('Password must be at least 6 characters');
    return;
  }

  if (newPassword !== confirmPassword) {
    showError('Passwords do not match');
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');

  if (!token) {
    showError('Invalid or missing reset token');
    return;
  }

  const btn = document.getElementById('resetBtn');

  btn.disabled = true;
  btn.textContent = 'Resetting...';

  try {
    const response = await fetch(
      `${API_URL}/auth/reset-password/${token}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          password: newPassword
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      showError(data.message || 'Unable to reset password');

      btn.disabled = false;
      btn.textContent = 'Reset Password';

      return;
    }

    showSuccess(
      'Password reset successfully! Redirecting to login...'
    );

    setTimeout(() => {
      window.location.href = './login.html';
    }, 2000);

  } catch (error) {
    console.error('RESET PASSWORD ERROR:', error);

    showError('Unable to connect to server');

    btn.disabled = false;
    btn.textContent = 'Reset Password';
  }
};
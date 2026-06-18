const API_URL = 'http://localhost:5000/api';

// Get token from localStorage
const getToken = () => localStorage.getItem('token');

// Get user from localStorage
const getUser = () => JSON.parse(localStorage.getItem('user'));

// Redirect to login if not logged in
if (!getToken()) {
  window.location.href = 'login.html';
}

// Show user name in navbar
const user = getUser();
if (user) {
  document.getElementById('userName').textContent = `Hi, ${user.name}`;
}

// Logout
const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'login.html';
};

// Open modal
const openModal = (modalId) => {
  document.getElementById(modalId).classList.add('active');
};

// Close modal
const closeModal = (modalId) => {
  document.getElementById(modalId).classList.remove('active');
};

// Show error inside modal
const showModalError = (elementId, msg) => {
  const el = document.getElementById(elementId);
  el.textContent = msg;
  el.style.display = 'block';
};

// Load all groups
const loadGroups = async () => {
  try {
    const response = await fetch(`${API_URL}/groups/mygroups`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        window.location.href = 'login.html';
        return;
      }
      document.getElementById('groupsContainer').innerHTML = 
        '<p style="color:#666">Failed to load groups.</p>';
      return;
    }

    const groups = data.data.groups;

    if (groups.length === 0) {
      document.getElementById('groupsContainer').innerHTML = `
        <div class="empty-state">
          <h3>No groups yet</h3>
          <p>Create a group or join one with an invite code</p>
        </div>
      `;
      return;
    }

    const groupsHTML = groups.map(group => `
      <a class="group-card" href="group.html?id=${group._id}">
        <h3>${group.name}</h3>
        <p>${group.description || 'No description'}</p>
        <p>${group.members.length} member${group.members.length !== 1 ? 's' : ''}</p>
        <span class="invite-code">${group.inviteCode}</span>
      </a>
    `).join('');

    document.getElementById('groupsContainer').innerHTML = 
      `<div class="groups-grid">${groupsHTML}</div>`;

  } catch (error) {
    document.getElementById('groupsContainer').innerHTML = 
      '<p style="color:#666">Something went wrong.</p>';
  }
};

// Create group
const createGroup = async () => {
  const name = document.getElementById('groupName').value.trim();
  const description = document.getElementById('groupDesc').value.trim();

  if (!name) {
    showModalError('createError', 'Group name is required');
    return;
  }

  try {
    const response = await fetch(`${API_URL}/groups/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify({ name, description })
    });

    const data = await response.json();

    if (!response.ok) {
      showModalError('createError', data.message);
      return;
    }

    closeModal('createModal');
    document.getElementById('groupName').value = '';
    document.getElementById('groupDesc').value = '';
    loadGroups();

  } catch (error) {
    showModalError('createError', 'Something went wrong');
  }
};

// Join group
const joinGroup = async () => {
  const inviteCode = document.getElementById('inviteCode').value.trim().toUpperCase();

  if (!inviteCode) {
    showModalError('joinError', 'Invite code is required');
    return;
  }

  try {
    const response = await fetch(`${API_URL}/groups/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify({ inviteCode })
    });

    const data = await response.json();

    if (!response.ok) {
      showModalError('joinError', data.message);
      return;
    }

    closeModal('joinModal');
    document.getElementById('inviteCode').value = '';
    loadGroups();

  } catch (error) {
    showModalError('joinError', 'Something went wrong');
  }
};

// Load groups on page load
loadGroups();
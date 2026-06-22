const API_URL = 'http://localhost:5000/api';

const getToken = () => localStorage.getItem('token');
const getUser = () => JSON.parse(localStorage.getItem('user') || 'null');

if (!getToken()) {
  window.location.href = '/frontend/pages/login.html';
}

const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  return parts.length > 1
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : parts[0].slice(0, 2).toUpperCase();
};

const user = getUser();

if (user) {

  document.getElementById('userName').textContent =
    user.name;

  document.getElementById('userAvatar').textContent =
    getInitials(user.name);

  const heroName =
    document.getElementById('heroName');

  if(heroName){
    heroName.textContent = user.name;
  }
}

const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/frontend/pages/login.html';
};

const openModal = (modalId) => {
  document.getElementById(modalId).classList.add('active');
};

const closeModal = (modalId) => {
  document.getElementById(modalId).classList.remove('active');
};

const showModalError = (elementId, msg) => {
  const el = document.getElementById(elementId);
  el.textContent = msg;
  el.style.display = 'flex';
};

const showToast = (message, type = 'success') => {
  const stack = document.getElementById('toastStack');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  stack.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('leaving');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
};

const loadGroups = async () => {
  try {
    const response = await fetch(`${API_URL}/groups/mygroups`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        window.location.href = '/frontend/pages/login.html';
        return;
      }
      document.getElementById('groupsContainer').innerHTML =
        '<p style="color:var(--ink-soft)">Failed to load groups.</p>';
      return;
    }

    const groups = data.data.groups;

    if (groups.length === 0) {
      document.getElementById('groupsContainer').innerHTML = `
        <div class="empty">
          <div class="empty-glyph">📒</div>
          <h3>No groups yet</h3>
          <p>Create a group for your next trip, or join one with an invite code from a friend.</p>
        </div>
      `;
      return;
    }

    const groupsHTML = groups.map(group => {
      const avatars = group.members.slice(0, 4).map(m =>
        `<span class="avatar" title="${m.name}">${getInitials(m.name)}</span>`
      ).join('');

      return `
        <a class="group-card" href="group.html?id=${group._id}">
          <h3>${group.name}</h3>
          <p>${group.description || 'No description yet'}</p>
          <div class="group-card-footer">
            <div class="member-stack">${avatars}</div>
            <span class="code-pill">${group.inviteCode}</span>
          </div>
        </a>
      `;
    }).join('');

    document.getElementById('groupsContainer').innerHTML =
      `<div class="groups-grid">${groupsHTML}</div>`;

  } catch (error) {
    document.getElementById('groupsContainer').innerHTML =
      '<p style="color:var(--ink-soft)">Something went wrong.</p>';
  }
};

const createGroup = async () => {
  const name = document.getElementById('groupName').value.trim();
  const description = document.getElementById('groupDesc').value.trim();

  if (!name) {
    showModalError('createError', 'Group name is required');
    return;
  }

  document.getElementById('createGroupBtn').disabled = true;

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
      document.getElementById('createGroupBtn').disabled = false;
      return;
    }

    closeModal('createModal');
    document.getElementById('groupName').value = '';
    document.getElementById('groupDesc').value = '';
    document.getElementById('createError').style.display = 'none';
    document.getElementById('createGroupBtn').disabled = false;
    showToast('Group created successfully');
    loadGroups();

  } catch (error) {
    showModalError('createError', 'Something went wrong');
    document.getElementById('createGroupBtn').disabled = false;
  }
};

const joinGroup = async () => {
  const inviteCode = document.getElementById('inviteCode').value.trim().toUpperCase();

  if (!inviteCode) {
    showModalError('joinError', 'Invite code is required');
    return;
  }

  document.getElementById('joinGroupBtn').disabled = true;

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
      document.getElementById('joinGroupBtn').disabled = false;
      return;
    }

    closeModal('joinModal');
    document.getElementById('inviteCode').value = '';
    document.getElementById('joinError').style.display = 'none';
    document.getElementById('joinGroupBtn').disabled = false;
    showToast('Joined group successfully');
    loadGroups();

  } catch (error) {
    showModalError('joinError', 'Something went wrong');
    document.getElementById('joinGroupBtn').disabled = false;
  }
};

loadGroups();
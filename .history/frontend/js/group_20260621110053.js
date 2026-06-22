const API_URL = 'http://localhost:5000/api';

const getToken = () => localStorage.getItem('token');
const getUser = () => JSON.parse(localStorage.getItem('user') || 'null');

if (!getToken()) {
  window.location.href = '/frontend/pages/login.html';
}

const urlParams = new URLSearchParams(window.location.search);
const groupId = urlParams.get('id');

if (!groupId) {
  window.location.href = '/frontend/pages/dashboard.html';
}

const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  return parts.length > 1
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : parts[0].slice(0, 2).toUpperCase();
};

const CATEGORY_ICONS = {
  food: '🍽️',
  travel: '✈️',
  accommodation: '🏨',
  utilities: '💡',
  entertainment: '🎬',
  other: '📦'
};

const user = getUser();
if (user) {
  document.getElementById('userName').textContent = user.name;
  document.getElementById('userAvatar').textContent = getInitials(user.name);
}

const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/frontend/pages/login.html';
};

const openModal = (modalId) => document.getElementById(modalId).classList.add('active');
const closeModal = (modalId) => document.getElementById(modalId).classList.remove('active');

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

const switchTab = (tab, evt) => {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  evt.target.classList.add('active');

  document.getElementById('expensesTab').style.display = tab === 'expenses' ? 'block' : 'none';
  document.getElementById('balancesTab').style.display = tab === 'balances' ? 'block' : 'none';
  document.getElementById('activityTab').style.display = tab === 'activity' ? 'block' : 'none';

  if (tab === 'balances') loadBalances();
  if (tab === 'activity') loadActivity();
};

const loadGroup = async () => {
  try {
    const response = await fetch(`${API_URL}/groups/${groupId}`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });

    const data = await response.json();

    if (!response.ok) {
      document.getElementById('groupHeader').innerHTML =
        '<p style="color:var(--coral)">Failed to load group</p>';
      return;
    }

    const group = data.data.group;
    document.title = `${group.name} — Expense Splitter`;
    document.getElementById('groupHeader').innerHTML = `
      <div class="group-hero">
        <span class="eyebrow">Group</span>
        <h2>${group.name}</h2>
        <div class="group-hero-meta">
          <span>${group.description || 'No description'}</span>
          <span>·</span>
          <span>${group.members.length} member${group.members.length !== 1 ? 's' : ''}</span>
          <span>·</span>
          <span class="code-pill">${group.inviteCode}</span>
        </div>
      </div>
    `;

  } catch (error) {
    document.getElementById('groupHeader').innerHTML =
      '<p style="color:var(--coral)">Something went wrong</p>';
  }
};

const loadExpenses = async () => {
  try {
    const response = await fetch(`${API_URL}/expenses/group/${groupId}`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });

    const data = await response.json();

    if (!response.ok) {
      document.getElementById('expensesContainer').innerHTML =
        '<p style="color:var(--coral)">Failed to load expenses</p>';
      return;
    }

    const { expenses, summary } = data.data;

    if (expenses.length === 0) {
      document.getElementById('expensesContainer').innerHTML = `
        <div class="empty">
          <div class="empty-glyph">🧾</div>
          <h3>No expenses yet</h3>
          <p>Add your first expense to start tracking who owes what.</p>
        </div>
      `;
      return;
    }

    const expensesHTML = expenses.map(expense => `
      <div class="expense-row">
        <div class="expense-row-left">
          <div class="cat-glyph">${CATEGORY_ICONS[expense.category] || '📦'}</div>
          <div class="expense-info">
            <h4>${expense.description}</h4>
            <p>Paid by <strong>${expense.paidBy.name}</strong> · ${new Date(expense.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
            <span class="cat-badge">${expense.category}</span>
          </div>
        </div>
        <div class="expense-row-right">
          <div class="expense-amount">₹${expense.amount}</div>
          ${expense.paidBy._id === user.id ? `
            <button class="delete-x" onclick="deleteExpense('${expense._id}')">Delete</button>
          ` : ''}
        </div>
      </div>
    `).join('');

    document.getElementById('expensesContainer').innerHTML = `
      <div class="summary-strip">
        <div class="stat-chip">
          <div class="num">${summary.totalExpenses}</div>
          <div class="label">Total expenses</div>
        </div>
        <div class="stat-chip">
          <div class="num">₹${summary.totalAmount}</div>
          <div class="label">Total amount</div>
        </div>
      </div>
      ${expensesHTML}
    `;

  } catch (error) {
    document.getElementById('expensesContainer').innerHTML =
      '<p style="color:var(--coral)">Something went wrong</p>';
  }
};

const loadBalances = async () => {
  try {
    const response = await fetch(`${API_URL}/expenses/balances/${groupId}`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });

    const data = await response.json();

    if (!response.ok) {
      document.getElementById('balancesContainer').innerHTML =
        '<p style="color:var(--coral)">Failed to load balances</p>';
      return;
    }

    const { balances, settlements } = data.data;

    const balancesHTML = balances.map(b => `
      <div class="balance-row">
        <div class="balance-person">
          <span class="avatar">${getInitials(b.name)}</span>
          ${b.name}
        </div>
        <span class="balance-figure ${b.balance > 0 ? 'is-positive' : b.balance < 0 ? 'is-negative' : 'is-zero'}">
          ${b.balance > 0 ? '+' : ''}₹${b.balance}
        </span>
      </div>
    `).join('');

    document.getElementById('balancesContainer').innerHTML =
      balancesHTML || '<p style="color:var(--ink-soft)">No balances yet</p>';

    if (settlements.length === 0) {
      document.getElementById('settlementsContainer').innerHTML =
        '<div class="all-settled">All settled up — nothing pending 🎉</div>';
    } else {
      document.getElementById('settlementsContainer').innerHTML = settlements.map(s => `
        <div class="settle-row">
          <b>${s.from}</b> pays <b>₹${s.amount}</b> to <b>${s.to}</b>
        </div>
      `).join('');
    }

  } catch (error) {
    document.getElementById('balancesContainer').innerHTML =
      '<p style="color:var(--coral)">Something went wrong</p>';
  }
};

const loadActivity = async () => {
  try {
    const response = await fetch(`${API_URL}/expenses/activity/${groupId}`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });

    const data = await response.json();

    if (!response.ok) {
      document.getElementById('activityContainer').innerHTML =
        '<p style="color:var(--coral)">Failed to load activity</p>';
      return;
    }

    const activities = data.data.activities;

    if (activities.length === 0) {
      document.getElementById('activityContainer').innerHTML =
        '<p style="color:var(--ink-soft)">No activity yet</p>';
      return;
    }

    document.getElementById('activityContainer').innerHTML = activities.map(a => `
      <div class="activity-row">
        <span class="avatar">${getInitials(a.userId?.name)}</span>
        <div>
          <div class="activity-text"><b>${a.userId?.name || 'Someone'}</b> ${a.description}</div>
          <div class="activity-time">${new Date(a.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
        </div>
      </div>
    `).join('');

  } catch (error) {
    document.getElementById('activityContainer').innerHTML =
      '<p style="color:var(--coral)">Something went wrong</p>';
  }
};

const addExpense = async () => {
  const description = document.getElementById('expenseDesc').value.trim();
  const amount = parseFloat(document.getElementById('expenseAmount').value);
  const category = document.getElementById('expenseCategory').value;
  const notes = document.getElementById('expenseNotes').value.trim();

  const errEl = document.getElementById('expenseError');

  if (!description) {
    errEl.textContent = 'Description is required';
    errEl.style.display = 'flex';
    return;
  }
  if (!amount || amount <= 0) {
    errEl.textContent = 'Valid amount is required';
    errEl.style.display = 'flex';
    return;
  }

  document.getElementById('addExpenseBtn').disabled = true;

  try {
    const response = await fetch(`${API_URL}/expenses/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify({ groupId, description, amount, category, notes })
    });

    const data = await response.json();

    if (!response.ok) {
      errEl.textContent = data.message;
      errEl.style.display = 'flex';
      document.getElementById('addExpenseBtn').disabled = false;
      return;
    }

    closeModal('addExpenseModal');
    document.getElementById('expenseDesc').value = '';
    document.getElementById('expenseAmount').value = '';
    document.getElementById('expenseNotes').value = '';
    errEl.style.display = 'none';
    document.getElementById('addExpenseBtn').disabled = false;
    showToast('Expense added successfully');
    loadExpenses();

  } catch (error) {
    errEl.textContent = 'Something went wrong';
    errEl.style.display = 'flex';
    document.getElementById('addExpenseBtn').disabled = false;
  }
};

const deleteExpense = async (expenseId) => {
  if (!confirm('Delete this expense?')) return;

  try {
    const response = await fetch(`${API_URL}/expenses/${expenseId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });

    if (!response.ok) {
      showToast('Failed to delete expense', 'error');
      return;
    }

    showToast('Expense deleted');
    loadExpenses();

  } catch (error) {
    showToast('Something went wrong', 'error');
  }
};

loadGroup();
loadExpenses();
const API_URL = 'http://localhost:5000/api';

const getToken = () => localStorage.getItem('token');
const getUser = () => JSON.parse(localStorage.getItem('user'));

if (!getToken()) {
  window.location.href = 'login.html';
}

// Get group ID from URL
const urlParams = new URLSearchParams(window.location.search);
const groupId = urlParams.get('id');

if (!groupId) {
  window.location.href = '/frontend/pages/dashboard.html';
}

// Show user name
const user = getUser();
if (user) {
  document.getElementById('userName').textContent = `Hi, ${user.name}`;
}

// Logout
const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/frontend/pages/login.html';
};

// Open modal
const openModal = (modalId) => {
  document.getElementById(modalId).classList.add('active');
};

// Close modal
const closeModal = (modalId) => {
  document.getElementById(modalId).classList.remove('active');
};

// Switch tabs
const switchTab = (tab) => {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  event.target.classList.add('active');

  if (tab === 'expenses') {
    document.getElementById('expensesTab').style.display = 'block';
    document.getElementById('balancesTab').style.display = 'none';
  } else {
    document.getElementById('expensesTab').style.display = 'none';
    document.getElementById('balancesTab').style.display = 'block';
    loadBalances();
  }
};

// Load group details
const loadGroup = async () => {
  try {
    const response = await fetch(`${API_URL}/groups/${groupId}`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });

    const data = await response.json();

    if (!response.ok) {
      document.getElementById('groupHeader').innerHTML =
        '<p style="color:red">Failed to load group</p>';
      return;
    }

    const group = data.data.group;
    document.title = `${group.name} — Expense Splitter`;
    document.getElementById('groupHeader').innerHTML = `
      <div style="margin-bottom:24px">
        <h2 style="font-size:26px; color:#1a1a1a">${group.name}</h2>
        <p style="color:#666; margin-top:4px">${group.description || ''}</p>
        <p style="color:#666; margin-top:4px; font-size:13px">
          ${group.members.length} members · 
          Invite code: <strong style="color:#1a73e8">${group.inviteCode}</strong>
        </p>
      </div>
    `;

  } catch (error) {
    document.getElementById('groupHeader').innerHTML =
      '<p style="color:red">Something went wrong</p>';
  }
};

// Load expenses
const loadExpenses = async () => {
  try {
    const response = await fetch(
      `${API_URL}/expenses/group/${groupId}`,
      { headers: { 'Authorization': `Bearer ${getToken()}` } }
    );

    const data = await response.json();

    if (!response.ok) {
      document.getElementById('expensesContainer').innerHTML =
        '<p style="color:red">Failed to load expenses</p>';
      return;
    }

    const { expenses, summary } = data.data;

    if (expenses.length === 0) {
      document.getElementById('expensesContainer').innerHTML = `
        <div class="empty-state">
          <h3>No expenses yet</h3>
          <p>Add your first expense to get started</p>
        </div>
      `;
      return;
    }

    const expensesHTML = expenses.map(expense => `
      <div class="expense-item">
        <div class="expense-info">
          <h4>${expense.description}</h4>
          <p>Paid by <strong>${expense.paidBy.name}</strong></p>
          <p>${new Date(expense.createdAt).toLocaleDateString('en-IN')}</p>
          <span class="category-badge">${expense.category}</span>
        </div>
        <div style="text-align:right">
          <div class="expense-amount">₹${expense.amount}</div>
          <p style="font-size:12px; color:#666; margin-top:4px">
            Split among ${expense.splitAmong.length}
          </p>
          ${expense.paidBy._id === user.id ? `
            <button 
              class="btn btn-danger btn-small" 
              style="margin-top:8px"
              onclick="deleteExpense('${expense._id}')"
            >
              Delete
            </button>
          ` : ''}
        </div>
      </div>
    `).join('');

    document.getElementById('expensesContainer').innerHTML = `
      <div style="background:white; border-radius:12px; padding:16px 24px; 
                  margin-bottom:16px; box-shadow:0 2px 8px rgba(0,0,0,0.06)">
        <p style="color:#666; font-size:14px">
          Total expenses: <strong>${summary.totalExpenses}</strong> · 
          Total amount: <strong>₹${summary.totalAmount}</strong>
        </p>
      </div>
      ${expensesHTML}
    `;

  } catch (error) {
    document.getElementById('expensesContainer').innerHTML =
      '<p style="color:red">Something went wrong</p>';
  }
};

// Load balances
const loadBalances = async () => {
  try {
    const response = await fetch(
      `${API_URL}/expenses/balances/${groupId}`,
      { headers: { 'Authorization': `Bearer ${getToken()}` } }
    );

    const data = await response.json();

    if (!response.ok) {
      document.getElementById('balancesContainer').innerHTML =
        '<p style="color:red">Failed to load balances</p>';
      return;
    }

    const { balances, settlements } = data.data;

    // Render balances
    const balancesHTML = balances.map(b => `
      <div class="balance-item">
        <span>${b.name}</span>
        <span class="${
          b.balance > 0 ? 'balance-positive' :
          b.balance < 0 ? 'balance-negative' :
          'balance-zero'
        }">
          ${b.balance > 0 ? '+' : ''}₹${b.balance}
        </span>
      </div>
    `).join('');

    document.getElementById('balancesContainer').innerHTML =
      balancesHTML || '<p style="color:#666">No balances yet</p>';

    // Render settlements
    if (settlements.length === 0) {
      document.getElementById('settlementsContainer').innerHTML =
        '<p style="color:#198754">All settled up! 🎉</p>';
    } else {
      const settlementsHTML = settlements.map(s => `
        <div class="settlement-item">
          <strong>${s.from}</strong> pays 
          <strong>₹${s.amount}</strong> to 
          <strong>${s.to}</strong>
        </div>
      `).join('')};
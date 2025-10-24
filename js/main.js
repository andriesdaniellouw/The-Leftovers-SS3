// js/main.js
// ======================
// DATA INITIALIZATION
// ======================
function initAppData() {
  if (!localStorage.getItem('brewbean_users')) {
    localStorage.setItem('brewbean_users', JSON.stringify([
      { id: 1, fullName: 'Admin User', username: 'admin', password: '12345', role: 'Manager', image: '👤' }
    ]));
  }
  if (!localStorage.getItem('brewbean_inventory')) {
    localStorage.setItem('brewbean_inventory', JSON.stringify([
      { id: 1, name: 'Fresh Milk', size: '1L', itemId: 'MILK001', quantity: 42, image: '🥛' },
      { id: 2, name: 'Coffee Beans', size: '250g', itemId: 'COF001', quantity: 120, image: '☕' },
      { id: 3, name: 'Oat Milk', size: '1L', itemId: 'OAT001', quantity: 0, image: '🥛' },
      { id: 4, name: 'Sugar Packets', size: '100 units', itemId: 'SUG001', quantity: 210, image: '🥄' }
    ]));
  }
  if (!localStorage.getItem('brewbean_orders')) {
    localStorage.setItem('brewbean_orders', JSON.stringify([
      { id: '001', items: ['1 x Coffee', '2 x Latte', '1 x Espresso'], date: '08/09/2025', total: '12.50' },
      { id: '002', items: ['3 x Cappuccino', '1 x Mocha'], date: '07/09/2025', total: '18.00' },
      { id: '003', items: ['2 x Cold Brew'], date: '06/09/2025', total: '8.00' }
    ]));
  }
  // POS Menu Data
  if (!localStorage.getItem('brewbean_menu')) {
    localStorage.setItem('brewbean_menu', JSON.stringify([
      { id: 'm001', name: 'Espresso', price: 2.50 },
      { id: 'm002', name: 'Latte', price: 4.00 },
      { id: 'm003', name: 'Cappuccino', price: 3.75 },
      { id: 'm004', name: 'Cold Brew', price: 3.50 },
      { id: 'm005', name: 'Mocha', price: 4.50 },
      { id: 'm006', name: 'Iced Latte', price: 4.25 }
    ]));
  }
}
initAppData();

let currentUploadedImage = null;

// ======================
// AUTHENTICATION
// ======================
document.getElementById('togglePassword')?.addEventListener('click', function () {
  const pwd = document.getElementById('password');
  pwd.type = pwd.type === 'password' ? 'text' : 'password';
  this.textContent = pwd.type === 'text' ? '🙈' : '👁️';
});

document.getElementById('loginForm')?.addEventListener('submit', function (e) {
  e.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const users = JSON.parse(localStorage.getItem('brewbean_users'));
  const user = users.find(u => u.username === username && u.password === password);
  if (user) {
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('currentUser', JSON.stringify(user));
    window.location.href = 'dashboard.html';
  } else {
    alert('Invalid username or password!');
  }
});

window.logout = function() {
  localStorage.removeItem('isLoggedIn');
  localStorage.removeItem('currentUser');
  window.location.href = 'index.html';
};

// Auto-fill user profile if logged in
if (!['index.html', ''].includes(window.location.pathname.split('/').pop())) {
  if (!localStorage.getItem('isLoggedIn')) {
    window.location.href = 'index.html';
  } else {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const nameEl = document.querySelector('.user-profile p');
    const roleEl = document.querySelector('.user-profile small');
    if (nameEl) nameEl.textContent = user.fullName;
    if (roleEl) roleEl.textContent = user.role;
  }
}

// ======================
// IMAGE UPLOAD
// ======================
document.getElementById('imageUpload')?.addEventListener('change', function(e) {
  const file = e.target.files[0];
  const preview = document.getElementById('imagePreview');
  if (!file || !preview) return;
  if (!file.type.startsWith('image/')) {
    alert('Please select a valid image file.');
    this.value = '';
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    currentUploadedImage = reader.result;
    preview.innerHTML = `<img src="${reader.result}" alt="Preview">`;
  };
  reader.readAsDataURL(file);
});

// ======================
// FORMS
// ======================
document.querySelectorAll('.toggle-password').forEach(btn => {
  btn.addEventListener('click', function () {
    const input = this.previousElementSibling;
    input.type = input.type === 'password' ? 'text' : 'password';
    this.textContent = input.type === 'text' ? '🙈' : '👁️';
  });
});

// Add User
document.getElementById('userForm')?.addEventListener('submit', function(e) {
  e.preventDefault();
  const fullName = document.getElementById('fullName').value;
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const role = document.getElementById('role').value;
  const users = JSON.parse(localStorage.getItem('brewbean_users'));
  if (users.some(u => u.username === username)) {
    alert('Username already exists!');
    return;
  }
  users.push({
    id: Date.now(),
    fullName,
    username,
    password,
    role,
    image: currentUploadedImage || '👤'
  });
  localStorage.setItem('brewbean_users', JSON.stringify(users));
  alert('User created successfully!');
  renderUserList();
});

// Add Stock
document.getElementById('stockForm')?.addEventListener('submit', function(e) {
  e.preventDefault();
  const inventory = JSON.parse(localStorage.getItem('brewbean_inventory'));
  inventory.push({
    id: Date.now(),
    name: document.getElementById('itemName').value,
    size: document.getElementById('size').value,
    itemId: document.getElementById('itemId').value,
    quantity: parseInt(document.getElementById('quantity').value),
    image: currentUploadedImage || '📦'
  });
  localStorage.setItem('brewbean_inventory', JSON.stringify(inventory));
  alert('Stock item added successfully!');
  window.location.href = 'inventory.html';
});

// ======================
// EXPORT TO CSV
// ======================
function exportToCSV(filename, rows) {
  const csv = rows.map(row => 
    row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
  ).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

window.exportOrdersCSV = () => {
  const orders = JSON.parse(localStorage.getItem('brewbean_orders')) || [];
  exportToCSV('brewbean_orders.csv', [
    ['Order Number', 'Order Date', 'Items', 'Total'],
    ...orders.map(o => [o.id, o.date, o.items.join('; '), o.total])
  ]);
};

window.exportOutOfStockCSV = () => {
  const inv = JSON.parse(localStorage.getItem('brewbean_inventory')) || [];
  const out = inv.filter(i => i.quantity === 0);
  exportToCSV('brewbean_out_of_stock.csv', [
    ['Item Name', 'Item ID', 'Out of Stock Date'],
    ...out.map(i => [i.name, i.itemId, new Date().toLocaleDateString('en-GB')])
  ]);
};

window.exportSalesCSV = () => {
  const orders = JSON.parse(localStorage.getItem('brewbean_orders')) || [];
  exportToCSV('brewbean_sales_report.csv', [
    ['Date', 'Order ID', 'Items', 'Total'],
    ...orders.map(o => [o.date, o.id, o.items.join('; '), o.total || '0.00'])
  ]);
};

// ======================
// INVENTORY RENDERING
// ======================
function renderInventoryList(items) {
  const container = document.querySelector('.inventory-grid');
  if (!container) return;
  container.innerHTML = '';
  items.forEach(item => {
    const card = document.createElement('div');
    card.className = `item-card ${item.quantity === 0 ? 'empty' : ''}`;
    let imgHtml;
    if (item.image && item.image.startsWith('data:image/')) {
      imgHtml = `<img src="${item.image}" alt="${item.name}">`;
    } else {
      imgHtml = `<div class="item-icon">${item.image || '📦'}</div>`;
    }
    card.innerHTML = `
      ${imgHtml}
      <h3>${item.name}</h3>
      <p>${item.size || ''} • ${item.quantity} units</p>
      <div class="actions">
        <button class="update-btn" data-id="${item.id}">Update</button>
        <button class="delete-btn" data-id="${item.id}">🗑️</button>
      </div>
    `;
    container.appendChild(card);
  });
  attachInventoryListeners();
}

function attachInventoryListeners() {
  document.querySelectorAll('.update-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.dataset.id);
      const qty = prompt('Enter new quantity:');
      if (qty !== null && !isNaN(qty)) updateInventoryItem(id, parseInt(qty));
    });
  });
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (confirm('Delete this item?')) {
        deleteInventoryItem(parseInt(btn.dataset.id));
      }
    });
  });
}

function updateInventoryItem(id, quantity) {
  const inv = JSON.parse(localStorage.getItem('brewbean_inventory'));
  const item = inv.find(i => i.id === id);
  if (item) {
    item.quantity = quantity;
    localStorage.setItem('brewbean_inventory', JSON.stringify(inv));
    loadInventory();
    if (window.location.pathname.includes('out-of-stock.html')) {
      renderOutOfStockTable();
    }
  }
}

function deleteInventoryItem(id) {
  const inv = JSON.parse(localStorage.getItem('brewbean_inventory'));
  localStorage.setItem('brewbean_inventory', JSON.stringify(inv.filter(i => i.id !== id)));
  loadInventory();
}

function loadInventory() {
  const inv = JSON.parse(localStorage.getItem('brewbean_inventory')) || [];
  renderInventoryList(inv);
}

// ======================
// USER LIST
// ======================
function renderUserList() {
  const container = document.querySelector('.users-table tbody');
  if (!container) return;
  const users = JSON.parse(localStorage.getItem('brewbean_users')) || [];
  container.innerHTML = '';
  users.forEach(user => {
    const img = user.image && user.image.startsWith('data:image/')
      ? `<img src="${user.image}" style="width:30px;height:30px;border-radius:50%;margin-right:8px;">`
      : `<span style="margin-right:8px;">${user.image}</span>`;
    const row = document.createElement('tr');
    row.innerHTML = `<td>${img}${user.fullName} – ${user.role}</td><td><button class="edit-btn" data-id="${user.id}">Edit</button></td>`;
    container.appendChild(row);
  });
  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      alert('Edit feature not implemented in this version.');
    });
  });
}

// ======================
// OUT OF STOCK TABLE
// ======================
function renderOutOfStockTable() {
  const tbody = document.getElementById('outOfStockTableBody');
  if (!tbody) return;
  const inv = JSON.parse(localStorage.getItem('brewbean_inventory')) || [];
  const out = inv.filter(i => i.quantity === 0);
  tbody.innerHTML = out.map(item => `
    <tr>
      <td>${item.name}</td>
      <td>${new Date().toLocaleDateString('en-GB')}</td>
      <td><button class="update-btn" data-id="${item.id}">Update</button></td>
    </tr>
  `).join('');
  document.querySelectorAll('.update-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.dataset.id);
      const qty = prompt('Enter new stock quantity:');
      if (qty !== null && !isNaN(qty)) updateInventoryItem(id, parseInt(qty));
    });
  });
}

// ======================
// POS SYSTEM
// ======================
let currentOrder = [];

function loadPOSMenu() {
  const menu = JSON.parse(localStorage.getItem('brewbean_menu')) || [];
  const container = document.getElementById('posMenu');
  if (!container) return;
  container.innerHTML = menu.map(item => `
    <div class="menu-item" onclick="addToOrder('${item.id}', '${item.name}', ${item.price})">
      <h3>${item.name}</h3>
      <p>$${item.price.toFixed(2)}</p>
    </div>
  `).join('');
}

function addToOrder(id, name, price) {
  currentOrder.push({ id, name, price });
  renderOrder();
}

function renderOrder() {
  const list = document.getElementById('orderItems');
  const totalEl = document.getElementById('orderTotal');
  if (!list || !totalEl) return;
  list.innerHTML = currentOrder.map(item => 
    `<li>${item.name} – $${item.price.toFixed(2)}</li>`
  ).join('');
  const total = currentOrder.reduce((sum, item) => sum + item.price, 0);
  totalEl.textContent = total.toFixed(2);
}

function checkout() {
  if (currentOrder.length === 0) return alert('No items in order!');
  const orders = JSON.parse(localStorage.getItem('brewbean_orders')) || [];
  orders.unshift({
    id: 'ORD' + Date.now().toString().slice(-6),
    items: currentOrder.map(i => i.name),
    date: new Date().toLocaleDateString('en-GB'),
    total: currentOrder.reduce((sum, i) => sum + i.price, 0).toFixed(2)
  });
  localStorage.setItem('brewbean_orders', JSON.stringify(orders));
  currentOrder = [];
  renderOrder();
  alert('✅ Order completed!');
}

// ======================
// DASHBOARD & SALES
// ======================
function renderOrderList(orders) {
  const tbody = document.querySelector('.orders-table tbody');
  if (!tbody) return;
  tbody.innerHTML = orders.map(order => `
    <tr>
      <td>${order.items.join('<br>')}</td>
      <td>${order.date}</td>
      <td><span class="order-id">${order.id}</span></td>
    </tr>
  `).join('');
}

function renderSalesTable(orders) {
  const tbody = document.getElementById('salesTableBody');
  if (!tbody) return;
  tbody.innerHTML = orders.map(order => `
    <tr>
      <td>${order.date}</td>
      <td>${order.id}</td>
      <td>${order.items.join('; ')}</td>
      <td>$${parseFloat(order.total || 0).toFixed(2)}</td>
    </tr>
  `).join('');
}

function renderSalesSummary() {
  const today = new Date().toLocaleDateString('en-GB');
  const orders = JSON.parse(localStorage.getItem('brewbean_orders')) || [];
  const todays = orders.filter(o => o.date === today);
  const total = todays.reduce((sum, o) => sum + parseFloat(o.total || 0), 0);
  const totalEl = document.getElementById('salesTotal');
  const countEl = document.getElementById('orderCount');
  if (totalEl) totalEl.textContent = `Total Sales: $${total.toFixed(2)}`;
  if (countEl) countEl.textContent = `Orders Today: ${todays.length}`;
}

// ======================
// SEARCH
// ======================
function setupSearch() {
  const input = document.querySelector('.search-bar input');
  if (!input) return;
  const path = window.location.pathname;
  input.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    if (path.includes('inventory.html')) {
      const inv = JSON.parse(localStorage.getItem('brewbean_inventory')) || [];
      const filtered = term
        ? inv.filter(i => i.name.toLowerCase().includes(term) || i.itemId.toLowerCase().includes(term))
        : inv;
      renderInventoryList(filtered);
    } else if (path.includes('pos.html') && term) {
      const menu = JSON.parse(localStorage.getItem('brewbean_menu')) || [];
      const filtered = menu.filter(m => m.name.toLowerCase().includes(term));
      document.getElementById('posMenu').innerHTML = filtered.map(item => `
        <div class="menu-item" onclick="addToOrder('${item.id}', '${item.name}', ${item.price})">
          <h3>${item.name}</h3>
          <p>$${item.price.toFixed(2)}</p>
        </div>
      `).join('');
    }
  });
}

// ======================
// PAGE INITIALIZATION
// ======================
document.addEventListener('DOMContentLoaded', () => {
  const path = window.location.pathname;
  if (path.includes('inventory.html')) loadInventory();
  else if (path.includes('add-user.html')) renderUserList();
  else if (path.includes('dashboard.html')) {
    const orders = JSON.parse(localStorage.getItem('brewbean_orders')) || [];
    renderOrderList(orders);
  }
  else if (path.includes('out-of-stock.html')) renderOutOfStockTable();
  else if (path.includes('analytics.html')) renderSalesSummary();
  else if (path.includes('sales.html')) {
    const orders = JSON.parse(localStorage.getItem('brewbean_orders')) || [];
    renderSalesTable(orders);
  }
  else if (path.includes('pos.html')) {
    loadPOSMenu();
    renderOrder();
  }
  setupSearch();
});
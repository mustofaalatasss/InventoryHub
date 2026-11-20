// ==========================================
// InventoryHub Frontend Integration Logic
// Created & Refined with Microsoft Copilot
// ==========================================

const API_BASE_URL = '/api/inventory';

// State management
let state = {
  items: [],
  currentPage: 1,
  totalPages: 1,
  totalItems: 0,
  searchQuery: '',
  selectedCategory: 'All',
  limit: 5,
  debounceTimer: null
};

// DOM Elements
const inventoryTableBody = document.getElementById('inventoryTableBody');
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');
const totalCountDisplay = document.getElementById('totalCountDisplay');
const loadingIndicator = document.getElementById('loadingIndicator');
const emptyState = document.getElementById('emptyState');
const pageIndicator = document.getElementById('pageIndicator');
const prevPageBtn = document.getElementById('prevPageBtn');
const nextPageBtn = document.getElementById('nextPageBtn');
const toastNotification = document.getElementById('toastNotification');

// Modal Elements
const itemModal = document.getElementById('itemModal');
const itemForm = document.getElementById('itemForm');
const modalTitle = document.getElementById('modalTitle');
const openAddModalBtn = document.getElementById('openAddModalBtn');
const closeModalBtn = document.getElementById('closeModalBtn');
const cancelModalBtn = document.getElementById('cancelModalBtn');

// Form Input Elements
const itemIdInput = document.getElementById('itemId');
const itemNameInput = document.getElementById('itemName');
const itemCategoryInput = document.getElementById('itemCategory');
const itemQuantityInput = document.getElementById('itemQuantity');
const itemPriceInput = document.getElementById('itemPrice');

// ==========================================
// Toast Notification Utility
// ==========================================
function showToast(message, type = 'success') {
  toastNotification.textContent = message;
  toastNotification.className = `toast ${type}`;
  toastNotification.classList.remove('hidden');

  setTimeout(() => {
    toastNotification.classList.add('hidden');
  }, 3500);
}

// ==========================================
// API Communication Service (Activities 1, 2, 3)
// ==========================================

/**
 * Fetch inventory with search, filtering, and pagination
 * Uses unified JSON structure parsing and robust error handling
 */
async function fetchInventory() {
  try {
    loadingIndicator.classList.remove('hidden');
    inventoryTableBody.innerHTML = '';
    emptyState.classList.add('hidden');

    const queryParams = new URLSearchParams({
      page: state.currentPage,
      limit: state.limit,
      search: state.searchQuery,
      category: state.selectedCategory
    });

    const response = await fetch(`${API_BASE_URL}?${queryParams.toString()}`);

    if (!response.ok) {
      const errorJson = await response.json();
      throw new Error(errorJson.message || `HTTP error! Status: ${response.status}`);
    }

    const result = await response.json();

    // Verify structured JSON format
    if (result.status === 'success' && Array.isArray(result.data)) {
      state.items = result.data;
      if (result.meta) {
        state.totalPages = result.meta.totalPages || 1;
        state.totalItems = result.meta.total || 0;
      }
      renderTable();
      updatePaginationControls();
    } else {
      throw new Error("Invalid JSON structure received from server.");
    }
  } catch (err) {
    console.error("Integration Fetch Error:", err);
    showToast(`Error connecting to API: ${err.message}`, 'error');
  } finally {
    loadingIndicator.classList.add('hidden');
  }
}

/**
 * Save Item (Create or Update)
 */
async function saveItem(itemData) {
  try {
    const isEditing = !!itemData.id;
    const url = isEditing ? `${API_BASE_URL}/${itemData.id}` : API_BASE_URL;
    const method = isEditing ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(itemData)
    });

    const result = await response.json();

    if (!response.ok || result.status !== 'success') {
      const detail = result.errors ? result.errors.join(', ') : result.message;
      throw new Error(detail || "Failed to save item.");
    }

    showToast(isEditing ? "Item updated successfully!" : "New item added successfully!", 'success');
    closeModal();
    fetchInventory();
  } catch (err) {
    console.error("Save Error:", err);
    showToast(err.message, 'error');
  }
}

/**
 * Delete Item
 */
async function deleteItem(id, name) {
  if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

  try {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE'
    });

    const result = await response.json();

    if (!response.ok || result.status !== 'success') {
      throw new Error(result.message || "Failed to delete item.");
    }

    showToast(`"${name}" was deleted successfully.`, 'success');
    fetchInventory();
  } catch (err) {
    console.error("Delete Error:", err);
    showToast(err.message, 'error');
  }
}

// ==========================================
// DOM Rendering
// ==========================================
function renderTable() {
  inventoryTableBody.innerHTML = '';

  if (state.items.length === 0) {
    emptyState.classList.remove('hidden');
    totalCountDisplay.textContent = 'Showing 0 items';
    return;
  }

  emptyState.classList.add('hidden');
  totalCountDisplay.textContent = `Showing ${state.items.length} of ${state.totalItems} items`;

  state.items.forEach(item => {
    const row = document.createElement('tr');

    let statusClass = 'status-instock';
    if (item.status === 'Low Stock') statusClass = 'status-lowstock';
    else if (item.status === 'Out of Stock') statusClass = 'status-outofstock';

    row.innerHTML = `
      <td>#${item.id}</td>
      <td><strong>${escapeHtml(item.name)}</strong></td>
      <td>${escapeHtml(item.category)}</td>
      <td>${item.quantity}</td>
      <td>$${parseFloat(item.price).toFixed(2)}</td>
      <td><span class="status-pill ${statusClass}">${item.status}</span></td>
      <td>
        <button class="btn btn-outline btn-sm edit-btn" data-id="${item.id}">Edit</button>
        <button class="btn btn-danger btn-sm delete-btn" data-id="${item.id}" data-name="${escapeHtml(item.name)}">Delete</button>
      </td>
    `;
    inventoryTableBody.appendChild(row);
  });

  // Attach event listeners to action buttons
  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = parseInt(e.target.dataset.id, 10);
      const item = state.items.find(i => i.id === id);
      if (item) openModal(item);
    });
  });

  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = parseInt(e.target.dataset.id, 10);
      const name = e.target.dataset.name;
      deleteItem(id, name);
    });
  });
}

function updatePaginationControls() {
  pageIndicator.textContent = `Page ${state.currentPage} of ${state.totalPages || 1}`;
  prevPageBtn.disabled = state.currentPage <= 1;
  nextPageBtn.disabled = state.currentPage >= state.totalPages;
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, function (m) {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[m];
  });
}

// ==========================================
// Performance Optimization: Debounce (Activity 4)
// ==========================================
searchInput.addEventListener('input', (e) => {
  clearTimeout(state.debounceTimer);
  state.debounceTimer = setTimeout(() => {
    state.searchQuery = e.target.value.trim();
    state.currentPage = 1;
    fetchInventory();
  }, 300); // 300ms debounce
});

categoryFilter.addEventListener('change', (e) => {
  state.selectedCategory = e.target.value;
  state.currentPage = 1;
  fetchInventory();
});

prevPageBtn.addEventListener('click', () => {
  if (state.currentPage > 1) {
    state.currentPage--;
    fetchInventory();
  }
});

nextPageBtn.addEventListener('click', () => {
  if (state.currentPage < state.totalPages) {
    state.currentPage++;
    fetchInventory();
  }
});

// ==========================================
// Modal Handlers
// ==========================================
function openModal(item = null) {
  if (item) {
    modalTitle.textContent = 'Edit Inventory Item';
    itemIdInput.value = item.id;
    itemNameInput.value = item.name;
    itemCategoryInput.value = item.category;
    itemQuantityInput.value = item.quantity;
    itemPriceInput.value = item.price;
  } else {
    modalTitle.textContent = 'Add New Inventory Item';
    itemForm.reset();
    itemIdInput.value = '';
  }
  itemModal.classList.remove('hidden');
}

function closeModal() {
  itemModal.classList.add('hidden');
  itemForm.reset();
}

openAddModalBtn.addEventListener('click', () => openModal());
closeModalBtn.addEventListener('click', closeModal);
cancelModalBtn.addEventListener('click', closeModal);

itemForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const itemData = {
    name: itemNameInput.value.trim(),
    category: itemCategoryInput.value,
    quantity: parseInt(itemQuantityInput.value, 10),
    price: parseFloat(itemPriceInput.value)
  };

  if (itemIdInput.value) {
    itemData.id = parseInt(itemIdInput.value, 10);
  }

  saveItem(itemData);
});

// Initial Load
document.addEventListener('DOMContentLoaded', () => {
  fetchInventory();
});

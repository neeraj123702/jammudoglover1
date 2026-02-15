// ===========================
// Professional Admin Dashboard v2
// Enhanced with Password Management & Google Sheets Integration
// ===========================

// Configuration
const ADMIN_CONFIG = {
    defaultUsername: 'admin',
    defaultPassword: 'admin123',
    googleSheetsUrl: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQzNPaUcCLd30eqGC4yzQwOeRsIbuQPOA6OuLrN8gk29hnFaEYnCBWs3DvolEgRrmxMje5SjGt7tzcn/pub?output=csv',
    googleAppsScriptUrl: '',  // User must set this - see SETUP_GOOGLE_APPS_SCRIPT.md
    corsProxy: 'https://cors.bridged.cc/'
};

// Global State
let adminState = {
    isLoggedIn: false,
    username: null,
    dogs: [],
    editingId: null,
    pendingAction: null,
    credentials: null  // Loaded from localStorage
};

// ===========================
// CREDENTIALS MANAGEMENT (localStorage)
// ===========================

function initializeCredentials() {
    // Load credentials from localStorage, or use defaults
    const stored = localStorage.getItem('admin_credentials');
    if (stored) {
        try {
            adminState.credentials = JSON.parse(stored);
            console.log('[Admin] Loaded credentials from localStorage');
        } catch (error) {
            console.error('[Admin] Error parsing stored credentials:', error);
            resetToDefaultCredentials();
        }
    } else {
        resetToDefaultCredentials();
    }
}

function resetToDefaultCredentials() {
    adminState.credentials = {
        username: ADMIN_CONFIG.defaultUsername,
        password: ADMIN_CONFIG.defaultPassword
    };
    localStorage.setItem('admin_credentials', JSON.stringify(adminState.credentials));
    console.log('[Admin] Using default credentials');
}

function updateStoredCredentials(username, password) {
    adminState.credentials = { username, password };
    localStorage.setItem('admin_credentials', JSON.stringify(adminState.credentials));
    console.log('[Admin] Credentials updated and saved to localStorage');
}

// ===========================
// INITIALIZATION
// ===========================

document.addEventListener('DOMContentLoaded', () => {
    console.log('[Admin] Dashboard initialized v2');
    initializeCredentials();  // Load credentials from storage
    checkSession();
    setupEventListeners();
    loadDogsFromGoogleSheets();
    updateLastUpdate();
    setInterval(updateLastUpdate, 60000); // Update every minute
});

// ===========================
// SESSION MANAGEMENT
// ===========================

function checkSession() {
    const session = sessionStorage.getItem('adminSession');
    if (session) {
        adminState.isLoggedIn = true;
        adminState.username = session;
        showDashboard();
        console.log('[Admin] Session found:', session);
    } else {
        showLoginPage();
    }
}

function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    const loginBtn = document.getElementById('loginBtn');
    const loginError = document.getElementById('loginError');

    // Clear error
    loginError.textContent = '';
    loginError.style.display = 'none';

    // Validate against stored credentials
    if (username === adminState.credentials.username && password === adminState.credentials.password) {
        // Success
        sessionStorage.setItem('adminSession', username);
        adminState.isLoggedIn = true;
        adminState.username = username;
        console.log('[Admin] Login successful:', username);
        showToast('✅ Login successful!', 'success');
        showDashboard();
    } else {
        // Error
        console.log('[Admin] Login failed: invalid credentials');
        loginError.textContent = '❌ Invalid username or password';
        loginError.style.display = 'block';
        showToast('❌ Invalid credentials', 'error');
        document.getElementById('loginPassword').value = '';
    }
}

function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        sessionStorage.removeItem('adminSession');
        adminState.isLoggedIn = false;
        adminState.username = null;
        console.log('[Admin] Logout successful');
        showLoginPage();
        showToast('👋 Logged out successfully', 'info');
    }
}

// ===========================
// UI NAVIGATION
// ===========================

function showLoginPage() {
    document.getElementById('loginPage').style.display = 'flex';
    document.getElementById('adminPanel').style.display = 'none';
}

function showDashboard() {
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'flex';
    updateDashboard();
}

function setupEventListeners() {
    // Sidebar navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = item.getAttribute('data-section');
            switchSection(section);
        });
    });
}

function switchSection(sectionName) {
    // Remove active class from all nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });

    // Add active class to clicked item
    const navItem = document.querySelector(`[data-section="${sectionName}"]`);
    if (navItem) {
        navItem.classList.add('active');
    }

    // Hide all sections
    document.querySelectorAll('[class*="-section"]').forEach(section => {
        section.classList.remove('active');
    });

    // Show selected section
    const section = document.querySelector(`.${sectionName}-section`);
    if (section) {
        section.classList.add('active');
    }

    // Update header title
    const titleMap = {
        'dashboard': '📊 Dashboard',
        'add-dog': '➕ Add Dog',
        'manage-dogs': '📋 Manage Dogs',
        'settings': '⚙️ Settings'
    };
    document.getElementById('sectionTitle').textContent = titleMap[sectionName] || 'Dashboard';

    // Special actions
    if (sectionName === 'manage-dogs') {
        loadDogsTable();
    } else if (sectionName === 'add-dog') {
        document.getElementById('addDogForm').reset();
    }
}

// ===========================
// DASHBOARD UPDATES
// ===========================

function updateDashboard() {
    console.log('[Admin] Updating dashboard stats');
    
    if (adminState.dogs.length === 0) {
        document.getElementById('totalDogs').textContent = '0';
        document.getElementById('availableDogs').textContent = '0';
        document.getElementById('avgPrice').textContent = '₹0';
        document.getElementById('lastDog').textContent = '-';
        return;
    }

    // Total dogs
    document.getElementById('totalDogs').textContent = adminState.dogs.length;

    // Available dogs
    const available = adminState.dogs.filter(d => d.status === 'Available').length;
    document.getElementById('availableDogs').textContent = available;

    // Average price
    const prices = adminState.dogs
        .map(d => parseInt(d.price) || 0)
        .filter(p => p > 0);
    const avgPrice = prices.length > 0 
        ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length)
        : 0;
    document.getElementById('avgPrice').textContent = `₹${avgPrice.toLocaleString()}`;

    // Last added dog
    if (adminState.dogs.length > 0) {
        document.getElementById('lastDog').textContent = adminState.dogs[0].name || '-';
    }

    // Settings page
    document.getElementById('totalRecords').textContent = adminState.dogs.length;
}

function updateLastUpdate() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-IN', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
    });
    document.getElementById('lastUpdate').textContent = `Last updated: ${timeString}`;
}

// ===========================
// GOOGLE SHEETS INTEGRATION
// ===========================

async function loadDogsFromGoogleSheets() {
    console.log('[Admin] Loading dogs from Google Sheets');
    
    try {
        // Try direct fetch first
        let csvText = null;
        
        try {
            const response = await fetch(ADMIN_CONFIG.googleSheetsUrl);
            if (response.ok) {
                csvText = await response.text();
                console.log('[Admin] Successfully fetched from Google Sheets (direct)');
            }
        } catch (directError) {
            console.log('[Admin] Direct fetch failed, trying CORS proxy...');
            const proxyUrl = ADMIN_CONFIG.corsProxy + ADMIN_CONFIG.googleSheetsUrl;
            const response = await fetch(proxyUrl);
            if (response.ok) {
                csvText = await response.text();
                console.log('[Admin] Successfully fetched from Google Sheets (CORS proxy)');
            }
        }

        if (csvText) {
            adminState.dogs = parseCSV(csvText);
            console.log('[Admin] Parsed dogs:', adminState.dogs.length);
            updateDashboard();
            saveDogsToLocalStorage();
            return;
        }
    } catch (error) {
        console.error('[Admin] Error loading from Google Sheets:', error);
    }

    // Fallback to localStorage
    console.log('[Admin] Using localStorage fallback');
    loadDogsFromLocalStorage();
}

function parseCSV(csvText) {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const dogs = [];

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const values = parseCSVLine(line);
        if (values.length < headers.length) {
            for (let j = values.length; j < headers.length; j++) {
                values.push('');
            }
        }

        const dog = {};
        headers.forEach((header, index) => {
            dog[header] = values[index] ? values[index].trim() : '';
        });

        if (dog.name && dog.name.length > 0) {
            dogs.push(dog);
        }
    }

    return dogs;
}

function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const nextChar = line[i + 1];

        if (char === '"') {
            if (inQuotes && nextChar === '"') {
                current += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }

    result.push(current);
    return result;
}

// ===========================
// LOCAL STORAGE MANAGEMENT
// ===========================

function saveDogsToLocalStorage() {
    try {
        localStorage.setItem('admin_dogs_backup', JSON.stringify(adminState.dogs));
        console.log('[Admin] Dogs saved to localStorage');
    } catch (error) {
        console.error('[Admin] Error saving to localStorage:', error);
    }
}

function loadDogsFromLocalStorage() {
    try {
        const stored = localStorage.getItem('admin_dogs_backup');
        if (stored) {
            adminState.dogs = JSON.parse(stored);
            console.log('[Admin] Loaded dogs from localStorage:', adminState.dogs.length);
            updateDashboard();
            return;
        }
    } catch (error) {
        console.error('[Admin] Error loading from localStorage:', error);
    }
    
    adminState.dogs = [];
}

function clearAllData() {
    if (confirm('⚠️ Clear all locally cached data? This cannot be undone.')) {
        localStorage.removeItem('admin_dogs_backup');
        adminState.dogs = [];
        updateDashboard();
        loadDogsFromGoogleSheets();
        showToast('✅ Cache cleared successfully', 'success');
        console.log('[Admin] All local data cleared');
    }
}

// ===========================
// ADD DOG FUNCTIONALITY
// ===========================

function handleAddDog(event) {
    event.preventDefault();

    const dog = {
        id: Date.now().toString(),
        name: document.getElementById('dogName').value,
        breed: document.getElementById('dogBreed').value,
        age: document.getElementById('dogAge').value,
        gender: document.getElementById('dogGender').value,
        price: document.getElementById('dogPrice').value,
        image: document.getElementById('dogImage').value,
        description: document.getElementById('dogDescription').value,
        status: document.getElementById('dogStatus').value
    };

    if (!dog.name || !dog.breed || !dog.age || !dog.price) {
        showToast('❌ Please fill all required fields', 'error');
        return;
    }

    console.log('[Admin] Adding new dog:', dog);

    // Try to sync with Google Sheets via Apps Script
    addDogToGoogleSheets(dog);
}

async function addDogToGoogleSheets(dog) {
    const formBtn = document.querySelector('#addDogForm .btn-submit');
    const originalText = formBtn.textContent;
    formBtn.disabled = true;
    formBtn.innerHTML = '<span class="spinner" style="display:inline-block;width:16px;height:16px;border:2px solid var(--primary);border-top-color:transparent;border-radius:50%;animation:spin 0.6s linear infinite;"></span> Adding...';

    try {
        // If Google Apps Script URL is configured, try to send there
        if (ADMIN_CONFIG.googleAppsScriptUrl && ADMIN_CONFIG.googleAppsScriptUrl.trim()) {
            const response = await fetch(ADMIN_CONFIG.googleAppsScriptUrl, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    action: 'addDog',
                    dog: dog
                })
            });

            console.log('[Admin] Posted dog to Google Sheets via Apps Script');
            showToast('✅ Dog added to Google Sheets!', 'success');
            
            // Wait a moment for Google Sheets to update, then refresh
            setTimeout(() => {
                loadDogsFromGoogleSheets();
                broadcastDogUpdate('add', dog);
            }, 2000);
        } else {
            // No Apps Script URL - use demo mode with localStorage
            throw new Error('Google Apps Script URL not configured - using demo mode');
        }
    } catch (error) {
        console.log('[Admin] Google Sheets sync failed, using demo mode:', error.message);
        
        // Demo mode: store locally
        adminState.dogs.unshift(dog);
        saveDogsToLocalStorage();
        updateDashboard();
        
        showToast('✅ Dog added locally! (Demo mode - not synced to Google Sheets)\n⚠️ See settings for Google Sheets setup', 'success');
        
        // Still broadcast to live update dogs.html
        broadcastDogUpdate('add', dog);
    } finally {
        // Reset form button
        formBtn.disabled = false;
        formBtn.textContent = originalText;

        // Reset form
        document.getElementById('addDogForm').reset();

        // Show management page
        setTimeout(() => {
            loadDogsTable();
            switchSection('manage-dogs');
        }, 500);
    }
}

// ===========================
// MANAGE DOGS - TABLE VIEW
// ===========================

function loadDogsTable() {
    console.log('[Admin] Loading dogs table');
    const container = document.getElementById('dogsTableContainer');

    if (adminState.dogs.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📭</div>
                <p>No dogs found. Click "Add Dog" to get started!</p>
            </div>
        `;
        return;
    }

    let html = `
        <table class="dogs-table">
            <thead>
                <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Breed</th>
                    <th>Age</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
    `;

    adminState.dogs.forEach((dog, index) => {
        const statusClass = dog.status === 'Available' ? 'status-available' : 'status-sold';
        html += `
            <tr>
                <td>${index + 1}</td>
                <td class="dog-name">${dog.name || '-'}</td>
                <td>${dog.breed || '-'}</td>
                <td>${dog.age || '-'}</td>
                <td>₹${dog.price ? parseInt(dog.price).toLocaleString() : '0'}</td>
                <td><span class="dog-status ${statusClass}">${dog.status || 'Unknown'}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-small btn-edit" onclick="editDog('${dog.id}')">Edit</button>
                        <button class="btn-small btn-delete" onclick="deleteDog('${dog.id}')">Delete</button>
                    </div>
                </td>
            </tr>
        `;
    });

    html += `
            </tbody>
        </table>
    `;

    container.innerHTML = html;
}

function refreshDogsList() {
    showToast('🔄 Refreshing dogs list...', 'info');
    loadDogsFromGoogleSheets();
    setTimeout(() => {
        loadDogsTable();
    }, 500);
}

// ===========================
// EDIT DOG FUNCTIONALITY
// ===========================

function editDog(dogId) {
    const dog = adminState.dogs.find(d => d.id === dogId);
    if (!dog) return;

    console.log('[Admin] Editing dog:', dogId);

    // For now, show a simple alert-based edit
    const newName = prompt(`Edit dog name (current: ${dog.name}):`, dog.name);
    if (newName !== null && newName.trim()) {
        dog.name = newName.trim();
        saveDogsToLocalStorage();
        loadDogsTable();
        showToast('✅ Dog updated successfully! (Demo - stored locally)', 'success');
    }
}

// ===========================
// DELETE DOG FUNCTIONALITY
// ===========================

function deleteDog(dogId) {
    const dog = adminState.dogs.find(d => d.id === dogId);
    if (!dog) return;

    adminState.pendingAction = () => {
        adminState.dogs = adminState.dogs.filter(d => d.id !== dogId);
        saveDogsToLocalStorage();
        loadDogsTable();
        updateDashboard();
        console.log('[Admin] Dog deleted:', dogId);
        showToast('✅ Dog deleted successfully! (Demo - stored locally)', 'success');
    };

    showConfirmModal(
        'Delete Dog',
        `Are you sure you want to delete "${dog.name}"? This action cannot be undone.`,
        () => {
            if (adminState.pendingAction) {
                adminState.pendingAction();
                adminState.pendingAction = null;
            }
        }
    );
}

// ===========================
// MODAL FUNCTIONS
// ===========================

function showConfirmModal(title, message, onConfirm) {
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalBody').textContent = message;
    document.getElementById('modalConfirmBtn').onclick = () => {
        closeModal();
        onConfirm();
    };
    document.getElementById('confirmModal').classList.add('active');
}

function closeModal() {
    document.getElementById('confirmModal').classList.remove('active');
    adminState.pendingAction = null;
}

function confirmAction() {
    if (adminState.pendingAction) {
        adminState.pendingAction();
    }
    closeModal();
}

// Close modal on background click
document.addEventListener('click', (e) => {
    const modal = document.getElementById('confirmModal');
    if (e.target === modal) {
        closeModal();
    }
});

// ===========================
// LIVE SYNC & BROADCAST
// ===========================

function broadcastDogUpdate(action, dog) {
    // Send update to other browser tabs/windows
    try {
        if (BroadcastChannel) {
            const channel = new BroadcastChannel('admin_updates');
            channel.postMessage({
                type: 'dog_update',
                action: action,  // 'add', 'edit', 'delete'
                dog: dog,
                timestamp: new Date().toISOString()
            });
            channel.close();
            console.log('[Admin] Broadcast sent:', action, dog.name);
        }
    } catch (e) {
        // BroadcastChannel not supported, fall back to localStorage
        localStorage.setItem('admin_last_update', JSON.stringify({
            type: 'dog_update',
            action: action,
            dog: dog,
            timestamp: new Date().toISOString()
        }));
        console.log('[Admin] localStorage broadcast sent:', action);
    }
}

// ===========================
// PASSWORD MANAGEMENT
// ===========================

function handleChangePassword(event) {
    event.preventDefault();

    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const errorDiv = document.getElementById('passwordError');
    const successDiv = document.getElementById('passwordSuccess');

    // Clear messages
    errorDiv.textContent = '';
    errorDiv.style.display = 'none';
    successDiv.textContent = '';
    successDiv.style.display = 'none';

    // Validate current password
    if (currentPassword !== adminState.credentials.password) {
        errorDiv.textContent = '❌ Current password is incorrect';
        errorDiv.style.display = 'block';
        console.log('[Admin] Password change failed: wrong current password');
        return;
    }

    // Validate new passwords match
    if (newPassword !== confirmPassword) {
        errorDiv.textContent = '❌ New password and confirm password do not match';
        errorDiv.style.display = 'block';
        return;
    }

    // Validate new password length
    if (newPassword.length < 4) {
        errorDiv.textContent = '❌ New password must be at least 4 characters';
        errorDiv.style.display = 'block';
        return;
    }

    // Update credentials
    updateStoredCredentials(adminState.credentials.username, newPassword);

    // Show success
    successDiv.textContent = '✅ Password changed successfully!';
    successDiv.style.display = 'block';
    showToast('✅ Password changed successfully!', 'success');
    console.log('[Admin] Password updated successfully');

    // Reset form
    setTimeout(() => {
        document.getElementById('changePasswordForm').reset();
        successDiv.style.display = 'none';
    }, 3000);
}

// ===========================
// TOAST NOTIFICATIONS  
// ===========================

function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const iconMap = {
        success: '✅',
        error: '❌',
        info: 'ℹ️'
    };

    toast.innerHTML = `
        <div class="toast-icon">${iconMap[type]}</div>
        <div class="toast-message">${message}</div>
    `;

    container.appendChild(toast);
    console.log(`[Admin] Toast [${type}]: ${message}`);

    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ===========================
// UTILITY FUNCTIONS
// ===========================

// Prevent accidental logout
window.addEventListener('beforeunload', (e) => {
    if (adminState.isLoggedIn) {
        // Optional: warn user about unsaved changes
    }
});

console.log('[Admin] Professional Admin Dashboard loaded');

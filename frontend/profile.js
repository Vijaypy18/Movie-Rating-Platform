// Constants for API endpoints
const API_BASE_URL = 'http://localhost:5001/api';

// Cache DOM elements
const elements = {
    profileDisplay: document.getElementById('profile-display'),
    profileForm: document.getElementById('profile-form'),
    profileInitial: document.getElementById('profile-initial'),
    profileUsername: document.getElementById('profile-username'),
    profileEmail: document.getElementById('profile-email'),
    accountCreated: document.getElementById('account-created'),
    lastLoginTime: document.getElementById('last-login-time'),
    activityLog: document.getElementById('activity-log'),
    editUsernameInput: document.getElementById('edit-username'),
    editEmailInput: document.getElementById('edit-email'),
    currentPasswordInput: document.getElementById('current-password'),
    editProfileBtn: document.getElementById('edit-profile-btn'),
    cancelEditBtn: document.getElementById('cancel-edit'),
    deleteAccountBtn: document.getElementById('delete-account-btn'),
    logoutBtn: document.getElementById('logout-btn'),
    loadingIndicator: document.getElementById('loading-indicator')
};

// Global variables
let currentUser = null;
let isLoggedIn = false;

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    checkAuthStatus();
    setupEventListeners();
    if (isLoggedIn) {
        loadUserProfile();
        loadUserActivity();
    }
});

// Check if user is logged in
function checkAuthStatus() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
        isLoggedIn = true;
        currentUser = JSON.parse(user);
    } else {
        // Redirect to login if not authenticated
        window.location.href = 'index.html';
    }
}

// Setup event listeners
function setupEventListeners() {
    elements.editProfileBtn.addEventListener('click', toggleEditMode);
    elements.cancelEditBtn.addEventListener('click', cancelEdit);
    elements.profileForm.addEventListener('submit', handleProfileUpdate);
    elements.deleteAccountBtn.addEventListener('click', handleDeleteAccount);
    elements.logoutBtn.addEventListener('click', handleLogout);
}

// Load user profile data
async function loadUserProfile() {
    showLoading(true);
    
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_BASE_URL}/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const user = response.data;
        displayUserProfile(user);
        
        // Update stored user data
        localStorage.setItem('user', JSON.stringify(user));
        currentUser = user;
        
    } catch (error) {
        console.error('Load profile error:', error);
        showError('Failed to load profile data');
        
        // If token is invalid, redirect to login
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = 'index.html';
        }
    } finally {
        showLoading(false);
    }
}

// Display user profile information
function displayUserProfile(user) {
    elements.profileInitial.textContent = user.username.charAt(0).toUpperCase();
    elements.profileUsername.textContent = user.username;
    elements.profileEmail.textContent = user.email;
    
    // Format dates
    const createdDate = new Date(user.createdAt || user.timestamps?.createdAt);
    elements.accountCreated.textContent = createdDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    // Show current time as last login (since we don't track this separately)
    elements.lastLoginTime.textContent = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    // Populate edit form
    elements.editUsernameInput.value = user.username;
    elements.editEmailInput.value = user.email;
}

// Load user activity (mock data for now)
async function loadUserActivity() {
    try {
        const token = localStorage.getItem('token');
        
        // Get user's watchlists
        const watchlistResponse = await axios.get(`${API_BASE_URL}/watchlist`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        // Get user's favorites
        const favoritesResponse = await axios.get(`${API_BASE_URL}/favourites`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        // Get friends list
        const friendsResponse = await axios.get(`${API_BASE_URL}/friends/list`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        displayUserActivity({
            watchlists: watchlistResponse.data,
            favorites: favoritesResponse.data,
            friends: friendsResponse.data
        });
        
    } catch (error) {
        console.error('Load activity error:', error);
        // Show basic activity even if API calls fail
        displayBasicActivity();
    }
}

// Display user activity
function displayUserActivity(data) {
    const activities = [];
    
    // Count movies in watchlists
    let totalWatchlistMovies = 0;
    if (data.watchlists && Array.isArray(data.watchlists)) {
        data.watchlists.forEach(watchlist => {
            if (watchlist.movies) {
                totalWatchlistMovies += watchlist.movies.length;
            }
        });
    }
    
    activities.push({
        icon: 'fas fa-list',
        text: `${totalWatchlistMovies} movies in watchlists`,
        time: 'Total'
    });
    
    activities.push({
        icon: 'fas fa-heart',
        text: `${data.favorites?.length || 0} favorite movies`,
        time: 'Total'
    });
    
    activities.push({
        icon: 'fas fa-user-friends',
        text: `${data.friends?.length || 0} friends`,
        time: 'Total'
    });
    
    activities.push({
        icon: 'fas fa-sign-in-alt',
        text: 'Logged in',
        time: 'Today'
    });
    
    const activityHTML = activities.map(activity => `
        <div class="flex items-center justify-between p-2 hover:bg-gray-700 rounded">
            <div class="flex items-center space-x-3">
                <i class="${activity.icon} text-purple-400"></i>
                <span>${activity.text}</span>
            </div>
            <span class="text-gray-400 text-sm">${activity.time}</span>
        </div>
    `).join('');
    
    elements.activityLog.innerHTML = activityHTML;
}

// Display basic activity when API calls fail
function displayBasicActivity() {
    const basicActivities = [
        {
            icon: 'fas fa-user',
            text: 'Profile loaded',
            time: 'Just now'
        },
        {
            icon: 'fas fa-sign-in-alt',
            text: 'Logged in',
            time: 'Today'
        }
    ];
    
    const activityHTML = basicActivities.map(activity => `
        <div class="flex items-center justify-between p-2 hover:bg-gray-700 rounded">
            <div class="flex items-center space-x-3">
                <i class="${activity.icon} text-purple-400"></i>
                <span>${activity.text}</span>
            </div>
            <span class="text-gray-400 text-sm">${activity.time}</span>
        </div>
    `).join('');
    
    elements.activityLog.innerHTML = activityHTML;
}

// Toggle edit mode
function toggleEditMode() {
    elements.profileDisplay.classList.add('hidden');
    elements.profileForm.classList.remove('hidden');
    elements.editProfileBtn.classList.add('hidden');
    elements.deleteAccountBtn.classList.add('hidden');
}

// Cancel edit mode
function cancelEdit() {
    elements.profileForm.classList.add('hidden');
    elements.profileDisplay.classList.remove('hidden');
    elements.editProfileBtn.classList.remove('hidden');
    elements.deleteAccountBtn.classList.remove('hidden');
    
    // Reset form values
    elements.editUsernameInput.value = currentUser.username;
    elements.editEmailInput.value = currentUser.email;
    elements.currentPasswordInput.value = '';
}

// Handle profile update
async function handleProfileUpdate(e) {
    e.preventDefault();
    
    const username = elements.editUsernameInput.value.trim();
    const email = elements.editEmailInput.value.trim();
    const currentPassword = elements.currentPasswordInput.value;
    
    if (!username || !email || !currentPassword) {
        showError('Please fill in all required fields');
        return;
    }
    
    showLoading(true);
    
    try {
        const token = localStorage.getItem('token');
        const response = await axios.put(`${API_BASE_URL}/auth/update`, {
            username,
            email,
            currentPassword
        }, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        showSuccess('Profile updated successfully!');
        
        // Update stored user data
        const updatedUser = response.data.user;
        localStorage.setItem('user', JSON.stringify(updatedUser));
        currentUser = updatedUser;
        
        // Refresh profile display
        displayUserProfile(updatedUser);
        cancelEdit();
        
    } catch (error) {
        console.error('Update profile error:', error);
        showError(error.response?.data?.message || 'Failed to update profile');
    } finally {
        showLoading(false);
    }
}

// Handle account deletion
async function handleDeleteAccount() {
    const confirmMessage = 'Are you sure you want to delete your account? This action cannot be undone.';
    
    if (!confirm(confirmMessage)) {
        return;
    }
    
    const doubleConfirm = prompt('Type "DELETE" to confirm account deletion:');
    if (doubleConfirm !== 'DELETE') {
        showError('Account deletion cancelled');
        return;
    }
    
    showLoading(true);
    
    try {
        const token = localStorage.getItem('token');
        await axios.delete(`${API_BASE_URL}/auth/delete`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        showSuccess('Account deleted successfully');
        
        // Clear local storage and redirect
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
        
    } catch (error) {
        console.error('Delete account error:', error);
        showError(error.response?.data?.message || 'Failed to delete account');
    } finally {
        showLoading(false);
    }
}

// Handle logout
function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'index.html';
    }
}

// Show/hide loading indicator
function showLoading(show) {
    if (show) {
        elements.loadingIndicator.classList.remove('hidden');
    } else {
        elements.loadingIndicator.classList.add('hidden');
    }
}

// Show success message
function showSuccess(message) {
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Show error message
function showError(message) {
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}
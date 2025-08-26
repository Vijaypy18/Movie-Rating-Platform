// Constants for API endpoints
const API_BASE_URL = 'http://localhost:5001/api';

// Cache DOM elements
const elements = {
    authBtn: document.getElementById('auth-btn'),
    myWatchlistTab: document.getElementById('my-watchlist-tab'),
    friendsTab: document.getElementById('friends-tab'),
    searchUsersTab: document.getElementById('search-users-tab'),
    myWatchlistsSection: document.getElementById('my-watchlists'),
    friendsSection: document.getElementById('friends-section'),
    searchUsersSection: document.getElementById('search-users-section'),
    publicBtn: document.getElementById('public-btn'),
    privateBtn: document.getElementById('private-btn'),
    watchlistContainer: document.getElementById('watchlist-container'),
    emptyMessage: document.getElementById('empty-message'),
    friendRequestsContainer: document.getElementById('friend-requests-container'),
    friendsContainer: document.getElementById('friends-container'),
    userSearchInput: document.getElementById('user-search-input'),
    userSearchResults: document.getElementById('user-search-results'),
    friendWatchlistModal: document.getElementById('friend-watchlist-modal'),
    friendWatchlistTitle: document.getElementById('friend-watchlist-title'),
    friendWatchlistContent: document.getElementById('friend-watchlist-content')
};

// Global variables
let currentUser = null;
let isLoggedIn = false;
let currentWatchlistType = 'public';
let currentTab = 'my-watchlists';

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    checkAuthStatus();
    setupEventListeners();
    if (isLoggedIn) {
        loadWatchlist('public');
    }
});

// Check if user is logged in
function checkAuthStatus() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
        isLoggedIn = true;
        currentUser = JSON.parse(user);
        updateUIForLoggedInUser();
    } else {
        showLoginPrompt();
    }
}

// Update UI for logged-in user
function updateUIForLoggedInUser() {
    elements.authBtn.textContent = `Welcome, ${currentUser.username}!`;
    elements.authBtn.classList.remove('bg-purple-600');
    elements.authBtn.classList.add('bg-green-600');
    elements.authBtn.onclick = logout;
}

// Show login prompt for non-logged-in users
function showLoginPrompt() {
    elements.watchlistContainer.innerHTML = `
        <div class="col-span-full text-center py-12">
            <i class="fas fa-user-lock text-6xl text-gray-500 mb-4"></i>
            <h3 class="text-2xl font-semibold mb-4">Please Login</h3>
            <p class="text-gray-400 mb-6">You need to be logged in to view your watchlist and connect with friends.</p>
            <a href="index.html" class="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg">
                Go to Login
            </a>
        </div>
    `;
}

// Setup event listeners
function setupEventListeners() {
    // Tab navigation
    elements.myWatchlistTab.addEventListener('click', () => switchTab('my-watchlists'));
    elements.friendsTab.addEventListener('click', () => switchTab('friends'));
    elements.searchUsersTab.addEventListener('click', () => switchTab('search-users'));
    
    // User search
    elements.userSearchInput.addEventListener('input', debounce(searchUsers, 300));
    
    // Close search results when clicking outside
    document.addEventListener('click', (e) => {
        if (!elements.userSearchInput.contains(e.target) && !elements.userSearchResults.contains(e.target)) {
            elements.userSearchResults.classList.add('hidden');
        }
    });
}

// Switch between tabs
function switchTab(tabName) {
    currentTab = tabName;
    
    // Update tab buttons
    document.querySelectorAll('[id$="-tab"]').forEach(tab => {
        tab.classList.remove('bg-purple-600', 'text-white');
        tab.classList.add('text-gray-300');
    });
    
    // Hide all sections
    elements.myWatchlistsSection.classList.add('hidden');
    elements.friendsSection.classList.add('hidden');
    elements.searchUsersSection.classList.add('hidden');
    
    // Show selected section and update tab
    switch(tabName) {
        case 'my-watchlists':
            elements.myWatchlistTab.classList.add('bg-purple-600', 'text-white');
            elements.myWatchlistTab.classList.remove('text-gray-300');
            elements.myWatchlistsSection.classList.remove('hidden');
            if (isLoggedIn) loadWatchlist(currentWatchlistType);
            break;
        case 'friends':
            elements.friendsTab.classList.add('bg-purple-600', 'text-white');
            elements.friendsTab.classList.remove('text-gray-300');
            elements.friendsSection.classList.remove('hidden');
            if (isLoggedIn) {
                loadFriends();
                loadFriendRequests();
            }
            break;
        case 'search-users':
            elements.searchUsersTab.classList.add('bg-purple-600', 'text-white');
            elements.searchUsersTab.classList.remove('text-gray-300');
            elements.searchUsersSection.classList.remove('hidden');
            break;
    }
}

// Toggle watchlist view between public and private
function toggleWatchlistView(type) {
    currentWatchlistType = type;
    
    // Update button styles
    elements.publicBtn.classList.remove('bg-blue-700');
    elements.privateBtn.classList.remove('bg-green-700');
    
    if (type === 'public') {
        elements.publicBtn.classList.add('bg-blue-700');
    } else {
        elements.privateBtn.classList.add('bg-green-700');
    }
    
    loadWatchlist(type);
}

// Load user's watchlist
async function loadWatchlist(type) {
    if (!isLoggedIn) return;
    
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_BASE_URL}/watchlist`, {
            params: { type },
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const watchlists = response.data;
        const watchlist = watchlists.find(w => w.type === type);
        
        if (!watchlist || watchlist.movies.length === 0) {
            showEmptyWatchlist();
        } else {
            displayWatchlist(watchlist.movies);
        }
    } catch (error) {
        console.error('Load watchlist error:', error);
        showError('Failed to load watchlist');
    }
}

// Display watchlist movies
function displayWatchlist(movies) {
    elements.emptyMessage.classList.add('hidden');
    
    const moviesHTML = movies.map(movieItem => {
        const movie = movieItem.movie;
        // Movie data structure: posterPath, releaseDate, voteAverage
        
        // Handle different possible poster field names
        const posterPath = movie.poster_path || movie.posterPath || movie.poster;
        const posterUrl = posterPath 
            ? (posterPath.startsWith('/') ? `https://image.tmdb.org/t/p/w500${posterPath}` : posterPath)
            : '/placeholder-movie.png';
            
        // Handle different possible release date field names
        const releaseDate = movie.release_date || movie.releaseDate;
        const releaseYear = releaseDate ? new Date(releaseDate).getFullYear() : 'N/A';
        
        // Handle different possible vote average field names
        const voteAverage = movie.vote_average || movie.voteAverage || 0;
        
        return `
            <div class="movie-card bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 relative group">
                <div class="relative">
                    <img src="${posterUrl}" 
                         alt="${movie.title}" 
                         class="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                         onerror="this.src='/placeholder-movie.png'">
                    
                    <!-- Hover overlay with movie details -->
                    <div class="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                        <h4 class="text-white font-bold text-lg mb-2">${movie.title}</h4>
                        <p class="text-gray-200 text-sm mb-2 line-clamp-2">${movie.overview || 'No description available.'}</p>
                        <div class="flex items-center justify-between text-sm">
                            <div class="flex items-center text-yellow-400">
                                <i class="fas fa-star mr-1"></i>
                                <span>${voteAverage.toFixed(1)}</span>
                            </div>
                            <span class="text-gray-300">${releaseYear}</span>
                        </div>
                    </div>
                </div>
                
                <div class="p-4">
                    <h3 class="font-bold text-lg mb-2 truncate">${movie.title}</h3>
                    <p class="text-gray-400 text-sm mb-2">${releaseYear}</p>
                    
                    ${movieItem.comment ? `
                        <div class="mb-3 p-2 bg-gray-700 rounded">
                            <p class="text-sm text-gray-300">"${movieItem.comment}"</p>
                        </div>
                    ` : ''}
                    
                    <div class="flex items-center justify-between mb-4">
                        <div class="flex items-center">
                            <i class="fas fa-star text-yellow-400 mr-1"></i>
                            <span class="text-sm">${voteAverage.toFixed(1)}/10</span>
                        </div>
                        <span class="text-xs text-gray-500">Added: ${new Date(movieItem.addedAt).toLocaleDateString()}</span>
                    </div>
                    
                    <div class="flex space-x-2">
                        <button onclick="editComment('${movie._id}', '${(movieItem.comment || '').replace(/'/g, "\\'")}')" 
                                class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm flex-1 transition-colors">
                            <i class="fas fa-edit mr-1"></i>Edit Comment
                        </button>
                        <button onclick="removeFromWatchlist('${movie._id}')" 
                                class="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    elements.watchlistContainer.innerHTML = moviesHTML;
}

// Show empty watchlist message
function showEmptyWatchlist() {
    elements.emptyMessage.classList.remove('hidden');
    elements.watchlistContainer.innerHTML = '';
}

// Edit comment for a movie in watchlist
function editComment(movieId, currentComment) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-gray-800 p-6 rounded-lg w-96">
            <h3 class="text-xl font-bold mb-4">Edit Comment</h3>
            <textarea id="comment-input" rows="4" 
                      class="w-full p-3 bg-gray-700 rounded resize-none mb-4"
                      placeholder="Add your thoughts about this movie...">${currentComment}</textarea>
            <div class="flex space-x-3">
                <button onclick="saveComment('${movieId}')" 
                        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex-1">
                    Save Comment
                </button>
                <button onclick="closeCommentModal()" 
                        class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded">
                    Cancel
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.onclick = (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    };
}

// Save comment
async function saveComment(movieId) {
    const comment = document.getElementById('comment-input').value.trim();
    
    try {
        const token = localStorage.getItem('token');
        // Find the watchlist ID first
        const watchlistResponse = await axios.get(`${API_BASE_URL}/watchlist`, {
            params: { type: currentWatchlistType },
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const watchlist = watchlistResponse.data.find(w => w.type === currentWatchlistType);
        if (!watchlist) {
            showError('Watchlist not found');
            return;
        }
        
        await axios.put(`${API_BASE_URL}/watchlist/${watchlist._id}/movie/${movieId}/comment`, {
            comment
        }, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        showSuccess('Comment updated successfully!');
        closeCommentModal();
        loadWatchlist(currentWatchlistType);
    } catch (error) {
        console.error('Save comment error:', error);
        showError('Failed to save comment');
    }
}

// Close comment modal
function closeCommentModal() {
    const modal = document.querySelector('.fixed.inset-0.bg-black.bg-opacity-50');
    if (modal) {
        modal.remove();
    }
}

// Remove movie from watchlist
async function removeFromWatchlist(movieId) {
    if (!confirm('Are you sure you want to remove this movie from your watchlist?')) {
        return;
    }
    
    try {
        const token = localStorage.getItem('token');
        // Find the watchlist ID first
        const watchlistResponse = await axios.get(`${API_BASE_URL}/watchlist`, {
            params: { type: currentWatchlistType },
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const watchlist = watchlistResponse.data.find(w => w.type === currentWatchlistType);
        if (!watchlist) {
            showError('Watchlist not found');
            return;
        }
        
        await axios.delete(`${API_BASE_URL}/watchlist/${watchlist._id}/movie/${movieId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        showSuccess('Movie removed from watchlist!');
        loadWatchlist(currentWatchlistType);
    } catch (error) {
        console.error('Remove from watchlist error:', error);
        showError('Failed to remove movie from watchlist');
    }
}

// Load friends
async function loadFriends() {
    if (!isLoggedIn) return;
    
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_BASE_URL}/friends/list`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        displayFriends(response.data);
    } catch (error) {
        console.error('Load friends error:', error);
        showError('Failed to load friends');
    }
}

// Display friends
function displayFriends(friends) {
    if (friends.length === 0) {
        elements.friendsContainer.innerHTML = `
            <div class="col-span-full text-center py-8">
                <i class="fas fa-user-friends text-4xl text-gray-500 mb-4"></i>
                <p class="text-gray-400">No friends yet. Search for users to add friends!</p>
            </div>
        `;
        return;
    }
    
    const friendsHTML = friends.map(friend => `
        <div class="bg-gray-800 rounded-lg p-4 text-center">
            <div class="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <i class="fas fa-user text-2xl"></i>
            </div>
            <h4 class="font-semibold mb-2">${friend.username}</h4>
            <p class="text-gray-400 text-sm mb-4">${friend.email}</p>
            <div class="space-y-2">
                <button onclick="viewFriendWatchlist('${friend._id}', '${friend.username}')" 
                        class="w-full bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm">
                    <i class="fas fa-list mr-1"></i>View Watchlist
                </button>
                <button onclick="removeFriend('${friend._id}', '${friend.username}')" 
                        class="w-full bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm">
                    <i class="fas fa-user-minus mr-1"></i>Remove Friend
                </button>
            </div>
        </div>
    `).join('');
    
    elements.friendsContainer.innerHTML = friendsHTML;
}

// Load friend requests
async function loadFriendRequests() {
    if (!isLoggedIn) return;
    
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_BASE_URL}/friends/requests`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        displayFriendRequests(response.data);
    } catch (error) {
        console.error('Load friend requests error:', error);
        showError('Failed to load friend requests');
    }
}

// Display friend requests
function displayFriendRequests(requests) {
    if (requests.received.length === 0) {
        elements.friendRequestsContainer.innerHTML = `
            <p class="text-gray-400 text-center">No pending friend requests</p>
        `;
        return;
    }
    
    const requestsHTML = requests.received.map(user => `
        <div class="bg-gray-800 rounded-lg p-4 flex items-center justify-between">
            <div class="flex items-center space-x-3">
                <div class="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                    <i class="fas fa-user"></i>
                </div>
                <div>
                    <h4 class="font-semibold">${user.username}</h4>
                    <p class="text-gray-400 text-sm">${user.email}</p>
                </div>
            </div>
            <div class="space-x-2">
                <button onclick="acceptFriendRequest('${user._id}')" 
                        class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm">
                    <i class="fas fa-check mr-1"></i>Accept
                </button>
                <button onclick="rejectFriendRequest('${user._id}')" 
                        class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm">
                    <i class="fas fa-times mr-1"></i>Reject
                </button>
            </div>
        </div>
    `).join('');
    
    elements.friendRequestsContainer.innerHTML = requestsHTML;
}

// Accept friend request
async function acceptFriendRequest(userId) {
    try {
        const token = localStorage.getItem('token');
        await axios.post(`${API_BASE_URL}/friends/accept/${userId}`, {}, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        showSuccess('Friend request accepted!');
        loadFriendRequests();
        loadFriends();
    } catch (error) {
        console.error('Accept friend request error:', error);
        showError('Failed to accept friend request');
    }
}

// Reject friend request
async function rejectFriendRequest(userId) {
    try {
        const token = localStorage.getItem('token');
        await axios.post(`${API_BASE_URL}/friends/reject/${userId}`, {}, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        showSuccess('Friend request rejected');
        loadFriendRequests();
    } catch (error) {
        console.error('Reject friend request error:', error);
        showError('Failed to reject friend request');
    }
}

// Remove friend
async function removeFriend(userId, username) {
    if (!confirm(`Are you sure you want to remove ${username} from your friends?`)) {
        return;
    }
    
    try {
        const token = localStorage.getItem('token');
        await axios.delete(`${API_BASE_URL}/friends/remove/${userId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        showSuccess('Friend removed successfully');
        loadFriends();
    } catch (error) {
        console.error('Remove friend error:', error);
        showError('Failed to remove friend');
    }
}

// View friend's watchlist
async function viewFriendWatchlist(userId, username) {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_BASE_URL}/friends/${userId}/watchlist`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        elements.friendWatchlistTitle.textContent = `${username}'s Public Watchlist`;
        
        if (!response.data.movies || response.data.movies.length === 0) {
            elements.friendWatchlistContent.innerHTML = `
                <div class="col-span-full text-center py-8">
                    <i class="fas fa-film text-4xl text-gray-500 mb-4"></i>
                    <p class="text-gray-400">${username} hasn't added any movies to their public watchlist yet.</p>
                </div>
            `;
        } else {
            const moviesHTML = response.data.movies.map(movieItem => {
                const movie = movieItem.movie;
                
                // Handle different possible poster field names
                const posterPath = movie.poster_path || movie.posterPath || movie.poster;
                const posterUrl = posterPath 
                    ? (posterPath.startsWith('/') ? `https://image.tmdb.org/t/p/w500${posterPath}` : posterPath)
                    : '/placeholder-movie.png';
                    
                // Handle different possible release date field names
                const releaseDate = movie.release_date || movie.releaseDate;
                const releaseYear = releaseDate ? new Date(releaseDate).getFullYear() : 'N/A';
                
                return `
                    <div class="bg-gray-700 rounded-lg overflow-hidden hover:bg-gray-600 transition-colors group">
                        <div class="relative">
                            <img src="${posterUrl}" 
                                 alt="${movie.title}" 
                                 class="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                                 onerror="this.src='/placeholder-movie.png'">
                            
                            <!-- Hover overlay -->
                            <div class="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                                <h4 class="text-white font-bold text-sm mb-1">${movie.title}</h4>
                                <span class="text-gray-300 text-xs">${releaseYear}</span>
                            </div>
                        </div>
                        <div class="p-3">
                            <h4 class="font-semibold mb-1 truncate">${movie.title}</h4>
                            <p class="text-gray-400 text-sm mb-2">${releaseYear}</p>
                            ${movieItem.comment ? `
                                <div class="p-2 bg-gray-600 rounded text-sm">
                                    <p class="text-gray-300">"${movieItem.comment}"</p>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                `;
            }).join('');
            
            elements.friendWatchlistContent.innerHTML = moviesHTML;
        }
        
        elements.friendWatchlistModal.classList.remove('hidden');
    } catch (error) {
        console.error('View friend watchlist error:', error);
        showError('Failed to load friend\'s watchlist');
    }
}

// Close friend watchlist modal
function closeFriendWatchlist() {
    elements.friendWatchlistModal.classList.add('hidden');
}

// Search users
async function searchUsers() {
    const query = elements.userSearchInput.value.trim();
    
    if (query.length < 2) {
        elements.userSearchResults.classList.add('hidden');
        return;
    }
    
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_BASE_URL}/friends/search`, {
            params: { query },
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        displayUserSearchResults(response.data);
    } catch (error) {
        console.error('Search users error:', error);
        showError('Failed to search users');
    }
}

// Display user search results
function displayUserSearchResults(users) {
    if (users.length === 0) {
        elements.userSearchResults.innerHTML = `
            <div class="p-4 text-center text-gray-400">
                No users found matching your search
            </div>
        `;
    } else {
        const usersHTML = users.map(user => `
            <div class="p-3 hover:bg-gray-700 border-b border-gray-600 last:border-b-0 flex items-center justify-between">
                <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                        <i class="fas fa-user text-sm"></i>
                    </div>
                    <div>
                        <h4 class="font-semibold">${user.username}</h4>
                        <p class="text-gray-400 text-sm">${user.email}</p>
                    </div>
                </div>
                <button onclick="sendFriendRequest('${user._id}', '${user.username}')" 
                        class="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm">
                    <i class="fas fa-user-plus mr-1"></i>Add Friend
                </button>
            </div>
        `).join('');
        
        elements.userSearchResults.innerHTML = usersHTML;
    }
    
    elements.userSearchResults.classList.remove('hidden');
}

// Send friend request
async function sendFriendRequest(userId, username) {
    try {
        const token = localStorage.getItem('token');
        await axios.post(`${API_BASE_URL}/friends/request/${userId}`, {}, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        showSuccess(`Friend request sent to ${username}!`);
        elements.userSearchResults.classList.add('hidden');
        elements.userSearchInput.value = '';
    } catch (error) {
        console.error('Send friend request error:', error);
        showError(error.response?.data?.message || 'Failed to send friend request');
    }
}

// Logout function
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
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
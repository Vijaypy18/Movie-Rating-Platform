// Constants for API endpoints
const API_BASE_URL = 'http://localhost:5001/api';

// Cache DOM elements
const elements = {
    searchInput: document.getElementById('search-input'),
    searchBtn: document.getElementById('search-btn'),
    moviesContainer: document.getElementById('movies-container'),
    suggestionsContainer: document.getElementById('suggestions-container'),
    prevPageBtn: document.getElementById('prev-page'),
    nextPageBtn: document.getElementById('next-page'),
    authModal: document.getElementById('auth-modal'),
    authToggle: document.getElementById('auth-toggle'),
    loginForm: document.getElementById('login-form'),
    registerForm: document.getElementById('register-form'),
    loginEmail: document.getElementById('login-email'),
    loginPassword: document.getElementById('login-password'),
    registerUsername: document.getElementById('register-username'),
    registerEmail: document.getElementById('register-email'),
    registerPassword: document.getElementById('register-password'),
    submitLogin: document.getElementById('submit-login'),
    submitRegister: document.getElementById('submit-register'),
    switchToRegister: document.getElementById('switch-to-register'),
    switchToLogin: document.getElementById('switch-to-login')
};

// Global variables
let currentPage = 1;
let currentQuery = '';
let isLoggedIn = false;
let currentUser = null;

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    checkAuthStatus();
    loadPopularMovies();
    setupEventListeners();
});

// Check if user is logged in
function checkAuthStatus() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
        isLoggedIn = true;
        currentUser = JSON.parse(user);
        updateUIForLoggedInUser();
    }
}

// Update UI for logged-in user
function updateUIForLoggedInUser() {
    elements.authToggle.textContent = `Welcome, ${currentUser.username}!`;
    elements.authToggle.classList.remove('bg-purple-600', 'hover:bg-purple-700');
    elements.authToggle.classList.add('bg-green-600', 'hover:bg-green-700');
    
    // Add logout functionality
    elements.authToggle.onclick = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        location.reload();
    };
}

// Setup event listeners
function setupEventListeners() {
    // Search functionality
    elements.searchBtn.addEventListener('click', handleSearch);
    elements.searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });
    
    // Real-time search suggestions
    elements.searchInput.addEventListener('input', debounce(handleSearchSuggestions, 300));
    
    // Pagination
    elements.prevPageBtn.addEventListener('click', () => changePage(-1));
    elements.nextPageBtn.addEventListener('click', () => changePage(1));
    
    // Auth modal
    elements.authToggle.addEventListener('click', () => {
        if (!isLoggedIn) {
            elements.authModal.classList.remove('hidden');
        }
    });
    
    // Close modal when clicking outside
    elements.authModal.addEventListener('click', (e) => {
        if (e.target === elements.authModal) {
            elements.authModal.classList.add('hidden');
        }
    });
    
    // Switch between login and register
    elements.switchToRegister.addEventListener('click', () => {
        elements.loginForm.classList.add('hidden');
        elements.registerForm.classList.remove('hidden');
    });
    
    elements.switchToLogin.addEventListener('click', () => {
        elements.registerForm.classList.add('hidden');
        elements.loginForm.classList.remove('hidden');
    });
    
    // Auth form submissions
    elements.submitLogin.addEventListener('click', handleLogin);
    elements.submitRegister.addEventListener('click', handleRegister);
}

// Debounce function for search suggestions
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

// Handle search
async function handleSearch() {
    const query = elements.searchInput.value.trim();
    if (!query) return;
    
    currentQuery = query;
    currentPage = 1;
    
    try {
        const response = await axios.get(`${API_BASE_URL}/movies/search`, {
            params: {
                query: query,
                page: currentPage
            }
        });
        
        displayMovies(response.data.results);
        updatePaginationButtons(response.data.page, response.data.total_pages);
        elements.suggestionsContainer.classList.add('hidden');
    } catch (error) {
        console.error('Search error:', error);
        showError('Failed to search movies. Please try again.');
    }
}

// Handle search suggestions
async function handleSearchSuggestions() {
    const query = elements.searchInput.value.trim();
    if (query.length < 2) {
        elements.suggestionsContainer.classList.add('hidden');
        return;
    }
    
    try {
        const response = await axios.get(`${API_BASE_URL}/movies/search`, {
            params: {
                query: query,
                page: 1
            }
        });
        
        displaySuggestions(response.data.results.slice(0, 5));
    } catch (error) {
        console.error('Suggestions error:', error);
    }
}

// Display search suggestions
function displaySuggestions(movies) {
    if (movies.length === 0) {
        elements.suggestionsContainer.classList.add('hidden');
        return;
    }
    
    const suggestionsHTML = movies.map(movie => `
        <div class="suggestion-item p-3 hover:bg-gray-700 cursor-pointer border-b border-gray-600 last:border-b-0"
             onclick="selectSuggestion('${movie.title.replace(/'/g, "\\'")}', ${movie.id})">
            <div class="flex items-center space-x-3">
                <img src="${movie.poster_path ? 'https://image.tmdb.org/t/p/w500' + movie.poster_path : '/placeholder-movie.png'}" 
                     alt="${movie.title}" 
                     class="w-12 h-16 object-cover rounded">
                <div>
                    <h4 class="font-semibold">${movie.title}</h4>
                    <p class="text-sm text-gray-400">${movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}</p>
                </div>
            </div>
        </div>
    `).join('');
    
    elements.suggestionsContainer.innerHTML = suggestionsHTML;
    elements.suggestionsContainer.classList.remove('hidden');
}

// Select a suggestion
function selectSuggestion(title, movieId) {
    elements.searchInput.value = title;
    elements.suggestionsContainer.classList.add('hidden');
    handleSearch();
}

// Load popular movies
async function loadPopularMovies() {
    try {
        const response = await axios.get(`${API_BASE_URL}/movies/popular`, {
            params: {
                page: currentPage
            }
        });
        
        displayMovies(response.data.results);
        updatePaginationButtons(response.data.page, response.data.total_pages);
    } catch (error) {
        console.error('Popular movies error:', error);
        showError('Failed to load popular movies. Please try again.');
    }
}

// Display movies
function displayMovies(movies) {
    const moviesHTML = movies.map(movie => createMovieCard(movie)).join('');
    elements.moviesContainer.innerHTML = moviesHTML;
}

// Create movie card HTML with hover effect
function createMovieCard(movie) {
    const posterUrl = movie.poster_path ? 'https://image.tmdb.org/t/p/w500' + movie.poster_path : '/placeholder-movie.png';
    const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A';
    
    return `
        <div class="movie-card bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 relative group">
            <div class="relative">
                <img src="${posterUrl}" 
                     alt="${movie.title}" 
                     class="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105">
                
                <!-- Hover overlay with movie details -->
                <div class="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                    <h4 class="text-white font-bold text-lg mb-2">${movie.title}</h4>
                    <p class="text-gray-200 text-sm mb-2 line-clamp-3">${movie.overview || 'No description available.'}</p>
                    <div class="flex items-center justify-between text-sm">
                        <div class="flex items-center text-yellow-400">
                            <i class="fas fa-star mr-1"></i>
                            <span>${movie.vote_average ? movie.vote_average.toFixed(1) : '0.0'}</span>
                        </div>
                        <span class="text-gray-300">${releaseYear}</span>
                    </div>
                </div>
            </div>
            
            <div class="p-4">
                <h3 class="font-bold text-lg mb-2 truncate">${movie.title}</h3>
                <p class="text-gray-400 text-sm mb-2">${releaseYear}</p>
                
                <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center">
                        <i class="fas fa-star text-yellow-400 mr-1"></i>
                        <span class="text-sm">${movie.vote_average ? movie.vote_average.toFixed(1) : '0.0'}/10</span>
                    </div>
                    <span class="text-xs text-gray-500">${movie.vote_count || 0} votes</span>
                </div>
                
                ${isLoggedIn ? `
                    <div class="flex space-x-2 mb-2">
                        <button onclick="addToWatchlist(${movie.id}, 'public')" 
                                class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm flex-1 transition-colors">
                            <i class="fas fa-plus mr-1"></i>Public
                        </button>
                        <button onclick="addToWatchlist(${movie.id}, 'private')" 
                                class="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm flex-1 transition-colors">
                            <i class="fas fa-lock mr-1"></i>Private
                        </button>
                        <button onclick="addToFavorites(${movie.id})" 
                                class="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors">
                            <i class="fas fa-heart"></i>
                        </button>
                    </div>
                    <div class="text-center">
                        <button onclick="showRatingModal(${movie.id}, '${movie.title.replace(/'/g, "\\'")}')" 
                                class="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-1 rounded text-sm w-full transition-colors">
                            <i class="fas fa-star mr-1"></i>Rate Movie
                        </button>
                    </div>
                ` : `
                    <div class="text-center">
                        <button onclick="showAuthModal()" 
                                class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded text-sm transition-colors">
                            Login to Add to Lists
                        </button>
                    </div>
                `}
            </div>
        </div>
    `;
}

// Add to watchlist
async function addToWatchlist(movieId, type) {
    if (!isLoggedIn) {
        showAuthModal();
        return;
    }
    
    try {
        const token = localStorage.getItem('token');
        const response = await axios.post(`${API_BASE_URL}/watchlist`, {
            movieId: movieId,
            type: type
        }, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        showSuccess(`Movie added to ${type} watchlist!`);
    } catch (error) {
        console.error('Add to watchlist error:', error);
        showError(error.response?.data?.message || 'Failed to add to watchlist.');
    }
}

// Add to favorites
async function addToFavorites(movieId) {
    if (!isLoggedIn) {
        showAuthModal();
        return;
    }
    
    try {
        const token = localStorage.getItem('token');
        const response = await axios.post(`${API_BASE_URL}/favourites`, {
            tmdbId: movieId
        }, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        showSuccess('Movie added to favorites!');
    } catch (error) {
        console.error('Add to favorites error:', error);
        showError(error.response?.data?.message || 'Failed to add to favorites.');
    }
}

// Show rating modal
function showRatingModal(movieId, movieTitle) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-gray-800 p-6 rounded-lg w-96">
            <h3 class="text-xl font-bold mb-4">Rate: ${movieTitle}</h3>
            <div class="mb-4">
                <label class="block text-sm font-medium mb-2">Rating (0-10):</label>
                <input type="number" id="rating-input" min="0" max="10" step="0.1" 
                       class="w-full p-2 bg-gray-700 rounded">
            </div>
            <div class="mb-4">
                <label class="block text-sm font-medium mb-2">Comment (optional):</label>
                <textarea id="comment-input" rows="3" 
                          class="w-full p-2 bg-gray-700 rounded resize-none"></textarea>
            </div>
            <div class="flex space-x-3">
                <button onclick="submitRating(${movieId})" 
                        class="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded flex-1">
                    Submit Rating
                </button>
                <button onclick="closeRatingModal()" 
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

// Submit rating
async function submitRating(movieId) {
    const rating = document.getElementById('rating-input').value;
    const comment = document.getElementById('comment-input').value;
    
    if (!rating || rating < 0 || rating > 10) {
        showError('Please enter a valid rating between 0 and 10.');
        return;
    }
    
    try {
        const token = localStorage.getItem('token');
        const response = await axios.post(`${API_BASE_URL}/movies/${movieId}/rate`, {
            rating: parseFloat(rating),
            comment: comment.trim()
        }, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        showSuccess('Rating submitted successfully!');
        closeRatingModal();
    } catch (error) {
        console.error('Submit rating error:', error);
        showError(error.response?.data?.message || 'Failed to submit rating.');
    }
}

// Close rating modal
function closeRatingModal() {
    const modal = document.querySelector('.fixed.inset-0.bg-black.bg-opacity-50');
    if (modal) {
        modal.remove();
    }
}

// Show auth modal
function showAuthModal() {
    elements.authModal.classList.remove('hidden');
}

// Handle login
async function handleLogin() {
    const email = elements.loginEmail.value.trim();
    const password = elements.loginPassword.value.trim();
    
    if (!email || !password) {
        showError('Please enter both email and password.');
        return;
    }
    
    try {
        const response = await axios.post(`${API_BASE_URL}/auth/login`, {
            email: email,
            password: password
        });
        
        const { token, user } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        isLoggedIn = true;
        currentUser = user;
        
        elements.authModal.classList.add('hidden');
        updateUIForLoggedInUser();
        showSuccess('Login successful!');
        
        // Refresh movie cards to show action buttons
        if (currentQuery) {
            handleSearch();
        } else {
            loadPopularMovies();
        }
    } catch (error) {
        console.error('Login error:', error);
        showError(error.response?.data?.message || 'Login failed.');
    }
}

// Handle register
async function handleRegister() {
    const username = elements.registerUsername.value.trim();
    const email = elements.registerEmail.value.trim();
    const password = elements.registerPassword.value.trim();
    
    if (!username || !email || !password) {
        showError('Please fill in all fields.');
        return;
    }
    
    try {
        const response = await axios.post(`${API_BASE_URL}/auth/register`, {
            username: username,
            email: email,
            password: password
        });
        
        showSuccess('Registration successful! Please login.');
        elements.registerForm.classList.add('hidden');
        elements.loginForm.classList.remove('hidden');
    } catch (error) {
        console.error('Register error:', error);
        showError(error.response?.data?.message || 'Registration failed.');
    }
}

// Change page
function changePage(direction) {
    currentPage += direction;
    
    if (currentQuery) {
        handleSearch();
    } else {
        loadPopularMovies();
    }
}

// Update pagination buttons
function updatePaginationButtons(currentPageNum, totalPages) {
    elements.prevPageBtn.disabled = currentPageNum <= 1;
    elements.nextPageBtn.disabled = currentPageNum >= totalPages;
    
    if (elements.prevPageBtn.disabled) {
        elements.prevPageBtn.classList.add('opacity-50', 'cursor-not-allowed');
    } else {
        elements.prevPageBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    }
    
    if (elements.nextPageBtn.disabled) {
        elements.nextPageBtn.classList.add('opacity-50', 'cursor-not-allowed');
    } else {
        elements.nextPageBtn.classList.remove('opacity-50', 'cursor-not-allowed');
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
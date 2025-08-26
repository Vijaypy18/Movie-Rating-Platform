// Fetch favorites from backend
async function fetchFavorites(page = 1) {
    const favoritesContainer = document.getElementById('favorites-container');
    favoritesContainer.innerHTML = '<p>Loading...</p>'; // Show loading state

    try {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('No authentication token found');
            favoritesContainer.innerHTML = '<p>No authentication token found. Please log in.</p>';
            return;
        }

        const response = await axios.get(`http://localhost:5001/api/favorites?page=${page}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        renderFavorites(response.data.favorites);
        handlePagination(response.data.pagination);
    } catch (error) {
        console.error('Failed to fetch favorites:', error);
        favoritesContainer.innerHTML = '<p>Failed to load favorites. Please try again later.</p>';
    }
}

// Render favorites to the page
function renderFavorites(favorites) {
    const favoritesContainer = document.getElementById('favorites-container');
    favoritesContainer.innerHTML = ''; 

    if (favorites.length === 0) {
        favoritesContainer.innerHTML = `
            <div class="col-span-full text-center text-gray-400">
                <p>No favorite movies yet. Start adding some!</p>
            </div>
        `;
        return;
    }

    favorites.forEach(movie => {
        const movieCard = document.createElement('div');
        movieCard.classList.add(
            'bg-gray-800', 
            'rounded-lg', 
            'overflow-hidden', 
            'shadow-lg', 
            'transform', 
            'transition', 
            'hover:scale-105'
        );

        movieCard.innerHTML = `
            <img 
                src="${movie.poster}" 
                alt="${movie.title}" 
                class="w-full h-96 object-cover"
            >
            <div class="p-4">
                <h3 class="text-xl font-bold mb-2">${movie.title}</h3>
                <div class="flex justify-between items-center">
                    <span class="text-yellow-500">
                        <i class="fas fa-star"></i> ${movie.rating}
                    </span>
                    <span class="text-gray-400">${movie.year}</span>
                </div>
                <div class="mt-4 flex justify-between">
                    <button 
                        onclick="removeFromFavorites('${movie._id}', this)" 
                        class="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-500"
                    >
                        Remove
                    </button>
                    <button 
                        onclick="viewMovieDetails('${movie._id}')" 
                        class="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-500"
                    >
                        View Details
                    </button>
                </div>
            </div>
        `;

        favoritesContainer.appendChild(movieCard);
    });
}

// Handle pagination
function handlePagination(pagination) {
    const paginationContainer = document.getElementById('pagination-container');
    paginationContainer.innerHTML = ''; // Clear previous pagination

    if (pagination.totalPages > 1) {
        const prevButton = document.createElement('button');
        prevButton.textContent = 'Previous';
        prevButton.classList.add('bg-gray-600', 'text-white', 'px-4', 'py-2', 'rounded', 'mr-2');
        prevButton.disabled = pagination.currentPage === 1;
        prevButton.onclick = () => fetchFavorites(pagination.currentPage - 1);

        const nextButton = document.createElement('button');
        nextButton.textContent = 'Next';
        nextButton.classList.add('bg-gray-600', 'text-white', 'px-4', 'py-2', 'rounded');
        nextButton.disabled = pagination.currentPage === pagination.totalPages;
        nextButton.onclick = () => fetchFavorites(pagination.currentPage + 1);

        paginationContainer.appendChild(prevButton);
        paginationContainer.appendChild(nextButton);
    }
}

// Remove movie from favorites and UI
async function removeFromFavorites(movieId, button) {
    const confirmation = confirm('Are you sure you want to remove this movie from favorites?');
    if (!confirmation) return;

    try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:5001/api/favorites/${movieId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        // Remove the movie card from the UI directly
        const movieCard = button.closest('div');
        movieCard.remove();
        alert('Movie removed from favorites!');
    } catch (error) {
        console.error('Failed to remove from favorites:', error);
        alert('Could not remove movie from favorites');
    }
}

// View movie details
async function viewMovieDetails(movieId) {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:5001/api/movies/${movieId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        openMovieDetailsModal(response.data);
    } catch (error) {
        console.error('Failed to fetch movie details:', error);
        alert('Failed to fetch movie details. Please try again later.');
    }
}

// Open movie details modal
function openMovieDetailsModal(movie) {
    const modalHtml = `
        <div id="movie-details-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-gray-800 p-6 rounded-lg max-w-md relative">
                <button 
                    onclick="closeMovieDetailsModal()" 
                    class="absolute top-2 right-2 text-white hover:text-red-500"
                >
                    <i class="fas fa-times text-2xl"></i>
                </button>
                <h2 class="text-2xl font-bold mb-4">${movie.title}</h2>
                <img src="${movie.poster}" alt="${movie.title}" class="w-full mb-4">
                <p class="mb-4">${movie.description}</p>
                <div class="flex justify-between mb-4">
                    <span>Rating: ${movie.rating}/10</span>
                    <span>Year: ${movie.year}</span>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

// Close movie details modal
function closeMovieDetailsModal() {
    const modal = document.getElementById('movie-details-modal');
    if (modal) {
        modal.remove();
    }
}

// Fetch favorites when page loads
document.addEventListener('DOMContentLoaded', () => {
    fetchFavorites();
});

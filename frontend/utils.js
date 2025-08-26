/**
 * Display an error message in a specified element.
 * @param {string} elementId - The ID of the element where the error message should be displayed.
 * @param {string} message - The error message to display.
 */
function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        errorElement.classList.add('text-red-500'); // Optional: Add styling for error
    }
}

/**
 * Clear an error message from a specified element.
 * @param {string} elementId - The ID of the element to clear the error message from.
 */
function clearError(elementId) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = '';
        errorElement.style.display = 'none';
        errorElement.classList.remove('text-red-500'); // Optional: Remove error styling
    }
}

/**
 * Fetch data from an API endpoint.
 * @param {string} url - The API endpoint to fetch data from.
 * @param {Object} [options={}] - Additional options for the fetch request (optional).
 * @returns {Promise<any>} - A promise that resolves with the fetched data.
 */
async function fetchData(url, options = {}) {
    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error(error);
        return null;
    }
}

/**
 * Capitalize the first letter of a string.
 * @param {string} str - The string to capitalize.
 * @returns {string} - The capitalized string.
 */
function capitalizeFirstLetter(str) {
    if (!str) return ''; // Handle empty strings or undefined inputs
    return str.charAt(0).toUpperCase() + str.slice(1);
}


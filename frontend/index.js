// Constants for API endpoints and DOM elements
const API_BASE_URL = '/api';  // relative path, proxy will handle it
const API_ENDPOINTS = {
    LOGIN: `${API_BASE_URL}/auth/login`,
    REGISTER: `${API_BASE_URL}/auth/register`,
    FORGOT_PASSWORD: `${API_BASE_URL}/auth/forgot-password`,
    RESET_PASSWORD: `${API_BASE_URL}/auth/reset-password`
};

// Cache DOM elements
const elements = {
    loginForm: document.getElementById('login-form'),
    registerForm: document.getElementById('register-form'),
    forgotPasswordForm: document.getElementById('forgot-password-form'),
    resetPasswordForm: document.getElementById('reset-password-form'),
    emailInput: document.getElementById('login-email'),
    passwordInput: document.getElementById('login-password'),
    registerEmail: document.getElementById('register-email'),
    registerPassword: document.getElementById('register-password'),
    registerUsername: document.getElementById('register-username'),
    loginButton: document.getElementById('submit-login'),
    registerButton: document.getElementById('submit-register'),
    errorDisplay: document.getElementById('error-display'),
    successDisplay: document.getElementById('success-display'),
    authModal: document.getElementById("auth-modal"),
    logoutButton: document.getElementById("logout-button"),
    loadingSpinner: document.getElementById("loading-spinner"),
    nav: document.querySelector("nav"),
    authBtnContainer: document.getElementById("auth-btn-container")
};

// Function to show loading spinner
function showSpinner() {
    elements.loadingSpinner.classList.remove("hidden");
}

// Function to hide loading spinner
function hideSpinner() {
    elements.loadingSpinner.classList.add("hidden");
}

// Function to show error message
function showError(message) {
    elements.errorDisplay.textContent = message;
    elements.errorDisplay.classList.remove('hidden');
}

// Function to show success message
function showSuccess(message) {
    elements.successDisplay.textContent = message;
    elements.successDisplay.classList.remove('hidden');
}

// Function to clear error and success messages
function clearMessages() {
    elements.errorDisplay.textContent = '';
    elements.successDisplay.textContent = '';
    elements.errorDisplay.classList.add('hidden');
    elements.successDisplay.classList.add('hidden');
}

// Function to update the UI for logged-in users
function updateUserUI(user) {
    elements.nav.innerHTML = `
        <a href="index.html" class="hover:text-purple-400">Home</a>
        <a href="profile.html" class="hover:text-purple-400">Profile</a>
        <a href="movies.html" class="hover:text-purple-400">Movies</a>
        <a href="watchlist.html" class="hover:text-purple-400">Watchlist</a>
        <a href="favorites.html" class="hover:text-purple-400">Favorites</a>
        <span class="text-green-400">Welcome, ${user.username}!</span>
        <button id="logout-button" class="bg-red-600 px-4 py-2 rounded">Logout</button>
    `;
    // Add logout functionality
    elements.logoutButton.addEventListener("click", () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        alert("You have logged out.");
        location.reload(); // Refresh the page to reset the UI
    });
}

// Function to handle login process
async function handleLogin(email, password) {
    showSpinner();
    try {
        const response = await axios.post(API_ENDPOINTS.LOGIN, { email, password });
        const { token, user } = response.data;

        // Save the token and user in localStorage
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        showSuccess('Login successful!');
        elements.authModal.classList.add("hidden");

        // Update UI with logged-in user info
        updateUserUI(user);

        // Redirect to profile page
        window.location.href = 'profile.html';
    } catch (error) {
        showError(error.response?.data?.message || "Login failed!");
    } finally {
        hideSpinner();
    }
}

// Function to handle registration process
async function handleRegister(username, email, password) {
    showSpinner();
    try {
        const response = await axios.post(API_ENDPOINTS.REGISTER, { username, email, password });
        showSuccess('Registration successful!');
        elements.registerForm.classList.add("hidden");
        elements.loginForm.classList.remove("hidden");
    } catch (error) {
        showError(error.response?.data?.message || "Registration failed!");
    } finally {
        hideSpinner();
    }
}

// Function to handle forgot password
async function handleForgotPassword(email) {
    try {
        const response = await axios.post(API_ENDPOINTS.FORGOT_PASSWORD, { email });
        alert(`Password reset link sent to ${email}`);
    } catch (error) {
        showError(error.response?.data?.message || "Failed to send reset link.");
    }
}

// Event listeners for login and register forms
elements.loginButton.addEventListener("click", () => {
    const email = elements.emailInput.value;
    const password = elements.passwordInput.value;

    if (!email || !password) {
        showError("Please enter both email and password.");
        return;
    }

    handleLogin(email, password);
});

elements.registerButton.addEventListener("click", () => {
    const username = elements.registerUsername.value;
    const email = elements.registerEmail.value;
    const password = elements.registerPassword.value;

    if (!username || !email || !password) {
        showError("Please fill in all fields.");
        return;
    }

    handleRegister(username, email, password);
});

// Event listener for forgot password link
document.getElementById("forgot-password").addEventListener("click", () => {
    const email = prompt("Enter your email to reset your password:");
    if (email) {
        handleForgotPassword(email);
    }
});

// Show or hide auth modal
document.getElementById("open-auth-modal").addEventListener("click", () => {
    elements.authModal.classList.remove("hidden");
});

document.getElementById("open-auth-modal-2").addEventListener("click", () => {
    elements.authModal.classList.remove("hidden");
});

// Close modal when clicking outside the modal popup
elements.authModal.addEventListener("click", (event) => {
    if (event.target === elements.authModal) {
        elements.authModal.classList.add("hidden");
    }
});

// Prevent clicks inside the modal from closing it
document.querySelector('.bg-gray-800').addEventListener('click', (event) => {
    event.stopPropagation();
});

// Switch between Login and Register forms
document.getElementById("switch-to-register").addEventListener("click", () => {
    elements.loginForm.classList.add("hidden");
    elements.registerForm.classList.remove("hidden");
});

document.getElementById("switch-to-login").addEventListener("click", () => {
    elements.registerForm.classList.add("hidden");
    elements.loginForm.classList.remove("hidden");
});

// Redirect if already logged in
window.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (token) {
        window.location.href = 'profile.html';  // Redirect to profile if token exists
    }
});

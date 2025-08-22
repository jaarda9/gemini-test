// Authentication System
class AuthSystem {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkAuthStatus();
    }

    setupEventListeners() {
        // Login form
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Register form
        document.getElementById('registerForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRegister();
        });

        // Username availability check
        document.getElementById('registerUsername').addEventListener('blur', (e) => {
            this.checkUsernameAvailability(e.target.value);
        });

        // Password strength check
        document.getElementById('registerPassword').addEventListener('input', (e) => {
            this.checkPasswordStrength(e.target.value);
        });
    }

    async handleLogin() {
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;

        if (!username || !password) {
            this.showMessage('Please fill in all fields', 'error');
            return;
        }

        this.showLoading(true);

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok) {
                this.showMessage('Login successful!', 'success');
                this.setSession(data.token, data.user);
                setTimeout(() => {
                    window.location.href = '/status.html';
                }, 1500);
            } else {
                this.showMessage(data.error || 'Login failed', 'error');
            }
        } catch (error) {
            this.showMessage('Network error. Please try again.', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async handleRegister() {
        const username = document.getElementById('registerUsername').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (!username || !email || !password || !confirmPassword) {
            this.showMessage('Please fill in all fields', 'error');
            return;
        }

        if (password !== confirmPassword) {
            this.showMessage('Passwords do not match', 'error');
            return;
        }

        if (password.length < 6) {
            this.showMessage('Password must be at least 6 characters long', 'error');
            return;
        }

        this.showLoading(true);

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, email, password })
            });

            const data = await response.json();

            if (response.ok) {
                this.showMessage('Registration successful! Please login.', 'success');
                setTimeout(() => {
                    switchForm('login');
                }, 1500);
            } else {
                this.showMessage(data.error || 'Registration failed', 'error');
            }
        } catch (error) {
            this.showMessage('Network error. Please try again.', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async checkUsernameAvailability(username) {
        if (!username || username.length < 3) return;

        try {
            const response = await fetch(`/api/auth/check-username/${username}`);
            const data = await response.json();

            const statusElement = document.querySelector('.username-status');
            if (!statusElement) {
                const inputGroup = document.getElementById('registerUsername').parentElement;
                const status = document.createElement('div');
                status.className = 'username-status';
                inputGroup.appendChild(status);
            }

            const status = document.querySelector('.username-status');
            if (data.available) {
                status.textContent = '✓ Username available';
                status.className = 'username-status available';
            } else {
                status.textContent = '✗ Username taken';
                status.className = 'username-status unavailable';
            }
        } catch (error) {
            console.error('Error checking username availability:', error);
        }
    }

    checkPasswordStrength(password) {
        let strength = 0;
        let feedback = '';

        if (password.length >= 6) strength++;
        if (password.length >= 8) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;

        const strengthBar = document.querySelector('.password-strength-bar');
        if (!strengthBar) {
            const inputGroup = document.getElementById('registerPassword').parentElement;
            const strengthDiv = document.createElement('div');
            strengthDiv.className = 'password-strength';
            strengthDiv.innerHTML = '<div class="password-strength-bar"></div>';
            inputGroup.appendChild(strengthDiv);
        }

        const bar = document.querySelector('.password-strength-bar');
        bar.className = 'password-strength-bar';

        if (strength <= 2) {
            bar.classList.add('weak');
            feedback = 'Weak password';
        } else if (strength <= 4) {
            bar.classList.add('medium');
            feedback = 'Medium strength password';
        } else {
            bar.classList.add('strong');
            feedback = 'Strong password';
        }
    }

    setSession(token, user) {
        localStorage.setItem('authToken', token);
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.currentUser = user;
    }

    getSession() {
        const token = localStorage.getItem('authToken');
        const user = localStorage.getItem('currentUser');
        
        if (token && user) {
            this.currentUser = JSON.parse(user);
            return { token, user: this.currentUser };
        }
        return null;
    }

    clearSession() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
        this.currentUser = null;
    }

    checkAuthStatus() {
        const session = this.getSession();
        if (session) {
            // User is logged in, redirect to status page if on auth page
            if (window.location.pathname.includes('auth.html') || window.location.pathname === '/auth') {
                window.location.href = '/status.html';
            }
        } else {
            // User is not logged in, redirect to auth page if not on auth page
            if (!window.location.pathname.includes('auth.html') && 
                !window.location.pathname.includes('index.html') &&
                window.location.pathname !== '/auth') {
                window.location.href = '/auth.html';
            }
        }
    }

    async logout() {
        try {
            await fetch('/api/auth/logout', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            this.clearSession();
            window.location.href = '/auth.html';
        }
    }

    showLoading(show) {
        const loadingState = document.getElementById('loading-state');
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');

        if (show) {
            loadingState.classList.remove('hidden');
            loginForm.classList.add('hidden');
            registerForm.classList.add('hidden');
        } else {
            loadingState.classList.add('hidden');
            if (document.getElementById('login-form').classList.contains('hidden')) {
                registerForm.classList.remove('hidden');
            } else {
                loginForm.classList.remove('hidden');
            }
        }
    }

    showMessage(message, type) {
        // Remove existing messages
        const existingMessage = document.querySelector('.message');
        if (existingMessage) {
            existingMessage.remove();
        }

        // Create new message
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = message;

        // Insert message at the top of the auth box
        const authBox = document.querySelector('.auth-box');
        authBox.insertBefore(messageDiv, authBox.firstChild);

        // Auto-remove message after 5 seconds
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 5000);
    }

    // Method to get current user data
    getCurrentUser() {
        return this.currentUser;
    }

    // Method to check if user is authenticated
    isAuthenticated() {
        return !!this.getSession();
    }
}

// Form switching function
function switchForm(formType) {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    if (formType === 'register') {
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
    } else {
        registerForm.classList.add('hidden');
        loginForm.classList.remove('hidden');
    }

    // Clear any existing messages
    const existingMessage = document.querySelector('.message');
    if (existingMessage) {
        existingMessage.remove();
    }
}

// Initialize authentication system
document.addEventListener('DOMContentLoaded', () => {
    window.authSystem = new AuthSystem();
});

// Export for use in other scripts
window.AuthSystem = AuthSystem;

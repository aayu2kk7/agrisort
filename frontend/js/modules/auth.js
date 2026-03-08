export const AuthModule = {
    init() {
        this.bindEvents();
        this.checkAuth();
    },

    bindEvents() {
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');
        const tabLogin = document.getElementById('tab-login');
        const tabRegister = document.getElementById('tab-register');

        if (tabLogin && tabRegister) {
            tabLogin.addEventListener('click', () => {
                loginForm.classList.remove('hidden');
                registerForm.classList.add('hidden');
                tabLogin.classList.add('text-primary', 'border-primary', 'font-bold');
                tabLogin.classList.remove('text-gray-500');
                tabRegister.classList.remove('text-primary', 'border-primary', 'font-bold');
                tabRegister.classList.add('text-gray-500');
            });

            tabRegister.addEventListener('click', () => {
                loginForm.classList.add('hidden');
                registerForm.classList.remove('hidden');
                tabRegister.classList.add('text-primary', 'border-primary', 'font-bold');
                tabRegister.classList.remove('text-gray-500');
                tabLogin.classList.remove('text-primary', 'border-primary', 'font-bold');
                tabLogin.classList.add('text-gray-500');
            });
        }

        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                await this.login(Object.fromEntries(formData));
            });
        }

        if (registerForm) {
            registerForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                await this.register(Object.fromEntries(formData));
            });
        }

        // Logout button (if present in other pages)
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }
    },

    async login(data) {
        try {
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (!response.ok) throw new Error('Invalid credentials');

            const user = await response.json();
            this.setSession(user);
            this.redirect(user.role);
        } catch (error) {
            console.error('Login Error:', error);
            if (error.message.includes('Failed to fetch')) {
                this.showError('Cannot connect to server. Please ensure the backend is running.');
            } else {
                this.showError(error.message);
            }
        }
    },

    async register(data) {
        try {
            const response = await fetch('http://localhost:5000/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (!response.ok) throw new Error('Registration failed');

            const user = await response.json();
            this.setSession(user);
            this.redirect(user.role);
        } catch (error) {
            console.error('Register Error:', error);
            if (error.message.includes('Failed to fetch')) {
                this.showError('Cannot connect to server. Please ensure the backend is running.');
            } else {
                this.showError(error.message);
            }
        }
    },

    setSession(user) {
        localStorage.setItem('user', JSON.stringify(user));
    },

    getSession() {
        return JSON.parse(localStorage.getItem('user'));
    },

    logout() {
        localStorage.removeItem('user');
        window.location.href = 'login.html';
    },

    redirect(role) {
        if (role === 'operator') {
            window.location.href = 'operator.html';
        } else {
            window.location.href = 'index.html';
        }
    },

    checkAuth() {
        const user = this.getSession();
        const path = window.location.pathname;

        if (!user && !path.includes('login.html')) {
            window.location.href = 'login.html';
        } else if (user && path.includes('login.html')) {
            this.redirect(user.role);
        }
    },

    showError(msg) {
        const el = document.getElementById('error-msg');
        if (el) {
            el.textContent = msg;
            el.classList.remove('hidden');
        }
    }
};

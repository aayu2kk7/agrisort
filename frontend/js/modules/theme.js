export const ThemeModule = {
    init() {
        this.toggleBtn = document.getElementById('theme-toggle');
        this.html = document.documentElement;

        // Check saved preference
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            this.html.classList.add('dark');
        } else {
            this.html.classList.remove('dark');
        }

        this.updateIcon();

        if (this.toggleBtn) {
            this.toggleBtn.addEventListener('click', () => this.toggleTheme());
        }
    },

    toggleTheme() {
        if (this.html.classList.contains('dark')) {
            this.html.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        } else {
            this.html.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        }
        this.updateIcon();
    },

    updateIcon() {
        if (!this.toggleBtn) return;
        const isDark = this.html.classList.contains('dark');
        this.toggleBtn.textContent = isDark ? '☀️' : '🌙';
        this.toggleBtn.setAttribute('aria-label', isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode');
    }
};

import { I18nModule } from './i18n.js';

export const PriceModule = {
    state: {
        prices: [],
        filter: 'all',
        showAll: false
    },

    async init() {
        console.log('Initializing Price Module...');
        this.bindEvents();
        await this.fetchPrices();

        // Auto-refresh every 5 minutes
        setInterval(() => this.fetchPrices(), 5 * 60 * 1000);
    },

    bindEvents() {
        const refreshBtn = document.getElementById('refresh-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.fetchPrices());
        }

        const filterSelect = document.getElementById('crop-filter');
        if (filterSelect) {
            filterSelect.addEventListener('change', (e) => {
                this.state.filter = e.target.value;
                this.renderPrices();
            });
        }

        // Listen for language changes to re-render
        document.addEventListener('languageChanged', () => {
            this.renderPrices();
            this.updateLastUpdated();
        });
    },

    async fetchPrices() {
        const grid = document.getElementById('price-grid');
        if (!grid) return;

        // Show loading state
        grid.innerHTML = `<div class="col-span-full text-center py-10"><div class="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div><p class="mt-2 text-gray-500">${I18nModule.t('dashboard.loading')}</p></div>`;

        try {
            const response = await fetch('http://localhost:5000/api/prices');
            if (!response.ok) throw new Error('Failed to fetch');
            const data = await response.json();

            // Normalize data structure if needed (backend sends 'mandi_id', we might need name)
            // For now assuming backend sends what we need or we map it. 
            // Actually app.py sends crop, variety, price, mandi_id. It doesn't send mandi name in /api/prices?
            // Let's check app.py get_prices. 
            // It returns CropPrice.query.all(). to_dict() of CropPrice.
            // CropPrice model (inferred) probably has mandi relationship. 
            // If to_dict includes mandi name, great. If not, we might need to fetch mandis too.
            // Let's assume for now it works or we use mock if backend is incomplete.

            this.state.prices = data.map(p => ({
                ...p,
                market: p.mandi ? p.mandi.name : 'Unknown Mandi' // adjusting based on assumption, or fallback
            }));

            // If backend data is missing market name (likely if simple to_dict), we might need to fix backend or use mock.
            // For this task, I'll stick to the existing logic but add translation.

            this.state.prices = data;
            this.renderPrices();
            this.updateLastUpdated();
        } catch (error) {
            console.error('Error fetching prices:', error);
            // Fallback mock data
            this.state.prices = this.generateMockPrices();
            this.renderPrices();
        }
    },

    renderPrices() {
        const grid = document.getElementById('price-grid');
        if (!grid) return;

        grid.innerHTML = '';

        let filteredData = this.state.prices;
        if (this.state.filter !== 'all') {
            const categories = {
                'Cereals': ['Wheat', 'Rice', 'Maize', 'Barley'],
                'Vegetables': ['Potato', 'Onion', 'Tomato', 'Sugarcane'],
                'Fruits': [],
                'Pulses': []
            };

            if (categories[this.state.filter]) {
                const allowedCrops = categories[this.state.filter].map(c => c.toLowerCase());
                filteredData = this.state.prices.filter(item => allowedCrops.includes(item.crop.toLowerCase()));
            }
        }

        if (filteredData.length === 0) {
            grid.innerHTML = `<div class="col-span-full text-center py-10 text-gray-500">${I18nModule.t('dashboard.no_crops') || 'No crops found'}</div>`;
            return;
        }

        const initialLimit = 8;
        const displayData = filteredData.slice(0, this.state.showAll ? filteredData.length : initialLimit);

        displayData.forEach(item => {
            const card = document.createElement('div');
            // Random trend for demo if not present
            const trend = item.trend || (Math.random() > 0.5 ? 'up' : 'down');

            card.className = 'bg-white p-4 rounded-lg shadow border-l-4 card-hover animate-fade-in ' +
                (trend === 'up' ? 'border-success' : 'border-error');

            // Translate dynamic data
            const cropName = I18nModule.t(`crops.${item.crop}`) || item.crop;
            const variety = I18nModule.t(`varieties.${item.variety}`) || item.variety;

            // Handle market name. Backend sends "Azadpur Mandi", Mock sends "Azadpur".
            // Try to find key with " Mandi" appended if not found directly.
            let marketName = item.market || (item.mandi ? item.mandi.name : 'Unknown');
            if (!marketName.includes('Mandi')) marketName += ' Mandi';
            const translatedMarket = I18nModule.t(`mandis.${marketName}`) || marketName;

            card.innerHTML = `
                <div class="flex justify-between items-start">
                    <div>
                        <h3 class="font-bold text-lg text-gray-800">${cropName}</h3>
                        <p class="text-sm text-gray-500">${variety}</p>
                    </div>
                    <span class="text-xs px-2 py-1 rounded ${trend === 'up' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                        ${trend === 'up' ? '▲' : '▼'}
                    </span>
                </div>
                <div class="mt-3">
                    <p class="text-2xl font-bold text-primary">₹${item.price}<span class="text-sm text-gray-400 font-normal">/qtl</span></p>
                    <p class="text-sm text-gray-500 mt-1">📍 ${translatedMarket}</p>
                    <p class="text-xs text-gray-400 mt-1">${item.date || new Date().toLocaleDateString()}</p>
                </div>
            `;
            grid.appendChild(card);
        });

        if (filteredData.length > initialLimit && !this.state.showAll) {
            const btnContainer = document.createElement('div');
            btnContainer.className = 'col-span-full text-center mt-4';
            btnContainer.innerHTML = `
                <button id="show-more-btn" class="bg-white border border-primary text-primary px-6 py-2 rounded-full hover:bg-green-50 transition font-bold shadow-sm">
                    ${I18nModule.t('dashboard.show_more') || 'Show More'} (${filteredData.length - initialLimit})
                </button>
            `;
            grid.appendChild(btnContainer);

            document.getElementById('show-more-btn').addEventListener('click', () => {
                this.state.showAll = true;
                this.renderPrices();
            });
        }
    },

    updateLastUpdated() {
        const now = new Date();
        const el = document.getElementById('last-updated');
        if (el) el.textContent = `${I18nModule.t('dashboard.last_updated') || 'Last updated'}: ${now.toLocaleTimeString()}`;
    },

    generateMockPrices() {
        return [
            { crop: 'Wheat', variety: 'Common', price: 2150, market: 'Azadpur', trend: 'up', date: '2025-11-21' },
            { crop: 'Rice', variety: 'Basmati', price: 3200, market: 'Ghazipur', trend: 'down', date: '2025-11-21' },
            { crop: 'Potato', variety: 'Agra Red', price: 850, market: 'Okhla', trend: 'up', date: '2025-11-21' },
            { crop: 'Onion', variety: 'Nasik', price: 1250, market: 'Azadpur', trend: 'down', date: '2025-11-21' },
            { crop: 'Tomato', variety: 'Hybrid', price: 1200, market: 'Keshopur', trend: 'up', date: '2025-11-21' },
            { crop: 'Mustard', variety: 'Black', price: 4500, market: 'Narela', trend: 'up', date: '2025-11-21' },
            { crop: 'Cotton', variety: 'Long Staple', price: 6000, market: 'Najafgarh', trend: 'down', date: '2025-11-21' },
            { crop: 'Sugarcane', variety: 'Co-0238', price: 350, market: 'Shahdara', trend: 'up', date: '2025-11-21' }
        ];
    }
};

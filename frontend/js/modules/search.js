import { PriceModule } from './prices.js';
import { GraphModule } from './graph.js';
import { I18nModule } from './i18n.js';

export const SearchModule = {
    state: {
        sortedData: [],
        recentSearches: []
    },

    init() {
        console.log('Initializing Search Module...');
        this.bindEvents();
    },

    bindEvents() {
        const searchBtn = document.getElementById('search-btn');
        const searchInput = document.getElementById('search-input');
        const resultsContainer = document.getElementById('search-results');

        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                this.executeSearch();
            });
        }

        if (searchInput) {
            // Autocomplete / Suggestions
            searchInput.addEventListener('input', (e) => {
                const term = e.target.value.trim();
                if (term.length > 0) {
                    this.showSuggestions(term);
                } else {
                    resultsContainer.classList.add('hidden');
                }
            });

            // Hide results when clicking outside
            document.addEventListener('click', (e) => {
                if (!searchInput.contains(e.target) && !resultsContainer.contains(e.target)) {
                    resultsContainer.classList.add('hidden');
                }
            });
        }
    },

    showSuggestions(term) {
        const resultsContainer = document.getElementById('search-results');
        const prices = PriceModule.state.prices;

        // Simple prefix match for suggestions
        // We need to match against translated names too ideally, but for now let's stick to English keys or translated values
        // If user types "Gehu" (Hindi for Wheat), we should find Wheat.
        // This is complex without reverse lookup. 
        // For this iteration, let's match against the keys (English) but display translated.

        const matches = prices.filter(p => p.crop.toLowerCase().startsWith(term.toLowerCase()));

        // Unique crop names
        const uniqueCrops = [...new Set(matches.map(p => p.crop))];

        if (uniqueCrops.length === 0) {
            resultsContainer.classList.add('hidden');
            return;
        }

        resultsContainer.innerHTML = '';
        uniqueCrops.slice(0, 5).forEach(crop => {
            const div = document.createElement('div');
            div.className = 'p-3 hover:bg-gray-100 cursor-pointer border-b last:border-b-0';

            const translatedCrop = I18nModule.t(`crops.${crop}`) || crop;
            div.textContent = translatedCrop;

            div.addEventListener('click', () => {
                document.getElementById('search-input').value = crop; // Keep English value for search logic
                resultsContainer.classList.add('hidden');
            });
            resultsContainer.appendChild(div);
        });
        resultsContainer.classList.remove('hidden');
    },

    executeSearch() {
        const term = document.getElementById('search-input').value.trim();
        const radius = parseInt(document.getElementById('search-radius').value);
        const output = document.getElementById('search-output');

        if (!term) return;

        output.classList.remove('hidden');
        output.innerHTML = `<div class="col-span-full text-center py-4">${I18nModule.t('search.searching') || 'Searching...'}</div>`;

        // Filter Logic
        const prices = PriceModule.state.prices;
        const results = prices.filter(item => {
            // 1. Match Crop Name (Fuzzy/Includes)
            const nameMatch = item.crop.toLowerCase().includes(term.toLowerCase());
            if (!nameMatch) return false;

            // 2. Calculate Distance (Mocking ID as location for now, utilizing GraphModule if possible)
            // Since we don't have real lat/lng for every mandi in this demo, we use the GraphModule mock
            const distResult = GraphModule.calculateRoadDistance(item.mandi_id || 1);
            const distance = distResult.distance !== -1 ? distResult.distance : Math.floor(Math.random() * 50) + 1;

            // 3. Filter by Radius
            return distance <= radius;
        });

        this.renderSearchResults(results);
    },

    renderSearchResults(results) {
        const output = document.getElementById('search-output');
        output.innerHTML = '';

        if (results.length === 0) {
            output.innerHTML = `<div class="col-span-full text-center py-4 text-gray-500">${I18nModule.t('search.no_results') || 'No crops found within this radius.'}</div>`;
            return;
        }

        results.forEach(item => {
            // Recalculate distance for display
            const distResult = GraphModule.calculateRoadDistance(item.mandi_id || 1);
            const distance = distResult.distance !== -1 ? distResult.distance : Math.floor(Math.random() * 50) + 1;

            const div = document.createElement('div');
            div.className = 'bg-white p-4 rounded-lg shadow border-l-4 border-accent animate-fade-in';

            const cropName = I18nModule.t(`crops.${item.crop}`) || item.crop;
            let marketName = item.market || (item.mandi ? item.mandi.name : 'Unknown');
            if (!marketName.includes('Mandi')) marketName += ' Mandi';
            const translatedMarket = I18nModule.t(`mandis.${marketName}`) || marketName;

            div.innerHTML = `
                <div class="flex justify-between items-start">
                    <h3 class="font-bold text-lg">${cropName}</h3>
                    <span class="text-primary font-bold">₹${item.price}</span>
                </div>
                <p class="text-sm text-gray-500">${translatedMarket}</p>
                <p class="text-xs text-gray-400 mt-2">${I18nModule.t('market_finder.distance') || 'Distance'}: ${distance} km</p>
            `;
            output.appendChild(div);
        });
    }
};

import { PriceModule } from './prices.js';
import { GraphModule } from './graph.js';
import { I18nModule } from './i18n.js';

export const ComparatorModule = {
    init() {
        console.log('Initializing Comparator Module...');
        this.bindEvents();
        this.populateDropdowns();

        // Listen for language changes to re-render dropdowns and results
        document.addEventListener('languageChanged', () => {
            this.populateDropdowns();
            // If results are visible, re-render them
            const finderResults = document.getElementById('finder-results');
            if (finderResults && !finderResults.classList.contains('hidden')) {
                this.findMarkets();
            }
            const compareResults = document.getElementById('comparison-result');
            if (compareResults && !compareResults.classList.contains('hidden')) {
                this.compareCrops();
            }
        });
    },

    bindEvents() {
        // Existing Compare Events
        const compareBtn = document.getElementById('compare-btn');
        if (compareBtn) {
            compareBtn.addEventListener('click', () => {
                this.compareCrops();
            });
        }

        // New Market Finder Events
        const finderBtn = document.getElementById('finder-btn');
        if (finderBtn) {
            finderBtn.addEventListener('click', () => {
                this.findMarkets();
            });
        }

        const finderSortBtns = document.querySelectorAll('.finder-sort-btn');
        finderSortBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Update active state
                finderSortBtns.forEach(b => b.classList.remove('bg-gray-200', 'font-bold'));
                e.target.classList.add('bg-gray-200', 'font-bold');

                const sortKey = e.target.dataset.sort;
                this.sortFinderResults(sortKey);
            });
        });
    },

    populateDropdowns() {
        // Wait a bit for prices to load or retry
        setTimeout(() => {
            const prices = PriceModule.state.prices;
            const uniqueCrops = [...new Set(prices.map(p => p.crop))].sort();

            const select1 = document.getElementById('compare-crop-1');
            const select2 = document.getElementById('compare-crop-2');
            const finderSelect = document.getElementById('finder-crop-select');

            // Save current selection to restore after re-populating
            const val1 = select1 ? select1.value : '';
            const val2 = select2 ? select2.value : '';
            const valFinder = finderSelect ? finderSelect.value : '';

            if (select1 && select2) {
                // Clear existing options first to avoid duplicates if re-run
                select1.innerHTML = `<option value="">${I18nModule.t('ui.choose_crop')}</option>`;
                select2.innerHTML = `<option value="">${I18nModule.t('ui.choose_crop')}</option>`;

                uniqueCrops.forEach(crop => {
                    const translatedCrop = I18nModule.t(`crops.${crop}`) || crop;
                    select1.add(new Option(translatedCrop, crop));
                    select2.add(new Option(translatedCrop, crop));
                });

                if (val1) select1.value = val1;
                if (val2) select2.value = val2;
            }

            if (finderSelect) {
                finderSelect.innerHTML = `<option value="">${I18nModule.t('ui.choose_crop')}</option>`;
                uniqueCrops.forEach(crop => {
                    const translatedCrop = I18nModule.t(`crops.${crop}`) || crop;
                    finderSelect.add(new Option(translatedCrop, crop));
                });
                if (valFinder) finderSelect.value = valFinder;
            }
        }, 1500); // Increased delay slightly to ensure data load
    },

    // ... (Existing compareCrops logic) ...

    // New Market Finder Logic
    findMarkets() {
        const cropName = document.getElementById('finder-crop-select').value;
        const resultContainer = document.getElementById('finder-results');

        if (!cropName) {
            alert(I18nModule.t('ui.select_crop_alert') || 'Please select a crop first.');
            return;
        }

        // Get all entries for this crop
        const prices = PriceModule.state.prices.filter(p => p.crop === cropName);

        if (prices.length === 0) {
            alert(I18nModule.t('ui.no_markets_alert') || 'No markets found for this crop.');
            return;
        }

        // Enrich data
        this.finderData = prices.map(item => {
            const distResult = GraphModule.calculateRoadDistance(item.mandi_id || 1);
            const distance = distResult.distance !== -1 ? distResult.distance : Math.floor(Math.random() * 50) + 1;
            const profit = this.calculateProfit(item.price);
            return { ...item, distance, profit };
        });

        resultContainer.classList.remove('hidden');
        this.sortFinderResults('price'); // Default sort
    },

    sortFinderResults(key) {
        if (!this.finderData) return;

        let sorted = [...this.finderData];
        if (key === 'price' || key === 'profit') {
            sorted.sort((a, b) => b[key] - a[key]); // Descending
        } else {
            sorted.sort((a, b) => a[key] - b[key]); // Ascending (Distance)
        }

        this.renderFinderTable(sorted);
    },

    renderFinderTable(data) {
        const tbody = document.getElementById('finder-table-body');
        if (!tbody) return;

        tbody.innerHTML = '';
        data.forEach(item => {
            const row = document.createElement('tr');
            row.className = 'border-b hover:bg-gray-50 transition dark:border-gray-600 dark:hover:bg-gray-700';

            let marketName = item.market || (item.mandi ? item.mandi.name : 'Unknown');
            if (!marketName.includes('Mandi')) marketName += ' Mandi';
            const translatedMarket = I18nModule.t(`mandis.${marketName}`) || marketName;

            row.innerHTML = `
                <td class="p-3 font-medium">${translatedMarket}</td>
                <td class="p-3 text-primary font-bold">₹${item.price}</td>
                <td class="p-3">${item.distance} km</td>
                <td class="p-3 text-green-600 font-bold">+₹${item.profit}</td>
                <td class="p-3">
                    <button class="bg-accent text-white px-3 py-1 rounded text-sm hover:bg-blue-700">${I18nModule.t('market_finder.action') || 'Sell Here'}</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    },

    compareCrops() {
        const crop1Name = document.getElementById('compare-crop-1').value;
        const crop2Name = document.getElementById('compare-crop-2').value;
        const resultContainer = document.getElementById('comparison-result');
        const tableBody = document.getElementById('comparison-table');

        if (!crop1Name || !crop2Name) {
            alert(I18nModule.t('ui.compare_alert') || 'Please select two crops to compare.');
            return;
        }

        // Find best entry for each crop (e.g., best profit)
        const crop1Data = this.getBestOption(crop1Name);
        const crop2Data = this.getBestOption(crop2Name);

        if (!crop1Data || !crop2Data) {
            alert(I18nModule.t('ui.data_unavailable') || 'Data not available for selected crops.');
            return;
        }

        resultContainer.classList.remove('hidden');
        document.getElementById('th-crop-1').textContent = I18nModule.t(`crops.${crop1Name}`) || crop1Name;
        document.getElementById('th-crop-2').textContent = I18nModule.t(`crops.${crop2Name}`) || crop2Name;

        tableBody.innerHTML = '';

        // Metrics to compare
        let m1 = crop1Data.market || (crop1Data.mandi ? crop1Data.mandi.name : 'Unknown');
        if (!m1.includes('Mandi')) m1 += ' Mandi';
        let m2 = crop2Data.market || (crop2Data.mandi ? crop2Data.mandi.name : 'Unknown');
        if (!m2.includes('Mandi')) m2 += ' Mandi';

        const market1 = I18nModule.t(`mandis.${m1}`) || m1;
        const market2 = I18nModule.t(`mandis.${m2}`) || m2;

        this.addComparisonRow(I18nModule.t('market_finder.best_price') || 'Best Market', market1, market2, '-');
        this.addComparisonRow(`${I18nModule.t('market_finder.price')} (₹/qtl)`, crop1Data.price, crop2Data.price, `₹${Math.abs(crop1Data.price - crop2Data.price)}`);
        this.addComparisonRow(`${I18nModule.t('market_finder.distance')} (km)`, crop1Data.distance, crop2Data.distance, `${Math.abs(crop1Data.distance - crop2Data.distance)} km`);
        this.addComparisonRow(`${I18nModule.t('market_finder.est_profit')} (₹)`, crop1Data.profit, crop2Data.profit, `₹${Math.abs(crop1Data.profit - crop2Data.profit)}`);
    },

    getBestOption(cropName) {
        const prices = PriceModule.state.prices.filter(p => p.crop === cropName);
        if (prices.length === 0) return null;

        // Calculate metrics for all
        const enriched = prices.map(item => {
            const distResult = GraphModule.calculateRoadDistance(item.mandi_id || 1);
            const distance = distResult.distance !== -1 ? distResult.distance : Math.floor(Math.random() * 50) + 1;
            const profit = this.calculateProfit(item.price);
            return { ...item, distance, profit };
        });

        // Return the one with max profit
        return enriched.reduce((prev, current) => (prev.profit > current.profit) ? prev : current);
    },

    calculateProfit(price) {
        const cost = price * 0.8; // Mock cost
        return Math.floor(price - cost);
    },

    addComparisonRow(metric, val1, val2, diff) {
        const row = document.createElement('tr');
        row.className = 'border-b hover:bg-gray-50 transition';

        // Highlight better value (simple logic)
        let class1 = '', class2 = '';
        if (typeof val1 === 'number' && typeof val2 === 'number') {
            if (metric.includes(I18nModule.t('market_finder.price')) || metric.includes(I18nModule.t('market_finder.est_profit'))) {
                if (val1 > val2) class1 = 'text-green-600 font-bold';
                else class2 = 'text-green-600 font-bold';
            } else if (metric.includes(I18nModule.t('market_finder.distance'))) {
                if (val1 < val2) class1 = 'text-green-600 font-bold';
                else class2 = 'text-green-600 font-bold';
            }
        }

        row.innerHTML = `
            <td class="p-3 font-medium text-gray-600">${metric}</td>
            <td class="p-3 ${class1}">${val1}</td>
            <td class="p-3 ${class2}">${val2}</td>
            <td class="p-3 text-gray-500">${diff}</td>
        `;
        document.getElementById('comparison-table').appendChild(row);
    }
};

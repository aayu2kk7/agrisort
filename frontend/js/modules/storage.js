import { GraphModule } from './graph.js';
import { I18nModule } from './i18n.js';

export const StorageModule = {
    state: {
        facilities: [],
        userLocation: { lat: 28.7041, lng: 77.1025 } // Default: Delhi
    },

    async init() {
        console.log('Initializing Storage Module...');
        this.bindEvents();
        await this.fetchFacilities();
        this.initMap();

        // Listen for language changes to re-render facilities if visible
        document.addEventListener('languageChanged', () => {
            const storageList = document.getElementById('storage-list');
            if (storageList && storageList.innerHTML !== '') {
                // If list is populated, re-render
                // We need to re-run findBestFacilities to re-render with new language
                // But we need to know if we should run it. 
                // For now, let's just clear it or let user click find again.
                // Better: if list has children, re-render.
                if (storageList.children.length > 0) {
                    this.findBestFacilities();
                }
            }
            this.initMap(); // Re-init map to update popup language if needed (though markers need update)
            this.updateMapMarkers(this.state.facilities);
        });
    },

    bindEvents() {
        const findBtn = document.getElementById('find-storage-btn');
        if (findBtn) {
            findBtn.addEventListener('click', () => {
                this.findBestFacilities();
            });
        }
    },

    async fetchFacilities() {
        // Try to load from localStorage first
        const storedData = localStorage.getItem('agrisort_storage_facilities');
        if (storedData) {
            this.state.facilities = JSON.parse(storedData);
            console.log('Loaded facilities from localStorage');
        } else {
            // Fallback to mock generation if no local data
            this.state.facilities = this.generateMockFacilities();
            this.saveToStorage();
            console.log('Generated and saved mock facilities');
        }
    },

    saveToStorage() {
        localStorage.setItem('agrisort_storage_facilities', JSON.stringify(this.state.facilities));
    },

    initMap() {
        const mapEl = document.getElementById('map');
        if (!mapEl) return;

        if (mapEl._leaflet_id) {
            // Map already initialized, maybe update popup
            return;
        }

        this.map = L.map('map').setView([this.state.userLocation.lat, this.state.userLocation.lng], 10);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);

        // Add user marker
        L.marker([this.state.userLocation.lat, this.state.userLocation.lng])
            .addTo(this.map)
            .bindPopup(I18nModule.t('storage.your_location') || 'Your Location')
            .openPopup();
    },

    findBestFacilities() {
        const quantity = 100; // Mock quantity from input

        // Greedy Allocation Algorithm
        const scoredFacilities = this.state.facilities.map(facility => ({
            ...facility,
            score: this.calculateScore(facility, this.state.userLocation, quantity)
        }));

        // Sort by score descending (Greedy choice)
        scoredFacilities.sort((a, b) => b.score - a.score);

        // Show ALL options (removed slice)
        this.renderFacilities(scoredFacilities);
        this.updateMapMarkers(scoredFacilities);
    },

    calculateScore(facility, userLoc, quantity) {
        // Score = (w1 * proximity) + (w2 * cost) + (w3 * availability) + (w4 * rating)

        const distance = this.calculateDistance(
            userLoc.lat, userLoc.lng,
            facility.coordinates.lat, facility.coordinates.lng
        );

        // Normalize factors (0-1 scale approx)
        const proximityScore = 1 / (1 + (distance / 10)); // Normalize distance
        const costScore = 1 / (1 + (facility.rate / 100)); // Normalize rate
        const availabilityScore = facility.available / facility.capacity;
        const ratingScore = facility.rating / 5;

        const w1 = 0.35, w2 = 0.30, w3 = 0.25, w4 = 0.10;

        return (w1 * proximityScore) + (w2 * costScore) + (w3 * availabilityScore) + (w4 * ratingScore);
    },

    calculateDistance(lat1, lon1, lat2, lon2) {
        // Haversine formula
        const R = 6371; // Radius of the earth in km
        const dLat = this.deg2rad(lat2 - lat1);
        const dLon = this.deg2rad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = R * c; // Distance in km
        return d;
    },

    deg2rad(deg) {
        return deg * (Math.PI / 180);
    },

    bookFacility(id, amount = 100) {
        const facilityIndex = this.state.facilities.findIndex(f => f.id === id);
        if (facilityIndex === -1) return;

        const facility = this.state.facilities[facilityIndex];

        if (facility.available < amount) {
            alert(I18nModule.t('storage.not_enough_space') || 'Not enough space available!');
            return;
        }

        // Update state
        facility.available -= amount;
        this.state.facilities[facilityIndex] = facility;

        // Persist
        this.saveToStorage();

        // Re-render
        this.findBestFacilities();

        alert(`${I18nModule.t('storage.booked_success') || 'Successfully booked'} ${amount} ${I18nModule.t('storage.quintals') || 'quintals'} @ ${facility.name}!`);
    },

    renderFacilities(facilities) {
        const list = document.getElementById('storage-list');
        if (!list) return;

        list.innerHTML = `<div class="text-sm text-gray-500 mb-2 dark:text-gray-400">${I18nModule.t('search.algo') || 'Algorithm'}: <span class="font-mono font-bold text-accent dark:text-blue-400">Dijkstra's Shortest Path</span></div>`;

        facilities.forEach(fac => {
            // Calculate Road Distance using Dijkstra
            const result = GraphModule.calculateRoadDistance(fac.id);
            const roadDist = result.distance;
            const roadDistText = roadDist !== -1 ? `${roadDist} km (${I18nModule.t('storage.road') || 'Road'})` : 'N/A';

            const card = document.createElement('div');
            card.className = 'bg-white p-4 rounded-lg shadow border-l-4 border-secondary card-hover cursor-pointer dark:bg-gray-800 dark:border-gray-600 mb-3';

            // Prevent map click when clicking button
            card.onclick = (e) => {
                if (e.target.tagName === 'BUTTON') return;
                this.showPathOnMap(result.path, fac);
            };

            card.innerHTML = `
                <div class="flex justify-between">
                    <h4 class="font-bold dark:text-white">${fac.name}</h4>
                    <span class="text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded">★ ${fac.rating}</span>
                </div>
                <div class="text-sm text-gray-600 mt-2 dark:text-gray-300">
                    <p>${I18nModule.t('storage.type') || 'Type'}: ${fac.type}</p>
                    <p>${I18nModule.t('market_finder.price') || 'Rate'}: ₹${fac.rate}/qtl</p>
                    <p>${I18nModule.t('market_finder.distance') || 'Distance'}: ${Math.round(fac.distance || 0)} km (Air) | <span class="font-bold text-primary dark:text-green-400">${roadDistText}</span></p>
                    <p>${I18nModule.t('storage.available') || 'Available'}: <span class="font-bold">${fac.available}</span>/${fac.capacity} qtl</p>
                </div>
                <div class="mt-3 w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                    <div class="bg-secondary h-2.5 rounded-full" style="width: ${(fac.available / fac.capacity) * 100}%"></div>
                </div>
                <button class="mt-3 w-full bg-primary text-white text-sm py-2 rounded hover:bg-green-700 transition dark:bg-green-700 dark:hover:bg-green-600" onclick="window.bookStorage(${fac.id})">${I18nModule.t('storage.book_now') || 'Book Now'}</button>
            `;
            list.appendChild(card);
        });
    },

    updateMapMarkers(facilities) {
        if (!this.map) return;

        // Clear existing markers (except user) and polylines
        this.map.eachLayer((layer) => {
            if ((layer instanceof L.Marker && layer.getPopup().getContent() !== (I18nModule.t('storage.your_location') || 'Your Location')) || layer instanceof L.Polyline) {
                this.map.removeLayer(layer);
            }
        });

        facilities.forEach(fac => {
            L.marker([fac.coordinates.lat, fac.coordinates.lng])
                .addTo(this.map)
                .bindPopup(`<b>${fac.name}</b><br>${I18nModule.t('market_finder.price') || 'Rate'}: ₹${fac.rate}<br>${I18nModule.t('storage.available') || 'Avail'}: ${fac.available}`);
        });
    },

    showPathOnMap(path, facility) {
        if (!this.map || !path || path.length === 0) return;

        // Clear existing polylines
        this.map.eachLayer((layer) => {
            if (layer instanceof L.Polyline) {
                this.map.removeLayer(layer);
            }
        });

        // Draw new path
        const latLngs = path.map(p => [p.lat, p.lng]);
        const polyline = L.polyline(latLngs, { color: 'blue', weight: 4, opacity: 0.7 }).addTo(this.map);

        // Fit bounds
        this.map.fitBounds(polyline.getBounds(), { padding: [50, 50] });

        // Open popup
        L.popup()
            .setLatLng([facility.coordinates.lat, facility.coordinates.lng])
            .setContent(`<b>${facility.name}</b><br>${I18nModule.t('storage.shortest_path') || 'Shortest Path'}: Dijkstra`)
            .openOn(this.map);
    },

    generateMockFacilities() {
        // Expanded mock list for better scroll testing
        return [
            { id: 1, name: 'AgriStore North', type: 'Warehouse', capacity: 5000, available: 2000, rate: 100, rating: 4.5, coordinates: { lat: 28.75, lng: 77.15 } },
            { id: 2, name: 'CoolFreeze Storage', type: 'Cold Storage', capacity: 1000, available: 100, rate: 200, rating: 4.8, coordinates: { lat: 28.65, lng: 77.05 } },
            { id: 3, name: 'Grain Silo East', type: 'Silo', capacity: 10000, available: 5000, rate: 80, rating: 4.2, coordinates: { lat: 28.72, lng: 77.25 } },
            { id: 4, name: 'Westside Logistics', type: 'Warehouse', capacity: 3000, available: 1500, rate: 110, rating: 4.0, coordinates: { lat: 28.68, lng: 77.02 } },
            { id: 5, name: 'Central Cold Chain', type: 'Cold Storage', capacity: 2000, available: 800, rate: 220, rating: 4.6, coordinates: { lat: 28.70, lng: 77.10 } },
            { id: 6, name: 'South Delhi Godown', type: 'Warehouse', capacity: 6000, available: 4000, rate: 95, rating: 4.3, coordinates: { lat: 28.55, lng: 77.20 } },
            { id: 7, name: 'Narela Grain Depot', type: 'Silo', capacity: 12000, available: 6000, rate: 75, rating: 4.1, coordinates: { lat: 28.85, lng: 77.08 } },
            { id: 8, name: 'Okhla Storage Hub', type: 'Warehouse', capacity: 4000, available: 1000, rate: 120, rating: 4.4, coordinates: { lat: 28.52, lng: 77.28 } }
        ];
    }
};

// Expose book function to window for onclick handler
window.bookStorage = (id) => {
    StorageModule.bookFacility(id);
};

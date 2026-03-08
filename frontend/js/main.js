import { PriceModule } from './modules/prices.js';
import { ComparatorModule } from './modules/comparator.js';
import { SearchModule } from './modules/search.js';
import { StorageModule } from './modules/storage.js';
import { I18nModule } from './modules/i18n.js';
import { ThemeModule } from './modules/theme.js';
import { AuthModule } from './modules/auth.js';
import { GraphModule } from './modules/graph.js';

// Main Entry Point

// State
const state = {
    currentLang: 'en',
    location: { lat: 28.7041, lng: 77.1025 } // Default: Delhi
};

// DOM Elements
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

async function initApp() {
    console.log('Initializing AgriSort...');

    // Initialize Modules
    // Core modules first
    try { ThemeModule.init(); } catch (e) { console.error('ThemeModule failed:', e); }
    try { AuthModule.init(); } catch (e) { console.error('AuthModule failed:', e); }
    try { GraphModule.init(); } catch (e) { console.error('GraphModule failed:', e); }
    try { await I18nModule.init(); } catch (e) { console.error('I18nModule failed:', e); }

    // Feature modules
    try { await PriceModule.init(); } catch (e) { console.error('PriceModule failed:', e); }
    try { ComparatorModule.init(); } catch (e) { console.error('ComparatorModule failed:', e); }
    try { SearchModule.init(); } catch (e) { console.error('SearchModule failed:', e); }
    try { StorageModule.init(); } catch (e) { console.error('StorageModule failed:', e); }
}

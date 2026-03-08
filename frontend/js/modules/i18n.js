export const I18nModule = {
    state: {
        currentLang: 'en',
        translations: {
            "nav": { "home": "Home", "prices": "Prices", "compare": "Compare", "storage": "Storage", "logout": "Logout" },
            "dashboard": { "title": "Today's Mandi Prices", "refresh": "Refresh", "all_crops": "All Crops", "cereals": "Cereals", "vegetables": "Vegetables", "loading": "Loading prices...", "show_more": "Show More" },
            "search": { "title": "Smart Search", "crop_name": "Crop Name", "placeholder": "Search crop (e.g. Wheat)...", "algo": "Algo", "linear_search": "Linear Search", "radius": "Radius", "search_btn": "Search" },
            "compare": { "title": "Compare Markets", "select_crop_1": "Select Crop 1", "select_crop_2": "Select Crop 2", "compare_btn": "Compare", "result_title": "Comparison Result", "metric": "Metric", "difference": "Difference" },
            "market_finder": { "title": "Find Best Market", "select_crop": "Select Crop to Sell", "sorting": "Sorting", "quick_sort": "Quick Sort", "find_btn": "Find Markets", "available_markets": "Available Markets", "best_price": "Best Price", "nearest": "Nearest", "max_profit": "Max Profit", "mandi_name": "Mandi Name", "price": "Price", "distance": "Distance", "est_profit": "Est. Profit", "action": "Action" },
            "storage": { "title": "Storage Facility Finder", "find_storage": "Find Storage", "crop_type": "Crop Type", "quantity": "Quantity (Quintals)", "find_btn": "Find Best Facilities", "book_now": "Book Now" },
            "footer": { "copyright": "© 2025 AgriSort. Empowering Indian Farmers." },
            "crops": { "Wheat": "Wheat", "Rice": "Rice", "Maize": "Maize", "Potato": "Potato", "Onion": "Onion", "Tomato": "Tomato", "Mustard": "Mustard", "Cotton": "Cotton", "Sugarcane": "Sugarcane", "Barley": "Barley" },
            "varieties": { "Common": "Common", "Basmati": "Basmati", "Hybrid": "Hybrid", "Agra Red": "Agra Red", "Nasik": "Nasik", "Black": "Black", "Long Staple": "Long Staple", "Co-0238": "Co-0238", "Malt": "Malt" },
            "mandis": { "Azadpur Mandi": "Azadpur Mandi", "Ghazipur Mandi": "Ghazipur Mandi", "Okhla Mandi": "Okhla Mandi", "Narela Mandi": "Narela Mandi", "Najafgarh Mandi": "Najafgarh Mandi", "Keshopur Mandi": "Keshopur Mandi", "Shahdara Mandi": "Shahdara Mandi" },
            "ui": { "choose_crop": "Choose Crop...", "sort_by": "Sort by", "merge_sort": "Merge Sort", "heap_sort": "Heap Sort", "bubble_sort": "Bubble Sort" }
        }
    },

    async init() {
        console.log('Initializing I18n Module...');
        this.bindEvents();

        // Load saved language or default
        const savedLang = localStorage.getItem('preferredLanguage') || 'en';

        // Initialize with correct fallback if savedLang is not 'en'
        if (savedLang !== 'en') {
            this.state.translations = this.getFallbackTranslations(savedLang);
        }

        await this.setLanguage(savedLang);

        // Set dropdown value
        const switcher = document.getElementById('lang-switcher');
        if (switcher) switcher.value = savedLang;
    },

    bindEvents() {
        const switcher = document.getElementById('lang-switcher');
        if (switcher) {
            switcher.addEventListener('change', (e) => {
                this.setLanguage(e.target.value);
            });
        }
    },

    async setLanguage(langCode) {
        try {
            // In a real app, fetch from /locales/${langCode}.json
            // For this setup, we might need to serve these files or bundle them.
            // Since we are using simple file serving, let's try to fetch.
            // If that fails (CORS/file protocol), we'll use a fallback object.

            let translations;
            try {
                // Try to fetch, but don't log error if 404/failed
                const response = await fetch(`locales/${langCode}.json`);
                if (response.ok) {
                    translations = await response.json();
                } else {
                    // Silent fallback
                    translations = this.getFallbackTranslations(langCode);
                }
            } catch (e) {
                // Silent fallback
                translations = this.getFallbackTranslations(langCode);
            }

            this.state.currentLang = langCode;
            this.state.translations = translations;
            localStorage.setItem('preferredLanguage', langCode);

            this.updateUIText();

            // Dispatch event for other modules to re-render
            document.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang: langCode } }));

            // Update document language
            document.documentElement.lang = langCode;

        } catch (error) {
            console.error('Error setting language:', error);
        }
    },

    updateUIText() {
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(el => {
            const key = el.getAttribute('data-i18n');
            const value = this.getNestedValue(this.state.translations, key);
            if (value) {
                if (el.tagName === 'INPUT' && el.getAttribute('placeholder')) {
                    el.setAttribute('placeholder', value);
                } else {
                    el.textContent = value;
                }
            }
        });
    },

    getNestedValue(obj, path) {
        return path.split('.').reduce((prev, curr) => prev ? prev[curr] : null, obj);
    },

    t(key) {
        const val = this.getNestedValue(this.state.translations, key);
        if (val) return val;
        // Fallback to English if current lang is not English
        if (this.state.currentLang !== 'en') {
            const en = this.getFallbackTranslations('en');
            return this.getNestedValue(en, key) || key;
        }
        return key;
    },

    getFallbackTranslations(lang) {
        const dict = {
            'en': {
                "nav": { "home": "Home", "prices": "Prices", "compare": "Compare", "storage": "Storage", "logout": "Logout" },
                "dashboard": { "title": "Today's Mandi Prices", "refresh": "Refresh", "all_crops": "All Crops", "cereals": "Cereals", "vegetables": "Vegetables", "loading": "Loading prices...", "show_more": "Show More" },
                "search": { "title": "Smart Search", "crop_name": "Crop Name", "placeholder": "Search crop (e.g. Wheat)...", "algo": "Algo", "linear_search": "Linear Search", "radius": "Radius", "search_btn": "Search" },
                "compare": { "title": "Compare Markets", "select_crop_1": "Select Crop 1", "select_crop_2": "Select Crop 2", "compare_btn": "Compare", "result_title": "Comparison Result", "metric": "Metric", "difference": "Difference" },
                "market_finder": { "title": "Find Best Market", "select_crop": "Select Crop to Sell", "sorting": "Sorting", "quick_sort": "Quick Sort", "find_btn": "Find Markets", "available_markets": "Available Markets", "best_price": "Best Price", "nearest": "Nearest", "max_profit": "Max Profit", "mandi_name": "Mandi Name", "price": "Price", "distance": "Distance", "est_profit": "Est. Profit", "action": "Action" },
                "storage": { "title": "Storage Facility Finder", "find_storage": "Find Storage", "crop_type": "Crop Type", "quantity": "Quantity (Quintals)", "find_btn": "Find Best Facilities", "book_now": "Book Now" },
                "footer": { "copyright": "© 2025 AgriSort. Empowering Indian Farmers." },
                "crops": { "Wheat": "Wheat", "Rice": "Rice", "Maize": "Maize", "Potato": "Potato", "Onion": "Onion", "Tomato": "Tomato", "Mustard": "Mustard", "Cotton": "Cotton", "Sugarcane": "Sugarcane", "Barley": "Barley" },
                "varieties": { "Common": "Common", "Basmati": "Basmati", "Hybrid": "Hybrid", "Agra Red": "Agra Red", "Nasik": "Nasik", "Black": "Black", "Long Staple": "Long Staple", "Co-0238": "Co-0238", "Malt": "Malt" },
                "mandis": { "Azadpur Mandi": "Azadpur Mandi", "Ghazipur Mandi": "Ghazipur Mandi", "Okhla Mandi": "Okhla Mandi", "Narela Mandi": "Narela Mandi", "Najafgarh Mandi": "Najafgarh Mandi", "Keshopur Mandi": "Keshopur Mandi", "Shahdara Mandi": "Shahdara Mandi" },
                "ui": { "choose_crop": "Choose Crop...", "sort_by": "Sort by", "merge_sort": "Merge Sort", "heap_sort": "Heap Sort", "bubble_sort": "Bubble Sort" }
            },
            'hi': {
                "nav": { "home": "होम", "prices": "मंडी भाव", "compare": "तुलना करें", "storage": "भंडारण", "logout": "लॉग आउट" },
                "dashboard": { "title": "आज के मंडी भाव", "refresh": "ताज़ा करें", "all_crops": "सभी फसलें", "cereals": "अनाज", "vegetables": "सब्जियां", "loading": "भाव लोड हो रहे हैं..." },
                "search": { "title": "स्मार्ट खोज", "crop_name": "फसल का नाम", "placeholder": "फसल खोजें (जैसे गेहूं)...", "algo": "एल्गो", "linear_search": "रैखिक खोज", "radius": "दायरा", "search_btn": "खोजें" },
                "compare": { "title": "बाजारों की तुलना करें", "select_crop_1": "फसल 1 चुनें", "select_crop_2": "फसल 2 चुनें", "compare_btn": "तुलना करें", "result_title": "तुलना परिणाम", "metric": "मेट्रिक", "difference": "अंतर" },
                "market_finder": { "title": "सर्वोत्तम बाजार खोजें", "select_crop": "बेचने के लिए फसल चुनें", "sorting": "छँटाई", "quick_sort": "त्वरित छँटाई", "find_btn": "बाजार खोजें", "available_markets": "उपलब्ध बाजार", "best_price": "सर्वोत्तम मूल्य", "nearest": "निकटतम", "max_profit": "अधिकतम लाभ", "mandi_name": "मंडी का नाम", "price": "भाव", "distance": "दूरी", "est_profit": "अनुमानित लाभ", "action": "कार्रवाई" },
                "storage": { "title": "भंडारण सुविधा खोजक", "find_storage": "भंडारण खोजें", "crop_type": "फसल का प्रकार", "quantity": "मात्रा (क्विंटल)", "find_btn": "सर्वोत्तम सुविधाएं खोजें", "book_now": "अभी बुक करें" },
                "footer": { "copyright": "© 2025 एग्रीसॉर्ट। भारतीय किसानों को सशक्त बनाना।" },
                "crops": { "Wheat": "गेहूं", "Rice": "चावल", "Maize": "मक्का", "Potato": "आलू", "Onion": "प्याज", "Tomato": "टमाटर", "Mustard": "सरसों", "Cotton": "कपास", "Sugarcane": "गन्ना", "Barley": "जौ" },
                "varieties": { "Common": "सामान्य", "Basmati": "बासमती", "Hybrid": "हाइब्रिड", "Agra Red": "आगरा लाल", "Nasik": "नासिक", "Black": "काली", "Long Staple": "लंबे रेशे वाला", "Co-0238": "को-0238", "Malt": "माल्ट" },
                "mandis": { "Azadpur Mandi": "आजादपुर मंडी", "Ghazipur Mandi": "गाजीपुर मंडी", "Okhla Mandi": "ओखला मंडी", "Narela Mandi": "नरेला मंडी", "Najafgarh Mandi": "नजफगढ़ मंडी", "Keshopur Mandi": "केशोपुर मंडी", "Shahdara Mandi": "शाहदरा मंडी" },
                "ui": { "choose_crop": "फसल चुनें...", "sort_by": "क्रमबद्ध करें", "merge_sort": "मर्ज सॉर्ट", "heap_sort": "हीप सॉर्ट", "bubble_sort": "बबल सॉर्ट" }
            },
            'pa': {
                "nav": { "home": "ਘਰ", "prices": "ਮੰਡੀ ਭਾਅ", "compare": "ਤੁਲਨਾ ਕਰੋ", "storage": "ਸਟੋਰੇਜ", "logout": "ਲਾਗ ਆਉਟ" },
                "dashboard": { "title": "ਅੱਜ ਦੇ ਮੰਡੀ ਭਾਅ", "refresh": "ਤਾਜ਼ਾ ਕਰੋ", "all_crops": "ਸਾਰੀਆਂ ਫਸਲਾਂ", "cereals": "ਅਨਾਜ", "vegetables": "ਸਬਜ਼ੀਆਂ", "loading": "ਭਾਅ ਲੋਡ ਹੋ ਰਹੇ ਹਨ..." },
                "search": { "title": "ਸਮਾਰਟ ਖੋਜ", "crop_name": "ਫਸਲ ਦਾ ਨਾਮ", "placeholder": "ਫਸਲ ਖੋਜੋ (ਜਿਵੇਂ ਕਣਕ)...", "algo": "ਐਲਗੋ", "linear_search": "ਲੀਨੀਅਰ ਖੋਜ", "radius": "ਦਾਇਰਾ", "search_btn": "ਖੋਜੋ" },
                "compare": { "title": "ਬਾਜ਼ਾਰਾਂ ਦੀ ਤੁਲਨਾ ਕਰੋ", "select_crop_1": "ਫਸਲ 1 ਚੁਣੋ", "select_crop_2": "ਫਸਲ 2 ਚੁਣੋ", "compare_btn": "ਤੁਲਨਾ ਕਰੋ", "result_title": "ਤੁਲਨਾ ਨਤੀਜਾ", "metric": "ਮੈਟ੍ਰਿਕ", "difference": "ਅੰਤਰ" },
                "market_finder": { "title": "ਵਧੀਆ ਬਾਜ਼ਾਰ ਲੱਭੋ", "select_crop": "ਵੇਚਣ ਲਈ ਫਸਲ ਚੁਣੋ", "sorting": "ਛਾਂਟੀ", "quick_sort": "ਤੇਜ਼ ਛਾਂਟੀ", "find_btn": "ਬਾਜ਼ਾਰ ਲੱਭੋ", "available_markets": "ਉਪਲਬਧ ਬਾਜ਼ਾਰ", "best_price": "ਵਧੀਆ ਭਾਅ", "nearest": "ਨਜ਼ਦੀਕੀ", "max_profit": "ਵੱਧ ਤੋਂ ਵੱਧ ਮੁਨਾਫਾ", "mandi_name": "ਮੰਡੀ ਦਾ ਨਾਮ", "price": "ਭਾਅ", "distance": "ਦੂਰੀ", "est_profit": "ਅਨੁਮਾਨਤ ਮੁਨਾਫਾ", "action": "ਕਾਰਵਾਈ" },
                "storage": { "title": "ਸਟੋਰੇਜ ਸਹੂਲਤ ਖੋਜਕ", "find_storage": "ਸਟੋਰੇਜ ਲੱਭੋ", "crop_type": "ਫਸਲ ਦੀ ਕਿਸਮ", "quantity": "ਮਾਤਰਾ (ਕਵਿੰਟਲ)", "find_btn": "ਵਧੀਆ ਸਹੂਲਤਾਂ ਲੱਭੋ", "book_now": "ਹੁਣੇ ਬੁੱਕ ਕਰੋ" },
                "footer": { "copyright": "© 2025 ਐਗਰੀਸੋਰਟ। ਭਾਰਤੀ ਕਿਸਾਨਾਂ ਨੂੰ ਸ਼ਕਤੀਸ਼ਾਲੀ ਬਣਾਉਣਾ।" },
                "crops": { "Wheat": "ਕਣਕ", "Rice": "ਚੌਲ", "Maize": "ਮੱਕੀ", "Potato": "ਆਲੂ", "Onion": "ਪਿਆਜ਼", "Tomato": "ਟਮਾਟਰ", "Mustard": "ਸਰ੍ਹੋਂ", "Cotton": "ਕਪਾਹ", "Sugarcane": "ਗੰਨਾ", "Barley": "ਜੌਂ" },
                "varieties": { "Common": "ਆਮ", "Basmati": "ਬਾਸਮਤੀ", "Hybrid": "ਹਾਈਬ੍ਰਿਡ", "Agra Red": "ਆਗਰਾ ਲਾਲ", "Nasik": "ਨਾਸਿਕ", "Black": "ਕਾਲੀ", "Long Staple": "ਲੰਬੇ ਰੇਸ਼ੇ ਵਾਲਾ", "Co-0238": "ਕੋ-0238", "Malt": "ਮਾਲਟ" },
                "mandis": { "Azadpur Mandi": "ਆਜ਼ਾਦਪੁਰ ਮੰਡੀ", "Ghazipur Mandi": "ਗਾਜ਼ੀਪੁਰ ਮੰਡੀ", "Okhla Mandi": "ਓਖਲਾ ਮੰਡੀ", "Narela Mandi": "ਨਰੇਲਾ ਮੰਡੀ", "Najafgarh Mandi": "ਨਜਫਗੜ੍ਹ ਮੰਡੀ", "Keshopur Mandi": "ਕੇਸ਼ੋਪੁਰ ਮੰਡੀ", "Shahdara Mandi": "ਸ਼ਾਹਦਰਾ ਮੰਡੀ" },
                "ui": { "choose_crop": "ਫਸਲ ਚੁਣੋ...", "sort_by": "ਇਸ ਦੁਆਰਾ ਕ੍ਰਮਬੱਧ ਕਰੋ", "merge_sort": "ਮਰਜ ਸੌਰਟ", "heap_sort": "ਹੀਪ ਸੌਰਟ", "bubble_sort": "ਬਬਲ ਸੌਰਟ" }
            },
            'bn': {
                "nav": { "home": "বাড়ি", "prices": "বাজার দর", "compare": "তুলনা করুন", "storage": "স্টোরেজ", "logout": "লগ আউট" },
                "dashboard": { "title": "আজকের বাজার দর", "refresh": "রিফ্রেশ", "all_crops": "সব ফসল", "cereals": "শস্য", "vegetables": "শাকসবজি", "loading": "দাম লোড হচ্ছে..." },
                "search": { "title": "স্মার্ট অনুসন্ধান", "crop_name": "ফসলের নাম", "placeholder": "ফসল খুঁজুন (যেমন গম)...", "algo": "অ্যালগো", "linear_search": "রৈখিক অনুসন্ধান", "radius": "ব্যাসার্ধ", "search_btn": "অনুসন্ধান" },
                "compare": { "title": "বাজার তুলনা করুন", "select_crop_1": "ফসল ১ নির্বাচন করুন", "select_crop_2": "ফসল ২ নির্বাচন করুন", "compare_btn": "তুলনা করুন", "result_title": "তুলনার ফলাফল", "metric": "মেট্রিক", "difference": "পার্থক্য" },
                "market_finder": { "title": "সেরা বাজার খুঁজুন", "select_crop": "বিক্রির জন্য ফসল নির্বাচন করুন", "sorting": "বাছাই", "quick_sort": "দ্রুত বাছাই", "find_btn": "বাজার খুঁজুন", "available_markets": "উপলব্ধ বাজার", "best_price": "সেরা দাম", "nearest": "নিকটতম", "max_profit": "সর্বাধিক লাভ", "mandi_name": "মান্ডির নাম", "price": "দাম", "distance": "দূরত্ব", "est_profit": "আনুমানিক লাভ", "action": "কর্ম" },
                "storage": { "title": "স্টোরেজ সুবিধা অনুসন্ধানকারী", "find_storage": "স্টোরেজ খুঁজুন", "crop_type": "ফসলের ধরন", "quantity": "পরিমাণ (কুইন্টাল)", "find_btn": "সেরা সুবিধা খুঁজুন", "book_now": "এখনই বুক করুন" },
                "footer": { "copyright": "© ২০২৫ এগ্রিসর্ট। ভারতীয় কৃষকদের ক্ষমতায়ন।" },
                "crops": { "Wheat": "গম", "Rice": "চাল", "Maize": "ভুট্টা", "Potato": "আলু", "Onion": "পেঁয়াজ", "Tomato": "টমেটো", "Mustard": "সরিষা", "Cotton": "তুলা", "Sugarcane": "আখ", "Barley": "বার্লি" },
                "varieties": { "Common": "সাধারণ", "Basmati": "বাসমতি", "Hybrid": "হাইব্রিড", "Agra Red": "আগ্রা লাল", "Nasik": "নাসিক", "Black": "কালো", "Long Staple": "লং স্ট্যাপল", "Co-0238": "কো-০২৩৮", "Malt": "মাল্ট" },
                "mandis": { "Azadpur Mandi": "আজাদপুর মান্ডি", "Ghazipur Mandi": "গাজিপুর মান্ডি", "Okhla Mandi": "ওখলা মান্ডি", "Narela Mandi": "নারেলা মান্ডি", "Najafgarh Mandi": "নাজাফগড় মান্ডি", "Keshopur Mandi": "কেশোপুর মান্ডি", "Shahdara Mandi": "শাহদারা মান্ডি" },
                "ui": { "choose_crop": "ফসল নির্বাচন করুন...", "sort_by": "বাছাই করুন", "merge_sort": "মার্জ সর্ট", "heap_sort": "হিপ সর্ট", "bubble_sort": "বাবল সর্ট" }
            },
            'mr': {
                "nav": { "home": "मुख्य पृष्ठ", "prices": "बाजार भाव", "compare": "तुलना करा", "storage": "साठवणूक", "logout": "लॉग आउट" },
                "dashboard": { "title": "आजचे बाजार भाव", "refresh": "रिफ्रेश", "all_crops": "सर्व पिके", "cereals": "धान्य", "vegetables": "भाज्या", "loading": "भाव लोड होत आहेत..." },
                "search": { "title": "स्मार्ट शोध", "crop_name": "पिकाचे नाव", "placeholder": "पीक शोधा (उदा. गहू)...", "algo": "अल्गो", "linear_search": "रेखीय शोध", "radius": "त्रिज्या", "search_btn": "शोधा" },
                "compare": { "title": "बाजारांची तुलना करा", "select_crop_1": "पीक १ निवडा", "select_crop_2": "पीक २ निवडा", "compare_btn": "तुलना करा", "result_title": "तुलना निकाल", "metric": "मेट्रिक", "difference": "फरक" },
                "market_finder": { "title": "सर्वोत्तम बाजार शोधा", "select_crop": "विक्रीसाठी पीक निवडा", "sorting": "क्रमवारी", "quick_sort": "जलद क्रमवारी", "find_btn": "बाजार शोधा", "available_markets": "उपलब्ध बाजार", "best_price": "सर्वोत्तम भाव", "nearest": "जवळचे", "max_profit": "जास्तीत जास्त नफा", "mandi_name": "मंडीचे नाव", "price": "भाव", "distance": "अंतर", "est_profit": "अंदाजित नफा", "action": "कृती" },
                "storage": { "title": "साठवणूक सुविधा शोधक", "find_storage": "साठवणूक शोधा", "crop_type": "पिकाचा प्रकार", "quantity": "प्रमाण (क्विंटल)", "find_btn": "सर्वोत्तम सुविधा शोधा", "book_now": "आता बुक करा" },
                "footer": { "copyright": "© २०२५ एग्रीसॉर्ट. भारतीय शेतकऱ्यांना सक्षम करणे." },
                "crops": { "Wheat": "गहू", "Rice": "तांदूळ", "Maize": "मका", "Potato": "बटाटा", "Onion": "कांदा", "Tomato": "टोमॅटो", "Mustard": "मोहरी", "Cotton": "कापूस", "Sugarcane": "ऊस", "Barley": "जव" },
                "varieties": { "Common": "सामान्य", "Basmati": "बासमती", "Hybrid": "हायब्रिड", "Agra Red": "आग्रा लाल", "Nasik": "नाशिक", "Black": "काळी", "Long Staple": "लांब धागा", "Co-0238": "को-०२३८", "Malt": "माल्ट" },
                "mandis": { "Azadpur Mandi": "आझादपूर मंडी", "Ghazipur Mandi": "गाझीपूर मंडी", "Okhla Mandi": "ओखला मंडी", "Narela Mandi": "नरेला मंडी", "Najafgarh Mandi": "नजफगड मंडी", "Keshopur Mandi": "केशोपूर मंडी", "Shahdara Mandi": "शहादरा मंडी" },
                "ui": { "choose_crop": "पीक निवडा...", "sort_by": "क्रमवारी लावा", "merge_sort": "मर्ज सॉर्ट", "heap_sort": "हीप सॉर्ट", "bubble_sort": "बबल सॉर्ट" }
            },
            'kn': {
                "nav": { "home": "ಮುಖಪುಟ", "prices": "ಮಾರುಕಟ್ಟೆ ಬೆಲೆಗಳು", "compare": "ಹೋಲಿಸಿ", "storage": "ಸಂಗ್ರಹಣೆ", "logout": "ಲಾಗ್ ಔಟ್" },
                "dashboard": { "title": "ಇಂದಿನ ಮಾರುಕಟ್ಟೆ ಬೆಲೆಗಳು", "refresh": "ರಿಫ್ರೆಶ್", "all_crops": "ಎಲ್ಲಾ ಬೆಳೆಗಳು", "cereals": "ಧಾನ್ಯಗಳು", "vegetables": "ತರಕಾರಿಗಳು", "loading": "ಬೆಲೆಗಳನ್ನು ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ..." },
                "search": { "title": "ಸ್ಮಾರ್ಟ್ ಹುಡುಕಾಟ", "crop_name": "ಬೆಳೆಯ ಹೆಸರು", "placeholder": "ಬೆಳೆಯನ್ನು ಹುಡುಕಿ (ಉದಾ. ಗೋಧಿ)...", "algo": "ಅಲ್ಗೋ", "linear_search": "ಲೀನಿಯರ್ ಹುಡುಕಾಟ", "radius": "ತ್ರಿಜ್ಯ", "search_btn": "ಹುಡುಕಿ" },
                "compare": { "title": "ಮಾರುಕಟ್ಟೆಗಳನ್ನು ಹೋಲಿಸಿ", "select_crop_1": "ಬೆಳೆ 1 ಆಯ್ಕೆಮಾಡಿ", "select_crop_2": "ಬೆಳೆ 2 ಆಯ್ಕೆಮಾಡಿ", "compare_btn": "ಹೋಲಿಸಿ", "result_title": "ಹೋಲಿಕೆ ಫಲಿತಾಂಶ", "metric": "ಮೆಟ್ರಿಕ್", "difference": "ವ್ಯತ್ಯಾಸ" },
                "market_finder": { "title": "ಅತ್ಯುತ್ತಮ ಮಾರುಕಟ್ಟೆಯನ್ನು ಹುಡುಕಿ", "select_crop": "ಮಾರಾಟ ಮಾಡಲು ಬೆಳೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ", "sorting": "ವಿಂಗಡಣೆ", "quick_sort": "ತ್ವರಿತ ವಿಂಗಡಣೆ", "find_btn": "ಮಾರುಕಟ್ಟೆಗಳನ್ನು ಹುಡುಕಿ", "available_markets": "ಲಭ್ಯವಿರುವ ಮಾರುಕಟ್ಟೆಗಳು", "best_price": "ಅತ್ಯುತ್ತಮ ಬೆಲೆ", "nearest": "ಹತ್ತಿರದ", "max_profit": "ಗರಿಷ್ಠ ಲಾಭ", "mandi_name": "ಮಂಡಿ ಹೆಸರು", "price": "ಬೆಲೆ", "distance": "ದೂರ", "est_profit": "ಅಂದಾಜು ಲಾಭ", "action": "ಕ್ರಿಯೆ" },
                "storage": { "title": "ಸಂಗ್ರಹಣೆ ಸೌಲಭ್ಯ ಶೋಧಕ", "find_storage": "ಸಂಗ್ರಹಣೆಯನ್ನು ಹುಡುಕಿ", "crop_type": "ಬೆಳೆಯ ವಿಧ", "quantity": "ಪ್ರಮಾಣ (ಕ್ವಿಂಟಾಲ್)", "find_btn": "ಅತ್ಯುತ್ತಮ ಸೌಲಭ್ಯಗಳನ್ನು ಹುಡುಕಿ", "book_now": "ಈಗ ಬುಕ್ ಮಾಡಿ" },
                "footer": { "copyright": "© 2025 ಅಗ್ರಿಸಾರ್ಟ್. ಭಾರತೀಯ ರೈತರನ್ನು ಸಬಲೀಕರಣಗೊಳಿಸುವುದು." },
                "crops": { "Wheat": "ಗೋಧಿ", "Rice": "ಅಕ್ಕಿ", "Maize": "ಜೋಳ", "Potato": "ಆಲೂಗಡ್ಡೆ", "Onion": "ಈರುಳ್ಳಿ", "Tomato": "ಟೊಮ್ಯಾಟೊ", "Mustard": "ಸಾಸಿವೆ", "Cotton": "ಹತ್ತಿ", "Sugarcane": "ಕಬ್ಬು", "Barley": "ಬಾರ್ಲಿ" },
                "varieties": { "Common": "ಸಾಮಾನ್ಯ", "Basmati": "ಬಾಸ್ಮತಿ", "Hybrid": "ಹೈಬ್ರಿಡ್", "Agra Red": "ಆಗ್ರಾ ಕೆಂಪು", "Nasik": "ನಾಸಿಕ್", "Black": "ಕಪ್ಪು", "Long Staple": "ಉದ್ದ ಎಳೆ", "Co-0238": "ಕೋ-0238", "Malt": "ಮಾಲ್ಟ್" },
                "mandis": { "Azadpur Mandi": "ಆಜಾದ್‌ಪುರ ಮಂಡಿ", "Ghazipur Mandi": "ಘಾಜಿಪುರ ಮಂಡಿ", "Okhla Mandi": "ಓಖ್ಲಾ ಮಂಡಿ", "Narela Mandi": "ನರೇಲಾ ಮಂಡಿ", "Najafgarh Mandi": "ನಜಫ್‌ಗಢ ಮಂಡಿ", "Keshopur Mandi": "ಕೇಶೋಪುರ ಮಂಡಿ", "Shahdara Mandi": "ಶಹದಾರ ಮಂಡಿ" },
                "ui": { "choose_crop": "ಬೆಳೆ ಆಯ್ಕೆಮಾಡಿ...", "sort_by": "ವಿಂಗಡಿಸಿ", "merge_sort": "ಮರ್ಜ್ ಸಾರ್ಟ್", "heap_sort": "ಹೀಪ್ ಸಾರ್ಟ್", "bubble_sort": "ಬಬಲ್ ಸಾರ್ಟ್" }
            },
            'te': {
                "nav": { "home": "హోమ్", "prices": "మార్కెట్ ధరలు", "compare": "పోల్చండి", "storage": "నిల్వ", "logout": "లాగ్ అవుట్" },
                "dashboard": { "title": "నేటి మార్కెట్ ధరలు", "refresh": "రీఫ్రెష్", "all_crops": "అన్ని పంటలు", "cereals": "ధాన్యాలు", "vegetables": "కూరగాయలు", "loading": "ధరలు లోడ్ అవుతున్నాయి..." },
                "search": { "title": "స్మార్ట్ శోధన", "crop_name": "పంట పేరు", "placeholder": "పంటను వెతకండి (ఉదా. గోధుమ)...", "algo": "అల్గో", "linear_search": "లీనియర్ సెర్చ్", "radius": "వ్యాసార్థం", "search_btn": "వెతకండి" },
                "compare": { "title": "మార్కెట్లను పోల్చండి", "select_crop_1": "పంట 1 ఎంచుకోండి", "select_crop_2": "పంట 2 ఎంచుకోండి", "compare_btn": "పోల్చండి", "result_title": "పోలిక ఫలితం", "metric": "మెట్రిక్", "difference": "తేడా" },
                "market_finder": { "title": "ఉత్తమ మార్కెట్‌ను కనుగొనండి", "select_crop": "అమ్మడానికి పంటను ఎంచుకోండి", "sorting": "సార్టింగ్", "quick_sort": "క్విక్ సార్ట్", "find_btn": "మార్కెట్లను కనుగొనండి", "available_markets": "అందుబాటులో ఉన్న మార్కెట్లు", "best_price": "ఉత్తమ ధర", "nearest": "దగ్గరి", "max_profit": "గరిష్ట లాభం", "mandi_name": "మండి పేరు", "price": "ధర", "distance": "దూరం", "est_profit": "అంచనా లాభం", "action": "చర్య" },
                "storage": { "title": "నిల్వ సౌకర్యం ఫైండర్", "find_storage": "నిల్వను కనుగొనండి", "crop_type": "పంట రకం", "quantity": "పరిమాణం (క్వింటాల్)", "find_btn": "ఉత్తమ సౌకర్యాలను కనుగొనండి", "book_now": "ఇప్పుడే బుక్ చేయండి" },
                "footer": { "copyright": "© 2025 అగ్రిసార్ట్. భారతీయ రైతులను శక్తివంతం చేయడం." },
                "crops": { "Wheat": "గోధుమ", "Rice": "బియ్యం", "Maize": "మొక్కజొన్న", "Potato": "బంగాళాదుంప", "Onion": "ఉల్లిపాయ", "Tomato": "టమోటా", "Mustard": "ఆవాలు", "Cotton": "పత్తి", "Sugarcane": "చెరకు", "Barley": "బార్లీ" },
                "varieties": { "Common": "సాధారణ", "Basmati": "బాస్మతి", "Hybrid": "హైబ్రిడ్", "Agra Red": "ఆగ్రా రెడ్", "Nasik": "నాసిక్", "Black": "నలుపు", "Long Staple": "పొడవాటి పింజ", "Co-0238": "కో-0238", "Malt": "మాల్ట్" },
                "mandis": { "Azadpur Mandi": "ఆజాద్‌పూర్ మండి", "Ghazipur Mandi": "ఘాజీపూర్ మండి", "Okhla Mandi": "ఓఖ్లా మండి", "Narela Mandi": "నరేలా మండి", "Najafgarh Mandi": "నజఫ్‌గఢ్ మండి", "Keshopur Mandi": "కేశోపూర్ మండి", "Shahdara Mandi": "షహదారా మండి" },
                "ui": { "choose_crop": "పంటను ఎంచుకోండి...", "sort_by": "క్రమబద్ధీకరించు", "merge_sort": "మెర్జ్ సార్ట్", "heap_sort": "హీప్ సార్ట్", "bubble_sort": "బబుల్ సార్ట్" }
            },
            'ta': {
                "nav": { "home": "முகப்பு", "prices": "சந்தை விலைகள்", "compare": "ஒப்பிடுக", "storage": "சேமிப்பு", "logout": "வெளியேறு" },
                "dashboard": { "title": "இன்றைய சந்தை விலைகள்", "refresh": "புதுப்பி", "all_crops": "அனைத்து பயிர்கள்", "cereals": "தானியங்கள்", "vegetables": "காய்கறிகள்", "loading": "விலைகள் ஏற்றப்படுகின்றன..." },
                "search": { "title": "ஸ்மார்ட் தேடல்", "crop_name": "பயிர் பெயர்", "placeholder": "பயிரைத் தேடு (எ.கா. கோதுமை)...", "algo": "அல்காரிதம்", "linear_search": "நேரியல் தேடல்", "radius": "ஆரம்", "search_btn": "தேடு" },
                "compare": { "title": "சந்தைகளை ஒப்பிடுக", "select_crop_1": "பயிர் 1 ஐத் தேர்ந்தெடுக்கவும்", "select_crop_2": "பயிர் 2 ஐத் தேர்ந்தெடுக்கவும்", "compare_btn": "ஒப்பிடுக", "result_title": "ஒப்பீட்டு முடிவு", "metric": "மெட்ரிக்", "difference": "வித்தியாசம்" },
                "market_finder": { "title": "சிறந்த சந்தையைக் கண்டறியவும்", "select_crop": "விற்க பயிரைத் தேர்ந்தெடுக்கவும்", "sorting": "வரிசைப்படுத்துதல்", "quick_sort": "விரைவு வரிசைப்படுத்தல்", "find_btn": "சந்தைகளைக் கண்டறியவும்", "available_markets": "கிடைக்கும் சந்தைகள்", "best_price": "சிறந்த விலை", "nearest": "அருகிலுள்ள", "max_profit": "அதிகபட்ச லாபம்", "mandi_name": "மண்டி பெயர்", "price": "விலை", "distance": "தூரம்", "est_profit": "மதிப்பிடப்பட்ட லாபம்", "action": "செயல்" },
                "storage": { "title": "சேமிப்பு வசதி தேடுபவர்", "find_storage": "சேமிப்பைக் கண்டறியவும்", "crop_type": "பயிர் வகை", "quantity": "அளவு (குவிண்டால்)", "find_btn": "சிறந்த வசதிகளைக் கண்டறியவும்", "book_now": "இப்போது முன்பதிவு செய்" },
                "footer": { "copyright": "© 2025 அக்ரிசார்ட். இந்திய விவசாயிகளுக்கு அதிகாரமளித்தல்." },
                "crops": { "Wheat": "கோதுமை", "Rice": "அரிசி", "Maize": "சோளம்", "Potato": "உருளைக்கிழங்கு", "Onion": "வெங்காயம்", "Tomato": "தக்காளி", "Mustard": "கடுகு", "Cotton": "பருத்தி", "Sugarcane": "கரும்பு", "Barley": "பார்லி" },
                "varieties": { "Common": "பொதுவான", "Basmati": "பாசுமதி", "Hybrid": "கலப்பின", "Agra Red": "ஆக்ரா சிவப்பு", "Nasik": "நாசிக்", "Black": "கருப்பு", "Long Staple": "நீண்ட இழை", "Co-0238": "கோ-0238", "Malt": "மால்ட்" },
                "mandis": { "Azadpur Mandi": "ஆசாத் பூர் மண்டி", "Ghazipur Mandi": "காசிப்பூர் மண்டி", "Okhla Mandi": "ஓக்லா மண்டி", "Narela Mandi": "நரேலா மண்டி", "Najafgarh Mandi": "நஜப்கர் மண்டி", "Keshopur Mandi": "கேஷோபூர் மண்டி", "Shahdara Mandi": "ஷஹதாரா மண்டி" },
                "ui": { "choose_crop": "பயிரைத் தேர்ந்தெடுக்கவும்...", "sort_by": "வரிசைப்படுத்து", "merge_sort": "மெர்ஜ் சார்ட்", "heap_sort": "ஹீப் சார்ட்", "bubble_sort": "பபுள் சார்ட்" }
            },
            'ml': {
                "nav": { "home": "ഹോം", "prices": "വിപണി വിലകൾ", "compare": "താരതമ്യം ചെയ്യുക", "storage": "സംഭരണം", "logout": "ലോഗ് ഔട്ട്" },
                "dashboard": { "title": "ഇന്നത്തെ വിപണി വിലകൾ", "refresh": "പുതുക്കുക", "all_crops": "എല്ലാ വിളകളും", "cereals": "ധാന്യങ്ങൾ", "vegetables": "പച്ചക്കറികൾ", "loading": "വിലകൾ ലോഡ് ചെയ്യുന്നു..." },
                "search": { "title": "സ്മാർട്ട് തിരയൽ", "crop_name": "വിളയുടെ പേര്", "placeholder": "വിള തിരയുക (ഉദാ. ഗോതമ്പ്)...", "algo": "അൽഗോരിതം", "linear_search": "ലീനിയർ സെർച്ച്", "radius": "പരിധി", "search_btn": "തിരയുക" },
                "compare": { "title": "വിപണികൾ താരതമ്യം ചെയ്യുക", "select_crop_1": "വിള 1 തിരഞ്ഞെടുക്കുക", "select_crop_2": "വിള 2 തിരഞ്ഞെടുക്കുക", "compare_btn": "താരതമ്യം ചെയ്യുക", "result_title": "താരതമ്യ ഫലം", "metric": "മെട്രിക്", "difference": "വ്യത്യാസം" },
                "market_finder": { "title": "മികച്ച വിപണി കണ്ടെത്തുക", "select_crop": "വിൽക്കാൻ വിള തിരഞ്ഞെടുക്കുക", "sorting": "ക്രമീകരണം", "quick_sort": "ദ്രുത ക്രമീകരണം", "find_btn": "വിപണികൾ കണ്ടെത്തുക", "available_markets": "ലഭ്യമായ വിപണികൾ", "best_price": "മികച്ച വില", "nearest": "ഏറ്റവും അടുത്തുള്ള", "max_profit": "പരമാവധി ലാഭം", "mandi_name": "മണ്ടി പേര്", "price": "വില", "distance": "ദൂരം", "est_profit": "പ്രതീക്ഷിക്കുന്ന ലാഭം", "action": "പ്രവർത്തി" },
                "storage": { "title": "സംഭരണ സൗകര്യം കണ്ടെത്തുക", "find_storage": "സംഭരണം കണ്ടെത്തുക", "crop_type": "വിള തരം", "quantity": "അളവ് (ക്വിന്റൽ)", "find_btn": "മികച്ച സൗകര്യങ്ങൾ കണ്ടെത്തുക", "book_now": "ഇപ്പോൾ ബുക്ക് ചെയ്യുക" },
                "footer": { "copyright": "© 2025 അഗ്രിസോർട്ട്. ഇന്ത്യൻ കർഷകരെ ശാക്തീകരിക്കുന്നു." },
                "crops": { "Wheat": "ഗോതമ്പ്", "Rice": "അരി", "Maize": "ചോളം", "Potato": "ഉരുളക്കിഴങ്ങ്", "Onion": "സവാള", "Tomato": "തക്കാളി", "Mustard": "കടുക്", "Cotton": "പരുത്തി", "Sugarcane": "കരിമ്പ്", "Barley": "ബാർലി" },
                "varieties": { "Common": "സാധാരണ", "Basmati": "ബസ്മതി", "Hybrid": "ഹൈബ്രിഡ്", "Agra Red": "ആഗ്ര റെഡ്", "Nasik": "നാസിക്", "Black": "കറുപ്പ്", "Long Staple": "നീളമുള്ള", "Co-0238": "കോ-0238", "Malt": "മാൾട്ട്" },
                "mandis": { "Azadpur Mandi": "ആസാദ്പൂർ മണ്ടി", "Ghazipur Mandi": "ഗാസിപൂർ മണ്ടി", "Okhla Mandi": "ഓഖ്ല മണ്ടി", "Narela Mandi": "നരേല മണ്ടി", "Najafgarh Mandi": "നജഫ്ഗഡ് മണ്ടി", "Keshopur Mandi": "കേശോപൂർ മണ്ടി", "Shahdara Mandi": "ഷഹദാര മണ്ടി" },
                "ui": { "choose_crop": "വിള തിരഞ്ഞെടുക്കുക...", "sort_by": "ക്രമീകരിക്കുക", "merge_sort": "മെർജ് സോർട്ട്", "heap_sort": "ഹീപ്പ് സോർട്ട്", "bubble_sort": "ബബിൾ സോർട്ട്" }
            }
        };
        return dict[lang] || dict['en'];
    }
};

// Configuration
const CONFIG = {
    // Firebase Realtime Database configuration
    FIREBASE_URL: 'FIREBASE_URL_PLACEHOLDER',
    FIREBASE_AUTH_TOKEN: null, // Set if your DB requires authentication

    // Auto-refresh interval (milliseconds)
    AUTO_REFRESH_INTERVAL: 30000, // 30 seconds

    // Cache key for localStorage
    CACHE_KEY: 'lastSensorData.cache'
};

// State
let isLoading = false;
let autoRefreshTimer = null;
let currentData = null;  // Latest full data from API
let displayData = null;  // Processed data for display (unchanged groups cleared)

// DOM Elements
const elements = {
    loadingView: document.getElementById('loadingView'),
    errorView: document.getElementById('errorView'),
    emptyView: document.getElementById('emptyView'),
    dataView: document.getElementById('dataView'),
    errorMessage: document.getElementById('errorMessage'),
    refreshBtn: document.getElementById('refreshBtn'),
    retryBtn: document.getElementById('retryBtn'),

    // Azart values
    azartA: document.getElementById('azart-a'),
    azartB: document.getElementById('azart-b'),
    azartC: document.getElementById('azart-c'),

    // Brama values
    bramaA: document.getElementById('brama-a'),
    bramaB: document.getElementById('brama-b'),
    bramaC: document.getElementById('brama-c')
};

// Utility Functions
function showView(viewName) {
    // Hide all views
    Object.values(elements).forEach(el => {
        if (el && el.classList && el.classList.contains('state-view')) {
            el.classList.add('hidden');
        }
    });

    elements.dataView.classList.add('hidden');

    // Show requested view
    switch (viewName) {
        case 'loading':
            elements.loadingView.classList.remove('hidden');
            break;
        case 'error':
            elements.errorView.classList.remove('hidden');
            break;
        case 'empty':
            elements.emptyView.classList.remove('hidden');
            break;
        case 'data':
            elements.dataView.classList.remove('hidden');
            break;
    }
}

function formatValue(value) {
    if (value === null || value === undefined) {
        return '-';
    }

    // Convert to number if string
    const num = typeof value === 'string' ? parseFloat(value) : value;

    if (isNaN(num)) {
        return '-';
    }

    // Format to 1 decimal place
    return num.toFixed(1);
}

function updateDisplay(sensorData) {
    if (!sensorData) {
        showView('empty');
        return;
    }

    // Update Azart values
    if (sensorData.azart) {
        elements.azartA.textContent = formatValue(sensorData.azart.a);
        elements.azartB.textContent = formatValue(sensorData.azart.b);
        elements.azartC.textContent = formatValue(sensorData.azart.c);
    }

    // Update Brama values
    if (sensorData.brama) {
        elements.bramaA.textContent = formatValue(sensorData.brama.a);
        elements.bramaB.textContent = formatValue(sensorData.brama.b);
        elements.bramaC.textContent = formatValue(sensorData.brama.c);
    }

    showView('data');
}

function showError(message) {
    elements.errorMessage.textContent = message;
    showView('error');
}
// Helper: Compare two sensor groups for equality
function areSensorGroupsEqual(group1, group2) {
    if (!group1 || !group2) return false;
    return group1.a === group2.a &&
        group1.b === group2.b &&
        group1.c === group2.c;
}

// Helper: Create a cleared sensor group (all values null)
function createClearedGroup() {
    return { a: null, b: null, c: null };
}

// Helper: Deep clone sensor data
function cloneData(data) {
    if (!data) return null;
    return JSON.parse(JSON.stringify(data));
}


function cacheData(data) {
    try {
        localStorage.setItem(CONFIG.CACHE_KEY, JSON.stringify(data));
    } catch (e) {
        console.warn('Failed to cache data:', e);
    }
}

function loadCachedData() {
    try {
        const cached = localStorage.getItem(CONFIG.CACHE_KEY);
        return cached ? JSON.parse(cached) : null;
    } catch (e) {
        console.warn('Failed to load cached data:', e);
        return null;
    }
}

// API Functions
async function fetchLatestData() {
    if (isLoading) return;

    isLoading = true;

    // Show loading only if we don't have any data yet
    if (!currentData && !displayData) {
        showView('loading');
    }

    // Add spinning animation to refresh button
    elements.refreshBtn.classList.add('spinning');

    try {
        // Build URL with auth token if provided
        let url = CONFIG.FIREBASE_URL;
        if (CONFIG.FIREBASE_AUTH_TOKEN) {
            url += `?auth=${CONFIG.FIREBASE_AUTH_TOKEN}`;
        }

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const newData = await response.json();

        // Validate data structure
        if (!newData || typeof newData !== 'object') {
            throw new Error('Invalid data format received');
        }

        // Process data: compare with previous and clear unchanged groups
        const previousData = currentData;
        let processedData = cloneData(newData);

        if (previousData) {
            // Clear brama group if it hasn't changed
            if (areSensorGroupsEqual(previousData.brama, newData.brama)) {
                processedData.brama = createClearedGroup();
            }

            // Clear azart group if it hasn't changed
            if (areSensorGroupsEqual(previousData.azart, newData.azart)) {
                processedData.azart = createClearedGroup();
            }
        }

        // Store full data and processed data
        currentData = newData;
        displayData = processedData;

        // Cache the full data for comparison after restart
        cacheData(newData);

        // Update display with processed data
        updateDisplay(processedData);

    } catch (error) {
        console.error('Fetch error:', error);

        // Try to use cached data as fallback
        const cached = loadCachedData();
        if (cached && !currentData) {
            currentData = cached;
            displayData = cached; // Show full cached data on first load
            updateDisplay(cached);
        } else if (displayData) {
            // Keep showing last successful data
            updateDisplay(displayData);
        } else {
            showError(error.message || 'Failed to load sensor data');
        }
    } finally {
        isLoading = false;
        elements.refreshBtn.classList.remove('spinning');
    }
}

// Auto-refresh
function startAutoRefresh() {
    // Clear any existing timer
    if (autoRefreshTimer) {
        clearInterval(autoRefreshTimer);
    }

    // Set up new timer
    autoRefreshTimer = setInterval(() => {
        fetchLatestData();
    }, CONFIG.AUTO_REFRESH_INTERVAL);
}

function stopAutoRefresh() {
    if (autoRefreshTimer) {
        clearInterval(autoRefreshTimer);
        autoRefreshTimer = null;
    }
}

// Event Listeners
elements.refreshBtn.addEventListener('click', () => {
    fetchLatestData();
});

elements.retryBtn.addEventListener('click', () => {
    fetchLatestData();
});

// Pull to Refresh
let touchStartY = 0;
let touchEndY = 0;
let isPulling = false;

document.addEventListener('touchstart', (e) => {
    if (window.scrollY === 0) {
        touchStartY = e.touches[0].clientY;
    }
}, { passive: true });

document.addEventListener('touchmove', (e) => {
    if (!isLoading && window.scrollY === 0) {
        touchEndY = e.touches[0].clientY;
        const pullDistance = touchEndY - touchStartY;

        if (pullDistance > 80 && !isPulling) {
            isPulling = true;
        }
    }
}, { passive: true });

document.addEventListener('touchend', () => {
    if (isPulling) {
        isPulling = false;
        fetchLatestData();
    }
    touchStartY = 0;
    touchEndY = 0;
}, { passive: true });

// Page Visibility API - pause auto-refresh when page is hidden
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        stopAutoRefresh();
    } else {
        startAutoRefresh();
        fetchLatestData(); // Refresh when page becomes visible
    }
});

// Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('Service Worker registered:', registration);
            })
            .catch(error => {
                console.log('Service Worker registration failed:', error);
            });
    });
}

// Initialize App
async function init() {
    // Load cached data as the baseline for comparison (like iOS app)
    // This is used only for comparison; displayData will be set after first fetch
    const cached = loadCachedData();
    if (cached) {
        currentData = cached;
        // Don't show cached data immediately - wait for fresh fetch
        // This matches iOS behavior where cached data is only for comparison
    }

    // Fetch fresh data
    await fetchLatestData();

    // Start auto-refresh
    startAutoRefresh();
}

// Start the app
init();

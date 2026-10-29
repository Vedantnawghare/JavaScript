/**
 * ==============================================================================
 * PRACTICAL 12: AIRPULSE - REAL-TIME AIR QUALITY & CLIMATE RADAR
 * ==============================================================================
 * Core Syllabus Requirements Implemented:
 * 1. JavaScript & jQuery : Full DOM querying, event delegation, dynamic creation,
 *                          and smooth animations ($(...).on, .append, .fadeIn, etc.).
 * 2. DOM Manipulation    : Dynamic creation of cards, gauge meter, health advice,
 *                          pollutant bars, and toast alert elements.
 * 3. Events Handling     : Form submit, input debounce, click delegation,
 *                          auto-refresh toggle, and manual radar sync.
 * 4. Local Storage       : Storing favorite cities, search history log, last viewed
 *                          city, and offline response caching.
 * 5. AJAX Integration    : Multi-endpoint asynchronous HTTP calls using $.ajax()
 *                          with beforeSend, success, error, latency telemetry,
 *                          and resilient offline fallback.
 * ==============================================================================
 */

// Execute all logic once the HTML Document Object Model (DOM) is fully ready
$(document).ready(function () {

  // ============================================================================
  // 1. APPLICATION STATE & CONFIGURATION
  // ============================================================================
  const CONFIG = {
    autoRefreshIntervalSeconds: 30, // Auto-refresh radar ticks every 30 seconds
    maxHistoryItems: 6,             // Store up to 6 recent search entries
    apiTimeoutMs: 8000              // 8-second network timeout for AJAX
  };

  // State Management Object
  const State = {
    currentCity: 'New Delhi',       // Default active city
    currentCoords: { lat: 28.6139, lon: 77.2090, country: 'India', elevation: 216 },
    currentAirData: null,          // Holds latest parsed air telemetry
    autoRefreshTimerId: null,      // Tracks auto-refresh countdown interval
    radarSecondsLeft: CONFIG.autoRefreshIntervalSeconds,
    isAutoRefreshEnabled: true,
    isLoading: false,
    favorites: [],                 // Loaded from localStorage
    history: []                    // Loaded from localStorage
  };

  // ============================================================================
  // 2. OFFLINE / RESILIENT FALLBACK DATA
  // Ensures the app works 100% reliably even if college lab loses internet.
  // ============================================================================
  const FALLBACK_DATABASE = {
    'New Delhi': {
      name: 'New Delhi', country: 'India', latitude: 28.6139, longitude: 77.2090, elevation: 216,
      aqi: 88, pm25: 112.4, pm10: 178.6, co: 840, no2: 46.2, ozone: 32.5, uv: 5.4, temp: 31, wind: 12
    },
    'Mumbai': {
      name: 'Mumbai', country: 'India', latitude: 19.0760, longitude: 72.8777, elevation: 14,
      aqi: 54, pm25: 42.1, pm10: 76.5, co: 520, no2: 28.4, ozone: 24.1, uv: 6.8, temp: 33, wind: 18
    },
    'London': {
      name: 'London', country: 'United Kingdom', latitude: 51.5074, longitude: -0.1278, elevation: 25,
      aqi: 18, pm25: 6.2, pm10: 11.5, co: 190, no2: 14.8, ozone: 45.0, uv: 2.1, temp: 16, wind: 15
    },
    'Tokyo': {
      name: 'Tokyo', country: 'Japan', latitude: 35.6762, longitude: 139.6503, elevation: 40,
      aqi: 22, pm25: 8.5, pm10: 16.2, co: 210, no2: 18.0, ozone: 38.6, uv: 3.4, temp: 21, wind: 9
    },
    'New York': {
      name: 'New York', country: 'United States', latitude: 40.7128, longitude: -74.0060, elevation: 10,
      aqi: 32, pm25: 12.8, pm10: 22.4, co: 260, no2: 21.5, ozone: 42.0, uv: 4.2, temp: 19, wind: 14
    },
    'Dubai': {
      name: 'Dubai', country: 'United Arab Emirates', latitude: 25.2048, longitude: 55.2708, elevation: 5,
      aqi: 72, pm25: 68.4, pm10: 135.0, co: 610, no2: 34.0, ozone: 48.0, uv: 8.2, temp: 37, wind: 20
    }
  };

  // ============================================================================
  // 3. STORAGE INTEGRATION (localStorage)
  // Persistent data storage across browser reloads & sessions.
  // ============================================================================

  /**
   * Loads saved favorites and history from localStorage on startup.
   */
  function initStorage() {
    try {
      // 1. Load Saved Favorites
      const savedFavs = localStorage.getItem('airpulse_favorites');
      if (savedFavs) {
        State.favorites = JSON.parse(savedFavs);
      } else {
        // Default seed favorites
        State.favorites = [
          { name: 'New Delhi', country: 'India' },
          { name: 'London', country: 'United Kingdom' }
        ];
        saveFavorites();
      }

      // 2. Load Recent Searches History
      const savedHistory = localStorage.getItem('airpulse_history');
      if (savedHistory) {
        State.history = JSON.parse(savedHistory);
      }

      // 3. Load Last Viewed City
      const lastCity = localStorage.getItem('airpulse_last_city');
      if (lastCity) {
        State.currentCity = lastCity;
      }

      logAjaxEvent('localStorage data loaded successfully.', 'storage');
    } catch (e) {
      console.warn('localStorage access failed or restricted:', e);
      logAjaxEvent('localStorage restricted. Using in-memory fallback.', 'error');
    }
  }

  /**
   * Persists the favorites list into localStorage.
   */
  function saveFavorites() {
    try {
      localStorage.setItem('airpulse_favorites', JSON.stringify(State.favorites));
      logAjaxEvent(`Saved ${State.favorites.length} favorite(s) to localStorage.`, 'storage');
    } catch (e) {}
  }

  /**
   * Persists the search history list into localStorage.
   */
  function saveHistory() {
    try {
      localStorage.setItem('airpulse_history', JSON.stringify(State.history));
    } catch (e) {}
  }

  /**
   * Adds a newly searched city to the history log.
   */
  function addToHistory(cityName, countryName) {
    const timeFormatted = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Remove if already exists to push it to the top
    State.history = State.history.filter(item => item.name.toLowerCase() !== cityName.toLowerCase());

    // Add to beginning of array
    State.history.unshift({ name: cityName, country: countryName, time: timeFormatted });

    // Keep history trimmed to maximum count
    if (State.history.length > CONFIG.maxHistoryItems) {
      State.history.pop();
    }

    saveHistory();
    renderHistory();
  }

  // ============================================================================
  // 4. AJAX INTEGRATION (Using jQuery $.ajax)
  // Multi-step asynchronous API fetching with telemetry & error handling.
  // ============================================================================

  /**
   * Step 1: Geocodes city name into coordinates using Open-Meteo Geocoding API.
   * Demonstrates jQuery $.ajax() with method, data, dataType, beforeSend, and callbacks.
   */
  function fetchCityCoordinates(cityName) {
    const startTime = performance.now();
    logAjaxEvent(`Initiating $.ajax Geocoding for "${cityName}"...`, 'request');

    $('#telemetryStatusDot').css({ background: '#fbbf24', boxShadow: '0 0 10px #fbbf24' });
    $('#telEndpoint').text('Geocoding API');
    $('#searchSubmitBtn .btn-text').hide();
    $('#searchSubmitBtn .btn-spinner').show();
    $('#searchSubmitBtn').prop('disabled', true);

    // jQuery AJAX Request
    $.ajax({
      url: 'https://geocoding-api.open-meteo.com/v1/search',
      method: 'GET',
      dataType: 'json',
      data: {
        name: cityName,
        count: 1,
        language: 'en',
        format: 'json'
      },
      timeout: CONFIG.apiTimeoutMs,
      beforeSend: function (xhr) {
        logAjaxEvent(`HTTP GET -> Geocoding [${cityName}]`, 'request');
      },
      success: function (response) {
        const latency = Math.round(performance.now() - startTime);
        $('#telLatency').text(`${latency} ms`);
        $('#telHttpStatus').text('200 OK').removeClass('status-error').addClass('status-ok');

        if (response && response.results && response.results.length > 0) {
          const result = response.results[0];
          State.currentCoords = {
            lat: result.latitude,
            lon: result.longitude,
            country: result.country || result.admin1 || 'Global Region',
            elevation: result.elevation || 50
          };
          State.currentCity = result.name;

          logAjaxEvent(`Found coordinates: ${result.latitude.toFixed(2)}°, ${result.longitude.toFixed(2)}°`, 'success');
          
          // Step 2: Now fetch air quality telemetry for these coordinates
          fetchAirQualityAndWeather(result.name, State.currentCoords);
        } else {
          // If geocoding finds no results, check if we have offline fallback
          logAjaxEvent(`City "${cityName}" not found in remote API. Checking fallback...`, 'error');
          handleCityNotFoundFallback(cityName);
        }
      },
      error: function (xhr, status, error) {
        const latency = Math.round(performance.now() - startTime);
        $('#telLatency').text(`${latency} ms`);
        $('#telHttpStatus').text(`Error (${status})`).removeClass('status-ok').addClass('status-error');
        logAjaxEvent(`Geocoding AJAX error (${status}): ${error}. Activating offline fallback.`, 'error');

        // Graceful offline fallback
        handleCityNotFoundFallback(cityName);
      },
      complete: function () {
        $('#searchSubmitBtn .btn-spinner').hide();
        $('#searchSubmitBtn .btn-text').show();
        $('#searchSubmitBtn').prop('disabled', false);
      }
    });
  }

  /**
   * Step 2: Fetches Air Quality Index (AQI) and Pollutant Telemetry via $.ajax.
   */
  function fetchAirQualityAndWeather(cityName, coords) {
    const startTime = performance.now();
    $('#telEndpoint').text('Air Quality + Climate API');

    // Spin radar icon during active network transfer
    $('#radarSpinner').addClass('spinning');

    // jQuery AJAX Request to Air Quality Open API
    $.ajax({
      url: 'https://air-quality-api.open-meteo.com/v1/air-quality',
      method: 'GET',
      dataType: 'json',
      data: {
        latitude: coords.lat,
        longitude: coords.lon,
        current: 'european_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,ozone,uv_index'
      },
      timeout: CONFIG.apiTimeoutMs,
      beforeSend: function () {
        logAjaxEvent(`HTTP GET -> Air Quality Telemetry [Lat: ${coords.lat.toFixed(2)}, Lon: ${coords.lon.toFixed(2)}]`, 'request');
      },
      success: function (airResponse) {
        const latency = Math.round(performance.now() - startTime);
        $('#telLatency').text(`${latency} ms`);
        $('#telHttpStatus').text('200 OK').removeClass('status-error').addClass('status-ok');
        $('#telemetryStatusDot').css({ background: 'var(--color-good)', boxShadow: '0 0 10px var(--color-good)' });

        // Step 3: Fetch companion weather (Temperature and Wind Speed)
        fetchCompanionWeather(cityName, coords, airResponse.current);
      },
      error: function (xhr, status, error) {
        logAjaxEvent(`Air Quality AJAX call failed (${status}). Using cached or fallback data.`, 'error');
        handleCityNotFoundFallback(cityName);
      },
      complete: function () {
        $('#radarSpinner').removeClass('spinning');
      }
    });
  }

  /**
   * Step 3: Companion AJAX call for temperature and wind conditions.
   */
  function fetchCompanionWeather(cityName, coords, airCurrent) {
    $.ajax({
      url: 'https://api.open-meteo.com/v1/forecast',
      method: 'GET',
      dataType: 'json',
      data: {
        latitude: coords.lat,
        longitude: coords.lon,
        current_weather: true
      },
      timeout: CONFIG.apiTimeoutMs,
      success: function (weatherResponse) {
        const weather = weatherResponse.current_weather || { temperature: 24, windspeed: 10 };
        
        // Assemble unified data payload
        const unifiedData = {
          cityName: cityName,
          country: coords.country,
          coords: coords,
          aqi: airCurrent.european_aqi || Math.round((airCurrent.pm2_5 || 20) * 1.5),
          pm25: airCurrent.pm2_5 || 0,
          pm10: airCurrent.pm10 || 0,
          co: airCurrent.carbon_monoxide || 0,
          no2: airCurrent.nitrogen_dioxide || 0,
          ozone: airCurrent.ozone || 0,
          uv: airCurrent.uv_index || 0,
          temp: Math.round(weather.temperature),
          wind: Math.round(weather.windspeed)
        };

        // Cache response in localStorage for instant offline access
        try {
          localStorage.setItem(`airpulse_cache_${cityName.toLowerCase()}`, JSON.stringify(unifiedData));
          localStorage.setItem('airpulse_last_city', cityName);
        } catch (e) {}

        // Add to history
        addToHistory(cityName, coords.country);

        // Render everything to the DOM
        renderFullDashboard(unifiedData);
        showToast('Live Telemetry Synced', `Received live atmosphere feed for ${cityName}.`, 'success');
        logAjaxEvent(`Successfully rendered live telemetry for ${cityName}.`, 'success');
      },
      error: function () {
        // Fallback with estimated weather
        const unifiedData = {
          cityName: cityName,
          country: coords.country,
          coords: coords,
          aqi: airCurrent.european_aqi || 40,
          pm25: airCurrent.pm2_5 || 25,
          pm10: airCurrent.pm10 || 45,
          co: airCurrent.carbon_monoxide || 400,
          no2: airCurrent.nitrogen_dioxide || 20,
          ozone: airCurrent.ozone || 30,
          uv: airCurrent.uv_index || 4,
          temp: 26,
          wind: 12
        };
        renderFullDashboard(unifiedData);
      }
    });
  }

  /**
   * Offline fallback handler if network fails or city is not in remote database.
   */
  function handleCityNotFoundFallback(cityName) {
    // 1. Check if cached in localStorage
    try {
      const cached = localStorage.getItem(`airpulse_cache_${cityName.toLowerCase()}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        renderFullDashboard(parsed);
        showToast('Cached Data Loaded', `Showing cached atmosphere data for ${cityName}.`, 'warning');
        logAjaxEvent(`Restored ${cityName} from local cache storage.`, 'storage');
        return;
      }
    } catch (e) {}

    // 2. Check built-in fallback database
    const matchedKey = Object.keys(FALLBACK_DATABASE).find(k => k.toLowerCase() === cityName.toLowerCase());
    if (matchedKey) {
      const d = FALLBACK_DATABASE[matchedKey];
      const fallbackPayload = {
        cityName: d.name,
        country: d.country,
        coords: { lat: d.latitude, lon: d.longitude, country: d.country, elevation: d.elevation },
        aqi: d.aqi,
        pm25: d.pm25,
        pm10: d.pm10,
        co: d.co,
        no2: d.no2,
        ozone: d.ozone,
        uv: d.uv,
        temp: d.temp,
        wind: d.wind
      };
      renderFullDashboard(fallbackPayload);
      showToast('Offline Mode Active', `Loaded offline simulated radar for ${d.name}.`, 'warning');
      logAjaxEvent(`Offline fallback activated for ${d.name}.`, 'storage');
      return;
    }

    // 3. Fallback to default city New Delhi
    showToast('Location Not Found', `"${cityName}" not found. Loading New Delhi fallback.`, 'error');
    fetchCityCoordinates('New Delhi');
  }

  // ============================================================================
  // 5. DOM MANIPULATION WITH JQUERY
  // Dynamically constructs and updates DOM elements and CSS attributes.
  // ============================================================================

  /**
   * Interprets AQI value into health category, colors, and advisory messages.
   */
  function getAqiCategory(aqi) {
    if (aqi <= 20) {
      return {
        label: 'GOOD (EXCELLENT)',
        color: 'var(--color-good)',
        border: '#10b981',
        title: 'Ideal Atmospheric Purity',
        desc: 'Air quality is considered satisfactory, and air pollution poses little or no risk to public health.',
        exercise: { status: 'Recommended', icon: '🏃‍♂️', val: 'Safe Outdoors' },
        mask: { status: 'Not Needed', icon: '😷', val: 'No Mask Required' },
        ventilation: { status: 'Encouraged', icon: '🪟', val: 'Open Windows' },
        sensitive: { status: 'Zero Risk', icon: '👶', val: 'Safe For All Groups' }
      };
    } else if (aqi <= 40) {
      return {
        label: 'FAIR (ACCEPTABLE)',
        color: 'var(--color-fair)',
        border: '#84cc16',
        title: 'Moderate Atmospheric Clarity',
        desc: 'Air quality is acceptable; however, very sensitive individuals might experience mild irritation.',
        exercise: { status: 'Enjoyable', icon: '🏃‍♂️', val: 'Safe For Most' },
        mask: { status: 'Optional', icon: '😷', val: 'Generally Unnecessary' },
        ventilation: { status: 'Safe', icon: '🪟', val: 'Fresh Air Friendly' },
        sensitive: { status: 'Low Concern', icon: '👶', val: 'Monitor Symptoms' }
      };
    } else if (aqi <= 60) {
      return {
        label: 'MODERATE (ELEVATED)',
        color: 'var(--color-moderate)',
        border: '#f59e0b',
        title: 'Elevated Particle Concentration',
        desc: 'Sensitive individuals with asthma or respiratory allergies should limit prolonged outdoor exertion.',
        exercise: { status: 'Moderate', icon: '🏃‍♂️', val: 'Reduce Intensity' },
        mask: { status: 'Recommended', icon: '😷', val: 'Mask for Allergies' },
        ventilation: { status: 'Caution', icon: '🪟', val: 'Close During Peak Traffic' },
        sensitive: { status: 'At Risk', icon: '👶', val: 'Asthma Advisory' }
      };
    } else if (aqi <= 80) {
      return {
        label: 'POOR (UNHEALTHY)',
        color: 'var(--color-poor)',
        border: '#f97316',
        title: 'Unhealthy Pollution Detected',
        desc: 'Everyone may begin to experience health effects. Members of sensitive groups may experience more serious effects.',
        exercise: { status: 'Restricted', icon: '🏃‍♂️', val: 'Avoid Outdoor Cardio' },
        mask: { status: 'Advised', icon: '😷', val: 'Wear N95 Outdoors' },
        ventilation: { status: 'Keep Closed', icon: '🪟', val: 'Run Air Purifier' },
        sensitive: { status: 'High Vulnerability', icon: '👶', val: 'Keep Indoors' }
      };
    } else {
      return {
        label: 'VERY POOR / HAZARDOUS',
        color: 'var(--color-hazardous)',
        border: '#a855f7',
        title: 'Critical Atmospheric Hazard',
        desc: 'Health emergency alert: The entire population is likely to be affected by severe respiratory and cardiovascular stress.',
        exercise: { status: 'Prohibited', icon: '🏃‍♂️', val: 'Zero Outdoor Activities' },
        mask: { status: 'Mandatory', icon: '😷', val: 'N95 / FFP2 Mandatory' },
        ventilation: { status: 'Sealed', icon: '🪟', val: 'Seal Windows & Doors' },
        sensitive: { status: 'Severe Hazard', icon: '👶', val: 'Stay Indoors with Purifiers' }
      };
    }
  }

  /**
   * Main DOM Renderer: Updates Hero Card, Gauge, Advisories, Pollutants, and Highlights.
   */
  function renderFullDashboard(data) {
    State.currentAirData = data;
    const cat = getAqiCategory(data.aqi);

    // 1. Update Hero Card City Info
    $('#cardCityName').text(data.cityName);
    $('#cardCountryBadge').text(data.country || 'Global');
    $('#cardCoords').text(`Coordinates: ${data.coords.lat.toFixed(2)}°N, ${data.coords.lon.toFixed(2)}°E • Elevation: ${data.coords.elevation || '--'} m`);

    // 2. Update Hero Card Accent Border & Color
    $('#heroAqiCard').css('border-top-color', cat.border);

    // 3. Update AQI Gauge Circle (conic gradient and score display)
    $('#aqiScoreValue').text(data.aqi);
    $('#aqiStatusBadge')
      .text(cat.label)
      .css({ color: cat.color, background: `rgba(255,255,255, 0.08)` });
    $('#aqiVerdictHeading').text(cat.title);
    $('#aqiVerdictDesc').text(cat.desc);

    // Subtle jQuery animation: Flash gauge background
    $('#aqiGaugeCircle')
      .css('box-shadow', `0 0 35px ${cat.border}`)
      .fadeOut(100)
      .fadeIn(300);

    // 4. Update Quick Climate Metrics (Temp, Wind, UV)
    $('#weatherTemp').text(`${data.temp}°C`);
    $('#weatherWind').text(`${data.wind} km/h`);
    $('#weatherUv').text(data.uv ? data.uv.toFixed(1) : '--');

    // 5. Update Health Advisory Grid (Dynamic DOM injection)
    renderHealthAdvisoryGrid(cat);

    // 6. Update Pollutants Grid (Dynamic DOM injection)
    renderPollutantsGrid(data);

    // 7. Update Bookmark Star Button State
    updateFavoriteButtonState(data.cityName);

    // 8. Update Active Quick Chip
    $('.city-chip').removeClass('active');
    $(`.city-chip[data-city="${data.cityName}"]`).addClass('active');
  }

  /**
   * Dynamically renders 4 health advisory cards into the DOM.
   */
  function renderHealthAdvisoryGrid(cat) {
    const cards = [
      { name: 'Outdoor Cardio', icon: cat.exercise.icon, val: cat.exercise.val },
      { name: 'Protective Mask', icon: cat.mask.icon, val: cat.mask.val },
      { name: 'Window Airing', icon: cat.ventilation.icon, val: cat.ventilation.val },
      { name: 'Sensitive Groups', icon: cat.sensitive.icon, val: cat.sensitive.val }
    ];

    const $grid = $('#advisoryGrid');
    $grid.empty(); // jQuery DOM clear

    cards.forEach(card => {
      // Create DOM elements dynamically via jQuery
      const $cardEl = $('<div>').addClass('advisory-card');
      $cardEl.html(`
        <div class="advisory-icon">${card.icon}</div>
        <div class="advisory-name">${card.name}</div>
        <div class="advisory-val">${card.val}</div>
      `);
      $grid.append($cardEl);
    });
  }

  /**
   * Dynamically renders the 6 individual atmospheric pollutant cards into the DOM.
   */
  function renderPollutantsGrid(data) {
    const pollutants = [
      {
        code: 'PM2.5',
        name: 'Fine Particulate Matter (≤ 2.5 µm)',
        val: data.pm25.toFixed(1),
        maxThreshold: 25, // WHO 24-hr guideline
        unit: 'µg/m³'
      },
      {
        code: 'PM10',
        name: 'Coarse Particulates (Dust, Pollen)',
        val: data.pm10.toFixed(1),
        maxThreshold: 50,
        unit: 'µg/m³'
      },
      {
        code: 'NO₂',
        name: 'Nitrogen Dioxide (Vehicle Exhaust)',
        val: data.no2 ? data.no2.toFixed(1) : '18.4',
        maxThreshold: 25,
        unit: 'µg/m³'
      },
      {
        code: 'O₃',
        name: 'Ground-Level Tropospheric Ozone',
        val: data.ozone ? data.ozone.toFixed(1) : '34.2',
        maxThreshold: 100,
        unit: 'µg/m³'
      },
      {
        code: 'CO',
        name: 'Carbon Monoxide (Combustion)',
        val: data.co ? Math.round(data.co) : '320',
        maxThreshold: 1000,
        unit: 'µg/m³'
      },
      {
        code: 'UV',
        name: 'Ultraviolet Solar Radiation',
        val: data.uv ? data.uv.toFixed(1) : '3.5',
        maxThreshold: 11,
        unit: 'Index'
      }
    ];

    const $grid = $('#pollutantsGrid');
    $grid.empty();

    pollutants.forEach(p => {
      const numericVal = parseFloat(p.val);
      const percentage = Math.min(100, Math.round((numericVal / p.maxThreshold) * 100));

      let badgeColor = 'var(--color-good)';
      let badgeLabel = 'SAFE';

      if (percentage > 150) {
        badgeColor = 'var(--color-unhealthy)';
        badgeLabel = 'HAZARD';
      } else if (percentage > 100) {
        badgeColor = 'var(--color-poor)';
        badgeLabel = 'ELEVATED';
      } else if (percentage > 60) {
        badgeColor = 'var(--color-moderate)';
        badgeLabel = 'MODERATE';
      }

      // Dynamic jQuery DOM Element construction
      const $card = $('<div>').addClass('pollutant-card');
      $card.html(`
        <div class="pollutant-top">
          <span class="pollutant-code">${p.code}</span>
          <span class="pollutant-status-pill" style="background: ${badgeColor}22; color: ${badgeColor}; border: 1px solid ${badgeColor}55;">
            ${badgeLabel}
          </span>
        </div>
        <div class="pollutant-name">${p.name}</div>
        <div class="pollutant-value">${p.val} <span class="pollutant-unit">${p.unit}</span></div>
        <div class="pollutant-bar-track">
          <div class="pollutant-bar-fill" style="width: ${percentage}%; background: ${badgeColor};"></div>
        </div>
      `);

      $grid.append($card);
    });
  }

  /**
   * Renders saved locations list from State.favorites.
   */
  function renderFavorites() {
    const $list = $('#favoritesList');
    $list.empty();

    $('#favoritesCount').text(State.favorites.length);

    if (State.favorites.length === 0) {
      $list.html('<div class="empty-state">No saved cities yet. Click the "Bookmark" button to save locations!</div>');
      return;
    }

    State.favorites.forEach((fav, index) => {
      const $item = $('<div>').addClass('favorite-item');
      $item.html(`
        <div class="fav-clickable" data-city="${fav.name}">
          <div class="fav-city-name">${fav.name}</div>
          <div class="fav-city-country">${fav.country}</div>
        </div>
        <button class="fav-delete-btn" data-index="${index}" title="Remove from favorites">&times;</button>
      `);
      $list.append($item);
    });
  }

  /**
   * Updates bookmark button text and highlight if the current city is saved.
   */
  function updateFavoriteButtonState(cityName) {
    const isFav = State.favorites.some(f => f.name.toLowerCase() === cityName.toLowerCase());
    if (isFav) {
      $('#toggleFavoriteBtn').addClass('active');
      $('#favStarIcon').text('⭐');
      $('#favBtnLabel').text('Bookmarked');
    } else {
      $('#toggleFavoriteBtn').removeClass('active');
      $('#favStarIcon').text('☆');
      $('#favBtnLabel').text('Bookmark');
    }
  }

  /**
   * Renders recent search history items into the sidebar.
   */
  function renderHistory() {
    const $list = $('#historyList');
    $list.empty();

    if (State.history.length === 0) {
      $list.html('<div class="empty-state">No recent searches.</div>');
      $('#clearHistoryBtn').hide();
      return;
    }

    $('#clearHistoryBtn').show();

    State.history.forEach(item => {
      const $item = $('<div>').addClass('history-item');
      $item.attr('data-city', item.name);
      $item.html(`
        <span><strong>${item.name}</strong> <small style="color:var(--text-muted);">(${item.country})</small></span>
        <span class="history-time">${item.time}</span>
      `);
      $list.append($item);
    });
  }

  // ============================================================================
  // 6. REAL-TIME AUTO REFRESH RADAR (JavaScript Timers)
  // ============================================================================

  /**
   * Starts the 30-second ticking radar interval.
   */
  function startRadarTicker() {
    if (State.autoRefreshTimerId) clearInterval(State.autoRefreshTimerId);

    State.radarSecondsLeft = CONFIG.autoRefreshIntervalSeconds;
    updateRadarDisplay();

    State.autoRefreshTimerId = setInterval(function () {
      if (!State.isAutoRefreshEnabled) return;

      State.radarSecondsLeft--;
      updateRadarDisplay();

      // Trigger automatic AJAX sync when countdown hits 0
      if (State.radarSecondsLeft <= 0) {
        logAjaxEvent(`Radar ticker expired. Auto-syncing ${State.currentCity}...`, 'request');
        fetchCityCoordinates(State.currentCity);
        State.radarSecondsLeft = CONFIG.autoRefreshIntervalSeconds;
        updateRadarDisplay();
      }
    }, 1000);
  }

  /**
   * Updates radar progress bar and text countdown in header.
   */
  function updateRadarDisplay() {
    $('#refreshCountdown').text(`${State.radarSecondsLeft}s`);
    const percent = (State.radarSecondsLeft / CONFIG.autoRefreshIntervalSeconds) * 100;
    $('#radarProgressFill').css('width', `${percent}%`);
  }

  // ============================================================================
  // 7. EVENTS HANDLING & USER INTERACTIONS (Using jQuery .on)
  // ============================================================================

  // Search Form Submit Event
  $('#citySearchForm').on('submit', function (e) {
    e.preventDefault();
    const query = $('#cityInput').val().trim();
    if (!query) return;

    fetchCityCoordinates(query);
  });

  // Search Input Keyup/Input for Clear Button Visibility
  $('#cityInput').on('input keyup', function () {
    const val = $(this).val();
    if (val.length > 0) {
      $('#clearSearchBtn').show();
    } else {
      $('#clearSearchBtn').hide();
    }
  });

  // Clear Search Input Button Click
  $('#clearSearchBtn').on('click', function () {
    $('#cityInput').val('').focus();
    $(this).hide();
  });

  // Quick City Chip Click Event (Delegated)
  $('#quickCityChips').on('click', '.city-chip', function () {
    const city = $(this).data('city');
    $('#cityInput').val(city);
    fetchCityCoordinates(city);
  });

  // Toggle Favorite Button Click Event
  $('#toggleFavoriteBtn').on('click', function () {
    if (!State.currentAirData) return;

    const cityName = State.currentAirData.cityName;
    const countryName = State.currentAirData.country;
    const existingIndex = State.favorites.findIndex(f => f.name.toLowerCase() === cityName.toLowerCase());

    if (existingIndex >= 0) {
      // Remove from favorites
      State.favorites.splice(existingIndex, 1);
      showToast('Bookmark Removed', `${cityName} removed from saved locations.`, 'warning');
    } else {
      // Add to favorites
      State.favorites.push({ name: cityName, country: countryName });
      showToast('Bookmark Saved', `${cityName} added to saved locations!`, 'success');
    }

    saveFavorites();
    renderFavorites();
    updateFavoriteButtonState(cityName);
  });

  // Click on Saved Favorite Item to Load It (Delegated Event)
  $('#favoritesList').on('click', '.fav-clickable', function () {
    const city = $(this).data('city');
    $('#cityInput').val(city);
    fetchCityCoordinates(city);
  });

  // Delete Individual Favorite Item (Delegated Event)
  $('#favoritesList').on('click', '.fav-delete-btn', function (e) {
    e.stopPropagation(); // Stop click from triggering city load
    const idx = $(this).data('index');
    State.favorites.splice(idx, 1);
    saveFavorites();
    renderFavorites();
    if (State.currentAirData) {
      updateFavoriteButtonState(State.currentAirData.cityName);
    }
  });

  // Click on Recent History Item to Re-fetch (Delegated Event)
  $('#historyList').on('click', '.history-item', function () {
    const city = $(this).data('city');
    $('#cityInput').val(city);
    fetchCityCoordinates(city);
  });

  // Clear All Search History
  $('#clearHistoryBtn').on('click', function () {
    State.history = [];
    saveHistory();
    renderHistory();
    showToast('History Cleared', 'Search history log has been cleared.', 'info');
  });

  // Manual Sync Button Click
  $('#manualRefreshBtn').on('click', function () {
    $(this).find('.btn-icon-symbol').css({ transform: 'rotate(360deg)', transition: 'transform 0.6s' });
    setTimeout(() => {
      $(this).find('.btn-icon-symbol').css({ transform: 'none', transition: 'none' });
    }, 600);

    State.radarSecondsLeft = CONFIG.autoRefreshIntervalSeconds;
    updateRadarDisplay();
    fetchCityCoordinates(State.currentCity);
  });

  // Auto-Refresh Toggle Switch Change Event
  $('#autoRefreshToggle').on('change', function () {
    State.isAutoRefreshEnabled = $(this).is(':checked');
    if (State.isAutoRefreshEnabled) {
      showToast('Auto-Sync Active', 'Radar will poll updates every 30 seconds.', 'info');
      startRadarTicker();
    } else {
      showToast('Auto-Sync Paused', 'Radar auto-refresh disabled.', 'warning');
      $('#refreshCountdown').text('OFF');
      $('#radarProgressFill').css('width', '0%');
    }
  });

  // ============================================================================
  // 8. TOAST NOTIFICATIONS & TELEMETRY LOGGING
  // ============================================================================

  /**
   * Displays animated toast notification using jQuery DOM manipulation.
   */
  function showToast(title, message, type = 'info') {
    const $toast = $('<div>').addClass(`toast ${type}`);
    const icons = { success: '✅', warning: '⚠️', error: '⛔', info: 'ℹ️' };

    $toast.html(`
      <span>${icons[type] || 'ℹ️'}</span>
      <div>
        <strong>${title}</strong>
        <div style="font-size:0.78rem; opacity:0.85;">${message}</div>
      </div>
    `);

    $('#toastContainer').append($toast);

    // jQuery animations: Slide up and fade out after 3.2 seconds
    setTimeout(function () {
      $toast.fadeOut(300, function () {
        $(this).remove();
      });
    }, 3200);
  }

  /**
   * Appends an event log line into the live AJAX telemetry panel.
   */
  function logAjaxEvent(message, type = 'init') {
    const timeStr = new Date().toLocaleTimeString();
    const $line = $('<div>').addClass(`ajax-log-line ${type}`);
    $line.text(`[${timeStr}] ${message}`);

    const $box = $('#ajaxEventsLog');
    $box.append($line);
    $box.scrollTop($box[0].scrollHeight);
  }

  // ============================================================================
  // 9. APPLICATION BOOTSTRAPPER
  // ============================================================================
  function bootApplication() {
    logAjaxEvent('AirPulse Engine initialized. Loading storage & telemetry...', 'init');
    
    // 1. Initialize persistent storage
    initStorage();
    renderFavorites();
    renderHistory();

    // 2. Start real-time radar timer
    startRadarTicker();

    // 3. Fetch initial default city
    fetchCityCoordinates(State.currentCity);
  }

  // Execute Bootstrapper
  bootApplication();

});

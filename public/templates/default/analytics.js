/**
 * Wabotti Analytics Tracker
 * Lightweight client-side analytics for public templates
 * 
 * Features:
 * - Session and visitor tracking via cookies
 * - UTM parameter extraction
 * - Pageview tracking
 * - Google Tag Manager integration (optional)
 */
(function () {
    'use strict';

    // =========================================================================
    // Cookie Management
    // =========================================================================

    function getCookie(name) {
        const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
        return match ? match[2] : null;
    }

    function setCookie(name, value, days) {
        const expires = new Date(Date.now() + days * 864e5).toUTCString();
        document.cookie = name + '=' + value + '; expires=' + expires + '; path=/; SameSite=Lax';
    }

    function generateId() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    // =========================================================================
    // Session & Visitor IDs
    // =========================================================================

    // Session ID (expires in 30 minutes)
    let sessionId = getCookie('wabotti_session');
    if (!sessionId) {
        sessionId = generateId();
        setCookie('wabotti_session', sessionId, 0.02); // 30 min = 0.02 days
    }

    // Visitor ID (expires in 2 years)
    let visitorId = getCookie('wabotti_visitor');
    if (!visitorId) {
        visitorId = generateId();
        setCookie('wabotti_visitor', visitorId, 730); // 2 years
    }

    // =========================================================================
    // UTM Parameter Extraction
    // =========================================================================

    function extractUTM() {
        const params = new URLSearchParams(window.location.search);
        return {
            utmSource: params.get('utm_source'),
            utmMedium: params.get('utm_medium'),
            utmCampaign: params.get('utm_campaign'),
            utmContent: params.get('utm_content'),
            utmTerm: params.get('utm_term')
        };
    }

    // =========================================================================
    // Pageview Tracking
    // =========================================================================

    function trackPageview() {
        if (!window.WABOTTI_ANALYTICS) {
            console.warn('WABOTTI_ANALYTICS not configured');
            return;
        }

        const payload = {
            type: 'pageview',
            companyId: window.EPIKAL_ANALYTICS.companyId,
            path: window.location.pathname,
            pageType: window.EPIKAL_ANALYTICS.pageType || 'unknown',
            serviceId: window.EPIKAL_ANALYTICS.serviceId || null,
            sessionId: sessionId,
            visitorId: visitorId,
            utm: extractUTM()
        };

        // Send to analytics endpoint
        fetch('/api/analytics/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            keepalive: true // Ensure request completes even if page unloads
        }).catch(function (err) {
            console.error('Analytics tracking error:', err);
        });
    }

    // =========================================================================
    // Google Tag Manager Integration
    // =========================================================================

    function initGTM() {
        const gtmId = window.EPIKAL_ANALYTICS?.gtmContainerId;
        if (!gtmId) return;

        // Inject GTM script
        (function (w, d, s, l, i) {
            w[l] = w[l] || [];
            w[l].push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
            var f = d.getElementsByTagName(s)[0],
                j = d.createElement(s),
                dl = l != 'dataLayer' ? '&l=' + l : '';
            j.async = true;
            j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
            f.parentNode.insertBefore(j, f);
        })(window, document, 'script', 'dataLayer', gtmId);

        // Push initial data to dataLayer
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
            event: 'page_view',
            page_type: window.EPIKAL_ANALYTICS.pageType,
            service_id: window.EPIKAL_ANALYTICS.serviceId,
            service_name: window.EPIKAL_ANALYTICS.serviceName
        });
    }

    // =========================================================================
    // Initialization
    // =========================================================================

    function init() {
        // Track pageview
        trackPageview();

        // Initialize GTM if configured
        initGTM();
    }

    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Expose tracking function for custom events
    window.epikalTrack = function (eventType, data) {
        if (!window.EPIKAL_ANALYTICS) return;

        fetch('/api/analytics/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: eventType,
                companyId: window.EPIKAL_ANALYTICS.companyId,
                path: window.location.pathname,
                sessionId: sessionId,
                visitorId: visitorId,
                ...data
            }),
            keepalive: true
        }).catch(function (err) {
            console.error('Analytics tracking error:', err);
        });
    };

})();

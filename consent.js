/*!
 * ZetaShift Labs: cookie consent + analytics loader.
 *
 * Google Analytics and Microsoft Clarity are NOT loaded until the visitor
 * clicks "Accept". The choice is kept in localStorage and can be changed
 * from any element carrying a data-cookie-settings attribute (the footer
 * "Cookie settings" link). If storage is unavailable, nothing is loaded.
 */
(function () {
    'use strict';

    var GA_ID = 'G-91YYLYGNWC';
    var CLARITY_ID = 'yy8cpjsh6q';
    var STORE_KEY = 'zs_analytics_consent_v1';
    var POLICY_URL = 'privacy-policy.html';

    /* ---------- stored choice ---------- */

    function readChoice() {
        try {
            var v = JSON.parse(localStorage.getItem(STORE_KEY));
            return v && typeof v.analytics === 'boolean' ? v.analytics : null;
        } catch (e) {
            return null;
        }
    }

    function saveChoice(analytics) {
        try {
            localStorage.setItem(STORE_KEY, JSON.stringify({ analytics: analytics, ts: Date.now() }));
        } catch (e) { /* storage blocked: the choice simply won't persist */ }
    }

    /* ---------- analytics (only ever called after consent) ---------- */

    var loaded = false;

    function loadAnalytics() {
        if (loaded) return;
        loaded = true;

        // Google Analytics 4
        window.dataLayer = window.dataLayer || [];
        window.gtag = function () { window.dataLayer.push(arguments); };
        var ga = document.createElement('script');
        ga.async = true;
        ga.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
        document.head.appendChild(ga);
        window.gtag('js', new Date());
        window.gtag('config', GA_ID);

        // Microsoft Clarity
        (function (c, l, a, r, i, t, y) {
            c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
            t = l.createElement(r);
            t.async = 1;
            t.src = 'https://www.clarity.ms/tag/' + i;
            y = l.getElementsByTagName(r)[0];
            y.parentNode.insertBefore(t, y);
        })(window, document, 'clarity', 'script', CLARITY_ID);
    }

    // Best-effort removal of first-party analytics cookies (also clears cookies
    // set before this banner existed). Cookies owned by other domains can't be
    // touched from here, but those scripts no longer load once consent is off.
    function clearAnalyticsCookies() {
        var exact = ['CLID', 'ANONCHK', 'MR', 'MUID', 'SM', 'SRM_B'];
        var names = [];
        (document.cookie ? document.cookie.split(';') : []).forEach(function (pair) {
            var n = pair.split('=')[0].trim();
            if (/^(_ga|_gid|_gat|_clck|_clsk)/.test(n) || exact.indexOf(n) !== -1) names.push(n);
        });
        if (!names.length) return;

        var parts = location.hostname.split('.');
        var domains = [''];
        for (var i = 0; i < parts.length - 1; i++) {
            var d = parts.slice(i).join('.');
            domains.push(d, '.' + d);
        }
        names.forEach(function (n) {
            domains.forEach(function (d) {
                document.cookie = n + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/' +
                    (d ? '; domain=' + d : '');
            });
        });
    }

    /* ---------- banner ---------- */

    var banner = null;

    function injectStyles() {
        if (document.getElementById('zs-consent-style')) return;
        var css =
            '#zs-consent{position:fixed;left:16px;bottom:16px;right:16px;max-width:560px;z-index:2147483000;' +
            'background:#14142b;color:#e8e9f6;border:1px solid #34346a;border-radius:16px;padding:18px 20px;' +
            'box-shadow:0 18px 48px rgba(0,0,0,.55);font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;' +
            'font-size:14px;line-height:1.55;text-align:left}' +
            '#zs-consent h2{margin:0 0 6px;font-size:16px;font-weight:700;color:#fff}' +
            '#zs-consent p{margin:0 0 12px;color:#c9cbe6}' +
            '#zs-consent a{color:#8fd3ff;text-decoration:underline}' +
            '#zs-consent .zs-status{font-weight:600;color:#fff}' +
            '#zs-consent .zs-row{display:flex;gap:10px;flex-wrap:wrap;margin-top:4px}' +
            '#zs-consent button{flex:1 1 140px;padding:11px 16px;border-radius:999px;cursor:pointer;color:#fff;' +
            'font-family:inherit;font-size:14px;font-weight:600;line-height:1.2}' +
            '#zs-consent .zs-accept{background:linear-gradient(135deg,#7b61ff,#4fa8f5);border:1px solid transparent}' +
            '#zs-consent .zs-reject{background:#2a2a52;border:1px solid #6a6ab0}' +
            '#zs-consent button:hover{filter:brightness(1.12)}' +
            '#zs-consent button:focus-visible,#zs-consent a:focus-visible{outline:2px solid #fff;outline-offset:2px}' +
            '@media (max-width:480px){#zs-consent{left:10px;right:10px;bottom:10px;padding:16px}}';
        var style = document.createElement('style');
        style.id = 'zs-consent-style';
        style.textContent = css;
        document.head.appendChild(style);
    }

    function buildBanner(current) {
        var el = document.createElement('div');
        el.id = 'zs-consent';
        el.setAttribute('role', 'dialog');
        el.setAttribute('aria-labelledby', 'zs-consent-title');
        el.setAttribute('aria-describedby', 'zs-consent-text');

        var h = document.createElement('h2');
        h.id = 'zs-consent-title';
        h.textContent = 'Cookies & analytics';

        var p = document.createElement('p');
        p.id = 'zs-consent-text';
        p.appendChild(document.createTextNode(
            'We\u2019d like to use Google Analytics and Microsoft Clarity to understand how this site is used. ' +
            'Clarity also records session replays (clicks, scrolling and page navigation, with form inputs masked). ' +
            'Both set cookies on your device and stay switched off unless you accept. ' +
            'The contact form works either way, and you can change your choice any time via \u201cCookie settings\u201d in the footer. '));
        var a = document.createElement('a');
        a.href = POLICY_URL;
        a.target = '_blank';
        a.rel = 'noopener';
        a.textContent = 'Privacy Policy';
        p.appendChild(a);
        p.appendChild(document.createTextNode('.'));

        el.appendChild(h);
        el.appendChild(p);

        if (current !== null) {
            var s = document.createElement('p');
            s.className = 'zs-status';
            s.textContent = 'Current setting: analytics ' + (current ? 'on' : 'off') + '.';
            el.appendChild(s);
        }

        var row = document.createElement('div');
        row.className = 'zs-row';

        var reject = document.createElement('button');
        reject.type = 'button';
        reject.className = 'zs-reject';
        reject.textContent = 'Reject';
        reject.addEventListener('click', onReject);

        var accept = document.createElement('button');
        accept.type = 'button';
        accept.className = 'zs-accept';
        accept.textContent = 'Accept';
        accept.addEventListener('click', onAccept);

        row.appendChild(reject);
        row.appendChild(accept);
        el.appendChild(row);
        return el;
    }

    function showBanner(moveFocus) {
        hideBanner();
        injectStyles();
        banner = buildBanner(readChoice());
        document.body.appendChild(banner);
        if (moveFocus) {
            var first = banner.querySelector('button');
            if (first) first.focus();
        }
    }

    function hideBanner() {
        if (banner && banner.parentNode) banner.parentNode.removeChild(banner);
        banner = null;
    }

    function onAccept() {
        saveChoice(true);
        hideBanner();
        loadAnalytics();
    }

    function onReject() {
        var wasRunning = loaded;
        saveChoice(false);
        hideBanner();
        clearAnalyticsCookies();
        // Scripts already running in this page can't be unloaded, so reload without them.
        if (wasRunning) location.reload();
    }

    /* ---------- init ---------- */

    function init() {
        var choice = readChoice();
        if (choice === true) loadAnalytics();
        else if (choice === null) showBanner(false);

        document.addEventListener('click', function (e) {
            var t = e.target && e.target.closest ? e.target.closest('[data-cookie-settings]') : null;
            if (!t) return;
            e.preventDefault();
            showBanner(true);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

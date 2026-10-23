/*
 * Consentimento de cookies (LGPD) + integrações — compartilhado por todas as páginas.
 * Monta o próprio aviso (marcação e estilo), então basta incluir config.js e este arquivo.
 * Enquanto não há aceite, nenhuma tag de análise/marketing é carregada (Consent Mode v2 = denied).
 */
(() => {
    const CFG = window.SHINERAY_CONFIG || {};
    const STORAGE_KEY = 'cookie-consent';
    const POLICY_URL = 'politica-de-privacidade.html';

    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
    window.gtag('consent', 'default', {
        ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'denied'
    });

    /* ---------------- Integrações ---------------- */

    const loadScript = (src) => {
        const s = document.createElement('script');
        s.async = true;
        s.src = src;
        document.head.appendChild(s);
    };
    const loaded = {};

    const applyConsent = (c) => {
        window.gtag('consent', 'update', {
            analytics_storage: c.analytics ? 'granted' : 'denied',
            ad_storage: c.marketing ? 'granted' : 'denied',
            ad_user_data: c.marketing ? 'granted' : 'denied',
            ad_personalization: c.marketing ? 'granted' : 'denied'
        });

        if ((c.analytics || c.marketing) && CFG.gtmId && !loaded.gtm) {
            loaded.gtm = true;
            window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
            loadScript(`https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(CFG.gtmId)}`);
        }
        if (c.marketing && CFG.metaPixelId && !loaded.pixel) {
            loaded.pixel = true;
            /* eslint-disable */
            !function (f, b, e, v, n, t, s) { if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments) }; if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = []; t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s) }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
            /* eslint-enable */
            window.fbq('init', CFG.metaPixelId);
            window.fbq('track', 'PageView');
        }
        if (c.marketing && CFG.rdStationScript && !loaded.rd) {
            loaded.rd = true;
            loadScript(CFG.rdStationScript);
        }
    };

    const readConsent = () => {
        try {
            const c = JSON.parse(localStorage.getItem(STORAGE_KEY));
            return c && c.necessary === true ? c : null;
        } catch {
            return null;
        }
    };

    /* ---------------- Aviso (marcação + estilo próprios) ---------------- */

    const STYLE = `
.cookie{position:fixed;left:24px;bottom:24px;z-index:60;display:flex;align-items:center;gap:20px;
width:min(520px,calc(100% - 32px));padding:16px 16px 16px 22px;background:#fff;border:1px solid #e9e6e4;
border-radius:20px;box-shadow:0 24px 60px -20px rgba(0,0,0,.3);font-family:"Inter Tight","Inter Tight Fallback",system-ui,-apple-system,"Segoe UI",sans-serif;
font-size:.88rem;line-height:1.45;color:#2c2c2e;text-align:left}
.cookie[hidden]{display:none!important}
.cookie p{margin:0}
.cookie a{color:#b8000f;text-decoration:underline;text-underline-offset:2px}
.cookie-accept{flex:none;display:inline-flex;align-items:center;justify-content:center;min-height:42px;padding:0 18px;
border:0;border-radius:10px;background:#e30613;color:#fff;font:inherit;font-weight:600;font-size:.92rem;cursor:pointer;
transition:background-color .2s}
.cookie-accept:hover{background:#b8000f}
.cookie-accept:focus-visible{outline:3px solid rgba(227,6,19,.45);outline-offset:3px}
@media (max-width:640px){.cookie{left:12px;bottom:12px;flex-direction:column;align-items:stretch;gap:12px;padding:16px}}`;

    let banner = null;

    const buildBanner = () => {
        if (banner) return banner;
        const style = document.createElement('style');
        style.textContent = STYLE;
        document.head.appendChild(style);

        banner = document.createElement('div');
        banner.className = 'cookie';
        banner.id = 'cookie-popup';
        banner.setAttribute('role', 'region');
        banner.setAttribute('aria-label', 'Aviso de cookies');
        banner.hidden = true;
        banner.innerHTML =
            '<p>Usamos cookies para melhorar sua experiência e analisar o uso da página. Saiba mais na nossa ' +
            `<a href="${POLICY_URL}">Política de Privacidade</a>.</p>` +
            '<button type="button" class="cookie-accept">Aceitar</button>';
        document.body.appendChild(banner);

        banner.querySelector('.cookie-accept').addEventListener('click', () => {
            const c = { necessary: true, analytics: true, marketing: true, updatedAt: new Date().toISOString() };
            try { localStorage.setItem(STORAGE_KEY, JSON.stringify(c)); } catch { /* navegação privada */ }
            banner.hidden = true;
            applyConsent(c);
            window.dispatchEvent(new CustomEvent('cookie-consent-updated', { detail: c }));
        });
        return banner;
    };

    const showBanner = () => {
        buildBanner().hidden = false;
        window.dispatchEvent(new CustomEvent('cookie-banner-shown'));
    };

    const saved = readConsent();
    if (saved) applyConsent(saved);
    else showBanner();

    // Botões "Redefinir preferências de cookies": apagam o aceite e mostram o aviso de novo
    document.querySelectorAll('[data-cookie-reset]').forEach((btn) => btn.addEventListener('click', () => {
        try { localStorage.removeItem(STORAGE_KEY); } catch { /* navegação privada */ }
        window.gtag('consent', 'update', {
            ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'denied'
        });
        showBanner();
    }));
})();

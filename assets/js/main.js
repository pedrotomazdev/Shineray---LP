/* Consórcio Shineray — LP v2 (conceito). JS puro, sem dependências. */
(() => {
    const CFG = window.SHINERAY_CONFIG || {};
    const $ = (s, root = document) => root.querySelector(s);
    const $$ = (s, root = document) => [...root.querySelectorAll(s)];
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

    window.dataLayer = window.dataLayer || [];
    const track = (event, data = {}) => window.dataLayer.push({ event, ...data });

    /* ---------------- WhatsApp (destino do envio do formulário) ---------------- */

    const waUrl = (text) => `https://wa.me/${CFG.whatsapp?.number || ''}?text=${encodeURIComponent(text)}`;

    /* ---------------- Formulários ---------------- */

    const forms = $$('.lead-form');
    const heroSelect = $('#hero-modelo');
    // Slider de parcela
    const P = CFG.parcela || { min: 400, max: 1200, step: 25, initial: 450 };
    const ranges = $$('[data-parcela-range]');

    const paintRange = (range) => {
        const v = Number(range.value);
        const pct = ((v - P.min) / (P.max - P.min)) * 100;
        range.style.setProperty('--p', `${pct}%`);
        const label = v >= P.max ? `${brl.format(v)}+` : brl.format(v);
        range.setAttribute('aria-valuetext', `${label} por mês`);
        const out = range.closest('.field').querySelector('[data-range-output]');
        if (out) out.innerHTML = `${label}<small> /mês</small>`;
        return label;
    };

    const setParcela = (value, source) => {
        ranges.forEach((r) => {
            if (r !== source) r.value = value;
            paintRange(r);
        });
    };

    ranges.forEach((r) => {
        Object.assign(r, { min: P.min, max: P.max, step: P.step });
        r.value = P.initial;
        const field = r.closest('.field');
        $('[data-range-min]', field).textContent = brl.format(P.min);
        $('[data-range-max]', field).textContent = `${brl.format(P.max)}+`;
        r.addEventListener('input', () => setParcela(r.value, r));
        r.addEventListener('change', () => track('parcela_change', { parcela: Number(r.value) }));
    });
    setParcela(P.initial);

    // Máscara de telefone (mantida da v1)
    $$('[data-mask="phone"]').forEach((input) => {
        input.addEventListener('input', () => {
            let v = input.value.replace(/\D/g, '').substring(0, 11);
            if (v.length > 10) v = v.replace(/^(\d{2})(\d{5})(\d{0,4}).*/, '($1) $2-$3');
            else if (v.length > 6) v = v.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3');
            else if (v.length > 2) v = v.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
            else if (v.length > 0) v = v.replace(/^(\d{0,2})/, '($1');
            input.value = v;
        });
    });

    const VALIDATORS = {
        nome: (v) => v.trim().length >= 2 || 'Informe seu nome.',
        contato: (v) => {
            const d = v.replace(/\D/g, '');
            if (!d) return 'Informe seu WhatsApp com DDD.';
            return /^\d{2}9\d{8}$/.test(d) || /^\d{10}$/.test(d) || 'Confira o número: use DDD + telefone, ex.: (34) 99999-9999.';
        },
        modelo: (v) => !!v || 'Escolha um modelo ou “Ainda não sei”.'
    };

    const validateField = (el) => {
        const rule = VALIDATORS[el.name];
        if (!rule) return true;
        const result = rule(el.value);
        const field = el.closest('.field');
        const msg = result === true ? '' : result;
        field.classList.toggle('has-error', !!msg);
        el.setAttribute('aria-invalid', msg ? 'true' : 'false');
        $('.field-error', field).textContent = msg;
        return !msg;
    };

    const setStatus = (form, state, html) => {
        const box = $('.form-status', form);
        box.hidden = false;
        box.dataset.state = state;
        box.innerHTML = html;
    };

    const leadMessage = (data) => [
        'Olá! Quero simular o consórcio de motos Shineray.',
        `Nome: ${data.nome}`,
        `Modelo de interesse: ${data.modelo}`,
        `Parcela desejada: ${brl.format(data.parcela)}${data.parcela >= P.max ? '+' : ''} por mês`
    ].join('\n');

    const utm = Object.fromEntries(
        [...new URLSearchParams(location.search)].filter(([k]) => /^(utm_|gclid|fbclid)/.test(k))
    );

    forms.forEach((form) => {
        const fields = $$('input[name], select[name]', form).filter((el) => VALIDATORS[el.name]);
        let touched = false;

        fields.forEach((el) => {
            el.addEventListener('blur', () => touched && validateField(el));
            el.addEventListener('input', () => touched && validateField(el));
            el.addEventListener('change', () => touched && validateField(el));
        });

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            touched = true;
            const invalid = fields.filter((el) => !validateField(el));
            if (invalid.length) {
                invalid[0].focus();
                return;
            }

            const fd = new FormData(form);
            const data = {
                nome: fd.get('nome').trim(),
                contato: fd.get('contato').replace(/\D/g, ''),
                modelo: fd.get('modelo'),
                parcela: Number(fd.get('parcela')),
                origem: form.dataset.formOrigin,
                pagina: location.href.split('?')[0],
                ...utm
            };
            const button = $('button[type="submit"]', form);

            // Sem endpoint de leads: o atendimento continua no WhatsApp com os dados preenchidos.
            if (!CFG.leadEndpoint) {
                const url = waUrl(leadMessage(data));
                track('lead_whatsapp', { form_origin: data.origem, modelo: data.modelo, parcela: data.parcela });
                // Sem "noopener" na chamada para saber se o pop-up abriu; o vínculo é cortado logo abaixo
                const win = window.open(url, '_blank');
                if (win) win.opener = null;
                setStatus(form, 'success',
                    '<strong>Tudo certo!</strong> Abrimos o WhatsApp com a sua simulação para concluir o atendimento. ' +
                    `Se a conversa não abriu, <a target="_blank" rel="noopener" href="${url}">toque aqui</a>.`);
                if (win) {
                    form.reset();
                    setParcela(P.initial);
                }
                return;
            }

            button.disabled = true;
            button.setAttribute('aria-busy', 'true');
            try {
                const res = await fetch(CFG.leadEndpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                track('lead_submit', { form_origin: data.origem, modelo: data.modelo, parcela: data.parcela });
                form.reset();
                setParcela(P.initial);
                setStatus(form, 'success', '<strong>Recebemos sua simulação!</strong> Um especialista vai falar com você pelo WhatsApp informado.');
            } catch (err) {
                setStatus(form, 'error',
                    'Não conseguimos enviar agora. Tente novamente em instantes ou ' +
                    `<a target="_blank" rel="noopener" href="${waUrl(leadMessage(data))}">fale com a equipe pelo WhatsApp</a>.`);
            } finally {
                button.disabled = false;
                button.removeAttribute('aria-busy');
            }
        });
    });

    /* ---------------- Navegação até o formulário ---------------- */

    const formAnchor = $('#simular');
    const goToForm = (focusEl) => {
        formAnchor.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
        if (focusEl) setTimeout(() => focusEl.focus({ preventScroll: true }), reduceMotion ? 0 : 600);
    };
    const firstEmpty = () => ['#hero-nome', '#hero-contato'].map((s) => $(s)).find((el) => !el.value) || $('#hero-parcela');

    $$('[data-focus-form]').forEach((a) => a.addEventListener('click', (e) => {
        e.preventDefault();
        goToForm(firstEmpty());
    }));

    const chooseModel = (model) => {
        $$('[data-model-select]').forEach((s) => {
            s.value = model;
            s.dispatchEvent(new Event('change'));
        });
        heroSelect.classList.remove('is-flash');
        void heroSelect.offsetWidth;
        heroSelect.classList.add('is-flash');
        track('model_interest', { modelo: model });
        goToForm(firstEmpty());
    };

    $$('[data-model]').forEach((btn) => btn.addEventListener('click', () => chooseModel(btn.dataset.model)));
    $$('[data-model-help]').forEach((a) => a.addEventListener('click', (e) => {
        e.preventDefault();
        chooseModel('Ainda não sei');
    }));

    /* ---------------- Animações de rolagem ---------------- */

    const onView = (els, cb, opts = { threshold: 0.18, rootMargin: '0px 0px -8% 0px' }) => {
        if (!('IntersectionObserver' in window)) return els.forEach((el) => cb(el));
        const io = new IntersectionObserver((entries) => entries.forEach((en) => {
            if (en.isIntersecting) {
                cb(en.target);
                io.unobserve(en.target);
            }
        }), opts);
        els.forEach((el) => io.observe(el));
    };

    // Entrada progressiva com leve escalonamento entre irmãos
    $$('.reveal').forEach((el) => {
        const siblings = [...el.parentElement.children].filter((c) => c.classList.contains('reveal'));
        el.style.setProperty('--d', `${Math.min(siblings.indexOf(el), 6) * 0.07}s`);
    });
    onView($$('.reveal'), (el) => el.classList.add('is-in'));

    // Linha do tempo: preenche a linha e acende as etapas em sequência
    const timeline = $('[data-timeline]');
    if (timeline) {
        onView([timeline], () => {
            const steps = $$('.step', timeline);
            timeline.style.setProperty('--progress', 1);
            steps.forEach((s, i) => setTimeout(() => s.classList.add('is-on'), reduceMotion ? 0 : 250 + i * 330));
        }, { threshold: 0.35 });
    }

    // Barra de composição da parcela
    onView($$('[data-stack-bar]'), (el) => el.classList.add('is-in'), { threshold: 0.5 });

    // Contadores
    onView($$('[data-count]'), (el) => {
        const end = Number(el.dataset.count);
        if (reduceMotion) return;
        const t0 = performance.now();
        const tick = (t) => {
            const k = Math.min((t - t0) / 900, 1);
            el.textContent = Math.round(end * (1 - Math.pow(1 - k, 3)));
            if (k < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    });

    /* ---------------- Cenário ilustrativo de planejamento ---------------- */

    const chart = $('[data-plan-chart]');
    const planRange = $('[data-plan-range]');
    if (chart && planRange) {
        const TOTAL = Number(planRange.max);
        const bars = Array.from({ length: TOTAL }, (_, i) => {
            const b = document.createElement('span');
            b.className = 'bar';
            b.style.transitionDelay = reduceMotion ? '0s' : `${i * 12}ms`;
            chart.appendChild(b);
            return b;
        });
        const flag = document.createElement('span');
        flag.className = 'plan-flag';
        flag.innerHTML = '<svg class="ico"><use href="#i-key"/></svg> Contemplação';
        chart.appendChild(flag);

        // Alturas ilustrativas: parcela reduzida até a contemplação e recalculada depois dela
        const H_BEFORE = 0.42;
        const H_AFTER = 0.78;
        const tag = (cls, text) => {
            const t = document.createElement('span');
            t.className = `plan-tag ${cls}`;
            t.textContent = text;
            chart.appendChild(t);
            return t;
        };
        const tagBefore = tag('plan-tag-before', 'Parcela menor');
        const tagAfter = tag('plan-tag-after', 'Parcela recalculada');
        let chartIn = reduceMotion;

        const render = () => {
            const m = Number(planRange.value);
            bars.forEach((b, i) => {
                b.classList.toggle('is-ride', i + 1 > m);
                b.classList.toggle('is-mark', i + 1 === m);
                if (chartIn) b.style.setProperty('--h', i + 1 > m ? H_AFTER : H_BEFORE);
            });
            // Rótulos dentro das barras, centralizados em cada trecho; somem quando o trecho fica estreito
            tagBefore.style.left = `${((m - 1) / 2 / TOTAL) * 100}%`;
            tagBefore.classList.toggle('is-off', m < 9 || !chartIn);
            tagAfter.style.left = `${((m + TOTAL) / 2 / TOTAL) * 100}%`;
            tagAfter.classList.toggle('is-off', TOTAL - m < 11 || !chartIn);
            flag.style.left = `${((m - 0.5) / TOTAL) * 100}%`;
            flag.classList.toggle('is-end', m > TOTAL * 0.75);
            $('[data-plan-month]').textContent = m;
            $('[data-plan-before]').textContent = m - 1;
            $('[data-plan-after]').textContent = TOTAL - m + 1;
            planRange.style.setProperty('--p', `${((m - 1) / (TOTAL - 1)) * 100}%`);
            planRange.setAttribute('aria-valuetext', `Contemplação no mês ${m} de ${TOTAL}`);
        };
        planRange.addEventListener('input', () => {
            bars.forEach((b) => { b.style.transitionDelay = '0s'; });
            render();
        });
        render();
        onView([chart], () => {
            chartIn = true;
            render();
        }, { threshold: 0.3 });
    }

    /* ---------------- FAQ (accordion com transição de altura) ---------------- */

    $$('[data-accordion] details').forEach((d) => {
        const summary = $('summary', d);
        summary.addEventListener('click', (e) => {
            e.preventDefault();
            const opening = !d.open;
            if (opening) {
                $$('[data-accordion] details[open]').forEach((o) => o !== d && toggle(o, false));
                track('faq_open', { pergunta: ($('.faq-q', summary) || summary).textContent.trim() });
            }
            toggle(d, opening);
        });

        function toggle(el, open) {
            const b = $('.faq-body', el);
            if (reduceMotion) {
                el.open = open;
                return;
            }
            if (open) el.open = true;
            const h = b.scrollHeight;
            const anim = b.animate(
                [{ height: open ? '0px' : `${h}px`, opacity: open ? 0 : 1 }, { height: open ? `${h}px` : '0px', opacity: open ? 1 : 0 }],
                { duration: 320, easing: 'cubic-bezier(.22,.61,.36,1)' }
            );
            anim.onfinish = () => { if (!open) el.open = false; };
        }
    });

    // Filtro de perguntas por tema
    const faqCards = $$('[data-faq-cat]');
    const faqGrid = $('[data-faq-grid]');
    // Duas colunas fixas: abrir uma resposta não faz os cards trocarem de coluna
    const faqCols = [0, 1].map(() => {
        const col = document.createElement('div');
        col.className = 'faq-col';
        faqGrid.appendChild(col);
        return col;
    });
    const layoutFaq = () => {
        const visible = faqCards.filter((c) => !c.classList.contains('is-hidden'));
        const half = Math.ceil(visible.length / 2);
        // Ocultos (índice -1) ficam na primeira coluna, sem afetar o equilíbrio
        faqCards.forEach((c) => faqCols[visible.indexOf(c) >= half ? 1 : 0].appendChild(c));
    };
    layoutFaq();
    $$('[data-faq-filter]').forEach((chip, _, chips) => chip.addEventListener('click', () => {
        const cat = chip.dataset.faqFilter;
        chips.forEach((c) => c.setAttribute('aria-pressed', c === chip ? 'true' : 'false'));
        faqCards.forEach((card) => {
            const show = cat === 'todas' || card.dataset.faqCat === cat;
            if (!show) card.open = false;
            card.classList.toggle('is-hidden', !show);
            card.classList.remove('is-filtered-in');
            if (show && !reduceMotion) {
                void card.offsetWidth;
                card.classList.add('is-filtered-in');
            }
        });
        layoutFaq();
        track('faq_filter', { tema: cat });
    }));

    /* ---------------- Header, parallax e CTA mobile ---------------- */

    const header = $('.site-header');
    const floatCta = $('[data-float-cta]');
    const parallax = reduceMotion ? [] : $$('.parallax');
    function updateFloatCta() {
        const vh = window.innerHeight;
        const formVisible = forms.some((f) => {
            const r = f.getBoundingClientRect();
            return r.top < vh * 0.85 && r.bottom > vh * 0.15;
        });
        // Não disputa espaço com o aviso de cookies
        const cookieOpen = !document.getElementById('cookie-popup').hidden;
        // Nem sobre a assinatura do rodapé
        const signature = document.querySelector('.signature');
        const atFooter = signature && signature.getBoundingClientRect().top < vh;
        const show = window.scrollY > vh * 0.9 && !formVisible && !cookieOpen && !atFooter;
        floatCta.classList.toggle('is-visible', show);
        floatCta.setAttribute('aria-hidden', show ? 'false' : 'true');
        $('a', floatCta).tabIndex = show ? 0 : -1;
    }

    let ticking = false;
    const onScroll = () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
            header.classList.toggle('is-scrolled', window.scrollY > 8);
            updateFloatCta();
            const vh = window.innerHeight;
            parallax.forEach((img) => {
                const r = img.getBoundingClientRect();
                if (r.bottom < 0 || r.top > vh) return;
                const k = (r.top + r.height / 2 - vh / 2) / vh; // -1..1
                img.style.transform = `translate3d(${k * -18}px, ${k * 14}px, 0)`;
            });
            ticking = false;
        });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    $$('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });

    // Assinatura da agência: aplica a fonte Rajdhani só perto do rodapé (não disputa banda no carregamento)
    onView($$('.signature'), (el) => el.classList.add('is-near'), { rootMargin: '0px 0px 600px 0px' });

    /* ---------------- Consentimento de cookies (LGPD) + integrações ---------------- */

    const STORAGE_KEY = 'cookie-consent';
    const popup = $('#cookie-popup');

    // Google Consent Mode v2: tudo negado até a escolha do visitante.
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
    window.gtag('consent', 'default', {
        ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'denied'
    });

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

    const saveConsent = (analytics, marketing) => {
        const c = { necessary: true, analytics, marketing, updatedAt: new Date().toISOString() };
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(c)); } catch { /* navegação privada */ }
        popup.hidden = true;
        applyConsent(c);
        window.dispatchEvent(new CustomEvent('cookie-consent-updated', { detail: c }));
    };

    const saved = readConsent();
    if (saved) applyConsent(saved);
    else popup.hidden = false;

    $('[data-cookie="accept"]', popup).addEventListener('click', () => {
        saveConsent(true, true);
        onScroll();
    });
})();

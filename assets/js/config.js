/*
 * Configuração comercial da LP — tudo aqui é editável sem tocar no layout.
 * Na integração com WordPress, este objeto passa a ser impresso pelo tema
 * (wp_localize_script / wp_add_inline_script) a partir de campos do painel.
 */
window.SHINERAY_CONFIG = {
    whatsapp: {
        // A CONFIRMAR: o briefing informa +55 34 9843-4495 (8 dígitos após o DDD).
        // A v1 usava também 55 34 98442-4404 no header e nos cards.
        number: '553498434495',
        display: '(34) 9843-4495',
        confirmed: false
    },

    // Slider "valor desejado da parcela".
    // A CONFIRMAR: faixa provisória apenas para o conceito — substituir pelas condições reais dos grupos.
    parcela: {
        min: 200,
        max: 1200,
        step: 25,
        initial: 450,
        provisional: true
    },

    // Endpoint que recebe o lead (back-end PHP / RD Station). Vazio = integração ainda não configurada:
    // o formulário NÃO simula envio e oferece continuar pelo WhatsApp.
    leadEndpoint: '',

    // Integrações — carregadas somente após consentimento (LGPD).
    gtmId: '',          // ex.: 'GTM-XXXXXXX'  (GA4 configurado dentro do GTM)
    metaPixelId: '',    // ex.: '000000000000000'
    rdStationScript: '' // ex.: URL do script de monitoramento do RD Station
};

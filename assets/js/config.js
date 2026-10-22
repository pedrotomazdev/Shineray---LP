/*
 * Configuração comercial da LP — tudo aqui é editável sem tocar no layout.
 * Na integração com WordPress, este objeto passa a ser impresso pelo tema
 * (wp_localize_script / wp_add_inline_script) a partir de campos do painel.
 */
window.SHINERAY_CONFIG = {
    whatsapp: {
        // Número de atendimento do briefing. O envio do formulário abre esta conversa.
        number: '553498434495',
        display: '(34) 9843-4495'
    },

    // Slider "valor desejado da parcela".
    // Faixa de referência do slider (ajustar quando houver as condições dos grupos).
    parcela: {
        min: 200,
        max: 1200,
        step: 25,
        initial: 450
    },

    // Endpoint que recebe o lead (back-end PHP / RD Station). Vazio = o envio abre o WhatsApp
    // de atendimento com os dados preenchidos.
    leadEndpoint: '',

    // Integrações — carregadas somente após consentimento (LGPD).
    gtmId: '',          // ex.: 'GTM-XXXXXXX'  (GA4 configurado dentro do GTM)
    metaPixelId: '',    // ex.: '000000000000000'
    rdStationScript: '' // ex.: URL do script de monitoramento do RD Station
};

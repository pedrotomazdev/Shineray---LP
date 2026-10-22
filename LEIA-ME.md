# LP Consórcio Shineray — v2 (conceito)

Conceito visual para revisão interna (Henrique). A v1 continua intacta em `Documents/Dev/Trash`.

## Estrutura

```
index.html                  página (seções numeradas 1–11 em comentários)
assets/css/style.css        sistema visual (tokens em :root)
assets/js/config.js         dados comerciais e integrações (editar aqui)
assets/js/main.js           slider, formulário, animações, FAQ, cookies/LGPD
assets/img/motos/*.webp     motos recortadas (900px e 480px)
assets/img/_src/            PNGs originais baixados do site da concessionária
politica-de-privacidade.html  cópia da v1 (usa landingpage.css e logo-dark.png da raiz)
```

Rodar localmente: `python -m http.server 5500` e abrir http://localhost:5500.

## Marcadores "a confirmar"

Na página, tudo o que depende do cliente aparece com o selo amarelo `.tbc` / atributo `data-tbc`.
Para ocultar os selos numa apresentação ao cliente: `.tbc { display: none }`.

| Item | Onde |
| --- | --- |
| Número do WhatsApp (briefing: 34 9843-4495, 8 dígitos; v1 também usava 34 98442-4404) | `config.js` |
| Faixa do slider de parcela (provisória: R$ 200–1.200, passo 25) | `config.js` |
| Administradora / parceiros (nome, CNPJ, logos) | seção Credibilidade, rodapé |
| % taxa de administração, fundo de reserva, seguro | Planejamento, FAQ |
| Prazos dos planos, índice e periodicidade de reajuste | Planejamento, FAQ |
| Modalidades de lance, regras de uso do crédito entre modelos, documentos | FAQ |
| Diferenciais da concessionária herdados da v1 (garantia 3 anos, entrega 500 km, nota 4,9, Fenabrave) | Diferenciais |
| Endpoint de leads, GTM, Meta Pixel, RD Station | `config.js` |

## Removido da v1

Preços “a partir de R$/mês”, “financiamento em até 76x”, “10 bancos parceiros”, depoimento sem comprovação,
endereço/menu “Lojas”, Tailwind via CDN e o CSS completo do tema WordPress.

## Formulário

- Campos: nome, WhatsApp, modelo, parcela (slider). Validação com mensagens por campo.
- Sem `leadEndpoint` configurado, **não simula envio**: avisa que a integração não está ativa e oferece
  continuar pelo WhatsApp com os dados preenchidos.
- Eventos no `dataLayer`: `lead_submit`, `lead_form_blocked`, `whatsapp_click`, `model_interest`,
  `parcela_change`, `faq_open`.
- GTM, Pixel e RD só carregam após consentimento (Google Consent Mode v2 com padrão “denied”).
- Aviso de cookies simplificado a pedido: apenas “Aceitar” + link da Política de Privacidade.
  Enquanto o visitante não aceita, nenhuma tag de análise/marketing é carregada.

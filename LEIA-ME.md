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

## Performance, SEO e deploy

Lighthouse local (servidor com compressão), 22/10/2026: **100 / 100 / 100 / 100** em mobile e desktop
(LCP 1,6 s mobile · CLS 0 · TBT 40 ms).

- Fonte Inter Tight hospedada em `assets/fonts` (subset latin, variável 400–700) com `preload` e fallback de métricas.
- Elementos do hero sem animação de entrada (não atrasam o LCP); demais seções com `.reveal`.
- Imagens WebP com `srcset`/`sizes`, `width`/`height` e `loading="lazy"` fora da primeira dobra.
- CSS/JS versionados por query (`?v=2.1.0`) — **troque a versão a cada publicação**, pois o `vercel.json`
  aplica cache de 1 ano (`immutable`) em `assets/css`, `assets/js` e `assets/fonts`.
- SEO: title/description, canonical, Open Graph + Twitter (`assets/img/og-consorcio-shineray.jpg`, 1200×630),
  JSON-LD (Organization + WebPage), favicons, `robots.txt` e `sitemap.xml`.
- Vercel: site estático, sem build. Importar o repositório (Framework Preset: Other) ou usar `vercel --prod`.

### Ao migrar para o WordPress
1. Trocar `https://landingpage-shinray.vercel.app/` pela URL definitiva (canonical, og:url, og:image, JSON-LD,
   robots.txt, sitemap.xml) — ou deixar o Yoast/Rank Math gerar essas tags e remover as do `<head>`.
2. Enfileirar `style.css`, `config.js` e `main.js` com `wp_enqueue_*` (versão = `filemtime`), `main.js` com `defer`.
3. Manter o `preload` da fonte e evitar que o tema carregue Google Fonts/Tailwind/CSS global nesta página.
4. Imprimir `SHINERAY_CONFIG` via `wp_add_inline_script` a partir de campos do painel.

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

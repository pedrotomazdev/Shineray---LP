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
- CSS/JS versionados por query (`?v=2.2.1`) — **troque a versão a cada publicação**, pois o `vercel.json`
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

## Conteúdo genérico (validar com o cliente antes da versão final)

Os marcadores "a confirmar" foram retirados do site a pedido. No lugar, ficou texto genérico ou ilustrativo:

| Item | Como está no site |
| --- | --- |
| WhatsApp de atendimento | `config.js`: (34) 9843-4495, do briefing — tem 8 dígitos após o DDD; testar se a conversa abre |
| Faixa do slider | R$ 400 a R$ 1.200+, passo R$ 25 (`config.js`) |
| Administradora | “autorizada e fiscalizada pelo Banco Central”, sem nome/CNPJ |
| Gráfico de planejamento | plano ilustrativo de 48 meses com parcela reduzida até a contemplação |
| Composição da parcela | proporções ilustrativas, sem percentuais |
| Diferencial da concessionária | slogan do Instagram do cliente (“Tecnologia, economia e qualidade”) |
| Instagram | @shineray.motodagenteuberlandia (perfil se apresenta como “Moto da Gente Uberlândia”) |
| Envio do formulário | sem `leadEndpoint`, abre o WhatsApp com nome, modelo e parcela preenchidos |

## Removido da v1

Preços “a partir de R$/mês”, “financiamento em até 76x”, “10 bancos parceiros”, depoimento sem comprovação,
endereço/menu “Lojas”, Tailwind via CDN e o CSS completo do tema WordPress.

## Formulário

- Campos: nome, WhatsApp, modelo, parcela (slider). Validação com mensagens por campo.
- Sem `leadEndpoint` configurado, o envio abre o WhatsApp de atendimento com os dados preenchidos
  (o site não tem botões de WhatsApp; todas as chamadas levam ao formulário do topo).
- Eventos no `dataLayer`: `lead_submit`, `lead_whatsapp`, `model_interest`, `faq_filter`,
  `parcela_change`, `faq_open`.
- GTM, Pixel e RD só carregam após consentimento (Google Consent Mode v2 com padrão “denied”).
- Aviso de cookies simplificado a pedido: apenas “Aceitar” + link da Política de Privacidade.
  Enquanto o visitante não aceita, nenhuma tag de análise/marketing é carregada.

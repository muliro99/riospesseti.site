#!/usr/bin/env node
// Gera um artigo juridico automaticamente usando a API da Anthropic

const https = require('https');
const fs    = require('fs');
const path  = require('path');

if (!process.env.ANTHROPIC_API_KEY) {
  console.error('Erro: variavel ANTHROPIC_API_KEY nao definida.');
  process.exit(1);
}

const POSTS_DIR  = path.join(__dirname, '..', 'public', 'blog', 'posts');
const POSTS_JSON = path.join(__dirname, '..', 'public', 'blog', 'posts.json');

const TEMAS = [
  'como contestar cobranças abusivas em contratos de cartao de credito',
  'o que fazer quando o INSS nega a aposentadoria por incapacidade permanente',
  'demissao sem justa causa: quais verbas rescisorias voce tem direito',
  'divorcio consensual: como funciona e quais sao os passos',
  'reconhecimento de uniao estavel para fins previdenciarios e patrimoniais',
  'acidente de trabalho: direitos do trabalhador e obrigacoes do empregador',
  'negativacao indevida: como remover o nome do SPC ou Serasa e cobrar indenizacao',
  'inventario sem testamento: como funciona a partilha de heranca',
  'busca e apreensao de veiculo: como contestar e quais sao seus direitos',
  'auxilio por incapacidade temporaria: quem tem direito e como solicitar ao INSS',
  'assedio moral no trabalho: como identificar e quais sao seus direitos',
  'superendividamento: como a lei protege o consumidor endividado',
  'pensao por morte: quem tem direito e como solicitar ao INSS',
  'rescisao indireta: o que e e quando o trabalhador pode pedir',
  'guarda compartilhada: como funciona na pratica e o que diz a lei',
  'horas extras nao pagas: como calcular e cobrar na justica trabalhista',
  'revisao de beneficio do INSS: quando vale a pena e como fazer',
  'o que e equiparacao salarial e como solicitar na justica',
  'financiamento de imovel: quais sao os seus direitos em caso de atraso na entrega',
  'como funciona o BPC LOAS: criterios, valor e como solicitar',
];

function selecionarTema() {
  const diasDesdeEpoca = Math.floor(Date.now() / 86400000);
  return TEMAS[diasDesdeEpoca % TEMAS.length];
}

function formatarData(data) {
  const meses = [
    'janeiro','fevereiro','marco','abril','maio','junho',
    'julho','agosto','setembro','outubro','novembro','dezembro'
  ];
  return `${data.getDate()} de ${meses[data.getMonth()]} de ${data.getFullYear()}`;
}

function slugify(texto) {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 70);
}

function chamarAPI(mensagem) {
  return new Promise((resolve, reject) => {
    const corpo = JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 3000,
      messages: [{ role: 'user', content: mensagem }]
    });

    const req = https.request({
      hostname: 'api.anthropic.com',
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Length': Buffer.byteLength(corpo),
      }
    }, (res) => {
      let dados = '';
      res.on('data', c => dados += c);
      res.on('end', () => {
        try {
          const resp = JSON.parse(dados);
          if (resp.error) return reject(new Error(resp.error.message));
          resolve(resp.content[0].text);
        } catch (e) {
          reject(new Error(`Resposta invalida: ${dados.substring(0, 200)}`));
        }
      });
    });

    req.on('error', reject);
    req.write(corpo);
    req.end();
  });
}

function gerarHTMLPost(titulo, dataFormatada, conteudoHTML) {
  const ig = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>`;

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${titulo} — Rios e Pessetti Advogados</title>
  <meta name="description" content="${titulo}" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="/css/style.css" />
</head>
<body>
  <header>
    <div class="container">
      <nav>
        <ul class="nav-esq">
          <li><a href="/">Inicio</a></li>
          <li><a href="/areas.html">Areas</a></li>
          <li><a href="/sobre.html">Sobre</a></li>
        </ul>
        <a href="/" class="nav-logo" aria-label="Rios e Pessetti Advogados">
          <img src="/images/logo.png" alt="Rios e Pessetti Advogados" />
        </a>
        <div class="nav-dir">
          <ul class="nav-dir-links">
            <li><a href="/blog/">Blog</a></li>
            <li><a href="/contato.html" class="nav-cta">Contato</a></li>
          </ul>
          <button class="nav-toggle" aria-label="Menu">
            <span></span><span></span><span></span>
          </button>
        </div>
      </nav>
    </div>
    <div class="nav-mobile" id="nav-mobile">
      <div class="container">
        <ul>
          <li><a href="/">Inicio</a></li>
          <li><a href="/areas.html">Areas de Atuacao</a></li>
          <li><a href="/sobre.html">Sobre</a></li>
          <li><a href="/blog/">Blog</a></li>
          <li><a href="/contato.html">Contato</a></li>
        </ul>
      </div>
    </div>
  </header>

  <div class="artigo-wrapper">
    <a href="/blog/" class="artigo-voltar">&larr; Voltar para o blog</a>
    <p class="artigo-meta">${dataFormatada}</p>
    <h1>${titulo}</h1>
    <div class="artigo-conteudo">
${conteudoHTML}
    </div>
    <div style="margin-top:3.5rem;padding-top:2rem;border-top:1px solid var(--line-md);">
      <p style="font-size:0.875rem;margin-bottom:1.25rem;">Precisa de orientacao sobre esse tema?</p>
      <a href="/contato.html" class="btn btn-primario">Falar com um advogado</a>
    </div>
  </div>

  <footer>
    <div class="container">
      <div class="footer-top">
        <div class="footer-marca">
          <div class="footer-marca-logo"><img src="/images/logo.png" alt="Rios e Pessetti Advogados" /></div>
          <p>Escritorio de advocacia full-service com atuacao nas principais areas do direito. Seriedade, tecnica e atendimento humanizado.</p>
          <div class="footer-marca-cidade">Francisco Beltrao, Parana</div>
          <div class="footer-social">
            <a href="https://www.instagram.com/riosepessettiadvogados/" target="_blank" rel="noopener" class="social-link" aria-label="Instagram">${ig}</a>
          </div>
        </div>
        <div class="footer-col">
          <h4>Paginas</h4>
          <ul>
            <li><a href="/">Inicio</a></li>
            <li><a href="/areas.html">Areas de Atuacao</a></li>
            <li><a href="/sobre.html">Sobre o Escritorio</a></li>
            <li><a href="/blog/">Blog Juridico</a></li>
            <li><a href="/contato.html">Contato</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4>Contato</h4>
          <ul>
            <li><a href="tel:+554626011530">(46) 2601-1530</a></li>
            <li><span>Av. Antonio de Paiva Cantelmo, 583<br>1&ordm; Andar, Centro<br>Francisco Beltrao, PR<br>CEP 85601-005</span></li>
            <li><span>Seg. a Sex. das 8h30 as 18h</span></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; 2025 Rios e Pessetti Advogados. Todos os direitos reservados.</p>
        <span class="footer-bottom-oab">OAB/PR 81.328 &middot; OAB/PR 36.084</span>
      </div>
    </div>
  </footer>
  <script src="/js/main.js"></script>
</body>
</html>`;
}

async function main() {
  const tema = selecionarTema();
  const hoje = new Date();
  const dataFormatada = formatarData(hoje);

  console.log(`Tema selecionado: ${tema}`);
  console.log('Chamando API da Anthropic...');

  const prompt = `Voce e um advogado especialista e redator de blog juridico. Escreva um artigo completo e informativo sobre o tema abaixo para o blog do escritorio Rios e Pessetti Advogados, de Francisco Beltrao, PR.

TEMA: ${tema}

REGRAS:
- Tom formal, cordial e acessivel. Sem juridiques desnecessario.
- Escreva para o cidadao comum, nao para advogados.
- Proibido usar travessao (o caractere —). Use virgula ou dois pontos.
- Sem emojis.
- Entre 600 e 900 palavras de conteudo.
- Use subtitulos H2 e H3 para organizar o texto.
- Ao final, incentive o leitor a buscar orientacao juridica profissional.

Retorne SOMENTE um JSON valido com estes campos (sem texto antes ou depois, sem markdown):
{
  "titulo": "titulo do artigo",
  "resumo": "resumo em uma frase de ate 130 caracteres",
  "conteudo_html": "conteudo HTML usando apenas p, h2, h3, ul, ol, li, strong. Sem html, head, body ou qualquer tag estrutural."
}`;

  let respostaTexto;
  try {
    respostaTexto = await chamarAPI(prompt);
  } catch (e) {
    console.error('Erro na API:', e.message);
    process.exit(1);
  }

  let dados;
  try {
    const limpo = respostaTexto
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();
    dados = JSON.parse(limpo);
  } catch (e) {
    console.error('Erro ao interpretar resposta JSON:', e.message);
    process.exit(1);
  }

  const { titulo, resumo, conteudo_html } = dados;

  const dataStr = `${hoje.getFullYear()}${String(hoje.getMonth()+1).padStart(2,'0')}${String(hoje.getDate()).padStart(2,'0')}`;
  const slug = `${slugify(titulo)}-${dataStr}`;

  fs.mkdirSync(POSTS_DIR, { recursive: true });

  const htmlPost = gerarHTMLPost(titulo, dataFormatada, conteudo_html);
  fs.writeFileSync(path.join(POSTS_DIR, `${slug}.html`), htmlPost, 'utf8');

  let posts = [];
  try { posts = JSON.parse(fs.readFileSync(POSTS_JSON, 'utf8')); } catch {}
  posts.unshift({ slug, titulo, data: dataFormatada, resumo });
  fs.writeFileSync(POSTS_JSON, JSON.stringify(posts, null, 2), 'utf8');

  console.log(`Artigo gerado com sucesso: "${titulo}"`);
  console.log(`Arquivo: ${slug}.html`);
}

main();

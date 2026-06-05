#!/usr/bin/env node
const fs   = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const slug = process.env.SLUG || process.argv[2];
if (!slug) { console.error('Uso: node publicar-post.js <slug>'); process.exit(1); }

const ROOT        = path.join(__dirname, '..');
const DRAFTS_DIR  = path.join(ROOT, 'public', 'blog', 'drafts');
const POSTS_DIR   = path.join(ROOT, 'public', 'blog', 'posts');
const DRAFTS_JSON = path.join(ROOT, 'public', 'blog', 'drafts.json');
const POSTS_JSON  = path.join(ROOT, 'public', 'blog', 'posts.json');
const RSS_PATH    = path.join(ROOT, 'public', 'rss.xml');
const SITE_URL    = 'https://riosepessetti.adv.br';

const draftFile = path.join(DRAFTS_DIR, `${slug}.html`);
const postFile  = path.join(POSTS_DIR,  `${slug}.html`);

if (!fs.existsSync(draftFile)) {
  console.error(`Rascunho nao encontrado: ${draftFile}`);
  process.exit(1);
}

fs.mkdirSync(POSTS_DIR, { recursive: true });
fs.copyFileSync(draftFile, postFile);
fs.unlinkSync(draftFile);

let drafts = [];
try { drafts = JSON.parse(fs.readFileSync(DRAFTS_JSON, 'utf8')); } catch {}
const entrada = drafts.find(d => d.slug === slug);
drafts = drafts.filter(d => d.slug !== slug);
fs.writeFileSync(DRAFTS_JSON, JSON.stringify(drafts, null, 2), 'utf8');

let posts = [];
try { posts = JSON.parse(fs.readFileSync(POSTS_JSON, 'utf8')); } catch {}
if (entrada) posts.unshift(entrada);
fs.writeFileSync(POSTS_JSON, JSON.stringify(posts, null, 2), 'utf8');

const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Blog Juridico - Rios e Pessetti Advogados</title>
    <link>${SITE_URL}/blog/</link>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />
    <description>Artigos juridicos sobre direito do consumidor, previdenciario, trabalhista e familiar.</description>
    <language>pt-BR</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${posts.slice(0, 20).map(p => `    <item>
      <title><![CDATA[${p.titulo}]]></title>
      <link>${SITE_URL}/blog/posts/${p.slug}</link>
      <guid isPermaLink="true">${SITE_URL}/blog/posts/${p.slug}</guid>
      <description><![CDATA[${p.resumo}]]></description>
      <pubDate>${p.pubDate || new Date().toUTCString()}</pubDate>
    </item>`).join('\n')}
  </channel>
</rss>`;
fs.writeFileSync(RSS_PATH, rss, 'utf8');

console.log(`Publicando: "${entrada ? entrada.titulo : slug}"`);

try {
  execSync('git pull --rebase', { cwd: ROOT, stdio: 'inherit' });
  execSync(`git add public/blog/posts/${slug}.html public/blog/drafts/${slug}.html public/blog/drafts.json public/blog/posts.json public/rss.xml`, { cwd: ROOT, stdio: 'inherit' });
  execSync(`git commit -m "blog: ${entrada ? entrada.titulo : slug}"`, { cwd: ROOT, stdio: 'inherit' });
  execSync('git push', { cwd: ROOT, stdio: 'inherit' });
  console.log('Publicado. Netlify vai atualizar em instantes.');
} catch (e) {
  console.error('Erro no push:', e.message);
  process.exit(1);
}

const https = require('https');

function githubRequest(path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = https.request({
      hostname: 'api.github.com',
      path,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github+json',
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        'User-Agent': 'riosepessetti-admin',
      },
    }, (res) => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => resolve({ status: res.statusCode, body }));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  const { senha, tema } = JSON.parse(event.body || '{}');
  if (senha !== process.env.ADMIN_PASSWORD) return { statusCode: 401, body: JSON.stringify({ erro: 'Nao autorizado.' }) };
  if (!tema || tema.trim().length < 5) return { statusCode: 400, body: JSON.stringify({ erro: 'Tema muito curto.' }) };

  const result = await githubRequest(
    '/repos/muliro99/riospesseti.site/actions/workflows/gerar-post.yml/dispatches',
    { ref: 'master', inputs: { tema: tema.trim() } }
  );

  if (result.status === 204) {
    return { statusCode: 200, body: JSON.stringify({ ok: true, mensagem: 'Artigo sendo gerado. Aparecera nos rascunhos em cerca de 2 minutos.' }) };
  }
  return { statusCode: 500, body: JSON.stringify({ erro: 'Falha ao acionar geracao.', detalhe: result.body }) };
};

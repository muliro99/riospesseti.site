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

  const { senha, slug } = JSON.parse(event.body || '{}');
  if (senha !== process.env.ADMIN_PASSWORD) return { statusCode: 401, body: JSON.stringify({ erro: 'Nao autorizado.' }) };
  if (!slug) return { statusCode: 400, body: JSON.stringify({ erro: 'Slug obrigatorio.' }) };

  const result = await githubRequest(
    '/repos/muliro99/riospesseti.site/actions/workflows/deletar-post.yml/dispatches',
    { ref: 'master', inputs: { slug } }
  );

  if (result.status === 204) {
    return { statusCode: 200, body: JSON.stringify({ ok: true, mensagem: 'Post sendo removido. O site sera atualizado em instantes.' }) };
  }
  return { statusCode: 500, body: JSON.stringify({ erro: 'Falha ao acionar remocao.', detalhe: result.body }) };
};

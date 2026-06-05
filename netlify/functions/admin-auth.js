exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  const { senha } = JSON.parse(event.body || '{}');
  const correta = process.env.ADMIN_PASSWORD;

  if (!correta) return { statusCode: 500, body: JSON.stringify({ erro: 'Servidor mal configurado.' }) };
  if (senha !== correta) return { statusCode: 401, body: JSON.stringify({ erro: 'Senha incorreta.' }) };

  return { statusCode: 200, body: JSON.stringify({ ok: true }) };
};

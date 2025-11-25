const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// /controle -> serviço na 3001 (raiz '/')
app.use(
  '/controle',
  createProxyMiddleware({
    target: 'http://localhost:3001',
    changeOrigin: true,
    pathRewrite: { '^/controle': '/' }, // remove o prefixo ao enviar
    logLevel: 'debug',
  })
);

// /log -> serviço na 3002 (raiz '/')
app.use(
  '/log',
  createProxyMiddleware({
    target: 'http://localhost:3002',
    changeOrigin: true,
    pathRewrite: { '^/log': '/' },
    logLevel: 'debug',
  })
);

app.listen(3000, () => console.log('API Gateway rodando na porta 3000'));

const express = require('express');
const app = express();
app.use(express.json());

let leituras = [];

app.post('/', (req, res) => {
  const registro = { ...req.body, dataHora: new Date().toISOString() };
  leituras.push(registro);
  res.json({ ok: true });
});

app.get('/', (req, res) => {
  res.json(leituras.slice(-100));
});

app.listen(3002, () => console.log('Log rodando na porta 3002'));

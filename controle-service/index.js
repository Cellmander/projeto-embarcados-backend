const express = require('express');
const app = express();
app.use(express.json());

let configuracoes = {
  luminosidadeMin: 800,
  luminosidadeMax: 3500,
};

app.get('/', (req, res) => {
  res.json(configuracoes);
});

app.post('/', (req, res) => {
  configuracoes = { ...configuracoes, ...req.body };
  res.json({ ok: true, atualizado: configuracoes });
});

app.listen(3001, () => console.log('Controle rodando na porta 3001'));

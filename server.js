// server.js
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

let pool;

if (process.env.USE_MOCK_POOL === 'true') {
  // Banco mockado (para testes unitários ou CI)
  pool = {
    query: jest.fn(),
  };
} else {
  // Banco real
  pool = new Pool({
    user: process.env.PG_USER || 'postgres',
    host: process.env.PG_HOST || 'localhost',
    database: process.env.PG_DB || 'N2',
    password: process.env.PG_PASSWORD || '123',
    port: process.env.PG_PORT || 5432,
  });
}

// Rotas
app.get('/pecas', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM pecas ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error('Erro ao listar peças:', err);
    res.status(500).json({ error: 'Erro ao listar peças' });
  }
});

app.post('/pecas', async (req, res) => {
  try {
    const { nome, quantidade } = req.body;
    if (!nome || quantidade === undefined) return res.status(400).json({ error: 'Nome e quantidade são obrigatórios' });

    const result = await pool.query(
      'INSERT INTO pecas (nome, quantidade) VALUES ($1, $2) RETURNING *',
      [nome, quantidade]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Erro ao criar peça:', err);
    res.status(500).json({ error: 'Erro ao criar peça' });
  }
});

app.put('/pecas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, quantidade } = req.body;
    if (!nome || quantidade === undefined) return res.status(400).json({ error: 'Nome e quantidade são obrigatórios' });

    const result = await pool.query(
      'UPDATE pecas SET nome = $1, quantidade = $2 WHERE id = $3 RETURNING *',
      [nome, quantidade, id]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: 'Peça não encontrada' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Erro ao atualizar peça:', err);
    res.status(500).json({ error: 'Erro ao atualizar peça' });
  }
});

app.delete('/pecas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM pecas WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) return res.status(404).json({ error: 'Peça não encontrada' });
    res.json({ message: 'Peça deletada com sucesso' });
  } catch (err) {
    console.error('Erro ao deletar peça:', err);
    res.status(500).json({ error: 'Erro ao deletar peça' });
  }
});

module.exports = { app, pool };

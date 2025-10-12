// server.js
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Configuração do PostgreSQL
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'N2',    
  password: '123',   
  port: 5432,
});

// Middleware para logar todas as requisições
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Listar todas as peças
app.get('/pecas', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM public.pecas ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error('Erro ao listar peças:', err);
    res.status(500).json({ error: 'Erro ao listar peças' });
  }
});

// Criar nova peça
app.post('/pecas', async (req, res) => {
  try {
    const { nome, quantidade } = req.body;
    if (!nome || quantidade === undefined) return res.status(400).json({ error: 'Nome e quantidade são obrigatórios' });

    const result = await pool.query(
      'INSERT INTO public.pecas (nome, quantidade) VALUES ($1, $2) RETURNING *',
      [nome, quantidade]
    );
    console.log('Inserido no banco:', result.rows[0]); // log detalhado
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Erro ao criar peça:', err);
    res.status(500).json({ error: 'Erro ao criar peça' });
  }
});

// Atualizar peça
app.put('/pecas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, quantidade } = req.body;
    if (!nome || quantidade === undefined) return res.status(400).json({ error: 'Nome e quantidade são obrigatórios' });

    const result = await pool.query(
      'UPDATE public.pecas SET nome = $1, quantidade = $2 WHERE id = $3 RETURNING *',
      [nome, quantidade, id]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: 'Peça não encontrada' });
    console.log('Atualizado no banco:', result.rows[0]); // log detalhado
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Erro ao atualizar peça:', err);
    res.status(500).json({ error: 'Erro ao atualizar peça' });
  }
});

// Deletar peça
app.delete('/pecas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM public.pecas WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: 'Peça não encontrada' });
    console.log('Deletado do banco:', result.rows[0]); // log detalhado
    res.json({ message: 'Peça deletada com sucesso' });
  } catch (err) {
    console.error('Erro ao deletar peça:', err);
    res.status(500).json({ error: 'Erro ao deletar peça' });
  }
});

// Start do servidor
app.listen(3001, () => console.log('Servidor rodando na porta 3001'));




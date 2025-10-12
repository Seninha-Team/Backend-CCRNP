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

// Start do servidor
app.listen(3001, () => console.log('Servidor rodando na porta 3001'));




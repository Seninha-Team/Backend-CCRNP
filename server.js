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

// Start do servidor
app.listen(3001, () => console.log('Servidor rodando na porta 3001'));




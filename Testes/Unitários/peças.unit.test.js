// testes/unit/pecas.unit.test.js
process.env.USE_MOCK_POOL = 'true'; // ativa o mock

const request = require('supertest');
const { app, pool } = require('../../server');

jest.spyOn(pool, 'query');

afterEach(() => {
  jest.clearAllMocks();
});

describe('Testes unitários - /pecas', () => {
  it('GET /pecas - retorna lista', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ id: 1, nome: 'Parafuso', quantidade: 10 }] });
    const res = await request(app).get('/pecas');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([{ id: 1, nome: 'Parafuso', quantidade: 10 }]);
  });

  it('POST /pecas - cria peça', async () => {
    const novaPeca = { nome: 'Porca', quantidade: 5 };
    pool.query.mockResolvedValueOnce({ rows: [{ id: 2, ...novaPeca }] });
    const res = await request(app).post('/pecas').send(novaPeca);
    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({ id: 2, ...novaPeca });
  });

  it('POST /pecas - erro 400', async () => {
    const res = await request(app).post('/pecas').send({ nome: 'X' });
    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: 'Nome e quantidade são obrigatórios' });
  });

  it('PUT /pecas/:id - atualiza peça', async () => {
    const atualizacao = { nome: 'Parafuso Atualizado', quantidade: 20 };
    pool.query.mockResolvedValueOnce({ rows: [{ id: 1, ...atualizacao }] });
    const res = await request(app).put('/pecas/1').send(atualizacao);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ id: 1, ...atualizacao });
  });

  it('DELETE /pecas/:id - deleta peça', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ id: 1, nome: 'Parafuso', quantidade: 10 }] });
    const res = await request(app).delete('/pecas/1');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ message: 'Peça deletada com sucesso' });
  });
});

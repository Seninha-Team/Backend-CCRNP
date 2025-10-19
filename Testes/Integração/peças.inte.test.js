// testes/integracao/pecas.inte.test.js
process.env.USE_MOCK_POOL = 'true'; // IMPORTANTE: deve vir antes do require

const request = require('supertest');
const { app, pool } = require('../../server');

describe('Testes de integração - /pecas (mocked DB)', () => {
  let idCriado;

  beforeEach(() => {
    // Limpa mocks antes de cada teste
    jest.clearAllMocks();
  });

  it('POST /pecas - cria peça', async () => {
    const novaPeca = { nome: 'Parafuso', quantidade: 10 };
    pool.query.mockResolvedValueOnce({ rows: [{ id: 1, ...novaPeca }] });

    const res = await request(app).post('/pecas').send(novaPeca);

    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({ id: 1, ...novaPeca });

    idCriado = 1; // guarda o id mockado
  });

  it('GET /pecas - lista peças', async () => {
    const lista = [{ id: idCriado, nome: 'Parafuso', quantidade: 10 }];
    pool.query.mockResolvedValueOnce({ rows: lista });

    const res = await request(app).get('/pecas');

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(lista);
  });

  it('PUT /pecas/:id - atualiza peça', async () => {
    const atualizacao = { nome: 'Parafuso Atualizado', quantidade: 20 };
    pool.query.mockResolvedValueOnce({ rows: [{ id: idCriado, ...atualizacao }] });

    const res = await request(app).put(`/pecas/${idCriado}`).send(atualizacao);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ id: idCriado, ...atualizacao });
  });

  it('DELETE /pecas/:id - deleta peça', async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ id: idCriado }] });

    const res = await request(app).delete(`/pecas/${idCriado}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ message: 'Peça deletada com sucesso' });
  });

  it('POST /pecas - erro 400 se dados incompletos', async () => {
    const res = await request(app).post('/pecas').send({ nome: 'X' });

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: 'Nome e quantidade são obrigatórios' });
  });

  it('PUT /pecas/:id - erro 404 se peça não encontrada', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app).put(`/pecas/999`).send({ nome: 'Nada', quantidade: 1 });

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ error: 'Peça não encontrada' });
  });

  it('DELETE /pecas/:id - erro 404 se peça não encontrada', async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app).delete(`/pecas/999`);

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ error: 'Peça não encontrada' });
  });
});

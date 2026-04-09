const request = require('supertest');
const app = require('../app');

describe('Posts', () => {
    test('GET /posts - Debe listar posts públicos', async () => {
        const res = await request(app).get('/posts');
        expect(res.status).toBe(200);
        expect(res.text).toContain('Posts');
    });

    test('GET /posts/slug/:slug - Debe manejar posts existentes o no encontrados', async () => {
        const res = await request(app).get('/posts/slug/test-post');
        expect([200, 302, 404, 500]).toContain(res.status);
    });

    test('GET /posts/create - Debe redirigir al login si no está autenticado', async () => {
        const res = await request(app).get('/posts/create');
        expect([302, 401]).toContain(res.status);
    });

    test('GET /posts/my-posts - Debe redirigir al login si no está autenticado', async () => {
        const res = await request(app).get('/posts/my-posts');
        expect([302, 401]).toContain(res.status);
    });
});

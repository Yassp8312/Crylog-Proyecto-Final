const request = require('supertest');
const app = require('../app');

describe('Autenticación', () => {
    test('GET /auth/login - Debe mostrar formulario de login', async () => {
        const res = await request(app).get('/auth/login');
        expect(res.status).toBe(200);
        expect(res.text).toContain('Iniciar Sesión');
    });

    test('GET /auth/register - Debe mostrar formulario de registro', async () => {
        const res = await request(app).get('/auth/register');
        expect(res.status).toBe(200);
        expect(res.text).toContain('Crear Cuenta');
    });

    test('POST /auth/login - Debe rechazar credenciales inválidas', async () => {
        const res = await request(app)
            .post('/auth/login')
            .send({ email: 'fake@test.com', password: 'wrongpassword' });
        expect([302, 401]).toContain(res.status);
    });
});

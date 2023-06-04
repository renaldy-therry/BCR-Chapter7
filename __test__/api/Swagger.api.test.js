require('dotenv').config();
const request = require('supertest');
const app = require('../../app');

describe('check swagger docs', () => {
    it('it must return a swagger docs', async () => {
        let response = await request(app).get('/documentation.json');
        expect(response.statusCode).toBe(200);
    });
});

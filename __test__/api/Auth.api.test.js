require('dotenv').config();
const request = require('supertest');
const app = require('../../app');
const { AuthenticationController } = require('../../app/controllers');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User, Role } = require('../../app/models');

// Define the Class
const roleModel = Role;
const userModel = User;
const authenticationController = new AuthenticationController({
    bcrypt,
    jwt,
    roleModel,
    userModel,
});

describe('GET /v1/auth/whoami', () => {
    let token;

    const mockUser = {
        email: 'johnny@binar.co.id',
        password: '123456',
    };

    const mockNewUser = {
        name: 'morgan',
        email: 'morgan@gmail.co.id',
        password: '123456',
    };

    const mockUnregisteredUser = {
        id: 12,
        name: 'jamal',
        email: 'jamal@gmail.com',
        image: 'jamal.jpeg.org',
    };

    const mockRole = {
        id: 1,
        name: 'CUSTOMER',
    };

    const mockInvalidRole = {
        id: 1,
        name: 'HEHEHE',
    };

    describe('Checking user info by logged user', () => {
        beforeAll(async () => {
            const response = await request(app).post('/v1/auth/login').send(mockUser);
            token = response.body.accessToken;
        });
        it('it must success get user info from user login', async () => {
            const response = await request(app)
                .get('/v1/auth/whoami')
                .set('authorization', 'Bearer ' + token);
            expect(response.statusCode).toBe(200);
        });
    });

    describe('Checking user info by registered user', () => {
        beforeAll(async () => {
            const response = await request(app).post('/v1/auth/register').send(mockNewUser);
            token = response.body.accessToken;
        });

        it('it must success get user info from user register', async () => {
            const response = await request(app)
                .get('/v1/auth/whoami')
                .set('authorization', 'Bearer ' + token);
            expect(response.statusCode).toBe(200);
        });
    });

    describe('Checking user info by unregistered user', () => {
        beforeAll(async () => {
            const accessToken = authenticationController.createTokenFromUser(mockUnregisteredUser, mockRole);
            token = accessToken;
        });
        it('it must failed because invalid user in db, therefore user must register first', async () => {
            const response = await request(app)
                .get('/v1/auth/whoami')
                .set('authorization', 'Bearer ' + token);
            expect(response.statusCode).toBe(404);
        });
    });

    describe('Checking user info by invalid role type of user', () => {
        beforeAll(async () => {
            const accessToken = authenticationController.createTokenFromUser(mockUnregisteredUser, mockInvalidRole);
            token = accessToken;
        });
        it('it must failed because invalid role type, input must be correct with role type', async () => {
            const response = await request(app)
                .get('/v1/auth/whoami')
                .set('authorization', 'Bearer ' + token);
            expect(response.body.error.message).toBe('Access forbidden!');
        });
    });
});

describe('POST /v1/auth/register', () => {
    const mockNewUser = {
        name: 'arief',
        email: 'arief@gmail.co.id',
        password: '123456',
    };

    const mockExistedUser = {
        name: 'Johnny',
        email: 'johnny@binar.co.id',
        password: '123456',
    };

    const mockInvalidUserInput = {
        name: 'Johnny',
        email: { email: 'johnny@binar.co.id' },
        password: '123456',
    };

    it('it must success register by user inputted data', async () => {
        const response = await request(app).post('/v1/auth/register').send(mockNewUser);
        expect(response.statusCode).toBe(201);
    });

    it('it must failed due to existed user account', async () => {
        const response = await request(app).post('/v1/auth/register').send(mockExistedUser);
        expect(response.statusCode).toBe(422);
    });

    it('it must failed due to invalid input user data', async () => {
        const response = await request(app).post('/v1/auth/register').send(mockInvalidUserInput);
        expect(response.statusCode).toBe(500);
    });
});

describe('POST /v1/auth/login', () => {
    const mockUser = {
        email: 'johnny@binar.co.id',
        password: '123456',
    };

    const mockUnregisteredUser = {
        email: 'unyin@binar.co.id',
        password: '123456',
    };

    const mockWrongPasswordUser = {
        email: 'johnny@binar.co.id',
        password: '123456HEHE',
    };

    const mockInvalidInputUser = {
        email: { email: 'johnny@binar.co.id' },
        password: '654321',
    };

    it('it must success login by user inputted data', async () => {
        const response = await request(app).post('/v1/auth/login').send(mockUser);
        expect(response.statusCode).toBe(201);
    });

    it('it must failed due to unregistered account', async () => {
        const response = await request(app).post('/v1/auth/login').send(mockUnregisteredUser);
        expect(response.statusCode).toBe(404);
    });

    it('it must failed due to user wrong input password', async () => {
        const response = await request(app).post('/v1/auth/login').send(mockWrongPasswordUser);
        expect(response.statusCode).toBe(401);
    });

    it('it must failed due to invalid user inputted data', async () => {
        const response = await request(app).post('/v1/auth/login').send(mockInvalidInputUser);
        expect(response.statusCode).toBe(500);
    });
});

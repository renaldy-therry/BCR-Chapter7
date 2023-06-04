require('dotenv').config();
const request = require('supertest');
const app = require('../../app');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const dayjs = require('dayjs');

const { AuthenticationController, CarController } = require('../../app/controllers');

const { User, Role, Car, UserCar } = require('../../app/models');

//Class Constructor variable
const roleModel = Role;
const userModel = User;
const carModel = Car;
const userCarModel = UserCar;

//Define Class
const authenticationController = new AuthenticationController({
    bcrypt,
    jwt,
    roleModel,
    userModel,
});

const carController = new CarController({ carModel, userCarModel, dayjs });

// Global Func
const getRole = async (role) => {
    return await authenticationController.roleModel.findOne({
        where: { name: authenticationController.accessControl[role] },
    });
};

const generateUser = async (mockData, role) => {
    return await authenticationController.userModel.create({
        name: mockData.name,
        email: mockData.email,
        encryptedPassword: authenticationController.encryptPassword(mockData.password),
        roleId: role.id,
    });
};

const generateCar = async (mockData) => {
    return await carController.carModel.create({
        name: mockData.name,
        price: mockData.price,
        image: mockData.image,
        size: mockData.image,
        isCurrentlyRented: false,
    });
};

describe('GET /v1/cars', () => {
    it('it must success get list of a car', async () => {
        const response = await request(app).get('/v1/cars');
        expect(response.statusCode).toBe(200);
    });
});

describe('GET /v1/cars/:id', () => {
    let idCar = 1;

    it('it must success get car by id', async () => {
        const response = await request(app).get(`/v1/cars/${idCar}`);
        expect(response.statusCode).toBe(200);
    });
});

describe('POST /v1/cars', () => {
    let token;

    const mockAdmin = {
        name: 'morgan',
        email: 'morgan@gmail.com',
        password: '123456',
    };

    const mockCar = {
        name: 'string',
        price: 0,
        image: 'string',
        size: 'string',
    };

    const mockInvalidCar = {
        name: ['test'],
        price: 0,
        image: {
            hehe: 'hehe',
        },
        size: 'string',
    };

    beforeAll(async () => {
        const adminRole = await getRole('ADMIN');
        const user = await generateUser(mockAdmin, adminRole);
        const accessToken = authenticationController.createTokenFromUser(user, adminRole);
        token = accessToken;
    });

    it('it must success add a car', async () => {
        const response = await request(app).post('/v1/cars').set('Authorization', `Bearer ${token}`).send(mockCar);
        expect(response.statusCode).toBe(201);
    });

    it('it must failed add a car due to invalid input data', async () => {
        const response = await request(app).post('/v1/cars').set('Authorization', `Bearer ${token}`).send(mockInvalidCar);
        expect(response.statusCode).toBe(422);
    });
});

describe('POST /v1/cars/:id/rent', () => {
    let token1, token2;

    const user1 = {
        email: 'johnny@binar.co.id',
        password: '123456',
    };

    const user2 = {
        email: 'brian@binar.co.id',
        password: '123456',
    };

    const rentTime = {
        rentStartedAt: '2023-05-30T13:36:40.143Z',
        rentEndedAt: '2023-05-30T13:36:40.143Z',
    };
    const rentTimeWithoutEndedTime = {
        rentStartedAt: '2023-05-30T13:36:40.143Z',
    };

    beforeAll(async () => {
        const response1 = await request(app).post('/v1/auth/login').send(user1);
        const response2 = await request(app).post('/v1/auth/login').send(user2);
        token1 = response1.body.accessToken;
        token2 = response2.body.accessToken;
    });

    it('it must success rent a car', async () => {
        const response = await request(app).post('/v1/cars/1/rent').set('Authorization', `Bearer ${token1}`).send(rentTime);
        expect(response.statusCode).toBe(201);
    });

    it('it must success rent a car even though rentEndedAt is not set', async () => {
        const response = await request(app).post('/v1/cars/2/rent').set('Authorization', `Bearer ${token2}`).send(rentTimeWithoutEndedTime);
        expect(response.statusCode).toBe(201);
    });

    it('it must failed due to car has been rented', async () => {
        const response = await request(app).post('/v1/cars/1/rent').set('Authorization', `Bearer ${token1}`).send(rentTime);
        expect(response.statusCode).toBe(422);
    });

    it('it must failed due to car not found', async () => {
        const response = await request(app).post('/v1/cars/1000/rent').set('Authorization', `Bearer ${token1}`).send(rentTime);
        expect(response.statusCode).toBe(500);
    });
});

describe('PUT /v1/cars/:id', () => {
    let car, token;

    const mockCreateCar = {
        name: 'string',
        price: 0,
        image: 'string',
        size: 'string',
        isCurrentlyRented: false,
    };

    const mockAdmin = {
        name: 'morgan',
        email: 'morgan@gmail.com',
        password: '123456',
    };

    const mockUpdateCar = {
        name: 'string neww',
        price: 0,
        image: 'string.png',
        size: 'string',
    };

    const mockInvalidUpdateCar = {
        name: ['string neww'],
        price: {
            price: 0,
        },
        image: 'string.png',
        size: 'string',
    };

    beforeAll(async () => {
        const adminRole = await getRole('ADMIN');
        const user = await generateUser(mockAdmin, adminRole);
        const accessToken = authenticationController.createTokenFromUser(user, adminRole);
        token = accessToken;
        car = await generateCar(mockCreateCar);
    });

    it('it must success update a car', async () => {
        const response = await request(app).put(`/v1/cars/${car.id}`).set('Authorization', `Bearer ${token}`).send(mockUpdateCar);
        expect(response.statusCode).toBe(200);
    });

    it('it must failed update a car because invalid input data', async () => {
        const response = await request(app).put(`/v1/cars/${car.id}`).set('Authorization', `Bearer ${token}`).send(mockInvalidUpdateCar);
        expect(response.statusCode).toBe(422);
    });
});

describe('Delete /v1/cars/:id', () => {
    let token, car;

    const mockCreateCar = {
        name: 'string',
        price: 0,
        image: 'string',
        size: 'string',
        isCurrentlyRented: false,
    };
    const mockAdmin = {
        name: 'jamal',
        email: 'jamal@gmail.com',
        password: '1234567',
    };

    beforeAll(async () => {
        const adminRole = await getRole('ADMIN');
        const user = await generateUser(mockAdmin, adminRole);
        const accessToken = authenticationController.createTokenFromUser(user, adminRole);
        token = accessToken;
        car = await generateCar(mockCreateCar);
    });

    it('it must success delete a car', async () => {
        const response = await request(app).delete(`/v1/cars/${car.id}`).set('Authorization', `Bearer ${token}`);
        expect(response.statusCode).toBe(204);
    });
});

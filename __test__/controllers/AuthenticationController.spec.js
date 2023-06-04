const { AuthenticationController } = require('../../app/controllers');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User, Role } = require('../../app/models');

const roleModel = Role;
const userModel = User;

const authenticationController = new AuthenticationController({
    bcrypt,
    jwt,
    roleModel,
    userModel,
});

describe('Check token diff between login and autorize token', () => {
    let token;

    const dummyAdmin = {
        id: 10,
        name: 'udin',
        email: 'udin@gmail.com',
        image: 'string',
    };

    const roleMock = {
        id: 1,
        name: 'Customer',
    };

    const mockReq = {
        headers: {
            authorization: 'Bearer ' + token,
        },
    };

    const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
    };

    const mockNext = jest.fn();

    beforeAll(() => {
        const accessToken = authenticationController.createTokenFromUser(dummyAdmin, roleMock);
        token = accessToken;
    });

    it('it must be failed due to diff between  login token  and authorize token', () => {
        const authorize = authenticationController.authorize('CUSTOMER');
        authorize(mockReq, mockRes, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(401);
    });
});

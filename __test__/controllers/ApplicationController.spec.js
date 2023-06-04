const { ApplicationController } = require('../../app/controllers');

const applicationController = new ApplicationController();

describe('Initial API Run', () => {
    const mockReq = {};
    const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
    };

    it('it must success because api is not crash', () => {
        applicationController.handleGetRoot(mockReq, mockRes);
        expect(mockRes.status).toHaveBeenCalledWith(200);
    });
});

describe('Handling Route not found', () => {
    const mockReq = {
        method: 'POST',
        url: 'https://arief/cars',
    };

    const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
    };

    it('it must failed due to route not same with api docs', () => {
        applicationController.handleNotFound(mockReq, mockRes);
        expect(mockRes.status).toHaveBeenCalledWith(404);
    });
});

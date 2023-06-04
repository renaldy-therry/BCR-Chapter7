const { JWT_SIGNATURE_KEY, MORGAN_FORMAT } = require('../../config/application');

describe('check application format', () => {
    it('it must have suitable morgan format with the project', () => {
        expect(MORGAN_FORMAT).toBe(':method :url :status :res[content-length] - :response-time ms');
    });
    it('it must have jwt signature key or error handling for that', () => {
        expect(JWT_SIGNATURE_KEY).toBe('Rahasia');
    });
});

const {assert, requester} = require('./set_up');

describe('test log in wrong password', () => {
    it('log in', async () => {
        const user = {
            email: 'shelly@e',
            password: 'shelly'
        };
        const res = await requester
            .post('/user/signin')
            .send(user);
        const data = res.data;
        const resExpect = "Wrong password!";
        assert.strictEqual(data, resExpect);
    });
});
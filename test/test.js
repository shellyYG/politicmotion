const {assert, requester} = require('./set_up');

describe('log in test!', () => {
    it('log in test here la', async () => {
        const user = {
            email: 'shelly@e',
            password: 'shelly'
        };
        const res = await requester
            .post('/user/signIn')
            .send(user);

        data = res.body.data.access_token; // need to say "body". different from original res.data.data.access_token
        const resExpect = "It would be a token!";
        console.log("data is: ", data);
        assert.strictEqual(typeof(data), typeof(resExpect));
    });
});
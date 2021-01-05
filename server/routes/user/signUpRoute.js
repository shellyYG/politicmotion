const router = require('express').Router();
const { wrapAsync } = require('../../../util/util');

const {
    signUp 
} = require('../../controllers/user/signUpController');

router.route('/user/signup')
    .post(wrapAsync(signUp));

module.exports = router;
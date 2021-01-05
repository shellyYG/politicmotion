const router = require('express').Router();
const { wrapAsync } = require('../../../util/util');
const { verifyToken } = require('../../../util/util');

const {
    getUserEmotion 
} = require('../../controllers/user/userEmotionController');

router.route('/calUserEmotion')
    .post(verifyToken, wrapAsync(getUserEmotion));

module.exports = router;
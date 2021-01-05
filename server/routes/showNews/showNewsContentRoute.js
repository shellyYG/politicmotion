const router = require('express').Router();
const { wrapAsync } = require('../../../util/util');

const {
    showNews 
} = require('../../controllers/showNews/showNewsContentController');

router.route('/showNewsContent')
    .post(wrapAsync(showNews));

module.exports = router;
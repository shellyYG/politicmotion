const router = require("express").Router();
const { wrapAsync } = require("../../../util/util");

const {
    showLatestNews 
} = require("../../controllers/showNews/showLatestNewsController");

router.route("/latestNews")
    .post(wrapAsync(showLatestNews));

module.exports = router;
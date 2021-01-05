const router = require("express").Router();
const { wrapAsync } = require("../../../util/util");
const { verifyToken } = require("../../../util/util");

const {
    showbuddies 
} = require("../../controllers/user/findBuddiesController");

router.route("/findBuddies")
    .post(verifyToken, wrapAsync(showbuddies));

module.exports = router;
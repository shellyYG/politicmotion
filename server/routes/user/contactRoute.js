const router = require("express").Router();
const { wrapAsync } = require("../../../util/util");

const {
    sendEmail 
} = require("../../controllers/user/contactController");

router.route("/user/contact")
    .post(wrapAsync(sendEmail));

module.exports = router;
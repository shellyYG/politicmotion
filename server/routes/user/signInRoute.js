const router = require("express").Router();
const { wrapAsync } = require("../../../util/util");

const {
    signIn 
} = require("../../controllers/user/signInController");

router.route("/user/signin")
    .post(wrapAsync(signIn));

module.exports = router;
const router = require("express").Router();
const { wrapAsync } = require("../../../util/util");

const {
    searchNews 
} = require("../../controllers/showNews/searchController");

router.route("/searchNews")
    .post(wrapAsync(searchNews));

module.exports = router;

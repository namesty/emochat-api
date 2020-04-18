var express = require("express");
var router = express.Router();

router.use("/signup", require("./signup"))
router.use("/login", require("./login"))

module.exports = router;
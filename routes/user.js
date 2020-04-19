var express = require("express");
const User = require('../models/User')
var router = express.Router();

router.get("/", async (req, res) => {

  const users = await User.find({}, { password: 0, date: 0, __v: 0 })

  res.status(200).json({ users })

})

module.exports = router;
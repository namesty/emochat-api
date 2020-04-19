var express = require("express");
const User = require('../models/User')
const Message = require('../models/Message')
var router = express.Router();

router.post("/", async (req, res) => {
  const { to, content } = req.body
  const toUser = await User.findOne({ email: to })

  if(!content) throw new Error("Message body cannot be empty")
  if(!toUser) throw new Error("User not found with email: " + to)

  const message = await Message.create({
    from: req.user._id,
    to: toUser._id,
    content
  })

  res.status(200).json({ message })
})

router.get("user/:id", async (req, res) => {
  const { id } = req.params

  const messagesFromMe = await Message.find({ from: req.user._id, to: id })
  const messagesToMe = await Message.find({ to: req.user._id, from: id })

  res.status(200).json({
    messagesFromMe,
    messagesToMe
  })

})

module.exports = router;
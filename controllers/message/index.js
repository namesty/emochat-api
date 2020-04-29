const Message = require('../../models/Message')
const User = require('../../models/User')

module.exports.createMessage = async (fromId, toEmail, content) => {

  const toUser = await User.findOne({ email: toEmail })
  const fromUser = await User.findById(fromId)

  if(!content) throw new Error("Message body cannot be empty")
  if(!toUser) throw new Error("User not found with email: " + toEmail)

  const message = await Message.create({
    from: fromId,
    to: toUser._id,
    content
  })

  return {
    from: fromUser.email,
    to: toEmail,
    content,
    date: message.date
  }
}
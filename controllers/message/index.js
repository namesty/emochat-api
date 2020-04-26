const Message = require('../../models/Message')
const User = require('../../models/User')

module.exports.createMessage = async (fromId, toEmail, content) => {

  const toUser = await User.findOne({ email: toEmail })

  if(!content) throw new Error("Message body cannot be empty")
  if(!toUser) throw new Error("User not found with email: " + toEmail)

  return await Message.create({
    from: fromId,
    to: toUser._id,
    content
  })
}
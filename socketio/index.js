const io = require('socket.io')(3500)
const jwt = require('jsonwebtoken')
const lodash = require('lodash')
const { createMessage } = require('../controllers/message')

let connectedUsers = []

const findBySocket = (socket, userArray) => {
  return userArray.find((user) => lodash.isEqual(user.socket, socket))
}

const findByEmail = (email, userArray) => {
  return userArray.find((user) => user.email.toString() === email)
}

io.sockets.on('connection', socket => {
  socket.emit('askForToken')
  socket.on('sendToken', (data) => {

    if(data) {

      const { email, sub: id, name, lastName } = jwt.decode(data)
      const found = findBySocket(socket, connectedUsers)

      if(!found) {

        const user = {
          id,
          name,
          lastName,
          email,
          socket
        }

        console.log("PUSHED")

        connectedUsers.push(user)
        io.sockets.emit('usersChanged', connectedUsers.map((u) => {
          return {
            id: u.id,
            name: u.name,
            lastName: u.lastName,
            email: u.email
          }
        }))
      }
    }
  })

  socket.on('newMessage', async (data) => {

    const user = findBySocket(socket, connectedUsers)
    const message = await createMessage(user.id, data.to, data.content)
    const toUser = findByEmail(data.to, connectedUsers)

    if(toUser) sendMessage(toUser.socket, message)
  })

  socket.on('disconnect', (socket) => {
    const index = connectedUsers.map(user => user.socket).indexOf(socket)

    connectedUsers.splice(index, 1)
    io.sockets.emit('usersChanged', connectedUsers.map((u) => {
      return {
        id: u.id,
        name: u.name,
        lastName: u.lastName,
        email: u.email
      }
    }))

    console.log(connectedUsers)
  })
})

const sendMessage = (socket, message) => {
  socket.emit('newMessage', message)
}
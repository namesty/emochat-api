const io = require('socket.io')(3000)
const jwt = require('jsonwebtoken')
const { createMessage } = require('../controllers/message')

const connectedUsers = []

const findBySocket = (socket, userArray) => {
  return userArray.find((user) => user.socket)
}

io.sockets.on('connection', socket => {
  socket.emit('askForToken')
  socket.on('sendToken', (data) => {

    if(data) {

      const { email, sub: id } = jwt.decode(data)

      connectedUsers.push({
        id,
        user: email,
        socket
      })

    }
  })

  socket.on('newMessage', (data) => {

    const user = findBySocket(socket, connectedUsers)

    createMessage(user.id, data.to, data.content).then((result) => {
      console.log(result)
    })
  })

  socket.on('disconnect', () => {
    connectedUsers.splice(connectedUsers.map(x => x.socket).indexOf(socket), 1)
  })
})
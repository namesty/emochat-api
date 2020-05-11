import io, { Socket } from "socket.io";
import { IUser } from "../features/user";
import lodash, { isEqual } from "lodash";
import jwt from "jsonwebtoken";
import { IMessage } from "../features/message";
import { addMessage } from '../features/conversation/controller'

//TODO: Luxon en lugar de moment
interface ConnectedUser {
  user: IUser;
  socket: Socket;
}

interface NewMessageData {
  conversationId: string,
  message: IMessage
}

//TODO: pasar el puerto a variable semantica (DotEnv)

export class ConversationSocket {

  private connectedUsers: ConnectedUser[] = []
  private server = io(3500)

  constructor() {
    this.server.sockets.on('connection', this.onConnect)
  }

  private onConnect = async (socket: Socket) => {
    socket.emit('askForToken')
    socket.on('sendToken', (data: any) => this.onSendToken(socket, data))
    socket.on('newMessage', this.onNewMessage)
    socket.on('disconnect', this.onDisconnect)
  }

  private findBySocket = (socket: Socket) => {
    return this.connectedUsers.find(u => lodash.isEqual(u.socket, socket))
  }

  private findByEmail = (email: string) => {
    return this.connectedUsers.find((u) => u.user.email.toString() === email);
  }

  private onSendToken = (socket: Socket, data: any) => {
    if(data) {
      const { email, id, name, lastName } = jwt.decode(data) as IUser;
      const found = this.findBySocket(socket);

      if (!found) {
        const connectedUser = {
          user: {
            id,
            name,
            lastName,
            email,
          },
          socket,
        }

        this.connectedUsers.push(connectedUser);
      }
    }
  }

  private onNewMessage = async (data: NewMessageData) => {
    const { conversationId, message } = data
    
    const conversation = await addMessage(conversationId, message)

    this.connectedUsers.forEach(u => {
      if(conversation.users.map(convoUser => convoUser.email).includes(u.user.email)) {
        u.socket.emit('newMessage', data)
      }
    })
  }

  private onDisconnect = (socket: Socket) => {
    this.connectedUsers = this.connectedUsers.filter((u) => !isEqual(u.socket, socket))
  }
}
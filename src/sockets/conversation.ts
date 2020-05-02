import io, { Socket } from "socket.io";
import { IUser } from "../features/user";
import lodash from "lodash";
import jwt from "jsonwebtoken";
import { IMessage } from "../features/message";
import { addMessage } from '../features/conversation/controller'

interface ConnectedUser {
  user: IUser;
  socket: Socket;
}

interface NewMessageData {
  conversationId: string,
  message: IMessage
}

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

    conversation.users.forEach(u => {
      const onlineUser = this.findByEmail(u.email)

      if(onlineUser){
        console.log('emitted')
        onlineUser.socket.emit('newMessage', data)
      }
    })
  }

  private onDisconnect = (socket: Socket) => {
    const index = this.connectedUsers.map((u) => u.socket).indexOf(socket);
    this.connectedUsers.splice(index, 1);
  }
}
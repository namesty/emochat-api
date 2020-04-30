import SocketServer, { Socket } from "socket.io";
import jwt from "jsonwebtoken";
import lodash from "lodash";
import { createMessage, IMessage } from "../features/message";
import { IUser } from "../features/user";

interface ConnectedUser {
  user: IUser;
  socket: Socket;
}

const io = SocketServer(3500);
const connectedUsers: ConnectedUser[] = [];

const findBySocket = (socket: Socket, userArray: ConnectedUser[]) => {
  return userArray.find((user) => lodash.isEqual(user.socket, socket));
};

const findByEmail = (email: string, userArray: ConnectedUser[]) => {
  return userArray.find((u) => u.user.email.toString() === email);
};

export const initialize = () => {
  io.sockets.on("connection", (socket) => {
    socket.emit("askForToken");
    socket.on("sendToken", (data) => {
      if (data) {
        const { email, id, name, lastName } = jwt.decode(data) as IUser;
        const found = findBySocket(socket, connectedUsers);

        if (!found) {
          const connectedUser = {
            user: {
              id,
              name,
              lastName,
              email,
            },
            socket,
          };

          connectedUsers.push(connectedUser);

          io.sockets.emit(
            "usersChanged",
            connectedUsers.map((u) => u.user)
          );
        }
      }
    });

    socket.on(
      "newMessage",
      async (data: { toEmail: string; content: string }) => {
        const connectedUser = findBySocket(socket, connectedUsers);
        const message = await createMessage({
          fromId: connectedUser.user.id,
          toEmail: data.toEmail,
          content: data.content,
        });
        const toUser = findByEmail(data.toEmail, connectedUsers);

        if (toUser) sendMessage(toUser.socket, message);
      }
    );

    socket.on("disconnect", (socket) => {
      const index = connectedUsers.map((user) => user.socket).indexOf(socket);

      connectedUsers.splice(index, 1);
      io.sockets.emit(
        "usersChanged",
        connectedUsers.map((u) => u.user)
      );

      console.log(connectedUsers);
    });
  });
};

const sendMessage = (socket: Socket, message: IMessage) => {
  socket.emit("newMessage", message);
};

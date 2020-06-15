import io from "socket.io-client";
import axios from "axios";
import { MongooseUser, User } from "../../features/user";
import { IConversation, Conversation } from "../../features/conversation/model";

describe("Chat Socket", () => {
  let testUser: MongooseUser,
    testUser2: MongooseUser,
    conversationsCreated: IConversation[] = [];

  beforeAll(async () => {
    require("../../../");
    testUser = await User.findOne({ email: process.env.TEST_USER_EMAIL });
    testUser2 = await User.findOne({ email: process.env.TEST_USER2_EMAIL });
  });

  afterAll(async () => {
    await Promise.all(
      conversationsCreated.map(async (c) => {
        await Conversation.findByIdAndDelete(c.id).exec();
      })
    );
  });

  it("Sends a message", async () => {
    const { data } = await axios.post(
      "http://localhost:" + process.env.REST_API + "/auth/login/"
    );

    console.log(data)

    // const socket = io("http//localhost:" + process.env.WS_PORT);
    // socket.on("askForToken", () => {
    //   socket.emit("sendToken", authData.token);
    // });
  });
});

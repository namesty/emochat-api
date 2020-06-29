import mongoose from 'mongoose'
import { User, MongooseUser, userMapper } from "../../user";
import {
  createConversation,
  deleteConversation,
  getConversations,
  addMessage,
} from "../controller";
import { IConversation, Conversation } from "../model";
import setupServer from "../../../";
import { Server } from "http";

describe("Conversation", () => {
  let testUser: MongooseUser,
    testUser2: MongooseUser,
    testUser3: MongooseUser,
    conversationsCreated: IConversation[] = [];
  let server: Server

  beforeAll((done) => {
    server = setupServer(done)
  });

  beforeEach(async () => {
    testUser = await User.findOne({ email: process.env.TEST_USER_EMAIL });
    testUser2 = await User.findOne({ email: process.env.TEST_USER2_EMAIL });
    testUser3 = await User.findOne({ email: process.env.TEST_USER3_EMAIL });
  })

  afterEach(async () => {
    await Promise.all(
      conversationsCreated.map(async (c) => {
        await Conversation.findByIdAndDelete(c.id);
      })
    );
  });

  afterAll(async (done) => {
    await mongoose.disconnect()
    server.close(done)
  })

  it("creates a new 2 people chat", async () => {
    const actual = await createConversation([testUser.id, testUser2.id]);

    expect(actual).toBeDefined();
    expect(actual.active).toBeTruthy();
    expect(actual.users[0].id).toEqual(testUser.id);
    expect(actual.users[1].id).toEqual(testUser2.id);

    conversationsCreated.push(actual);
  });

  it("throws if conversation is created with only 1 user", async () => {
    expect(createConversation([testUser.id])).rejects.toThrow(
      /At least two user IDs must be provided to create a conversation/i
    );
  });

  it("creates a new group chat", async () => {
    const actual = await createConversation([
      testUser.id,
      testUser2.id,
      testUser3.id,
    ]);

    expect(actual).toBeDefined();
    expect(actual.active).toBeTruthy();
    expect(actual.users[0].id).toEqual(testUser.id);
    expect(actual.users[1].id).toEqual(testUser2.id);
    expect(actual.users[2].id).toEqual(testUser3.id);

    conversationsCreated.push(actual);
  });

  it("soft deletes an existing conversation", async () => {
    const conversation = await createConversation([testUser.id, testUser2.id]);
    await deleteConversation(conversation.id);

    const actual = await Conversation.findById(conversation.id);

    expect(actual).toBeDefined();
    expect(actual.active).toBe(false);

    conversationsCreated.push(conversation);
  });

  it("gets conversations of a specific user", async () => {
    const conversation = await createConversation([testUser.id, testUser2.id]);

    const actual = await getConversations(testUser.id);
    const actual2 = await getConversations(testUser2.id);

    expect(actual).toBeDefined();
    expect(actual.length).toBe(1);
    expect(actual2).toBeDefined();
    expect(actual).toEqual(actual2);
    expect(actual[0].users[0].id).toEqual(testUser.id);
    expect(actual[0].users[1].id).toEqual(testUser2.id);

    conversationsCreated.push(conversation);
  });

  it("adds a new message to an existing conversation", async () => {
    const conversation = await createConversation([testUser.id, testUser2.id]);
    const actual = await addMessage(conversation.id, {
      id: "",
      date: "1591142997470",
      from: userMapper(testUser),
      content: "I am feeling really sad today",
    });

    expect(actual.messages.length).toBeGreaterThan(0);
    expect(actual.messages[0].from).toEqual(userMapper(testUser));
    expect(actual.messages[0].content).toEqual("I am feeling really sad today");
    expect(actual.messages[0].date).toEqual("1591142997470");
    expect(actual.messages[0].id.length).toBeGreaterThan(0);

    conversationsCreated.push(conversation);
  });

  it("throws if message content is empty", async () => {
    const conversation = await createConversation([testUser.id, testUser2.id]);
    expect(
      addMessage(conversation.id, {
        id: "",
        date: "1591142997470",
        from: userMapper(testUser),
        content: "",
      })
    ).rejects.toThrow(/Message sender ID or content not found/i);

    conversationsCreated.push(conversation);
  });
});

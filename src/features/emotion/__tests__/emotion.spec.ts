import { User, MongooseUser, userMapper, IUser } from '../../user'
import { IConversation, Conversation } from '../../conversation/model'
import { createConversation, addMessage } from '../../conversation/controller'
import { analyzeLastNMessages } from '../controller'
import setupServer from "../../../";
import mongoose from "mongoose"
import { Server } from 'http';
import { ConversationSocket } from '../../../sockets/conversation';

describe("Conversation", () => {

  let testUser: MongooseUser,
    testUser2: MongooseUser,
    conversationsCreated: IConversation[] = []
  let conversationSocket = new ConversationSocket()
  let server: Server

  beforeAll((done) => {
    server = setupServer(done)
  })

  beforeEach(async () => {
    testUser = await User.findOne({ email: process.env.TEST_USER_EMAIL })
    testUser2 = await User.findOne({ email: process.env.TEST_USER2_EMAIL })
  })

  afterAll(async (done) => {
    await Promise.all(
      conversationsCreated.map(async (c) => {
        await Conversation.findByIdAndDelete(c.id).exec()
      })
    )
    await mongoose.disconnect()
    conversationSocket.disconnect()
    server.close(done)
  })

  it('analyzes last 2 messages', async done => {
    const conversation = await createConversation([testUser.id, testUser2.id])
    await addMessage(conversation.id, {
      id: '',
      date: '1591142997470',
      from: userMapper(testUser),
      content: 'I am feeling really sad today'
    })

    await addMessage(conversation.id, {
      id: '',
      date: '1591142997470',
      from: userMapper(testUser),
      content: 'I am not feeling well at all'
    })

    const emotions = await analyzeLastNMessages(2, conversation.id)

    expect(emotions.length).toEqual(1)
    expect((emotions[0].user as IUser).id).toEqual(testUser.id)
    expect(emotions[0].Sad).toBeGreaterThan(0)

    conversationsCreated.push(conversation)
    done()
  })

  it('Throws if n < 1', async done => {
    const conversation = await createConversation([testUser.id, testUser2.id])
    await addMessage(conversation.id, {
      id: '',
      date: '1591142997470',
      from: userMapper(testUser),
      content: 'I am feeling really sad today'
    })

    expect(analyzeLastNMessages(0, conversation.id)).rejects.toThrow(
      /N must be a natural number/i
    )

    conversationsCreated.push(conversation)
    done()
  })

  it('Sadness is the predominant emotion read from a sad message', async done => {
    const conversation = await createConversation([testUser.id, testUser2.id])
    await addMessage(conversation.id, {
      id: '',
      date: '1591142997470',
      from: userMapper(testUser),
      content: 'I am feeling really sad today'
    })

    const emotions = await analyzeLastNMessages(1, conversation.id)

    expect(emotions[0].Sad).toBeGreaterThan(0)
    expect(emotions[0].Sad).toBeGreaterThan(emotions[0].Angry)
    expect(emotions[0].Sad).toBeGreaterThan(emotions[0].Happy)
    expect(emotions[0].Sad).toBeGreaterThan(emotions[0].Excited)
    expect(emotions[0].Sad).toBeGreaterThan(emotions[0].Fear)
    expect(emotions[0].Sad).toBeGreaterThan(emotions[0].Bored)

    conversationsCreated.push(conversation)
    done()
  })
})
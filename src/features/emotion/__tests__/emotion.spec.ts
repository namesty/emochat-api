import { User, MongooseUser, userMapper, IUser } from '../../user'
import { IConversation, Conversation } from '../../conversation/model'
import { createConversation, addMessage } from '../../conversation/controller'
import { analyzeLastNMessages } from '../controller'

jest.setTimeout(20000)

describe("Conversation", () => {

  let testUser: MongooseUser,
    testUser2: MongooseUser,
    conversationsCreated: IConversation[] = []

  beforeAll(async () => {
    require('../../../')
    testUser = await User.findOne({ email: process.env.TEST_USER_EMAIL })
    testUser2 = await User.findOne({ email: process.env.TEST_USER2_EMAIL })
  })

  afterAll(async () => {
    await Promise.all(
      conversationsCreated.map(async (c) => {
        await Conversation.findByIdAndDelete(c.id).exec()
      })
    )
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
})
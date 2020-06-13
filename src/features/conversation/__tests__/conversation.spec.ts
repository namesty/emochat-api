import { User, MongooseUser } from '../../user'
import { createConversation, deleteConversation, getConversations } from '../controller'
import { IConversation, Conversation } from '../model'

jest.setTimeout(20000)

describe("Conversation", () => {

  let testUser: MongooseUser,
    testUser2: MongooseUser,
    testUser3: MongooseUser,
    conversationsCreated: IConversation[] = []

  beforeAll(async () => {
    require('../../../')
    testUser = await User.findOne({ email: process.env.TEST_USER_EMAIL })
    testUser2 = await User.findOne({ email: process.env.TEST_USER2_EMAIL })
    testUser3 = await User.findOne({ email: process.env.TEST_USER3_EMAIL })
  })

  afterEach(async () => {
    await Promise.all(
      conversationsCreated.map(async (c) => {
        await Conversation.findByIdAndDelete(c.id)
      })
    )
  })

  it('creates a new 2 people chat', async () => {
    const actual = await createConversation([testUser.id, testUser2.id])

    expect(actual).toBeDefined()
    expect(actual.active).toBeTruthy()
    expect(actual.users[0].id).toEqual(testUser.id)
    expect(actual.users[1].id).toEqual(testUser2.id)

    conversationsCreated.push(actual)
  })

  it('creates a new group chat', async () => {
    const actual = await createConversation([testUser.id, testUser2.id, testUser3.id])

    expect(actual).toBeDefined()
    expect(actual.active).toBeTruthy()
    expect(actual.users[0].id).toEqual(testUser.id)
    expect(actual.users[1].id).toEqual(testUser2.id)
    expect(actual.users[2].id).toEqual(testUser3.id)

    conversationsCreated.push(actual)
  })

  it('soft deletes an existing conversation', async () => {
    const conversation = await createConversation([testUser.id, testUser2.id])
    await deleteConversation(conversation.id)

    const actual = await Conversation.findById(conversation.id)

    expect(actual).toBeDefined()
    expect(actual.active).toBe(false)

    conversationsCreated.push(conversation)
  })

  it('gets conversations of a specific user', async () => {
    const conversation = await createConversation([testUser.id, testUser2.id])

    const actual = await getConversations(testUser.id)
    const actual2 = await getConversations(testUser2.id)

    expect(actual).toBeDefined()
    expect(actual.length).toBe(1)
    expect(actual2).toBeDefined()
    expect(actual).toEqual(actual2)
    expect(actual[0].users[0].id).toEqual(testUser.id)
    expect(actual[0].users[1].id).toEqual(testUser2.id)

    conversationsCreated.push(conversation)
  })
})
import { findAllUsers, findUser } from "../controller"
import { User } from "../model"

describe("User", () => {

  beforeAll(() => {
    require('../../../')
  })

  it('Gets list of all users', async () => {
    const users = await findAllUsers()

    expect(users.length).toBeGreaterThan(0)
    expect(users[0].email.length).toBeGreaterThan(0)
  })

  it('Finds specific user by id', async () => {
    const email = process.env.TEST_USER_EMAIL
    const id = (await User.findOne({ email }).exec()).id
    const user = await findUser(id)

    expect(user.email.length).toBeGreaterThan(0)
    expect(user.password).toBeUndefined()
  })
})
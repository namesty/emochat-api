import { IUser, User } from "../../user";
import { signup } from '../signup'

describe("Conversation", () => {

  let usersCreated: IUser[] = []

  beforeAll(async () => {
    require("../../../");
  });

  afterEach(async () => {
    await Promise.all(
      usersCreated.map(async (c) => {
        await User.findByIdAndDelete(c.id);
      })
    );
  });

  it('Creates user', async () => {
    const user = await signup({
      email: 'testSignup@test.com',
      lastName: 'Test',
      name: 'Test',
      password: '12345678'
    })

    expect(user.email).toEqual('testSignup@test.com')
    expect(user.name).toEqual('Test')
    expect(user.lastName).toEqual('Test')

    usersCreated.push(user)
  })

  it('Throws if email is already taken', async () => {
    expect(signup({
      email: process.env.TEST_USER_EMAIL,
      lastName: 'Test',
      name: 'Test',
      password: '12345678'
    })).rejects.toThrow(/Email is already taken/i)
  })

});

import mongoose from 'mongoose'
import { IUser, User } from "../../user";
import { signup } from '../signup'
import setupServer from "../../../";
import { Server } from "http";

describe("Conversation", () => {

  let usersCreated: IUser[] = []

  let server: Server

  beforeAll((done) => {
    server = setupServer(done)
  })

  afterEach(async () => {
    await Promise.all(
      usersCreated.map(async (c) => {
        await User.findByIdAndDelete(c.id);
      })
    );
  });

  afterAll(async (done) => {
    await mongoose.disconnect()
    server.close(done)
  })

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

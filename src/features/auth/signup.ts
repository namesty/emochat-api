import express from "express";
import bcrypt from "bcryptjs";
import { User, userMapper } from "../user";
import { CustomError } from "../../errors";

const router = express.Router();

interface SignupParams {
  lastName: string;
  password: string;
  email: string;
  name: string;
}

export const signup = async (params: SignupParams) => {
  const { lastName, password, email, name } = params;

  const user = await User.findOne({ email });
  if (user) throw new CustomError("BadParameters", "Email is already taken");

  const hashPass = bcrypt.hashSync(password, 10);
  const mongooseUser = new User({ lastName, password: hashPass, email, name });

  return await mongooseUser.save();
};

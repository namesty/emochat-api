import express from 'express'
import { findAllUsers } from './controller';

const router = express.Router()

router.get("/", async (req, res) => {

  const users = await findAllUsers()

  res.status(200).json(users)

});

export { router }
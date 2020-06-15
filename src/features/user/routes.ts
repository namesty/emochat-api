import express from 'express'
import { findAllUsers } from './controller';
import { CustomError } from '../../errors';

const router = express.Router()

router.get("/", async (req, res) => {

  try{
    const users = await findAllUsers()

    res.status(200).json(users)
  } catch(e) {
    console.log(e.stack)

    if(e instanceof CustomError) {
      res.status(e.code).json(e.clientMessage)
    } else {
      res.status(500).json('Internal server error')
    }
  }

});

export { router }
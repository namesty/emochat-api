import express from "express"
import { router as LoginRouter } from './login'
import { signup } from './signup'
import { CustomError } from "../../errors";

const router = express.Router();

router.use("/login", LoginRouter)
router.post("/signup", async (req, res) => {
  try {

    const user = await signup(req.body)

    res.json(user)
  } catch(e) {
    console.log(e.stack)

    if(e instanceof CustomError) {
      res.status(e.code).json(e.clientMessage)
    } else {
      res.status(500).json('Internal server error')
    }
  }
})

export { router }
import express from "express"
import { router as LoginRouter } from './login'
import { router as SignupRouter } from './signup'

const router = express.Router();

router.use("/login", LoginRouter)
router.use("/signup", SignupRouter)

export { router }
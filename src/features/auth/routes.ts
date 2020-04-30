import express from "express"
import { router as LoginRouter } from './login'
import { router as SignupRouter } from './signup'

const router = express.Router();

router.use("/signup", LoginRouter)
router.use("/login", SignupRouter)

export { router }
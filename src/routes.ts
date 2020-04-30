import express from 'express'
import { isAutenticated } from './middlewares/isAuthenticated';
import { router as UserRouter } from './features/user'
import { router as MessageRouter } from './features/message'

const router = express.Router()

router.use("/user", isAutenticated, UserRouter)
router.use("/message", isAutenticated, MessageRouter);

export { router }
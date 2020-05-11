import express from 'express'
import { isAutenticated } from './middlewares/isAuthenticated';
import { router as UserRouter } from './features/user'
import { router as ConversationRouter } from './features/conversation/routes'
import { router as EmotionRouter } from './features/emotion/routes'

const router = express.Router()

router.use("/user", isAutenticated, UserRouter)
router.use("/conversation", isAutenticated, ConversationRouter)
router.use("/emotion", isAutenticated, EmotionRouter)

export { router }
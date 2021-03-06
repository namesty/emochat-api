
import express from "express"
import mongoose from "mongoose"
import dotenv from 'dotenv'
dotenv.config()
import passport from "passport"
import { Strategy as LocalStrategy } from "passport-local"
import { Strategy as JwtStrategy } from "passport-jwt"
import { ExtractJwt } from "passport-jwt"
import bcrypt from "bcryptjs"
import cors from 'cors'
import swaggerUi from 'swagger-ui-express'
import { ConversationSocket } from './sockets/conversation'
import { User } from "./features/user"
import { uri } from './config/db'
import { router as MainRouter } from './routes'
import { router as AuthRouter } from './features/auth/routes'
import swaggerJSDoc from "swagger-jsdoc"

const swaggerDefinition = {
  info: {
    title: 'Emochat API',
    description: 'Emochat API Information',
    version: '1.0.0'
  },
  securityDefinitions: {
    bearerAuth: {
      type: 'apiKey',
      name: 'Authorization',
      scheme: 'bearer',
      in: 'header',
    },
  },
}

const swaggerDocs = swaggerJSDoc({
  swaggerDefinition,
  apis: [
    'src/features/**/routes.ts',
    'src/features/**/model.ts'
  ]
})

const app = express();

app.use(cors({ origin: '*'}))
app.use(passport.initialize());
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs))

passport.use(
  new LocalStrategy(  {
  
    usernameField: "email",
    passwordField: "password",
    session: false
  }, async (email, password, next) => {
    try {
      const user = await User.findOne({ email });

      if (!user) next(null, false, { message: "User does not exist" });

      if (!bcrypt.compareSync(password, user.password))
        next(null, false, { message: "Invalid password" });

      next(null, user);
    } catch (error) {

      next(error);
    }
  })
);

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET
};


passport.use(
  new JwtStrategy(opts, async (tokenPayload, next) => {

    try {
      const user = await User.findOne({ _id: tokenPayload.sub });

      if (!user) next(null, false, { message: "invalid token" });

      next(null, user);
    } catch (error) {
      next(error);
    }
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(passport.initialize())

app.use('/', MainRouter)
app.use('/auth', AuthRouter)

const PORT = process.env.PORT || process.env.REST_PORT

const server = (callback?: () => any) => app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology:true })
  .then(() => {
    console.log('Connected to Mongo Atlas')
    if(callback) callback()
  })
  .catch(err => {
    throw new Error(err)
  })
})

if(process.env.MODE !== 'test') {
  const expressServer = server()
  new ConversationSocket(expressServer)
}

export default server

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
import { ConversationSocket } from './sockets/conversation'
import { User } from "./features/user"
import { uri } from './config/db'
import { router as MainRouter } from './routes'
import { router as AuthRouter } from './features/auth/routes'

const app = express();
const conversationHandler = new ConversationSocket()

app.use(cors({ origin: '*'}))
app.use(passport.initialize());

passport.use(
// La estrategía local recibe un primer parametro de configuración y un callback de verificación como segundo parametro
  new LocalStrategy(  {
    // Los campos usernameField y passwordField, servirán para definir
    // el nombre de los atributos por los que encontraremos y comprobaremos al usuario
    usernameField: "email",
    passwordField: "password",
    // Dado que no haremos uso de sesiones, es necesaria especificarlo en las distintas estrategias poniendolo a false.
    session: false
  }, async (email, password, next) => {
    console.log(`Estrategia local. Información recibida: email ${email}, password${password}`)
    try {
      // Buscamos el usuario a travñes del email
      const user = await User.findOne({ email });


      /*Si no hay usuario enviamos ejecutamos next con el primer parametro (error) a null, el segundo parametro
       (data, en este caso usuario) a false y el tercer parametro (info) con el mensaje de error*/
      if (!user) next(null, false, { message: "El usuario no existe" });

      // comprobamos la contraseña y procedemos igual que si no hay usuario
      if (!bcrypt.compareSync(password, user.password))
        next(null, false, { message: "la contraseña no es correcta" });

      // Si el usuario existe y la contraseña es correcta, lo enviamos como segundo parametro de la función next.
      next(null, user);
    } catch (error) {

      // Si hay un error, lo envíamos como primer parametro de la función next.
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
    console.log(`Estrategia jwt. Información recibida: token ${tokenPayload}`)

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

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology:true })
.then(() => {
  console.log('Connected to Mongo Atlas')
})
.catch(err => {
  throw new Error(err)
})

app.use('/', MainRouter)
app.use('/auth', AuthRouter)

const PORT = 5000 || process.env.PORT

app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
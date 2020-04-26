require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose")
const User = require("./models/User");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const bcrypt = require("bcryptjs");
const cors = require('cors')
require('./socketio')

const uri = require('./config/db')

const app = express();

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

      //Si hay un error, lo envíamos como primer parametro de la función next.
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

app.use('/', require('./routes/index'))
app.use('/auth', require('./routes/auth'))

const PORT = 5000 || process.env.PORT

app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
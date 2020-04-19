var express = require("express");
var router = express.Router();
const passport = require("passport");

const isAutenticated = (req, res, next) => {

  passport.authenticate("jwt", { session: false }, (error, user, info) => {
    console.log(`Autenticación de estrategia jwt. Información recibida: error: ${error}, user: ${user}, info: ${info}`)

    if (error) return res.status(500).json({message: "Hubo un error"});

    if (!user) return res.status(401).json({message: "No autorizado"});
    
    req.user = user;
    next();
    
  })(req, res, next);
};

router.use("/message", isAutenticated, require('./message'));
router.use("/user", isAutenticated, require('./user'));

module.exports = router;
import express from "express"
import passport from "passport"
import jwt from "jsonwebtoken"

const router = express.Router();

router.post("/", (req, res) => {

  passport.authenticate("local", { session: false }, (error, user, info) => {
    if (error) res.status(500).json({ message: "Hubo un error" });
    if (info) res.status(400).json({ message: info });

    const payload = {
      sub: user._id,
      exp: Date.now() + parseInt(process.env.JWT_EXPIRES),
      email: user.email,
      name: user.name,
      lastName: user.lastName,
      id: user._id
    };

    const token = jwt.sign(JSON.stringify(payload), process.env.JWT_SECRET );

    res.status(200).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        lastName: user.lastName
      }
    });
  })(req, res);
});

export { router }
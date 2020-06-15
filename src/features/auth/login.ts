import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import { CustomError } from "../../errors";

const router = express.Router();

router.post("/", (req, res) => {
  try {
    passport.authenticate("local", { session: false }, (error, user, info) => {
      const payload = {
        sub: user._id,
        exp: Date.now() + parseInt(process.env.JWT_EXPIRES),
        email: user.email,
        name: user.name,
        lastName: user.lastName,
        id: user._id,
      };

      const token = jwt.sign(JSON.stringify(payload), process.env.JWT_SECRET);

      res.status(200).json({
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          lastName: user.lastName,
        },
      });
    })(req, res);
  } catch (e) {
    console.log(e.stack);

    if (e instanceof CustomError) {
      res.status(e.code).json(e.clientMessage);
    } else {
      res.status(500).json("Internal server error");
    }
  }
});

export { router };

import express from "express"
import bcrypt from "bcryptjs"
import { User } from '../user'

const router = express.Router();

router.post("/", async (req, res) => {

  const { lastName, password, email, name } = req.body;

  try {
    const user = await User.findOne({ email });
    if (user) return res.status(409).json({ error: "El usuario ya existe" });


  } catch (error) {
    res.status(500).json({ message: "Hubo un error" });
  }

  try {
    const hashPass = bcrypt.hashSync(password, 10);
    const user = new User({ lastName, password: hashPass, email, name });

    await user.save();

    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: "Hubo un error" });
  }
});

export { router }
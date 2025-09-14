import e from "express";
import "../config/passport";
import passport from "passport";
import { signToken } from "../utils/auth";

const router = e.Router();

//api/users/auth...

router.get(
  "/github",
  passport.authenticate("github", { scope: ["user:email"] })
);

router.get(
  "/github/callback",
  passport.authenticate("github", {
    failureRedirect: null, //to be filled in later when figuring out how to handle this
    session: false,
  }),
  (req, res) => {
    const user = req.user;
    const token = signToken(user);

    res.json({ token, user });
  }
);

export default router;

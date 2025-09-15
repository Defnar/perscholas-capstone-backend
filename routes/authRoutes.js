import e from "express";
import passport from "passport";
import "../config/passport.js";
import { signToken } from "../utils/auth.js";

const router = e.Router();

//api/users/auth...

router.get(
  "/github",
  passport.authenticate("github", { scope: ["user:email"] })
);

router.get(
  "/github/callback",
  passport.authenticate("github", {
    failureRedirect: "/api/users/auth/github/failure",
    session: false,
  }),
  (req, res) => {
    const user = req.user;
    const token = signToken(user);
    const refreshToken = signToken(user, process.env.REFRESHTTL);

    res.cookie("refreshToken", refreshToken, {
      maxAge: refreshExp * 1000 - Date.now(),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.json({ token, user });
  }
);

router.get("/github/failure", (req, res) => {
  res.status(401).json({ message: "oauth login failed" });
});

export default router;

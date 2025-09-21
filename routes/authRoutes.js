import e from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
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
    const refreshExp = jwt.decode(refreshToken).exp;

    res.cookie("refreshToken", refreshToken, {
      maxAge: refreshExp * 1000 - Date.now(),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.redirect(
      `${process.env.ORIGIN}/auth/callback?oauth=success&token=${token}&userid=${user._id}`
    );
  }
);

router.get("/github/failure", (req, res) => {
  res.redirect(`${process.env.ORIGIN}/auth/callback?oauth=failure`);
});

export default router;

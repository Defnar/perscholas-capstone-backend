import {
  loggedOutRefresh,
  loggedOutTokens,
} from "../config/loggedOutTokens.js";
import User from "../models/User.js";
import { signToken } from "../utils/auth.js";
import jwt from "jsonwebtoken";

const secret = process.env.JWT_SECRET;

export const login = async (req, res) => {
  if (!req.body) return res.status(400).json({ message: "body missing" });
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "email or password missing" });

    const user = await User.findOne({ email: email });

    if (!user?.password || user?.password.length === 0)
      return res
        .status(401)
        .json({ message: "Please sign in through oauth or set a password" });

    if (!user || !(await user.isCorrectPassword(password)))
      return res.status(401).json({ message: "Incorrect email or password" });

    const refreshToken = signToken(user, process.env.REFRESHTTL);
    const token = signToken(user);
    const refreshExp = jwt.decode(refreshToken).exp;

    res.cookie("refreshToken", refreshToken, {
      maxAge: refreshExp * 1000 - Date.now(),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const register = async (req, res) => {
  if (!req.body) return res.status(400).json({ message: "body missing" });

  try {
    const user = await User.create(req.body);

    res.status(201).json({ message: "user successfully created", user });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const logout = async (req, res) => {
  const authHeader = req.headers.authorization;
  let token = authHeader.split(" ").pop().trim();

  const tokenExp = jwt.decode(token).exp;

  if (token && jwt.verify(token, secret)) loggedOutTokens.set(token, tokenExp);

  const refreshToken = res.cookie.refreshToken;

  if (refreshToken && jwt.verify(token, secret)) {
    const refreshExp = jwt.decode(refreshToken).exp;
    loggedOutRefresh.set(refreshToken, refreshExp);
  }

  res.json({ message: "User successfully logged out" });
};

export const updateUser = async (req, res) => {
  if (!req.body)
    return res.status(400).json({ message: "body cannot be empty" });

  if (!req.user) return res.status(403).json({ message: "Unauthorized" });

  try {
    if (req.body.email || req.body.username) {
      const user = await User.find().or(
        {
          email: req.body.email,
        },
        {
          username: req.body.username,
        }
      );

      if (Object.keys(user).length > 0) {
        return res.status(403).json({ message: "email already exists" });
      }
    }

    const { _id, githubId, message, ...user } = req.body;
    const updatedUser = await user.save();

    res.json(updatedUser);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    if (!req.user) return res.status(403).json({ message: "unauthorized" });
    const refreshToken = req.cookie.refreshToken;
    const authHeader = req.headers.authorization;
    let token = authHeader.split("").pop().trim();

    if (token && jwt.verify(token, secret)) loggedOutTokens.push(token);
    if (refreshToken) loggedOutRefresh.push(refreshToken);

    await req.user.deleteOne();

    res.json({ message: "user successfully deleted" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
};

import {
  loggedOutRefresh,
  loggedOutTokens,
} from "../config/loggedOutTokens.js";
import User from "../models/User.js";
import { signToken } from "../utils/auth.js";
import jwt from "jsonwebtoken";

const secret = process.env.JWT_SECRET;

export const login = async (req, res) => {
  if (!req.body) return res.status(400).json({ error: "body missing" });
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ error: "email or password missing" });

    const user = await User.findOne({ email: email }).populate([
      { path: "message" },
    ]);

    if (!user?.password || user?.password.length === 0)
      return res
        .status(401)
        .json({ error: "Please sign in through oauth or set a password" });

    if (!user || !(await user.isCorrectPassword(password)))
      return res.status(401).json({ error: "Incorrect email or password" });

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
  if (!req.body) return res.status(400).json({ error: "body missing" });

  try {
    const user = await User.create(req.body);

    res.status(201).json({ message: "user successfully created", user });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const logout = async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(400).json({ error: "No token provided" });

  const token = authHeader.split(" ").pop().trim();

  try {
    if (token && jwt.verify(token, secret)) {
      const tokenExp = jwt.decode(token).exp;
      loggedOutTokens.set(token, tokenExp);
    }
  } catch (err) {
    console.log("Invalid access token on logout:", err.message);
  }

  const refreshToken = req.cookies.refreshToken;

  try {
    if (refreshToken && jwt.verify(refreshToken, secret)) {
      const refreshExp = jwt.decode(refreshToken).exp;
      loggedOutRefresh.set(refreshToken, refreshExp);
    }
  } catch (err) {
    console.log("Invalid refresh token on logout:", err.message);
  }

  res.clearCookie("refreshToken");
  res.json({ message: "User successfully logged out" });
};

export const updateUser = async (req, res) => {
  if (!req.body) return res.status(400).json({ error: "body cannot be empty" });

  if (!req.user)
    return res.status(403).json({ error: "unauthorized to access this" });

  try {
    const { email, username } = req.body;

    if (email && email !== req.user.email) {
      const emailCheck = await User.findOne({ email: email });
      if (emailCheck)
        return res.status(403).json({ error: "email already exists" });
    }

    if (username && username !== req.user.username) {
      const usernameCheck = await User.findOne({ username: username });

      if (usernameCheck)
        return res.status(403).json({ error: "username already exists" });
    }

    const { _id, githubId, message, ...user } = req.body;
    const updatedUser = await User.findByIdAndUpdate(req.user._id, user, {
      new: true,
    });

    res.json(updatedUser);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    if (!req.user) return res.status(403).json({ error: "unauthorized" });
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

export const findUsers = async (req, res) => {
  try {
    const { username } = req.query;

    const users = await User.find({
      username: {
        $regex: username,
        $options: "i",
      },
    });

    res.json(users);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
};

export const findUserById = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);

    res.json(user);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "internal server error" });
  }
};

export const getUserMessages = async (req, res) => {
  if (!req.user) res.json({ error: "Not authorized to get messages" });

  try {
    const user = await User.findById(req.user._id).populate([
      { path: "message" },
    ]);

    res.json(user.message);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "internal server error" });
  }
};

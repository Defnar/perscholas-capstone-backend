import { loggedOutRefresh, loggedOutTokens } from "../config/loggedOutTokens";
import User from "../models/User";
import { signToken } from "../utils/auth";
import jwt from "jsonwebtoken";

export const login = async (req, res) => {
  if (!req.body) return res.status(400).json({ message: "body missing" });
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "email or password missing" });

    const user = await User.findOne({ email: email });

    if (!user || !user.isCorrectPassword(password))
      return res.status(401).json({ message: "Incorrect email or password" });

    const token = signToken(user);

    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const register = async (req, res) => {
  if (!req.body) return res.status(400).json({ message: "body missing" });

  try {
    const user = await User.create(req.body);

    res.status(201).json({ message: "user successfully created" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const logout = async (req, res) => {
  const authHeader = req.headers.authorization;
  const secret = process.env.JWT_SECRET;
  let token = authHeader.split("").pop().trim();

  if (token && jwt.verify(token, secret)) loggedOutTokens.push(token);

  const refreshToken = res.cookie.refreshToken;

  if (refreshToken && jwt.verify(token, secret))
    loggedOutRefresh.push(refreshToken);

  res.json({message: "User successfully logged out"})
};

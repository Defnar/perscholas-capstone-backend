import { loggedOutRefresh } from "../config/loggedOutTokens.js";
import jwt from "jsonwebtoken";
const { TokenExpiredError } = jwt;
import { signToken } from "../utils/auth.js";

const secret = process.env.JWT_SECRET;
const refreshTTL = process.env.REFRESHTTL;
const tokenTTL = process.env.TOKENTTL;

const refreshToken = (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken || loggedOutRefresh.has(refreshToken)) {
    return res
      .status(401)
      .json({ error: "Invalid or missing refresh token" });
  }

  try {
    const { data } = jwt.verify(refreshToken, secret);

    //create new tokens
    const newRefreshToken = signToken(data, refreshTTL);
    const token = signToken(data, tokenTTL);

    // Replace old refresh cookie
    loggedOutRefresh.set(refreshToken, jwt.decode(refreshToken).exp)
    const refreshExp = jwt.decode(newRefreshToken).exp;
    res.cookie("refreshToken", newRefreshToken, {
      maxAge: refreshExp * 1000 - Date.now(),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.json({ token, user: data });
  } catch (err) {
    if (err instanceof TokenExpiredError) {
      return res.status(401).json({ error: "User must log in again" });
    }
    console.log(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export default refreshToken;

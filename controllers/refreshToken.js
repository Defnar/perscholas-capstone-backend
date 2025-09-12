import { loggedOutRefresh } from "../config/loggedOutTokens"
import jwt, { TokenExpiredError } from "jsonwebtoken";
import { signToken } from "../utils/auth";

const secret = process.env.JWT_SECRET;
const refreshTTL = process.env.REFRESHTTL;
const tokenTTL = process.env.TOKENTTL;

const refreshToken = (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken || loggedOutRefresh.has(refreshToken)) {
    return res
      .status(401)
      .json({ message: "Invalid or missing refresh token" });
  }

  try {
    const { data } = jwt.verify(refreshToken, secret);

    //create new tokens
    const newRefreshToken = signToken(data, refreshTTL);
    const newToken = signToken(data, tokenTTL);

    // Replace old refresh cookie
    const refreshExp = jwt.decode(newRefreshToken).exp;
    res.cookie("refreshToken", newRefreshToken, {
      maxAge: refreshExp * 1000 - Date.now(),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.json({newToken, user: data})
  } catch (err) {
    if (err instanceof TokenExpiredError) {
        return res.status(401).json({message: "User must log in again"})
    }
    console.log(err);
    res.status(500).json({message: "Internal server error"})
  }
};

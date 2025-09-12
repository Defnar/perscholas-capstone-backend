import jwt, { TokenExpiredError } from "jsonwebtoken";
import { signToken } from "./auth";
import { loggedOutTokens } from "../configs/loggedOutTokens";

const secret = process.env.JWT_SECRET;

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  let accessToken = authHeader?.split(" ").pop().trim();

  if (!accessToken) return res.status(401).json({ message: "Please log in to access this" });

  // Check if token is logged out
  if (loggedOutTokens.has(accessToken)) return res.status(401).json({ message: "Please log in to access this" });

  try {
    const {data } = jwt.verify(accessToken, secret);
    req.user = data

    next();
  } catch (err) {
    if (err instanceof TokenExpiredError) {
        return res.status(401).json({message: "token expired"})
    }
    console.log(err);
    return res.status(500).json({message: "Internal server error"})
    }
};

export function signToken(user, expirationTimer) {
  const payload = { username: user.username, email: user.email, id: user._id };
  
  return jwt.sign({ data: payload }, secret, { expiresIn: expirationTimer });
}
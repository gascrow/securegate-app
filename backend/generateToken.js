import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config(); // <- ini yang membuat process.env.JWT_SECRET terbaca

const token = jwt.sign(
  { id: 1, username: "admin", role: "ADMIN" }, 
  process.env.JWT_SECRET, 
  { expiresIn: "1h" }
);

console.log("Token admin baru:", token);
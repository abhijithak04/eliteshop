import jwt from "jsonwebtoken";

const generateToken = (res, userId) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is missing in backend .env");
  }

  const token = jwt.sign(
    {
      userId,
      id: userId,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "30d",
    }
  );

  res.cookie("jwt", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite:
      process.env.NODE_ENV === "production"
        ? "none"
        : "strict",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  return token;
};

export default generateToken;
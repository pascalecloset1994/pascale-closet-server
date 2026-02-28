import jwt from "jsonwebtoken";
import path from "path";

export const createAccessToken = (payload) => {
  if (process.env.NODE_ENV !== "production") {
    process.loadEnvFile(path.join(process.cwd(), ".env"));
  }

  return new Promise((resolve, reject) => {
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
      (err, token) => {
        if (err) reject(err);
        resolve(token);
      }
    );
  });
};

export const createResetToken = (payload) => {
  return new Promise((resolve, reject) => {
    jwt.sign(
      { ...payload, purpose: "password-reset" },
      process.env.JWT_SECRET,
      { expiresIn: "15m" },
      (err, token) => {
        if (err) reject(err);
        resolve(token);
      }
    );
  });
};

export const verifyResetToken = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) return reject(err);
      if (decoded.purpose !== "password-reset") {
        return reject(new Error("Token no válido para esta operación"));
      }
      resolve(decoded);
    });
  });
};

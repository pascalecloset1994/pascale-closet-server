import cors from "cors";

const ALLOWED_ORIGINS = [
  "https://pascalecloset.com",
  "https://www.pascalecloset.com",
  "http://localhost:5173",
];

export const corsMiddleware = ({ allowedOrigins = ALLOWED_ORIGINS } = {}) => {
  return cors({
    origin: (origin, callback) => {
      
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, origin);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  });
};

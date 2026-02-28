import { compare, hash } from "bcrypt";
import {
  CREATE_USER,
  GET_USER_BY_EMAIL,
  UPDATE_USER_PASSWORD,
} from "./constants.js";
import {
  createAccessToken,
  createResetToken,
  verifyResetToken,
} from "../utils/jwt.js";
import {
  sendEmail,
  sendRecoveryPasswordEmail,
} from "../services/mail.service.js";

const FRONTEND_URL =
  process.env.FRONTEND_URL || "https://pascalecloset.com";

export class AuthController {
  cookieExpiration = 60 * 60 * 24 * 1000;
  COOKIE_OPTIONS = {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
  };
  
  constructor({ db }) {
    this.db = db;
  }

  getFirstRow = (result) => result?.rows?.[0] || result[0];

  userLogin = async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password)
        return res.status(400).json({ message: "Campos vacíos" });

      const userExist = await this.db.query(GET_USER_BY_EMAIL, [email]);
      const user = this.getFirstRow(userExist);

      if (!user)
        return res
          .status(404)
          .json({ message: "El correo electrónico no está registrado", email });

      const validated = await compare(password, user.password);
      if (!validated)
        return res.status(403).json({ message: "La contraseña es incorrecta" });

      const token = await createAccessToken({ id: user.user_id });

      res.cookie("pascale_token", token, {
        ...this.COOKIE_OPTIONS, maxAge: this.cookieExpiration
      });

      return res.status(200).json({ message: "Ingreso exitoso", user });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Error en el login del usuario: " + error.message });
    }
  };

  signUp = async (req, res) => {
    try {
      const {
        name,
        lastName,
        email,
        password,
        role,
        ip,
        city,
        country,
        postalCode,
      } = req.body;

      if (!name || !lastName || !email || !password)
        return res.status(400).json({ message: "Campos vacíos" });

      const userExist = await this.db.query(GET_USER_BY_EMAIL, [email]);
      const userFound = this.getFirstRow(userExist);

      if (userFound) {
        return res
          .status(409)
          .json({ message: `El correo ${email} ya está registrado.` });
      }

      const hashedPassword = await hash(password, 10);

      const result = await this.db.query(CREATE_USER, [
        name,
        lastName,
        email,
        hashedPassword,
        role,
        ip,
        city,
        country,
        postalCode,
      ]);

      const newUser = this.getFirstRow(result);
      const token = await createAccessToken({ id: newUser.user_id });

      res.cookie("pascale_token", token, {
        ...this.COOKIE_OPTIONS, maxAge: this.cookieExpiration
      });

      await sendEmail({ to: email, userName: name });

      return res.status(201).json({
        message: `Registro exitoso! Se ha enviado un correo a ${email}. No olvides revisar tu bandeja de entrada y, si no lo ves 👀, échale un vistazo a la carpeta de SPAM.`,
      });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Error al crear usuario: " + error.message });
    }
  };

  userLogout = async (req, res) => {
    try {
      res.clearCookie("pascale_token", {
        ...this.COOKIE_OPTIONS, maxAge: 0
      });

      return res.status(200).json({ message: "Sesión cerrada correctamente" });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Error en logout: " + error.message });
    }
  };

  recoveryPassword = async (req, res) => {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "El correo es requerido" });
    }

    try {
      const userExist = await this.db.query(GET_USER_BY_EMAIL, [email]);
      const userFound = this.getFirstRow(userExist);

      if (!userFound) {
        return res.status(200).json({
          message:
            "Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.",
        });
      }

      const resetToken = await createResetToken({ id: userFound.user_id });

      res.cookie("pascale_reset_token", resetToken, {
        httpOnly: true,
        sameSite: "none",
        secure: true,
        maxAge: 15 * 60 * 1000,
        path: "/",
      });

      await sendRecoveryPasswordEmail({
        to: userFound.email,
        userName: userFound.name,
        resetUrl: `${FRONTEND_URL}/reset-password`,
      });

      return res.status(200).json({
        message:
          "Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.",
      });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Error en el servidor: " + error.message });
    }
  };

  resetPassword = async (req, res) => {
    try {
      const resetToken = req.cookies?.pascale_reset_token;

      if (!resetToken) {
        return res.status(401).json({
          message:
            "Enlace de recuperación expirado o inválido. Solicita uno nuevo.",
        });
      }

      // Verificar que el token sea de tipo password-reset y no haya expirado
      const decoded = await verifyResetToken(resetToken);
      const userId = decoded.id;

      const { password } = req.body;

      if (!password || password.length < 6) {
        return res.status(400).json({
          message: "La contraseña debe tener al menos 6 caracteres.",
        });
      }

      const hashedPassword = await hash(password, 10);
      await this.db.query(UPDATE_USER_PASSWORD, [userId, hashedPassword, true]);

      res.clearCookie("pascale_reset_token", {
        httpOnly: true,
        sameSite: "none",
        secure: true,
        path: "/",
      });

      return res
        .status(200)
        .json({ message: "Contraseña actualizada correctamente" });
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({
          message: "El enlace de recuperación ha expirado. Solicita uno nuevo.",
        });
      }
      return res.status(500).json({
        message: "Error al actualizar la contraseña: " + error.message,
      });
    }
  };
}

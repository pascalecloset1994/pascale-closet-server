import { compare, hash } from "bcrypt";
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
    domain: ".pascalecloset.com",
  };

  constructor({ model }) {
    this.model = model;
  }

  userLogin = async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password)
        return res.status(400).json({ message: "Campos vacíos." });

      const user = await this.model.getUserByEmail(email);

      if (!user)
        return res
          .status(404)
          .json({ message: "Credenciales inválidas." });

      const validated = await compare(password, user.password);
      if (!validated)
        return res.status(403).json({ message: "Credenciales inválidas." });

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

      const hashedPassword = await hash(password, 10);

      const newUser = await this.model.createUser({
        name,
        lastName,
        email,
        password: hashedPassword,
        role,
        ip,
        city,
        country,
        postalCode,
      });

      if (!newUser) {
        return res
          .status(409)
          .json({ message: "Credenciales inválidas." });
      }

      const token = await createAccessToken({ id: newUser.user_id });

      res.cookie("pascale_token", token, {
        ...this.COOKIE_OPTIONS, maxAge: this.cookieExpiration
      });

      await sendEmail({ to: email, userName: name });

      return res.status(201).json({
        message: `Registro exitoso! Se ha enviado un correo a ${email}. No olvides revisar tu bandeja de entrada y, si no lo ves 👀, échale un vistazo a la carpeta de SPAM.`,
      });
    } catch (error) {
      if (error?.code === "23505") {
        return res
          .status(409)
          .json({ message: `El correo ${req.body?.email} ya está registrado.` });
      }

      return res
        .status(500)
        .json({ message: "Error al crear usuario: " + error.message });
    }
  };

  userLogout = async (req, res) => {
    try {
      res.set({
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
        "Surrogate-Control": "no-store",
      });

      const base = {
        ...this.COOKIE_OPTIONS,
        expires: new Date(0),
      };

      res.clearCookie("pascale_token", base);

      res.clearCookie("pascale_token", {
        ...base,
        domain: "api.pascalecloset.com",
      });

      return res.status(200).json({ message: "Sesión cerrada correctamente" });;
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
      const userFound = await this.model.getUserByEmail(email);

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
      await this.model.updateUserPassword({
        userId,
        password: hashedPassword,
        updated: true,
      });

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

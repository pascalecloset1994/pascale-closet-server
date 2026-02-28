import { updateToBlob } from "../services/vercelBlob.service.js";
import {
  GET_ALL_USERS,
  GET_USER_BY_ID,
  UPDATE_USER,
  DELETE_USER,
  UPDATE_HERO,
  GET_HERO,
  UPDATE_PARTIAL_USER,
  UPDATE_FOOTER,
  GET_FOOTER,
} from "./constants.js";

export class UserController {
  constructor({ db }) {
    this.db = db;
  }

  getFirstRow = (result) => result?.rows?.[0] || result[0];

  getAllUsers = async (req, res) => {
    try {
      const result = await this.db.query(GET_ALL_USERS);
      const users = result?.rows || result;
      return res.status(200).json({ users });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Error al obtener usuarios: " + error.message });
    }
  };

  getUserById = async (req, res) => {
    try {
      const { userId: id } = req;
      const result = await this.db.query(GET_USER_BY_ID, [id]);
      const user = this.getFirstRow(result);

      if (!user)
        return res.status(404).json({ message: "Usuario inexistente", id });

      return res.status(200).json({ message: "Usuario encontrado", user });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Error en el servidor: " + error.message });
    }
  };

  updateUser = async (req, res) => {
    try {
      const id = req.userId;
      const file = req.file ?? null;
      const { name, lastname, email, avatar, city, country, postalCode } =
        req.body;

      if (!name || !lastname || !email || !city || !postalCode)
        return res.status(400).json({ message: "Campos vacíos" });
      const result = await this.db.query(GET_USER_BY_ID, [id]);

      const user = this.getFirstRow(result);

      if (!user)
        return res.status(404).json({ message: "Usuario no encontrado" });
      const urlImage = file ? await updateToBlob(file) : avatar;
      const updated = await this.db.query(UPDATE_USER, [
        id,
        name,
        lastname,
        email,
        true,
        new Date().toISOString(),
        urlImage,
        city,
        country,
        postalCode,
      ]);

      const updatedUser = this.getFirstRow(updated);

      return res
        .status(200)
        .json({ message: "Usuario actualizado", user: updatedUser });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Error al actualizar usuario: " + error.message });
    }
  };

  deleteUser = async (req, res) => {
    try {
      const id = req.userId;
      const result = await this.db.query(DELETE_USER, [id]);
      const deleted = this.getFirstRow(result);

      if (!deleted) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      res.clearCookie("pascale_token");
      return res
        .status(200)
        .json({ message: "Usuario eliminado", user: deleted });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Error al borrar usuario: " + error.message });
    }
  };

  userProfile = async (req, res) => {
    try {
      const { userId } = req;

      const result = await this.db.query(GET_USER_BY_ID, [userId]);
      const user = this.getFirstRow(result);

      if (!user)
        return res.status(404).json({ message: "Usuario inexistente" });

      return res.status(200).json({ message: "Perfil del usuario", user });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Error al obtener el perfil: " + error.message });
    }
  };

  getUserClientHero = async (req, res) => {
    try {
      const result = await this.db.query(GET_HERO);
      const hero = this.getFirstRow(result);

      return res.status(200).json({ message: "Hero del usuario", hero });
    } catch (error) {
      return res.status(500).json({
        message: "Error al obtener los datos del hero: " + error.message,
      });
    }
  };

  updateUserShippingInformation = async (req, res) => {
    try {
      const id = req.userId;
      const { address, phone, state } = req.body;

      if (!address || !phone || !state) {
        return res.status(400).json({ message: "Campos vacíos" });
      }

      const result = await this.db.query(GET_USER_BY_ID, [id]);

      const user = this.getFirstRow(result);

      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      await this.db.query(UPDATE_PARTIAL_USER, [
        id,
        address,
        phone,
        state,
        true,
        new Date().toISOString(),
      ]);

      return res.status(200).json({ message: "Usuario actualizado" });
    } catch (error) {
      return res
        .status(500)
        .josn({ message: "Error al actualizar: " + error.message });
    }
  };

  updateUserClientHero = async (req, res) => {
    try {
      const file = req.file ?? null;
      const { heroCollection, heroTitle, heroSubTitle } = req.body;

      if (!heroCollection || !heroTitle || !heroSubTitle) {
        return res
          .status(400)
          .json({ message: "Faltan datos del formulario." });
      }

      const imageUrl = file ? await updateToBlob(file) : null;
      const result = await this.db.query(UPDATE_HERO, [
        heroCollection,
        heroTitle,
        heroSubTitle,
        true,
        imageUrl,
      ]);
      const hero = this.getFirstRow(result);

      return res
        .status(200)
        .json({ message: "Hero actualizado con éxito", hero });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Error al actualizar el hero: " + error.message });
    }
  };

  getUserClientFooter = async (req, res) => {
    try {
      const result = await this.db.query(GET_FOOTER);
      const footer = this.getFirstRow(result);

      return res.status(200).json({ message: "Footer del usuario", footer });
    } catch (error) {
      return res.status(500).json({
        message: "Error al obtener los datos del footer: " + error.message,
      });
    }
  };

  updateUserClientFooter = async (req, res) => {
    try {
      const { id } = req.params;
      const file = req.file ?? null;
      const { title, location, schedule } = req.body;

      if (!title || !location || !schedule) {
        return res
          .status(400)
          .json({ message: "Faltan datos del formulario." });
      }

      const imageUrl = file ? await updateToBlob(file) : null;
      const result = await this.db.query(UPDATE_FOOTER, [
        id,
        title,
        location,
        schedule,
        true,
        imageUrl,
      ]);
      const hero = this.getFirstRow(result);

      return res
        .status(200)
        .json({ message: "Footer actualizado con éxito", hero });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Error al actualizar el footer: " + error.message });
    }
  };

  getUserDiscounContent = async (req, res) => {
    try {
      const result = await this.db.query(
        "SELECT discount_is_active, discount, discount_description, discount_updated_at FROM user_content WHERE id = 1;",
      );
      const discountData = this.getFirstRow(result);
      return res.status(200).json({ userContent: discountData });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Error al obtener los datos " + error.message });
    }
  };

  updateUserDiscountContent = async (req, res) => {
    const {
      discount,
      discountIsActive: discount_is_active,
      discountDescription: discount_description,
      discountUpdatedAt: discount_updated_at,
    } = req.body;

    try {
      const result = await this.db.query(
        `UPDATE user_content
         SET
          discount_is_active = $1,
          discount = $2,
          discount_description = $3,
          discount_updated_at = $4
         WHERE id = 1
         RETURNING *;`,
        [
          discount_is_active,
          discount,
          discount_description,
          discount_updated_at,
        ],
      );
      const userContent = this.getFirstRow(result);

      return res
        .status(200)
        .json({ message: "Cupón actualizado correctamente.", userContent });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Error al actualizar los datos " + error.message });
    }
  };
}

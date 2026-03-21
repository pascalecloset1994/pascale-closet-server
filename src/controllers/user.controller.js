import { updateToBlob } from "../services/vercelBlob.service.js";

export class UserController {
  constructor({ model }) {
    this.model = model;
  }

  getAllUsers = async (req, res) => {
    try {
      const users = await this.model.getAllUsers();
      return res.status(200).json(users);
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Error al obtener usuarios: " + error.message });
    }
  };

  getUserById = async (req, res) => {
    try {
      const { userId: id } = req;
      const user = await this.model.getUserById(id);

      if (!user) {
        return res.status(404).json({ message: "Usuario inexistente", id });
      }

      return res.status(200).json({ message: "Usuario encontrado", user });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Error en el servidor: " + error.message });
    }
  };

  updateUser = async (req, res) => {
    try {
      const { userId } = req;
      const file = req.file ?? null;
      const { name, lastname, email, avatar, city, country, postalCode } =
        req.body;

      if (!name || !lastname || !email || !city || !postalCode)
        return res.status(400).json({ message: "Campos vacíos." });
      const user = await this.model.getUserById(userId);

      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado." });
      }

      const urlImage = file ? await updateToBlob(file) : avatar;
      const updatedUser = await this.model.updateUser({
        userId,
        name,
        lastname,
        email,
        updated: true,
        avatar: urlImage,
        city,
        country,
        postalCode,
        updatedAt: user.updated_at,
      });

      if (!updatedUser) {
        return res.status(409).json({
          message:
            "Conflicto de concurrencia: el perfil fue actualizado por otra sesión. Recarga e intenta nuevamente.",
        });
      }

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
      const { userId } = req;
      const deleted = await this.model.deleteUser(userId);

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
      const user = await this.model.getUserById(userId);

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
      const hero = await this.model.getUserHero();

      return res.status(200).json({ message: "Hero del usuario", hero });
    } catch (error) {
      return res.status(500).json({
        message: "Error al obtener los datos del hero: " + error.message,
      });
    }
  };

  updateUserShippingInformation = async (req, res) => {
    try {
      const { userId } = req;
      const { address, phone, state } = req.body;

      if (!address || !phone || !state) {
        return res.status(400).json({ message: "Campos vacíos" });
      }

      const user = await this.model.getUserById(userId);

      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      const updatedUser = await this.model.updatePartialUser({
        userId,
        address,
        phone,
        state,
        updated: true,
        updatedAt: user.updated_at,
      });

      if (!updatedUser) {
        return res.status(409).json({
          message:
            "Conflicto de concurrencia: la información de envío fue actualizada por otra sesión. Recarga e intenta nuevamente.",
        });
      }

      return res.status(200).json({ message: "Usuario actualizado" });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Error al actualizar: " + error.message });
    }
  };

  updateUserClientHero = async (req, res) => {
    try {
      const { id } = req.params;
      const file = req.file ?? null;
      const { heroCollection, heroTitle, heroSubTitle } = req.body;

      if (!heroCollection || !heroTitle || !heroSubTitle) {
        return res
          .status(400)
          .json({ message: "Faltan datos del formulario." });
      }

      const imageUrl = file ? await updateToBlob(file) : null;
      const currentHero = await this.model.getHeroVersionById(id);

      if (!currentHero) {
        return res.status(404).json({ message: "Contenido Hero no encontrado." });
      }

      const hero = await this.model.updateUserHero({
        id,
        heroCollection,
        heroTitle,
        heroSubTitle,
        updated: true,
        imageUrl,
        updatedAt: currentHero.hero_updated_at,
      });

      if (!hero) {
        return res.status(409).json({
          message:
            "Conflicto de concurrencia: el Hero fue actualizado por otra sesión. Recarga e intenta nuevamente.",
        });
      }

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
      const footer = await this.model.getUserFooter();

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
      const currentFooter = await this.model.getFooterVersionById(id);

      if (!currentFooter) {
        return res
          .status(404)
          .json({ message: "Contenido Footer no encontrado." });
      }

      const footer = await this.model.updateUserFooter({
        id,
        title,
        location,
        schedule,
        updated: true,
        imageUrl,
        updatedAt: currentFooter.updated_at,
      });

      if (!footer) {
        return res.status(409).json({
          message:
            "Conflicto de concurrencia: el Footer fue actualizado por otra sesión. Recarga e intenta nuevamente.",
        });
      }

      return res
        .status(200)
        .json({ message: "Footer actualizado con éxito", footer });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Error al actualizar el footer: " + error.message });
    }
  };

  getUserDiscounContent = async (req, res) => {
    try {
      const discountData = await this.model.getUserDiscountContent();
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
    } = req.body;

    try {
      const currentDiscount = await this.model.getDiscountVersion();

      if (!currentDiscount) {
        return res
          .status(404)
          .json({ message: "Contenido de descuento no encontrado." });
      }

      const userContent = await this.model.updateUserDiscountContent({
        discountIsActive: discount_is_active,
        discount,
        discountDescription: discount_description,
        discountUpdatedAt: currentDiscount.discount_updated_at,
      });

      if (!userContent) {
        return res.status(409).json({
          message:
            "Conflicto de concurrencia: el contenido de descuentos fue actualizado por otra sesión. Recarga e intenta nuevamente.",
        });
      }

      return res
        .status(200)
        .json({ message: "Cupón actualizado correctamente.", userContent });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Error al actualizar los datos " + error.message });
    }
  };

  getShippingPrice = async (req, res) => {
    try {
      const shipping_price = await this.model.getShippingPrice();

      return res.status(200).json(shipping_price);
    } catch (error) {
      return res.status(500).json({ message: "Error al obtener precio de envío." });
    }
  }
}

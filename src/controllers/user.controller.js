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
      const hero = await this.model.getUserHero(1);

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
      const file = req.file ?? null;
      const { heroCollection, heroTitle, heroSubTitle } = req.body;

      if (!heroCollection || !heroTitle || !heroSubTitle) {
        return res
          .status(400)
          .json({ message: "Faltan datos del formulario." });
      }

      const currentHero = await this.model.getUserHero(1);
      const imageUrl = file ? await updateToBlob(file) : currentHero.hero_url_image;

      const hero = await this.model.updateUserHero({
        id: 1,
        heroCollection,
        heroTitle,
        heroSubTitle,
        updated: true,
        imageUrl,
        updatedAt: currentHero.hero_updated_at,
      });

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
      const footer = await this.model.getUserFooter(1);

      return res.status(200).json({ message: "Footer del usuario", footer });
    } catch (error) {
      return res.status(500).json({
        message: "Error al obtener los datos del footer: " + error.message,
      });
    }
  };

  updateUserClientFooter = async (req, res) => {
    try {
      const file = req.file ?? null;
      const { title, location, schedule } = req.body;

      if (!title || !location || !schedule) {
        return res.status(400).json({ message: "Faltan datos del formulario." });
      }

      const currentFooter = await this.model.getUserFooter(1);
      const imageUrl = file ? await updateToBlob(file) : currentFooter.footer_url_image;

      const footer = await this.model.updateUserFooter({
        id: 1,
        title,
        location,
        schedule,
        updated: true,
        imageUrl,
      });

      if (!footer) {
        return res.status(409).json({
          message: "Conflicto de concurrencia: el Footer fue actualizado por otra sesión. Recarga e intenta nuevamente.",
        });
      }

      return res.status(200).json({ message: "Footer actualizado con éxito", footer });
    } catch (error) {
      return res.status(500).json({ message: "Error al actualizar el footer: " + error.message });
    }
  };

  getUserContent = async (req, res) => {
    try {
      const userContent = await this.model.getUserContent();
      return res.status(200).json({ userContent: userContent });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Error al obtener los datos " + error.message });
    }
  };

  updateUserContent = async (req, res) => {
    const {
      discount,
      discount_description,
      discount_is_active,
      shipping_price,
    } = req.body;

    try {
      const currentDiscount = await this.model.getUserContent();

      const userContent = await this.model.updateUserContent({
        discount_is_active: discount_is_active ?? currentDiscount.discount_is_active,
        discount: discount || currentDiscount.discount,
        discountDescription: discount_description || currentDiscount.discount_description,
        discountUpdatedAt: discount !== currentDiscount.discount ? new Date() : currentDiscount.discount_updated_at,
        shippingPrice: shipping_price || currentDiscount.shipping_price,
        shippingUpdatedAt: shipping_price !== currentDiscount.shipping_price ? new Date() : currentDiscount.shipping_price_updated_at,
        shippingUpdate: shipping_price ? true : false
      });

      return res
        .status(200)
        .json({ message: "Datos actualizados correctamente.", userContent });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Error al actualizar los datos: " + error.message });
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

  getUserContent_V2 = async (req, res) => {
    try {
      const userContent = await this.model.getUserContent_V2(1);
      return res.status(200).json(userContent);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  getUserHeroContent_V2 = async (req, res) => {
    try {
      const userHeroContent = await this.model.getUserHeroContent_V2(1);
      return res.status(200).json(userHeroContent);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  updateUserContentHero_V2 = async (req, res) => {
    const file = req.file ?? null;
    const { heroCollection, heroTitle, heroSubTitle } = req.body;
    try {
      const currentHeroContent = await this.model.getUserHeroContent_V2(1);
      const heroImageUrl = file ? updateToBlob(file) : currentHeroContent.image;
      const heroContent = await this.model.updateHeroContent_V2(1, heroCollection, heroTitle, heroSubTitle, heroImageUrl, true);
      if (!heroContent) {
        return res.status(400).json({ message: "Cago" })
      }
      return res.status(200).json({ message: "Hero actualizado.", heroContent });
    } catch (error) {
      return res.status(500).json({ message: error.message })
    }
  }

  updateUserContentFooter_V2 = async (req, res) => {
    const { footerTitle, footerLocation, footerSchedule, footerImage } = req.body;
    try {
      const footerContent = await this.model.updateFooterContent_V2(1, footerTitle, footerLocation, footerSchedule, footerImage, true);
      if (!footerContent) {
        return res.status(400).json({ message: "Cago" })
      }
      return res.status(200).json({ message: "Footer actualizado.", footerContent });
    } catch (error) {
      return res.status(500).json({ message: error.message })
    }
  }
}

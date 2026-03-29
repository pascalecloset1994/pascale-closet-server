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
      const { name, lastname, email, city, country, postalCode, address } =
        req.body;

      if (!name || !lastname || !email || !city || !postalCode || !address)
        return res.status(400).json({ message: "Campos vacíos." });

      const user = await this.model.getUserById(userId);

      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado." });
      }

      const urlImage = file ? await updateToBlob(file) : user.avatar;
      const updatedUser = await this.model.updateUser({
        userId,
        name,
        lastname,
        email,
        updated: true,
        avatar: urlImage,
        city,
        country,
        address,
        postalCode,
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

      delete user.ip;
      delete user.password;

      return res.status(200).json({ user });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Error al obtener el perfil: " + error.message });
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

  // ─── V2 ──────────────────────────────────────────────────────────────────────

  getUserContent_V2 = async (req, res) => {
    try {
      const userContent = await this.model.getUserContent_V2(1);
      return res.status(200).json(userContent);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  };

  // ─── Hero V2 ─────────────────────────────────────────────────────────────────

  getUserHeroContent_V2 = async (req, res) => {
    try {
      const hero = await this.model.getUserHeroContent_V2(1);
      return res.status(200).json(hero);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  };

  updateUserHeroContent_V2 = async (req, res) => {
    try {
      const file = req.file ?? null;
      const { heroCollection, heroTitle, heroSubTitle } = req.body;

      if (!heroCollection || !heroTitle || !heroSubTitle) {
        return res.status(400).json({ message: "Faltan datos del formulario." });
      }

      const currentHero = await this.model.getUserHeroContent_V2(1);

      if (!currentHero) {
        return res.status(404).json({ message: "Contenido del hero no encontrado." });
      }

      const heroImage = file ? await updateToBlob(file) : currentHero.image;

      const hero = await this.model.updateHeroContent_V2({
        id: 1,
        heroCollection,
        heroTitle,
        heroSubTitle,
        heroImage,
        heroUpdated: true,
      });

      return res.status(200).json({ message: "Hero actualizado.", hero });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  };

  // ─── Footer V2 ───────────────────────────────────────────────────────────────

  getUserFooterContent_V2 = async (req, res) => {
    try {
      const footer = await this.model.getUserFooterContent_V2(1);
      return res.status(200).json(footer);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  };

  updateUserFooterContent_V2 = async (req, res) => {
    try {
      const file = req.file ?? null;
      const { footerTitle, footerLocation, footerSchedule } = req.body;

      if (!footerTitle || !footerLocation || !footerSchedule) {
        return res.status(400).json({ message: "Faltan datos del formulario." });
      }

      const currentFooter = await this.model.getUserFooterContent_V2(1);

      if (!currentFooter) {
        return res.status(404).json({ message: "Contenido del footer no encontrado." });
      }

      const footerImage = file ? await updateToBlob(file) : currentFooter?.image;

      const footer = await this.model.updateFooterContent_V2({
        id: 1,
        footerTitle,
        footerLocation,
        footerSchedule,
        footerImage,
        footerUpdated: true,
      });

      return res.status(200).json({ message: "Footer actualizado.", footer });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  };

  // ─── Shipping V2 ─────────────────────────────────────────────────────────────

  getShippingPrice_V2 = async (req, res) => {
    try {
      const shipping = await this.model.getShippingPrice(1);
      return res.status(200).json(shipping);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  };

  updateShippingContent_V2 = async (req, res) => {
    try {
      const { shippingPrice, shippingUpdate } = req.body;

      if (shippingPrice === undefined) {
        return res.status(400).json({ message: "Faltan datos del formulario." });
      }

      const shipping = await this.model.updateShippingContent_V2({
        id: 1,
        shippingPrice,
        shippingUpdate: shippingUpdate ?? true,
      });

      return res.status(200).json({ message: "Precio de envío actualizado.", shipping });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  };

  // ─── Discount V2 ─────────────────────────────────────────────────────────────

  getDiscountContent_V2 = async (req, res) => {
    try {
      const discount = await this.model.getDiscountContent_V2(1);
      return res.status(200).json(discount);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  };

  updateDiscountContent_V2 = async (req, res) => {
    try {
      const { discountIsActive, discount, discountDescription } = req.body;

      if (discount === undefined || !discountDescription) {
        return res.status(400).json({ message: "Faltan datos del formulario." });
      }

      const updatedDiscount = await this.model.updateDiscountContent_V2({
        id: 1,
        discountIsActive: discountIsActive ?? false,
        discount,
        discountDescription,
      });

      return res.status(200).json({ message: "Descuento actualizado.", discount: updatedDiscount });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  };
}